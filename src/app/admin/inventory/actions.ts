"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { str, type ActionState } from "@/lib/actions";
import { notifyBackInStock } from "@/lib/admin/stock-alerts";

export async function updateStock(variantId: string, _prev: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  const parsed = z
    .object({ stock: z.coerce.number().int().min(0), lowStockThreshold: z.coerce.number().int().min(0) })
    .safeParse({ stock: str(form, "stock"), lowStockThreshold: str(form, "lowStockThreshold") });
  if (!parsed.success) return { error: "Enter whole numbers of 0 or more." };

  const before = await db.productVariant.findUnique({ where: { id: variantId }, select: { stock: true } });
  if (!before) return { error: "Variant not found." };
  const variant = await db.productVariant.update({
    where: { id: variantId },
    data: parsed.data,
    include: { product: { select: { slug: true } } },
  });
  // Back from zero: email everyone who asked to hear about it.
  const emailed = before.stock <= 0 && variant.stock > 0 ? await notifyBackInStock(variantId) : 0;

  revalidatePath("/admin/inventory");
  revalidatePath("/admin/stock-alerts");
  revalidatePath("/admin");
  revalidatePath(`/shop/${variant.product.slug}`);
  revalidatePath("/shop");
  return {
    ok: true,
    message: `Saved. ${variant.stock} in stock${emailed ? `, ${emailed} waiting customer${emailed === 1 ? "" : "s"} emailed` : ""}.`,
  };
}
