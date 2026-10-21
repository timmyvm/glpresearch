"use server";

import type { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { revalidateStorefront } from "@/lib/revalidate";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { getSettings } from "@/lib/settings";
import { bool, str, zodErrors, type ActionState } from "@/lib/actions";
import { ORDER_STATUSES, statusLabel } from "@/lib/orders";
import { noteEmail, statusEmail, trackingEmail } from "@/lib/admin/emails";
import { expireUnpaidOrders } from "@/lib/admin/expire-orders";
import { notifyBackInStock } from "@/lib/admin/stock-alerts";

const RESTOCKED = ["CANCELLED", "REFUNDED"];
const PAID_STATES = ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"];

function revalidateOrder(id: string) {
  revalidatePath(`/admin/orders/${id}`);
  revalidatePath("/admin/orders");
  revalidatePath("/admin");
}

export async function updateOrderStatus(orderId: string, _prev: ActionState, form: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  const parsed = z
    .object({ status: z.enum(ORDER_STATUSES), note: z.string().max(2000) })
    .safeParse({ status: str(form, "status"), note: str(form, "note") });
  if (!parsed.success) return zodErrors(parsed.error);
  const { status, note } = parsed.data;
  const notify = bool(form, "notify");

  const order = await db.order.findUnique({ where: { id: orderId }, include: { items: true } });
  if (!order) return { error: "Order not found." };
  if (order.status === status) return { error: `Order is already “${statusLabel(status)}”.` };

  const now = new Date();
  const data: Prisma.OrderUpdateInput = { status };
  if (PAID_STATES.includes(status)) {
    data.paymentStatus = "PAID";
    data.paymentClaimedAt = null;
    if (!order.paidAt) data.paidAt = now;
  }
  if (status === "SHIPPED" && !order.shippedAt) data.shippedAt = now;
  if (status === "DELIVERED") {
    if (!order.deliveredAt) data.deliveredAt = now;
    if (!order.shippedAt) data.shippedAt = now;
  }
  if (status === "CANCELLED") data.cancelledAt = now;
  if (status === "REFUNDED") data.paymentStatus = "REFUNDED";
  if (status === "PENDING_PAYMENT") data.paymentStatus = "UNPAID";

  // Stock: release once when an order is cancelled/refunded; re-reserve if it is revived.
  const wasRestocked = RESTOCKED.includes(order.status);
  const willRestock = RESTOCKED.includes(status);
  const stockOps = order.items
    .filter((i) => i.variantId)
    .map((i) =>
      db.productVariant.update({
        where: { id: i.variantId! },
        data: { stock: willRestock ? { increment: i.quantity } : { decrement: i.quantity } },
      }),
    );

  await db.$transaction([
    db.order.update({ where: { id: orderId }, data }),
    ...(willRestock !== wasRestocked ? stockOps : []),
    db.orderEvent.create({
      data: {
        orderId,
        type: status === "PAID" ? "PAYMENT" : "STATUS",
        status,
        message: note || `Status changed to ${statusLabel(status)}.`,
        createdBy: admin.email,
      },
    }),
  ]);

  // Stock returned by a cancellation or refund can bring a sold-out variant back.
  if (willRestock && !wasRestocked) {
    for (const item of order.items) if (item.variantId) await notifyBackInStock(item.variantId);
  }

  if (notify) {
    const settings = await getSettings();
    const email = statusEmail(order, status, note, settings.storeName);
    await sendEmail({ to: order.email, subject: email.subject, text: email.text });
    await db.orderEvent.create({
      data: { orderId, type: "EMAIL", message: `Emailed customer: “${email.subject}”`, visibleToCustomer: false, createdBy: admin.email },
    });
  }

  revalidateOrder(orderId);
  revalidatePath("/admin/inventory");
  revalidatePath("/admin/stock-alerts");
  if (willRestock !== wasRestocked) revalidateStorefront();
  return {
    ok: true,
    message: `Status updated to ${statusLabel(status)}${willRestock !== wasRestocked ? (willRestock ? " · stock returned to inventory" : " · stock re-reserved") : ""}${notify ? " · customer notified" : ""}.`,
  };
}

export async function updateTracking(orderId: string, _prev: ActionState, form: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  const parsed = z
    .object({ carrier: z.string().min(2, "Enter a carrier").max(80), trackingNumber: z.string().min(4, "Enter a tracking number").max(80) })
    .safeParse({ carrier: str(form, "carrier"), trackingNumber: str(form, "trackingNumber") });
  if (!parsed.success) return zodErrors(parsed.error);
  const markShipped = bool(form, "markShipped");
  const notify = bool(form, "notify");

  const order = await db.order.findUnique({ where: { id: orderId } });
  if (!order) return { error: "Order not found." };

  const now = new Date();
  const shipNow = markShipped && ["PENDING_PAYMENT", "PAID", "PROCESSING"].includes(order.status);
  if (shipNow && order.status === "PENDING_PAYMENT") {
    return { error: "This order hasn't been paid yet. Mark it as paid before shipping." };
  }

  const updated = await db.order.update({
    where: { id: orderId },
    data: {
      ...parsed.data,
      ...(shipNow ? { status: "SHIPPED", shippedAt: order.shippedAt ?? now, paymentStatus: "PAID", paidAt: order.paidAt ?? now, paymentClaimedAt: null } : {}),
    },
  });

  await db.orderEvent.create({
    data: {
      orderId,
      type: shipNow ? "STATUS" : "NOTE",
      status: shipNow ? "SHIPPED" : null,
      message: `${shipNow ? "Shipped" : "Tracking updated"} — ${parsed.data.carrier} ${parsed.data.trackingNumber}`,
      createdBy: admin.email,
    },
  });

  let emailed = false;
  if (notify && updated.status === "SHIPPED") {
    const settings = await getSettings();
    const email = trackingEmail({ ...updated, carrier: parsed.data.carrier, trackingNumber: parsed.data.trackingNumber }, settings.storeName);
    await sendEmail({ to: order.email, subject: email.subject, text: email.text });
    await db.orderEvent.create({
      data: { orderId, type: "EMAIL", message: `Emailed customer: “${email.subject}”`, visibleToCustomer: false, createdBy: admin.email },
    });
    emailed = true;
  }

  revalidateOrder(orderId);
  return { ok: true, message: `Tracking saved${shipNow ? " · order marked as shipped" : ""}${emailed ? " · customer emailed" : ""}.` };
}

export async function addOrderNote(orderId: string, _prev: ActionState, form: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  const parsed = z
    .object({ message: z.string().min(2, "Write a note").max(4000), visibility: z.enum(["internal", "customer"]) })
    .safeParse({ message: str(form, "message"), visibility: str(form, "visibility") || "internal" });
  if (!parsed.success) return zodErrors(parsed.error);
  const visible = parsed.data.visibility === "customer";
  const notify = visible && bool(form, "notify");

  const order = await db.order.findUnique({ where: { id: orderId } });
  if (!order) return { error: "Order not found." };

  await db.orderEvent.create({
    data: { orderId, type: "NOTE", message: parsed.data.message, visibleToCustomer: visible, createdBy: admin.email },
  });

  if (notify) {
    const settings = await getSettings();
    const email = noteEmail(order, parsed.data.message, settings.storeName);
    await sendEmail({ to: order.email, subject: email.subject, text: email.text });
    await db.orderEvent.create({
      data: { orderId, type: "EMAIL", message: `Emailed customer: “${email.subject}”`, visibleToCustomer: false, createdBy: admin.email },
    });
  }

  revalidateOrder(orderId);
  return { ok: true, message: visible ? `Note added to customer timeline${notify ? " and emailed" : ""}.` : "Internal note added." };
}

export async function updateAdminNote(orderId: string, _prev: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  const note = str(form, "adminNote").slice(0, 4000);
  await db.order.update({ where: { id: orderId }, data: { adminNote: note || null } });
  revalidateOrder(orderId);
  return { ok: true, message: "Pinned note saved." };
}

/** One-click "payment matched" from the payments queue: PAID, claim cleared, customer emailed. */
export async function markOrderPaid(orderId: string) {
  const admin = await requireAdmin();
  const order = await db.order.findUnique({ where: { id: orderId } });
  if (!order || order.status !== "PENDING_PAYMENT") return;
  const now = new Date();
  const updated = await db.order.updateMany({
    where: { id: orderId, status: "PENDING_PAYMENT" },
    data: { status: "PAID", paymentStatus: "PAID", paidAt: now, paymentClaimedAt: null },
  });
  if (updated.count === 0) return;
  await db.orderEvent.create({
    data: { orderId, type: "PAYMENT", status: "PAID", message: "Payment received and matched.", createdBy: admin.email },
  });
  const settings = await getSettings();
  const email = statusEmail(order, "PAID", null, settings.storeName);
  await sendEmail({ to: order.email, subject: email.subject, text: email.text });
  await db.orderEvent.create({
    data: { orderId, type: "EMAIL", message: `Emailed customer: “${email.subject}”`, visibleToCustomer: false, createdBy: admin.email },
  });
  revalidateOrder(orderId);
}

/** Runs the same job as the hourly cron, on demand. */
export async function cancelExpiredOrders(): Promise<ActionState> {
  await requireAdmin();
  const cancelled = await expireUnpaidOrders();
  revalidatePath("/admin/orders");
  revalidatePath("/admin");
  revalidatePath("/admin/inventory");
  revalidatePath("/admin/stock-alerts");
  if (!cancelled.length) return { ok: true, message: "No orders were past the payment window." };
  revalidateStorefront();
  return {
    ok: true,
    message: `Cancelled ${cancelled.length} unpaid order${cancelled.length === 1 ? "" : "s"} (${cancelled.join(", ")}) and released ${cancelled.length === 1 ? "its" : "their"} stock.`,
  };
}
