import Link from "next/link";
import { ChevronRight, Package } from "lucide-react";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { formatMoney } from "@/lib/money";
import { formatDate } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";

export const metadata = { title: "Orders" };

export default async function AccountOrdersPage() {
  const user = await requireUser("/account/orders");
  const orders = await db.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { items: { select: { quantity: true, productName: true } } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink-900">Orders</h1>
        <p className="mt-1 text-sm text-slate-600">Track deliveries, view payment details and reorder.</p>
      </div>

      {orders.length === 0 ? (
        <Card className="flex flex-col items-center gap-4 p-12 text-center">
          <Package className="size-8 text-slate-300" />
          <p className="text-sm text-slate-600">You haven&apos;t placed any orders yet.</p>
          <ButtonLink href="/shop">Browse peptides</ButtonLink>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="hidden grid-cols-[1.2fr_1fr_1fr_0.8fr_0.9fr_24px] gap-4 border-b border-slate-100 bg-slate-50 px-5 py-3 text-xs font-semibold tracking-wide text-slate-500 uppercase md:grid">
            <span>Order</span>
            <span>Date</span>
            <span>Status</span>
            <span>Items</span>
            <span className="text-right">Total</span>
            <span />
          </div>
          <ul className="divide-y divide-slate-100">
            {orders.map((order) => {
              const count = order.items.reduce((s, i) => s + i.quantity, 0);
              return (
                <li key={order.id}>
                  <Link
                    href={`/account/orders/${order.number}`}
                    className="grid grid-cols-2 items-center gap-x-4 gap-y-1.5 px-5 py-4 transition-colors hover:bg-ink-50/50 md:grid-cols-[1.2fr_1fr_1fr_0.8fr_0.9fr_24px]"
                  >
                    <span className="font-mono text-sm font-semibold text-ink-900">{order.number}</span>
                    <span className="text-right text-sm font-semibold md:order-5">{formatMoney(order.total)}</span>
                    <span className="text-sm text-slate-500 md:order-2">{formatDate(order.createdAt)}</span>
                    <span className="text-right md:order-3 md:text-left">
                      <StatusBadge status={order.status} />
                    </span>
                    <span className="col-span-2 truncate text-sm text-slate-500 md:order-4 md:col-span-1">
                      {count} item{count === 1 ? "" : "s"}
                      <span className="md:hidden"> · {order.items.map((i) => i.productName).join(", ")}</span>
                    </span>
                    <ChevronRight className="hidden size-4 text-slate-300 md:order-6 md:block" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </Card>
      )}
    </div>
  );
}
