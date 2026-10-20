import Link from "next/link";
import { db } from "@/lib/db";
import { formatMoney } from "@/lib/money";
import { getSettings } from "@/lib/settings";
import { ORDER_STATUSES, ORDER_STATUS_LABEL, PAYMENT_METHODS, type PaymentMethod } from "@/lib/orders";
import { formatDate } from "@/lib/utils";
import { orderWhere } from "@/lib/admin/orders-query";
import { StatusBadge } from "@/components/ui/badge";
import { buttonClass } from "@/components/ui/button";
import { ActionForm, FormSubmit } from "@/components/admin/action-form";
import { ListFilters, Tabs } from "@/components/admin/filters";
import { EmptyState, PageHeader, Pagination, TableWrap, Td, Th } from "@/components/admin/ui";
import { cancelExpiredOrders } from "./actions";

export const metadata = { title: "Orders" };

const PAGE_SIZE = 25;
const nf = new Intl.NumberFormat("en-AU");

export default async function OrdersPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const claimedView = sp.claimed === "1";
  const where = orderWhere({ q: sp.q, status: sp.status, claimed: sp.claimed });
  const settings = await getSettings();
  const now = new Date();
  const cutoff = new Date(now.getTime() - settings.paymentWindowHours * 3_600_000);

  const [orders, total, counts, claimedCount, expiredCount] = await Promise.all([
    db.order.findMany({
      where,
      orderBy: { createdAt: claimedView ? "asc" : "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { _count: { select: { items: true } } },
    }),
    db.order.count({ where }),
    db.order.groupBy({ by: ["status"], _count: true }),
    db.order.count({ where: { status: "PENDING_PAYMENT", paymentClaimedAt: { not: null } } }),
    db.order.count({ where: { status: "PENDING_PAYMENT", paymentClaimedAt: null, createdAt: { lt: cutoff } } }),
  ]);

  const countFor = (s: string) => counts.find((c) => c.status === s)?._count ?? 0;
  const all = counts.reduce((s, c) => s + c._count, 0);

  const filterParams = new URLSearchParams();
  if (sp.q) filterParams.set("q", sp.q);
  if (sp.status && !claimedView) filterParams.set("status", sp.status);
  if (claimedView) filterParams.set("claimed", "1");
  const makeHref = (p: number) => {
    const params = new URLSearchParams(filterParams);
    params.set("page", String(p));
    return `/admin/orders?${params}`;
  };
  const tabHref = (extra: string) => `/admin/orders${extra}${sp.q ? `${extra ? "&" : "?"}q=${encodeURIComponent(sp.q)}` : ""}`;

  const tabs = [
    { href: tabHref(""), label: "All", count: all, active: !sp.status && !claimedView },
    { href: tabHref("?claimed=1"), label: "Customer says paid", count: claimedCount, active: claimedView },
    ...ORDER_STATUSES.map((s) => ({ href: tabHref(`?status=${s}`), label: ORDER_STATUS_LABEL[s], count: countFor(s), active: !claimedView && sp.status === s })),
  ];

  return (
    <>
      <PageHeader
        title="Orders"
        description={
          claimedView
            ? "Customers have reported sending payment for these orders. Check your account, then mark each one paid. They are not cancelled automatically."
            : `${nf.format(all)} orders. Unpaid orders are cancelled ${settings.paymentWindowHours} hours after they are placed unless the customer reports payment.`
        }
        actions={
          <>
            <a href={`/api/admin/orders/export${filterParams.size ? `?${filterParams}` : ""}`} className={buttonClass("outline", "sm", "ring-1 ring-ink/25")}>
              Export CSV
            </a>
            {/* Always mounted, so the result message survives the re-render that drops the count to 0. */}
            <ActionForm
              action={cancelExpiredOrders}
              compact
              confirmMessage={`Cancel ${expiredCount} unpaid order${expiredCount === 1 ? "" : "s"} past the ${settings.paymentWindowHours}-hour payment window? Stock is released and each customer is emailed.`}
              className="flex flex-col items-end empty:hidden"
            >
              {expiredCount ? (
                <FormSubmit variant="ghost" size="sm" pendingText="Cancelling…" className="text-danger ring-1 ring-danger/40 ring-inset hover:bg-[#ffedea]">
                  Cancel Expired Orders ({expiredCount})
                </FormSubmit>
              ) : null}
            </ActionForm>
          </>
        }
      />

      <Tabs tabs={tabs} label="Order status" />
      <ListFilters label="Search orders" placeholder="Order number, email or name…" count={`${nf.format(total)} order${total === 1 ? "" : "s"}`} />

      <TableWrap minWidth={0}>
        <thead>
          <tr>
            <Th>Order</Th>
            <Th className="hidden sm:table-cell">Status</Th>
            <Th className="hidden md:table-cell">Payment</Th>
            <Th className="hidden text-right lg:table-cell">Items</Th>
            <Th className="hidden text-right sm:table-cell">Placed</Th>
            <Th className="text-right">Total</Th>
          </tr>
        </thead>
        <tbody>
          {orders.length === 0 ? (
            <tr>
              <Td colSpan={6} className="p-0">
                <EmptyState
                  title={claimedView ? "No payments waiting to be checked." : "No orders match this view."}
                  description={claimedView ? "When a customer reports sending payment, their order appears here." : "Try another tab or clear the search."}
                />
              </Td>
            </tr>
          ) : null}
          {orders.map((o) => (
            <tr key={o.id} className="hover:bg-surface/50">
              <Td>
                <Link href={`/admin/orders/${o.id}`} className="font-medium text-ink hover:underline">
                  {o.number}
                </Link>
                <p className="max-w-[20ch] truncate text-small text-muted sm:max-w-[28ch]">
                  {o.shipFirstName} {o.shipLastName}
                  <span className="sm:hidden">, {formatDate(o.createdAt, { year: undefined })}</span>
                </p>
              </Td>
              <Td className="hidden sm:table-cell">
                <StatusBadge status={o.status} />
                {o.status === "PENDING_PAYMENT" && o.paymentClaimedAt ? (
                  <p className="mt-1 text-small whitespace-nowrap text-[#92400e]">Says paid {formatDate(o.paymentClaimedAt, { year: undefined })}</p>
                ) : null}
              </Td>
              <Td className="hidden text-muted md:table-cell">{PAYMENT_METHODS[o.paymentMethod as PaymentMethod]?.label ?? o.paymentMethod}</Td>
              <Td className="tabular hidden text-right text-muted lg:table-cell">{o._count.items}</Td>
              <Td className="tabular hidden text-right whitespace-nowrap text-muted sm:table-cell">{formatDate(o.createdAt)}</Td>
              <Td className="tabular text-right font-medium">
                {formatMoney(o.total)}
                {/* Phone: the status moves under the total, so each order is two lines. */}
                <span className="mt-1 block sm:hidden">
                  <StatusBadge status={o.status} />
                  {o.status === "PENDING_PAYMENT" && o.paymentClaimedAt ? <span className="mt-1 block text-small font-normal text-[#92400e]">Says paid</span> : null}
                </span>
              </Td>
            </tr>
          ))}
        </tbody>
      </TableWrap>
      <Pagination page={page} pageCount={Math.ceil(total / PAGE_SIZE)} total={total} pageSize={PAGE_SIZE} noun="order" makeHref={makeHref} />
    </>
  );
}
