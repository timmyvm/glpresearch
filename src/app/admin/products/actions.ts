"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { toCents } from "@/lib/money";
import { slugify } from "@/lib/utils";
import { bool, optStr, str, zodErrors, type ActionState } from "@/lib/actions";

const variantSchema = z.object({
  id: z.string().optional(),
  label: z.string().min(1, "Variant label is required").max(40),
  sku: z.string().min(2, "SKU is required").max(40).transform((s) => s.toUpperCase()),
  price: z.string().refine((v) => toCents(v) > 0, "Price must be greater than 0"),
  compareAtPrice: z.string().optional(),
  stock: z.coerce.number().int().min(0),
  lowStockThreshold: z.coerce.number().int().min(0),
  image: z.string().max(500).optional(),
  active: z.boolean(),
});

const referenceSchema = z.object({ label: z.string().min(1).max(400), url: z.string().max(500) });

const productSchema = z.object({
  name: z.string().min(2, "Name is required").max(120),
  slug: z.string().max(120).regex(/^[a-z0-9-]*$/, "Lowercase letters, numbers and dashes only"),
  subtitle: z.string().min(2, "Subtitle is required").max(160),
  category: z.enum(["GLP1", "DUAL", "TRIPLE"]),
  shortDescription: z.string().min(10, "Short description is required").max(400),
  description: z.string().min(10, "Description is required"),
  image: z.string().min(1, "Main image is required").max(500),
  accentColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Use a hex colour like #2DD4BF"),
  receptorTargets: z.string().min(2, "Add at least one receptor target"),
  aminoAcidCount: z.coerce.number().int().min(0).max(500).nullable(),
  form: z.string().min(2).max(120),
  purity: z.string().min(2).max(120),
  storage: z.string().min(2).max(500),
  sortOrder: z.coerce.number().int(),
});

function revalidateCatalogue(slug?: string) {
  revalidatePath("/admin/products");
  revalidatePath("/admin/inventory");
  revalidatePath("/shop");
  revalidatePath("/compare");
  revalidatePath("/", "layout");
  if (slug) revalidatePath(`/shop/${slug}`);
}

export async function saveProduct(productId: string | null, _prev: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();

  const name = str(form, "name");
  const parsed = productSchema.safeParse({
    name,
    slug: str(form, "slug") || slugify(name),
    subtitle: str(form, "subtitle"),
    category: str(form, "category"),
    shortDescription: str(form, "shortDescription"),
    description: str(form, "description"),
    image: str(form, "image"),
    accentColor: str(form, "accentColor") || "#2DD4BF",
    receptorTargets: str(form, "receptorTargets"),
    aminoAcidCount: str(form, "aminoAcidCount") || null,
    form: str(form, "form") || "Lyophilized powder",
    purity: str(form, "purity") || "≥99% (HPLC)",
    storage: str(form, "storage") || "Store lyophilized at −20 °C, protected from light and moisture.",
    sortOrder: str(form, "sortOrder") || "0",
  });
  if (!parsed.success) return zodErrors(parsed.error);

  let variants: z.infer<typeof variantSchema>[];
  let references: z.infer<typeof referenceSchema>[];
  try {
    variants = z.array(variantSchema).min(1, "Add at least one variant").parse(JSON.parse(str(form, "variants") || "[]"));
    references = z.array(referenceSchema).parse(JSON.parse(str(form, "references") || "[]")).filter((r) => r.label.trim());
  } catch (e) {
    if (e instanceof z.ZodError) return { error: e.issues[0]?.message ?? "Check the variants and references." };
    return { error: "Could not read variants or references." };
  }

  const data = parsed.data;
  const skus = variants.map((v) => v.sku);
  if (new Set(skus).size !== skus.length) return { error: "Each variant needs a unique SKU." };

  const [slugTaken, skuTaken] = await Promise.all([
    db.product.findFirst({ where: { slug: data.slug, NOT: productId ? { id: productId } : undefined }, select: { id: true } }),
    db.productVariant.findFirst({
      where: { sku: { in: skus }, NOT: productId ? { productId } : undefined },
      select: { sku: true },
    }),
  ]);
  if (slugTaken) return { error: "Another product already uses that slug.", fieldErrors: { slug: ["Slug already in use"] } };
  if (skuTaken) return { error: `SKU ${skuTaken.sku} is already used by another product.` };

  const productData = {
    ...data,
    aliases: optStr(form, "aliases"),
    developer: optStr(form, "developer"),
    molecularFormula: optStr(form, "molecularFormula"),
    molecularWeight: optStr(form, "molecularWeight"),
    casNumber: optStr(form, "casNumber"),
    sequence: optStr(form, "sequence"),
    halfLife: optStr(form, "halfLife"),
    regulatoryStatus: optStr(form, "regulatoryStatus"),
    mechanism: optStr(form, "mechanism"),
    research: optStr(form, "research"),
    references: references.length ? JSON.stringify(references) : null,
    active: bool(form, "active"),
    featured: bool(form, "featured"),
  };

  const variantData = (v: z.infer<typeof variantSchema>, i: number) => ({
    label: v.label,
    sku: v.sku,
    price: toCents(v.price),
    compareAtPrice: v.compareAtPrice && toCents(v.compareAtPrice) > 0 ? toCents(v.compareAtPrice) : null,
    stock: v.stock,
    lowStockThreshold: v.lowStockThreshold,
    image: v.image?.trim() || null,
    active: v.active,
    sortOrder: i,
  });

  if (!productId) {
    const created = await db.product.create({
      data: { ...productData, variants: { create: variants.map(variantData) } },
    });
    revalidateCatalogue(created.slug);
    redirect(`/admin/products/${created.id}?created=1`);
  }

  const existing = await db.product.findUnique({ where: { id: productId }, include: { variants: { select: { id: true } } } });
  if (!existing) return { error: "Product not found." };
  const keepIds = variants.map((v) => v.id).filter((id): id is string => !!id && existing.variants.some((ev) => ev.id === id));

  // Two-phase SKU update avoids unique collisions when SKUs are swapped between rows.
  await db.$transaction([
    db.productVariant.deleteMany({ where: { productId, id: { notIn: keepIds } } }),
    ...keepIds.map((id) => db.productVariant.update({ where: { id }, data: { sku: `__tmp_${id}` } })),
    db.product.update({ where: { id: productId }, data: productData }),
    ...variants.map((v, i) =>
      v.id && keepIds.includes(v.id)
        ? db.productVariant.update({ where: { id: v.id }, data: variantData(v, i) })
        : db.productVariant.create({ data: { ...variantData(v, i), productId } }),
    ),
  ]);

  revalidateCatalogue(data.slug);
  if (existing.slug !== data.slug) revalidatePath(`/shop/${existing.slug}`);
  revalidatePath(`/admin/products/${productId}`);
  return { ok: true, message: "Product saved." };
}

export async function toggleProductActive(productId: string) {
  await requireAdmin();
  const product = await db.product.findUnique({ where: { id: productId }, select: { active: true, slug: true } });
  if (!product) return;
  await db.product.update({ where: { id: productId }, data: { active: !product.active } });
  revalidateCatalogue(product.slug);
}

export async function deleteProduct(productId: string) {
  await requireAdmin();
  const product = await db.product.delete({ where: { id: productId } });
  revalidateCatalogue(product.slug);
  redirect("/admin/products");
}
