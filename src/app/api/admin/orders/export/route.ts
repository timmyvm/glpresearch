import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { fromCents } from "@/lib/money";
import { statusLabel } from "@/lib/orders";
import { orderWhere } from "@/lib/admin/orders-query";
import { csvResponse, toCsv } from "@/lib/admin/csv";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") return new Response("Unauthorized", { status: 401 });

  const url = new URL(request.url);
  const where = orderWhere({
    q: url.searchParams.get("q") ?? undefined,
    status: url.searchParams.get("status") ?? undefined,
    claimed: url.searchParams.get("claimed") ?? undefined,
  });
  const orders = await db.order.findMany({ where, orderBy: { createdAt: "desc" }, include: { items: true } });

  const csv = toCsv(
    [
      "Order number", "Placed", "Status", "Payment method", "Payment status", "Customer reported payment", "Email",
      "First name", "Last name", "Company", "Address line 1", "Address line 2", "City", "State", "Postcode", "Country", "Phone",
      "Items", "Subtotal", "Discount", "Coupon", "Shipping", "Shipping method", "Total", "Carrier", "Tracking number", "Customer note",
    ],
    orders.map((o) => [
      o.number, o.createdAt, statusLabel(o.status), o.paymentMethod, o.paymentStatus, o.paymentClaimedAt, o.email,
      o.shipFirstName, o.shipLastName, o.shipCompany, o.shipLine1, o.shipLine2, o.shipCity, o.shipState, o.shipPostcode, o.shipCountry, o.shipPhone,
      o.items.map((i) => `${i.quantity}× ${i.productName} ${i.variantLabel} (${i.sku})`).join("; "),
      fromCents(o.subtotal), fromCents(o.discount), o.couponCode, fromCents(o.shipping), o.shippingMethod, fromCents(o.total),
      o.carrier, o.trackingNumber, o.customerNote,
    ]),
  );

  return csvResponse(`orders-${new Date().toISOString().slice(0, 10)}.csv`, csv);
}
