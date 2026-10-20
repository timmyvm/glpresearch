import Link from "next/link";
import { AlertTriangle, ArrowRight, Clock, DollarSign, Inbox, ShoppingCart, TrendingUp, UserPlus } from "lucide-react";
import { db } from "@/lib/db";
import { formatMoney } from "@/lib/money";
import { formatDate, formatDateTime } from "@/lib/utils";
import { Card, CardHeader } from "@/components/ui/card";
import { StatusBadge, Badge } from "@/components/ui/badge";
import { PageHeader, StatCard } from "@/components/admin/ui";
import { RevenueChart, type DayPoint } from "@/components/admin/revenue-chart";
import { percentChange } from "@/lib/admin/format";

export const metadata = { title: "Dashboard" };

const REVENUE_WHERE = { paymentStatus: "PAID", status: { notIn: ["CANCELLED", "REFUNDED"] } };
const DAY = 86400000;

function dayKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

export default async function AdminDashboard() {
  const now = new Date();
  const d30 = new Date(now.getTime() - 30 * DAY);
  const d60 = new Date(now.getTime() - 60 * DAY);
  const d90 = new Date(now.getTime() - 89 * DAY);
  d90.setHours(0, 0, 0, 0);

  const [rev30, rev60, orders30, ordersPrev30, newCustomers, newCustomersPrev, awaiting, lowStock, chartOrders, paidItems, recentOrders, messages] =
    await Promise.all([
      db.order.aggregate({ where: { ...REVENUE_WHERE, createdAt: { gte: d30 } }, _sum: { total: true }, _count: true }),
      db.order.aggregate({ where: { ...REVENUE_WHERE, createdAt: { gte: d60, lt: d30 } }, _sum: { total: true }, _count: true }),
      db.order.count({ where: { createdAt: { gte: d30 } } }),
      db.order.count({ where: { createdAt: { gte: d60, lt: d30 } } }),
      db.user.count({ where: { role: "CUSTOMER", createdAt: { gte: d30 } } }),
      db.user.count({ where: { role: "CUSTOMER", createdAt: { gte: d60, lt: d30 } } }),
      db.order.aggregate({ where: { status: "PENDING_PAYMENT" }, _count: true, _sum: { total: true } }),
      db.productVariant.findMany({
        where: { active: true, stock: { lte: db.productVariant.fields.lowStockThreshold } },
        include: { product: { select: { name: true, id: true } } },
        orderBy: { stock: "asc" },
      }),
      db.order.findMany({
        where: { createdAt: { gte: d90 } },
        select: { createdAt: true, total: true, paymentStatus: true, status: true },
      }),
      db.orderItem.findMany({
        where: { order: { ...REVENUE_WHERE, createdAt: { gte: d90 } } },
        select: { productName: true, lineTotal: true, quantity: true },
      }),
      db.order.findMany({
        orderBy: { createdAt: "desc" },
        take: 8,
        select: { id: true, number: true, status: true, total: true, createdAt: true, shipFirstName: true, shipLastName: true, email: true },
      }),
      db.contactMessage.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
    ]);

  // Daily chart series for the last 90 days.
  const days = new Map<string, DayPoint>();
  for (let i = 0; i < 90; i++) {
    const key = dayKey(new Date(d90.getTime() + i * DAY));
    days.set(key, { date: key, revenue: 0, orders: 0 });
  }
  for (const o of chartOrders) {
    const point = days.get(dayKey(o.createdAt));
    if (!point) continue;
    point.orders += 1;
    if (o.paymentStatus === "PAID" && o.status !== "CANCELLED" && o.status !== "REFUNDED") point.revenue += o.total;
  }

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
    .slice(0, 6);
  const topMax = topProducts[0]?.revenue ?? 1;

  const revenue = rev30._sum.total ?? 0;
  const prevRevenue = rev60._sum.total ?? 0;
  const aov = rev30._count ? Math.round(revenue / rev30._count) : 0;
  const prevAov = rev60._count ? Math.round(prevRevenue / rev60._count) : 0;

  return (
    <>
      <PageHeader title="Dashboard" description={`Store performance overview · ${formatDate(now, { weekday: "long" })}`} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        <StatCard label="Revenue · 30d" value={formatMoney(revenue)} change={percentChange(revenue, prevRevenue)} hint="vs prior 30d" icon={DollarSign} />
        <StatCard label="Orders · 30d" value={orders30} change={percentChange(orders30, ordersPrev30)} hint="vs prior 30d" icon={ShoppingCart} />
        <StatCard label="Avg order value" value={formatMoney(aov)} change={percentChange(aov, prevAov)} hint="paid orders" icon={TrendingUp} />
        <StatCard label="New customers" value={newCustomers} change={percentChange(newCustomers, newCustomersPrev)} hint="last 30d" icon={UserPlus} />
        <StatCard
          label="Awaiting payment"
          value={awaiting._count}
          hint={formatMoney(awaiting._sum.total ?? 0)}
          icon={Clock}
          tone={awaiting._count ? "warning" : "default"}
        />
        <StatCard label="Low stock" value={lowStock.length} hint="variants at/below threshold" icon={AlertTriangle} tone={lowStock.length ? "warning" : "default"} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[2fr_1fr]">
        <RevenueChart data={[...days.values()]} />
        <Card>
          <CardHeader title="Top products" description="Paid revenue · last 90 days" />
          <ul className="space-y-4 p-5">
            {topProducts.length === 0 ? <li className="text-sm text-slate-500">No paid orders yet.</li> : null}
            {topProducts.map((p) => (
              <li key={p.name}>
                <div className="flex items-baseline justify-between text-sm">
                  <span className="font-medium text-ink-900">{p.name}</span>
                  <span className="font-semibold tabular-nums">{formatMoney(p.revenue)}</span>
                </div>
                <div className="mt-1.5 flex items-center gap-2">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-mint-500" style={{ width: `${(p.revenue / topMax) * 100}%` }} />
                  </div>
                  <span className="w-14 text-right text-xs text-slate-500">{p.units} units</span>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[2fr_1fr]">
        <Card>
          <CardHeader
            title="Recent orders"
            action={
              <Link href="/admin/orders" className="inline-flex items-center gap-1 text-xs font-semibold text-mint-700 hover:text-mint-800">
                All orders <ArrowRight className="size-3.5" />
              </Link>
            }
          />
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <tbody className="divide-y divide-slate-100">
                {recentOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50">
                    <td className="px-5 py-3">
                      <Link href={`/admin/orders/${o.id}`} className="font-mono text-xs font-semibold text-ink-900 hover:text-mint-700">
                        {o.number}
                      </Link>
                    </td>
                    <td className="px-5 py-3">
                      <p className="font-medium text-ink-900">
                        {o.shipFirstName} {o.shipLastName}
                      </p>
                      <p className="text-xs text-slate-500">{o.email}</p>
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge status={o.status} />
                    </td>
                    <td className="px-5 py-3 text-xs text-slate-500">{formatDateTime(o.createdAt)}</td>
                    <td className="px-5 py-3 text-right font-semibold tabular-nums">{formatMoney(o.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader
              title="Low stock"
              action={
                <Link href="/admin/inventory" className="inline-flex items-center gap-1 text-xs font-semibold text-mint-700 hover:text-mint-800">
                  Inventory <ArrowRight className="size-3.5" />
                </Link>
              }
            />
            <ul className="divide-y divide-slate-100">
              {lowStock.length === 0 ? <li className="px-5 py-4 text-sm text-slate-500">All variants are above their thresholds.</li> : null}
              {lowStock.slice(0, 6).map((v) => (
                <li key={v.id} className="flex items-center justify-between px-5 py-3 text-sm">
                  <div>
                    <Link href={`/admin/products/${v.product.id}`} className="font-medium text-ink-900 hover:text-mint-700">
                      {v.product.name} · {v.label}
                    </Link>
                    <p className="font-mono text-xs text-slate-500">{v.sku}</p>
                  </div>
                  <Badge className={v.stock === 0 ? "bg-rose-50 text-rose-700 ring-rose-600/20" : "bg-amber-50 text-amber-700 ring-amber-600/20"}>
                    {v.stock === 0 ? "Out of stock" : `${v.stock} left`}
                  </Badge>
                </li>
              ))}
            </ul>
          </Card>

          <Card>
            <CardHeader
              title="Recent messages"
              action={
                <Link href="/admin/messages" className="inline-flex items-center gap-1 text-xs font-semibold text-mint-700 hover:text-mint-800">
                  Inbox <ArrowRight className="size-3.5" />
                </Link>
              }
            />
            <ul className="divide-y divide-slate-100">
              {messages.length === 0 ? (
                <li className="flex items-center gap-2 px-5 py-4 text-sm text-slate-500">
                  <Inbox className="size-4" /> Inbox zero.
                </li>
              ) : null}
              {messages.map((m) => (
                <li key={m.id} className="px-5 py-3">
                  <Link href={`/admin/messages?id=${m.id}`} className="block">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-medium text-ink-900">{m.subject}</p>
                      {m.status === "NEW" ? <span className="size-2 shrink-0 rounded-full bg-mint-500" /> : null}
                    </div>
                    <p className="truncate text-xs text-slate-500">
                      {m.name} · {formatDate(m.createdAt)}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </>
  );
}
