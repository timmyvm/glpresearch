import Image from "next/image";
import Link from "next/link";
import { formatMoney } from "@/lib/money";
import { specimenImage } from "@/lib/plates";
import { cn, formatDate } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/badge";

/** The account screens' title row: a 24px noun, one grey line about the data, real actions on the right. */
export function PageTitle({
  title,
  children,
  action,
  className,
}: {
  title: React.ReactNode;
  children?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-end justify-between gap-x-6 gap-y-4", className)}>
      <div className="min-w-0">
        <h1 className="text-index font-semibold">{title}</h1>
        {children ? <p className="mt-1 text-small text-muted">{children}</p> : null}
      </div>
      {action ? <div className="flex flex-wrap gap-2">{action}</div> : null}
    </div>
  );
}

/** A panel's own heading row, with an optional link or action on the right. */
export function PanelTitle({ id, title, action }: { id?: string; title: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 px-5 pt-4 pb-3">
      <h2 id={id} className="text-lead font-semibold">
        {title}
      </h2>
      {action}
    </div>
  );
}

/** Up to four specimen thumbnails for an order's items. */
export function ItemThumbs({ items, className }: { items: { id: string; image: string | null; productName: string }[]; className?: string }) {
  const shown = items.slice(0, 4);
  return (
    <div className={cn("flex gap-1.5", className)}>
      {shown.map((item) => {
        const img = specimenImage(item.image) ?? item.image;
        return (
          <div key={item.id} className="relative h-12 w-10 shrink-0 bg-white">
            {img ? <Image src={img} alt={item.productName} fill sizes="40px" className="object-contain p-0.5" /> : null}
          </div>
        );
      })}
      {items.length > shown.length ? (
        <span className="grid h-12 w-10 place-items-center bg-white text-small text-muted tabular">+{items.length - shown.length}</span>
      ) : null}
    </div>
  );
}

export type OrderSummary = {
  id: string;
  number: string;
  status: string;
  total: number;
  createdAt: Date;
  items: { id: string; quantity: number; productName: string; image: string | null }[];
};

const ORDER_COLS = "md:grid-cols-[9rem_minmax(0,1fr)_8.5rem_7rem]";

/** Column headers for a list of OrderRows, shown from md up. */
export function OrderListHead() {
  return (
    <div data-ui aria-hidden="true" className={cn("hidden gap-x-4 border-b border-ink/10 px-5 py-2.5 text-small text-muted md:grid", ORDER_COLS)}>
      <span>Order</span>
      <span>Items</span>
      <span>Status</span>
      <span className="text-right">Total</span>
    </div>
  );
}

/** One order as a two-line row: number and date, the items, the status pill, the total on one right edge. */
export function OrderRow({ order }: { order: OrderSummary }) {
  const count = order.items.reduce((s, i) => s + i.quantity, 0);
  const names = [...new Set(order.items.map((i) => i.productName))].join(", ");
  return (
    <li data-ui className="border-t border-ink/[0.06] first:border-t-0">
      <Link
        href={`/account/orders/${order.number}`}
        className={cn("grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1 px-5 py-3.5 transition-colors duration-150 hover:bg-white/70", ORDER_COLS)}
      >
        <span className="min-w-0">
          <span className="tabular block font-medium">{order.number}</span>
          <span className="tabular block text-small text-muted">{formatDate(order.createdAt)}</span>
        </span>
        <span className="tabular text-right font-medium md:order-last">{formatMoney(order.total)}</span>
        <span className="min-w-0 truncate text-small text-muted">
          {count} {count === 1 ? "vial" : "vials"}: {names}
        </span>
        <span className="text-right md:text-left">
          <StatusBadge status={order.status} />
        </span>
      </Link>
    </li>
  );
}
