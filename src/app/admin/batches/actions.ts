"use server";

import { revalidatePath } from "next/cache";
import { revalidateStorefront } from "@/lib/revalidate";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { bool, optStr, str, zodErrors, type ActionState } from "@/lib/actions";
import { parseDateInput } from "@/lib/admin/format";

const schema = z.object({
  productId: z.string().min(1, "Choose a product"),
  batchNumber: z.string().min(3, "Batch number is required").max(60).transform((s) => s.toUpperCase()),
  purity: z.coerce.number().min(0, "0–100").max(100, "0–100"),
  testMethod: z.string().min(2).max(120),
  laboratory: z.string().min(2, "Laboratory is required").max(160),
  testedAt: z.date({ error: "Tested date is required" }),
});

function revalidateBatches() {
  revalidatePath("/admin/batches");
  revalidateStorefront();
}

export async function saveBatch(batchId: string | null, _prev: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  const parsed = schema.safeParse({
    productId: str(form, "productId"),
    batchNumber: str(form, "batchNumber"),
    purity: str(form, "purity"),
    testMethod: str(form, "testMethod") || "RP-HPLC (UV 214 nm) / ESI-MS",
    laboratory: str(form, "laboratory"),
    testedAt: parseDateInput(str(form, "testedAt")) ?? undefined,
  });
  if (!parsed.success) return zodErrors(parsed.error);

  const taken = await db.batch.findFirst({
    where: { batchNumber: parsed.data.batchNumber, NOT: batchId ? { id: batchId } : undefined },
    select: { id: true },
  });
  if (taken) return { error: "That batch number already exists.", fieldErrors: { batchNumber: ["Already in use"] } };

  const product = await db.product.findUnique({ where: { id: parsed.data.productId }, select: { slug: true } });
  if (!product) return { error: "Product not found." };

  const data = {
    ...parsed.data,
    variantLabel: optStr(form, "variantLabel"),
    massSpec: optStr(form, "massSpec"),
    expiresAt: parseDateInput(str(form, "expiresAt")),
    coaUrl: optStr(form, "coaUrl"),
    notes: optStr(form, "notes"),
    published: bool(form, "published"),
  };

  if (batchId) {
    await db.batch.update({ where: { id: batchId }, data });
    revalidateBatches();
    return { ok: true, message: "Batch saved." };
  }
  await db.batch.create({ data });
  revalidateBatches();
  redirect("/admin/batches");
}

export async function deleteBatch(batchId: string) {
  await requireAdmin();
  await db.batch.delete({ where: { id: batchId } });
  revalidateBatches();
  redirect("/admin/batches");
}

export async function toggleBatchPublished(batchId: string) {
  await requireAdmin();
  const batch = await db.batch.findUnique({ where: { id: batchId }, select: { published: true } });
  if (!batch) return;
  await db.batch.update({ where: { id: batchId }, data: { published: !batch.published } });
  revalidateBatches();
}
