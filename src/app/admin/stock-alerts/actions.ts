"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import type { ActionState } from "@/lib/actions";
import { notifyBackInStock } from "@/lib/admin/stock-alerts";

/** Emails everyone waiting on an in-stock variant now (normally automatic on restock). */
export async function sendStockAlerts(variantId: string): Promise<ActionState> {
  await requireAdmin();
  const sent = await notifyBackInStock(variantId);
  revalidatePath("/admin/stock-alerts");
  revalidatePath("/admin");
  if (!sent) return { error: "Nothing sent. The variant is out of stock, hidden, or has no one waiting." };
  return { ok: true, message: `Emailed ${sent} customer${sent === 1 ? "" : "s"}.` };
}

export async function deleteStockAlert(alertId: string) {
  await requireAdmin();
  await db.stockAlert.deleteMany({ where: { id: alertId } });
  revalidatePath("/admin/stock-alerts");
  revalidatePath("/admin");
}
