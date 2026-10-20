import { formatMoney } from "@/lib/money";
import { statusLabel } from "@/lib/orders";
import { siteUrl } from "@/lib/utils";

type OrderLike = { number: string; accessToken: string; shipFirstName: string; total: number };

export function orderLink(order: Pick<OrderLike, "number" | "accessToken">) {
  return siteUrl(`/order/${order.number}?token=${order.accessToken}`);
}

const STATUS_COPY: Record<string, string> = {
  PAID: "We've received your payment. Your order is now queued for dispatch.",
  PROCESSING: "Your order is being picked, packed and checked by our team.",
  SHIPPED: "Your order is on its way.",
  DELIVERED: "Your order has been marked as delivered. We hope everything arrived in perfect condition.",
  CANCELLED: "Your order has been cancelled. If you believe this is a mistake, simply reply to this email.",
  REFUNDED: "Your order has been refunded. Please allow 3–5 business days for the funds to appear.",
  PENDING_PAYMENT: "Your order is awaiting payment.",
};

export function statusEmail(
  order: OrderLike & { carrier?: string | null; trackingNumber?: string | null },
  status: string,
  note?: string | null,
  storeName = "GLP Research",
) {
  const lines = [
    `Hi ${order.shipFirstName},`,
    "",
    `Order ${order.number} — ${statusLabel(status)}`,
    "",
    STATUS_COPY[status] ?? `Your order status is now: ${statusLabel(status)}.`,
  ];
  if (status === "SHIPPED" && order.trackingNumber) {
    lines.push("", `Carrier: ${order.carrier ?? "Australia Post"}`, `Tracking number: ${order.trackingNumber}`);
  }
  if (note) lines.push("", note);
  lines.push("", `Order total: ${formatMoney(order.total)}`, `View your order: ${orderLink(order)}`, "", `— The ${storeName} team`);
  return { subject: `Order ${order.number}: ${statusLabel(status)}`, text: lines.join("\n") };
}

export function trackingEmail(order: OrderLike & { carrier: string; trackingNumber: string }, storeName = "GLP Research") {
  return {
    subject: `Order ${order.number} has shipped — tracking inside`,
    text: [
      `Hi ${order.shipFirstName},`,
      "",
      `Great news — order ${order.number} has been dispatched.`,
      "",
      `Carrier: ${order.carrier}`,
      `Tracking number: ${order.trackingNumber}`,
      "",
      `View your order: ${orderLink(order)}`,
      "",
      `— The ${storeName} team`,
    ].join("\n"),
  };
}

export function noteEmail(order: OrderLike, note: string, storeName = "GLP Research") {
  return {
    subject: `Update on order ${order.number}`,
    text: [`Hi ${order.shipFirstName},`, "", note, "", `View your order: ${orderLink(order)}`, "", `— The ${storeName} team`].join("\n"),
  };
}
