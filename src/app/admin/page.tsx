import Link from "next/link";
import { db } from "@/lib/db";
import { formatMoney } from "@/lib/money";
import { getSettings } from "@/lib/settings";
import { PAYMENT_METHODS, type PaymentMethod } from "@/lib/orders";
import { formatDate } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/badge";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { ActionForm, FormSubmit } from "@/components/admin/action-form";
import { CHART_RANGES, RevenueChart, type ChartRange, type DayPoint } from "@/components/admin/revenue-chart";
import { EmptyState, PageHeader, Panel, StatStrip, Swatch, textAction } from "@/components/admin/ui";
import { cancelExpiredOrders, markOrderPaid } from "./orders/actions";

export const metadata = { title: "Overview" };

const REVENUE_WHERE = { paymentStatus: "PAID", status: { notIn: ["CANCELLED", "REFUNDED"] } };
const DAY = 86_400_000;
const nf = new Intl.NumberFormat("en-AU");

const dayKey = (d: Date) => d.toISOString().slice(0, 10);

/** "+12% vs prior 30 days", grey when there is nothing to compare. */
function delta(current: number, previous: number, goodWhenUp = true): { note: string; tone: "good" | "bad" | "neutral" } {
  if (previous === 0) return current === 0 ? { note: "No change vs prior 30 days", tone: "neutral" } : { note: `+${nf.format(current)} (new) vs prior 30 days`, tone: "neutral" };
  const pct = ((current - previous) / previous) * 100;
  if (Math.abs(pct) < 0.5) return { note: "No change vs prior 30 days", tone: "neutral" };
  const up = pct > 0;
  return { note: `${up ? "+" : "−"}${Math.abs(pct).toFixed(0)}% vs prior 30 days`, tone: up === goodWhenUp ? "good" : "bad" };
}

function timeLeft(ms: number) {
  if (ms <= 0) return "Past window";
  const h = Math.floor(ms / 3_600_000);
  if (h >= 24) return `${Math.floor(h / 24)} d ${h % 24} h left`;
  return `${h} h ${Math.floor((ms % 3_600_000) / 60_000)} m left`;
}

