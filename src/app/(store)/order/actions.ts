"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { str, type ActionState } from "@/lib/actions";
import { canAccessOrder } from "./access";
import { sendCancellationEmail, sendPaymentClaimNotice } from "@/lib/order-emails";
import { getSettings } from "@/lib/settings";

const input = z.object({ number: z.string().trim().min(3).max(40), token: z.string().max(64).optional() });

function revalidateOrder(number: string) {
  revalidatePath(`/order/${number}`);
  revalidatePath(`/account/orders/${number}`);
  revalidatePath("/account");
}

async function loadOrder(form: FormData) {
  const parsed = input.safeParse({ number: str(form, "number"), token: str(form, "token") || undefined });
  if (!parsed.success) return null;
  const order = await db.order.findUnique({ where: { number: parsed.data.number }, include: { items: true } });
  if (!order || !(await canAccessOrder(order, parsed.data.token))) return null;
  return order;
}

/** The customer says they have sent payment. Idempotent; tells the store so it can match the payment. */
export async function claimPayment(_prev: ActionState, form: FormData): Promise<ActionState> {
  const order = await loadOrder(form);
  if (!order) return { error: "We couldn't find that order. Refresh the page and try again." };
  if (order.status !== "PENDING_PAYMENT") return { error: "This order is no longer awaiting payment." };
  if (order.paymentClaimedAt) return { ok: true, message: "Thanks. We're already checking your payment." };

  const claimed = await db.order.updateMany({
    where: { id: order.id, status: "PENDING_PAYMENT", paymentClaimedAt: null },
    data: { paymentClaimedAt: new Date() },
  });
  if (claimed.count === 1) {
    await db.orderEvent.create({
      data: { orderId: order.id, type: "PAYMENT", message: "Payment reported as sent by the customer.", visibleToCustomer: true },
    });
    const settings = await getSettings();
    await sendPaymentClaimNotice(order, settings).catch((error) => console.error("[order] payment notice failed", error));
  }
  revalidateOrder(order.number);
  return { ok: true, message: "Thanks. We'll confirm by email as soon as the payment is matched." };
}

/** Cancels an unpaid order: restocks its items, frees the coupon use and records the event. */
export async function cancelOrder(_prev: ActionState, form: FormData): Promise<ActionState> {
  const order = await loadOrder(form);
  if (!order) return { error: "We couldn't find that order. Refresh the page and try again." };
  if (order.status !== "PENDING_PAYMENT") {
    return { error: "Only orders awaiting payment can be cancelled here. Contact us about this order instead." };
  }

  const cancelled = await db.$transaction(async (tx) => {
    // Guarded transition so a double submit (or an admin acting at the same time) restocks only once.
    const moved = await tx.order.updateMany({
      where: { id: order.id, status: "PENDING_PAYMENT" },
      data: { status: "CANCELLED", cancelledAt: new Date(), paymentClaimedAt: null },
    });
    if (moved.count !== 1) return false;
    for (const item of order.items) {
      if (item.variantId) {
        await tx.productVariant.updateMany({ where: { id: item.variantId }, data: { stock: { increment: item.quantity } } });
      }
    }
    if (order.couponCode) {
      await tx.coupon.updateMany({ where: { code: order.couponCode, usedCount: { gt: 0 } }, data: { usedCount: { decrement: 1 } } });
    }
    await tx.orderEvent.create({
      data: { orderId: order.id, type: "STATUS", status: "CANCELLED", message: "Cancelled by the customer before payment.", visibleToCustomer: true },
    });
    return true;
  });

  if (!cancelled) return { error: "This order changed while you were viewing it. Refresh the page to see its status." };
  const settings = await getSettings();
  await sendCancellationEmail(order, settings).catch((error) => console.error("[order] cancellation email failed", error));
  revalidateOrder(order.number);
  return { ok: true, message: `Order ${order.number} is cancelled and nothing is owed.` };
}
