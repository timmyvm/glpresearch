import "server-only";
import { db } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { formatMoney } from "@/lib/money";
import { getSettings } from "@/lib/settings";
import { orderLink } from "./emails";
import { notifyBackInStock } from "./stock-alerts";

/**
 * Cancels orders still awaiting payment after the payment window, unless the customer has said
 * they paid (those wait for a person to check). Stock and coupon uses are released.
 * Returns the order numbers that were cancelled.
 */
export async function expireUnpaidOrders(now = new Date()) {
  const settings = await getSettings();
  const hours = settings.paymentWindowHours;
  const cutoff = new Date(now.getTime() - hours * 3600_000);

  const due = await db.order.findMany({
    where: { status: "PENDING_PAYMENT", paymentClaimedAt: null, createdAt: { lt: cutoff } },
    include: { items: { select: { variantId: true, quantity: true } } },
    orderBy: { createdAt: "asc" },
  });

  const cancelled: string[] = [];
  const restocked = new Set<string>();
  for (const order of due) {
    const message = `Cancelled automatically: payment not received within ${hours} hours.`;
    // Re-check the status inside the transaction so a payment marked meanwhile is never undone.
    const done = await db.$transaction(async (tx) => {
      const fresh = await tx.order.updateMany({
        where: { id: order.id, status: "PENDING_PAYMENT", paymentClaimedAt: null },
        data: { status: "CANCELLED", cancelledAt: now },
      });
      if (fresh.count === 0) return false;
      for (const item of order.items) {
        if (item.variantId) {
          await tx.productVariant.update({ where: { id: item.variantId }, data: { stock: { increment: item.quantity } } });
        }
      }
      if (order.couponCode) {
        await tx.coupon.updateMany({ where: { code: order.couponCode, usedCount: { gt: 0 } }, data: { usedCount: { decrement: 1 } } });
      }
      await tx.orderEvent.create({ data: { orderId: order.id, type: "STATUS", status: "CANCELLED", message, createdBy: "system" } });
      return true;
    });
    if (!done) continue;
    cancelled.push(order.number);
    for (const item of order.items) if (item.variantId) restocked.add(item.variantId);

    const subject = `Order ${order.number} has been cancelled`;
    await sendEmail({
      to: order.email,
      subject,
      text: [
        `Hi ${order.shipFirstName},`,
        "",
        `We didn't receive payment for order ${order.number} (${formatMoney(order.total)}) within ${hours} hours, so it has been cancelled and the stock released.`,
        "",
        "If you have already paid, reply to this email with your payment receipt and we'll restore the order.",
        "",
        `Order details: ${orderLink(order)}`,
        "",
        `— The ${settings.storeName} team`,
      ].join("\n"),
    });
    await db.orderEvent.create({
      data: { orderId: order.id, type: "EMAIL", message: `Emailed customer: “${subject}”`, visibleToCustomer: false, createdBy: "system" },
    });
  }
  // Released stock can take a sold-out variant back above zero.
  for (const variantId of restocked) await notifyBackInStock(variantId);
  return cancelled;
}
