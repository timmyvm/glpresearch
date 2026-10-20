"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { str, type ActionState } from "@/lib/actions";

export async function updateStock(variantId: string, _prev: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  const parsed = z
    .object({ stock: z.coerce.number().int().min(0), lowStockThreshold: z.coerce.number().int().min(0) })
    .safeParse({ stock: str(form, "stock"), lowStockThreshold: str(form, "lowStockThreshold") });
  if (!parsed.success) return { error: "Enter whole numbers ≥ 0." };

  const variant = await db.productVariant.update({
    where: { id: variantId },
    data: parsed.data,
    include: { product: { select: { slug: true } } },
  });
  revalidatePath("/admin/inventory");
  revalidatePath("/admin");
  revalidatePath(`/shop/${variant.product.slug}`);
  revalidatePath("/shop");
  return { ok: true, message: `Saved · ${variant.stock} in stock` };
}
