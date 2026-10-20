import Link from "next/link";
import { ClipboardList, Download } from "lucide-react";
import { db } from "@/lib/db";
import { formatMoney } from "@/lib/money";
import { ORDER_STATUSES, ORDER_STATUS_LABEL, PAYMENT_METHODS, type PaymentMethod } from "@/lib/orders";
import { formatDateTime } from "@/lib/utils";
import { orderWhere } from "@/lib/admin/orders-query";
import { StatusBadge } from "@/components/ui/badge";
import { buttonClass } from "@/components/ui/button";
import { ListFilters } from "@/components/admin/filters";
import { EmptyState, PageHeader, Pagination, TableWrap, Td, Th } from "@/components/admin/ui";

export const metadata = { title: "Orders" };

const PAGE_SIZE = 25;

export default async function OrdersPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const where = orderWhere({ q: sp.q, status: sp.status });

  const [orders, total, counts] = await Promise.all([
    db.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { _count: { select: { items: true } } },
    }),
    db.order.count({ where }),
    db.order.groupBy({ by: ["status"], _count: true }),
  ]);

  const countFor = (s: string) => counts.find((c) => c.status === s)?._count ?? 0;
  const exportParams = new URLSearchParams();
  if (sp.q) exportParams.set("q", sp.q);
  if (sp.status) exportParams.set("status", sp.status);

  const makeHref = (p: number) => {
    const params = new URLSearchParams(exportParams);
    params.set("page", String(p));
    return `/admin/orders?${params}`;
  };

  return (
    <>
      <PageHeader
        title="Orders"
        description="Every order placed in the store, newest first."
        actions={
          <a href={`/api/admin/orders/export${exportParams.size ? `?${exportParams}` : ""}`} className={buttonClass("outline", "md")}>
            <Download className="size-4" /> Export CSV
          </a>
        }
      />

      <div className="mb-4 flex flex-wrap gap-1.5">
        <Link
          href="/admin/orders"
          className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${!sp.status ? "bg-ink-900 text-white ring-ink-900" : "bg-white text-slate-600 ring-slate-200 hover:bg-slate-50"}`}
        >
          All · {counts.reduce((s, c) => s + c._count, 0)}
        </Link>
        {ORDER_STATUSES.map((s) => (
          <Link
            key={s}
            href={`/admin/orders?status=${s}`}
            className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${sp.status === s ? "bg-ink-900 text-white ring-ink-900" : "bg-white text-slate-600 ring-slate-200 hover:bg-slate-50"}`}
          >
            {ORDER_STATUS_LABEL[s]} · {countFor(s)}
          </Link>
        ))}
      </div>

      <ListFilters
        placeholder="Search order number, email or name…"
        selectName="status"
        selectLabel="Filter by status"
        selectOptions={[{ value: "", label: "All statuses" }, ...ORDER_STATUSES.map((s) => ({ value: s, label: ORDER_STATUS_LABEL[s] }))]}
      />

      <TableWrap>
        <thead>
          <tr>
            <Th>Order</Th>
            <Th>Customer</Th>
            <Th>Status</Th>
            <Th>Payment</Th>
            <Th>Items</Th>
            <Th>Placed</Th>
            <Th className="text-right">Total</Th>
          </tr>
        </thead>
        <tbody>
          {orders.length === 0 ? (
            <tr>
              <Td colSpan={7}>
                <EmptyState icon={ClipboardList} title="No orders found" description="Try a different search or status filter." />
              </Td>
            </tr>
          ) : null}
          {orders.map((o) => (
            <tr key={o.id} className="group hover:bg-slate-50">
              <Td>
                <Link href={`/admin/orders/${o.id}`} className="font-mono text-xs font-semibold text-ink-900 group-hover:text-mint-700">
                  {o.number}
                </Link>
              </Td>
              <Td>
                <p className="font-medium text-ink-900">
                  {o.shipFirstName} {o.shipLastName}
                </p>
                <p className="text-xs text-slate-500">{o.email}</p>
              </Td>
              <Td>
                <StatusBadge status={o.status} />
              </Td>
              <Td>
                <p className="text-xs font-medium text-ink-800">{PAYMENT_METHODS[o.paymentMethod as PaymentMethod]?.label ?? o.paymentMethod}</p>
                <p className={`text-xs ${o.paymentStatus === "PAID" ? "text-emerald-600" : o.paymentStatus === "REFUNDED" ? "text-rose-600" : "text-amber-600"}`}>
                  {o.paymentStatus.charAt(0) + o.paymentStatus.slice(1).toLowerCase()}
                </p>
              </Td>
              <Td className="text-slate-600">{o._count.items}</Td>
              <Td className="text-xs whitespace-nowrap text-slate-500">{formatDateTime(o.createdAt)}</Td>
              <Td className="text-right font-semibold tabular-nums">{formatMoney(o.total)}</Td>
            </tr>
          ))}
        </tbody>
      </TableWrap>
      <Pagination page={page} pageCount={Math.ceil(total / PAGE_SIZE)} total={total} makeHref={makeHref} />
    </>
  );
}