export default async function AdminOverview({ searchParams }: { searchParams: Promise<{ range?: string }> }) {
  const { range: rangeParam } = await searchParams;
  const range = (CHART_RANGES.find((r) => String(r) === rangeParam) ?? 30) as ChartRange;
  const now = new Date();
  const d30 = new Date(now.getTime() - 30 * DAY);
  const d60 = new Date(now.getTime() - 60 * DAY);
  const d90 = new Date(now.getTime() - 90 * DAY);

  const settings = await getSettings();
  const windowMs = settings.paymentWindowHours * 3_600_000;

  const [awaiting, awaitingSum, toPack, toPackCount, rev30, rev60, orders30, ordersPrev30, newCustomers, newCustomersPrev, chartOrders, paidItems, products, lowStock, alertsWaiting, messages] =
    await Promise.all([
      db.order.findMany({
        where: { status: "PENDING_PAYMENT" },
        orderBy: { createdAt: "asc" },
        select: { id: true, number: true, total: true, createdAt: true, paymentMethod: true, paymentClaimedAt: true, shipFirstName: true, shipLastName: true },
      }),
      db.order.aggregate({ where: { status: "PENDING_PAYMENT" }, _sum: { total: true } }),
      db.order.findMany({
        where: { status: { in: ["PAID", "PROCESSING"] } },
        orderBy: { paidAt: "asc" },
        take: 5,
        select: { id: true, number: true, status: true, paidAt: true, shippingMethod: true, shipFirstName: true, shipLastName: true, _count: { select: { items: true } } },
      }),
      db.order.count({ where: { status: { in: ["PAID", "PROCESSING"] } } }),
      db.order.aggregate({ where: { ...REVENUE_WHERE, createdAt: { gte: d30 } }, _sum: { total: true }, _count: true }),
      db.order.aggregate({ where: { ...REVENUE_WHERE, createdAt: { gte: d60, lt: d30 } }, _sum: { total: true }, _count: true }),
      db.order.count({ where: { createdAt: { gte: d30 } } }),
      db.order.count({ where: { createdAt: { gte: d60, lt: d30 } } }),
      db.user.count({ where: { role: "CUSTOMER", createdAt: { gte: d30 } } }),
      db.user.count({ where: { role: "CUSTOMER", createdAt: { gte: d60, lt: d30 } } }),
      db.order.findMany({ where: { createdAt: { gte: d90 } }, select: { createdAt: true, total: true, paymentStatus: true, status: true } }),
      db.orderItem.findMany({
        where: { order: { ...REVENUE_WHERE, createdAt: { gte: d90 } } },
        select: { productName: true, lineTotal: true, quantity: true },
      }),
      db.product.findMany({ select: { name: true, accentColor: true } }),
      db.productVariant.findMany({
        where: { active: true, stock: { lte: db.productVariant.fields.lowStockThreshold } },
        include: { product: { select: { name: true, id: true, accentColor: true } } },
        orderBy: { stock: "asc" },
        take: 5,
      }),
      db.stockAlert.count({ where: { notifiedAt: null } }),
      db.contactMessage.findMany({ where: { status: "NEW" }, orderBy: { createdAt: "desc" }, take: 3 }),
    ]);

  // Payments queue: customer-reported payments first, then the ones closest to expiry.
  const queue = awaiting
    .map((o) => ({ ...o, left: o.createdAt.getTime() + windowMs - now.getTime() }))
    .sort((a, b) => Number(!!b.paymentClaimedAt) - Number(!!a.paymentClaimedAt) || a.left - b.left);
  const claimed = queue.filter((o) => o.paymentClaimedAt).length;
  const expired = queue.filter((o) => !o.paymentClaimedAt && o.left <= 0).length;
  const soon = queue.filter((o) => !o.paymentClaimedAt && o.left > 0 && o.left < 12 * 3_600_000).length;

  // Chart series: one point per day, ending today.
  const days = new Map<string, DayPoint>();
  for (let i = 89; i >= 0; i--) {
    const key = dayKey(new Date(now.getTime() - i * DAY));
    days.set(key, { date: key, revenue: 0, orders: 0 });
  }
  for (const o of chartOrders) {
    const point = days.get(dayKey(o.createdAt));
    if (!point) continue;
    point.orders += 1;
    if (o.paymentStatus === "PAID" && o.status !== "CANCELLED" && o.status !== "REFUNDED") point.revenue += o.total;
  }

  const colour = new Map(products.map((p) => [p.name, p.accentColor]));
  const topProducts = [
    ...paidItems
      .reduce((map, i) => {
        const row = map.get(i.productName) ?? { name: i.productName, revenue: 0, units: 0 };
        row.revenue += i.lineTotal;
        row.units += i.quantity;
        return map.set(i.productName, row);
      }, new Map<string, { name: string; revenue: number; units: number }>())
      .values(),
  ]
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);
  const topMax = topProducts[0]?.revenue || 1;

  const revenue = rev30._sum.total ?? 0;
  const prevRevenue = rev60._sum.total ?? 0;
  const aov = rev30._count ? Math.round(revenue / rev30._count) : 0;
  const prevAov = rev60._count ? Math.round(prevRevenue / rev60._count) : 0;

  const finding =
    queue.length === 0
      ? `No payments to match. ${toPackCount} order${toPackCount === 1 ? "" : "s"} to pack.`
      : [
          `${queue.length} payment${queue.length === 1 ? "" : "s"} to match (${formatMoney(awaitingSum._sum.total ?? 0)})`,
          claimed ? `${claimed} reported paid by the customer` : null,
          soon ? `${soon} expire${soon === 1 ? "s" : ""} within 12 hours` : null,
          expired ? `${expired} past the ${settings.paymentWindowHours}-hour window` : null,
        ]
          .filter(Boolean)
          .join(", ") + ".";

  return (
    <>
      <PageHeader title="Overview" description={`${formatDate(now, { weekday: "long" })}. ${finding}`} />

      <div className="grid items-start gap-4 xl:grid-cols-3">
        {/* The screen's question: which payments need matching today? */}
        <Panel
          className="xl:col-span-2"
          title="Payments to match"
          description={`Bank transfer, PayID and crypto orders, ${settings.paymentWindowHours}-hour window`}
          action={
            <Link href="/admin/orders?status=PENDING_PAYMENT" className={textAction}>
              View all {queue.length}
            </Link>
          }
          bodyClassName="px-0 pb-2"
        >
          {queue.length === 0 ? (
            <EmptyState title="Every order is paid." description="New bank transfer and PayID orders will wait here until you match them." />
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-small text-muted">
                  <th scope="col" className="px-5 pb-2 font-normal">Order</th>
                  <th scope="col" className="hidden px-3 pb-2 font-normal sm:table-cell">Method</th>
                  <th scope="col" className="px-3 pb-2 text-right font-normal">Amount</th>
                  <th scope="col" className="hidden px-3 pb-2 text-right font-normal md:table-cell">Window</th>
                  <th scope="col" className="px-5 pb-2 text-right font-normal">
                    <span className="sr-only">Action</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {queue.slice(0, 5).map((o) => (
                  <tr key={o.id} className="border-t border-ink/[0.07]">
                    <td className="px-5 py-2.5">
                      <Link href={`/admin/orders/${o.id}`} className="font-medium text-ink hover:underline">
                        {o.number}
                      </Link>
                      <p className="text-small text-muted">
                        {o.shipFirstName} {o.shipLastName}
                        {o.paymentClaimedAt ? <span className="text-[#7a3d00]">, says paid {formatDate(o.paymentClaimedAt, { year: undefined, hour: "numeric", minute: "2-digit" })}</span> : null}
                      </p>
                    </td>
                    <td className="hidden px-3 py-2.5 text-muted sm:table-cell">{PAYMENT_METHODS[o.paymentMethod as PaymentMethod]?.label ?? o.paymentMethod}</td>
                    <td className="tabular px-3 py-2.5 text-right font-medium">{formatMoney(o.total)}</td>
                    <td className={`tabular hidden px-3 py-2.5 text-right md:table-cell ${!o.paymentClaimedAt && o.left <= 0 ? "text-danger" : "text-muted"}`}>
                      {o.paymentClaimedAt ? "Held" : timeLeft(o.left)}
                    </td>
                    <td className="px-5 py-2.5 text-right">
                      <ConfirmButton
                        action={markOrderPaid.bind(null, o.id)}
                        message={`Mark ${o.number} as paid (${formatMoney(o.total)})? The customer will be emailed.`}
                        variant="outline"
                        size="sm"
                        className="ring-1"
                      >
                        Mark Paid
                      </ConfirmButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {/* Always mounted, so the result stays on screen after the list re-renders without the expired rows. */}
          <ActionForm
            action={cancelExpiredOrders}
            compact
            confirmMessage={`Cancel ${expired} unpaid order${expired === 1 ? "" : "s"} past the payment window? Stock is released and each customer is emailed.`}
            className={expired ? "mt-2 border-t border-ink/[0.07] px-5 pt-3" : "px-5"}
          >
            {expired ? (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-small text-muted">
                  {expired} order{expired === 1 ? " is" : "s are"} past the payment window. The hourly job cancels {expired === 1 ? "it" : "them"} automatically.
                </p>
                <FormSubmit variant="ghost" size="sm" pendingText="Cancelling…" className="h-8 text-danger ring-1 ring-danger/40 ring-inset hover:bg-[#fbe4e1]">
                  Cancel Expired Now
                </FormSubmit>
              </div>
            ) : null}
          </ActionForm>
        </Panel>

        <Panel
          title="Ready to pack"
          description="Paid, oldest first"
          action={
            <Link href="/admin/orders?status=PAID" className={textAction}>
              View all {toPackCount}
            </Link>
          }
          bodyClassName="px-0 pb-2"
        >
          {toPack.length === 0 ? (
            <EmptyState title="Nothing to pack." description="Paid orders appear here until they ship." />
          ) : (
            <ul>
              {toPack.map((o) => (
                <li key={o.id} className="border-t border-ink/[0.07] first:border-t-0">
                  <Link href={`/admin/orders/${o.id}`} className="flex items-center justify-between gap-3 px-5 py-2.5 hover:bg-surface/50">
                    <span className="min-w-0">
                      <span className="block font-medium">{o.number}</span>
                      <span className="block truncate text-small text-muted">
                        {o.shipFirstName} {o.shipLastName}, {o._count.items} item{o._count.items === 1 ? "" : "s"}
                        {o.shippingMethod === "EXPRESS" ? ", express" : ""}
                      </span>
                    </span>
                    <StatusBadge status={o.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <StatStrip
        className="mt-4"
        stats={[
          { label: "Paid revenue, 30 days", value: formatMoney(revenue), ...delta(revenue, prevRevenue) },
          { label: "Orders, 30 days", value: nf.format(orders30), ...delta(orders30, ordersPrev30) },
          { label: "Average paid order", value: formatMoney(aov), ...delta(aov, prevAov) },
          { label: "New customers, 30 days", value: nf.format(newCustomers), ...delta(newCustomers, newCustomersPrev) },
        ]}
      />

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <RevenueChart data={[...days.values()]} range={range} makeHref={(r) => (r === 30 ? "/admin" : `/admin?range=${r}`)} className="h-full" />
        </div>
        <Panel title="Top compounds" description="Paid revenue, last 90 days">
          {topProducts.length === 0 ? (
            <p className="text-muted">No paid orders in the last 90 days.</p>
          ) : (
            <ul className="space-y-3">
              {topProducts.map((p, i) => (
                <li key={p.name}>
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="flex min-w-0 items-center gap-2">
                      <Swatch color={colour.get(p.name) ?? "#c9ced6"} />
                      {p.name}
                      <span className="tabular text-small text-muted">{nf.format(p.units)} vials</span>
                    </span>
                    <span className="tabular font-medium">{formatMoney(p.revenue)}</span>
                  </div>
                  <div className="mt-1.5 h-0.5 bg-surface">
                    <div className={i === 0 ? "h-full bg-ink" : "h-full bg-muted/50"} style={{ width: `${(p.revenue / topMax) * 100}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <Panel
          title="Stock"
          description={`${lowStock.length ? `${lowStock.length} variant${lowStock.length === 1 ? "" : "s"} at or below threshold` : "Every variant is above its threshold"}, ${alertsWaiting} back-in-stock request${alertsWaiting === 1 ? "" : "s"} waiting`}
          action={
            <Link href={alertsWaiting ? "/admin/stock-alerts" : "/admin/inventory"} className={textAction}>
              {alertsWaiting ? "Stock alerts" : "Inventory"}
            </Link>
          }
          bodyClassName="px-0 pb-2"
        >
          {lowStock.length === 0 ? (
            <EmptyState title="Nothing is running low." className="py-4" />
          ) : (
            <ul>
              {lowStock.map((v) => (
                <li key={v.id} className="flex items-center justify-between gap-3 border-t border-ink/[0.07] px-5 py-2.5 first:border-t-0">
                  <Link href={`/admin/products/${v.product.id}`} className="flex min-w-0 items-center gap-2 hover:underline">
                    <Swatch color={v.product.accentColor} />
                    <span className="truncate">
                      {v.product.name} {v.label}
                    </span>
                  </Link>
                  <span className={`tabular ${v.stock === 0 ? "text-danger" : "text-ink"}`}>
                    {v.stock} <span className="text-muted">/ {v.lowStockThreshold}</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel
          title="Unread messages"
          description="From the contact form, newest first"
          action={
            <Link href="/admin/messages" className={textAction}>
              Inbox
            </Link>
          }
          bodyClassName="px-0 pb-2"
        >
          {messages.length === 0 ? (
            <EmptyState title="Inbox is clear." className="py-4" />
          ) : (
            <ul>
              {messages.map((m) => (
                <li key={m.id} className="border-t border-ink/[0.07] first:border-t-0">
                  <Link href={`/admin/messages?id=${m.id}`} className="block px-5 py-2.5 hover:bg-surface/50">
                    <span className="flex items-baseline justify-between gap-3">
                      <span className="truncate font-medium">{m.subject}</span>
                      <span className="shrink-0 text-small text-muted">{formatDate(m.createdAt, { year: undefined })}</span>
                    </span>
                    <span className="block truncate text-small text-muted">
                      {m.name}
                      {m.orderNumber ? `, order ${m.orderNumber}` : ""}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </>
  );
}
