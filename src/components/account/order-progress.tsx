import { Check, CircleDollarSign, Package, PackageCheck, Truck, XCircle } from "lucide-react";
import { ORDER_PROGRESS, ORDER_STATUS_LABEL, type OrderStatus } from "@/lib/orders";
import { cn, formatDate, formatDateTime } from "@/lib/utils";

const ICONS = {
  PENDING_PAYMENT: CircleDollarSign,
  PAID: Check,
  PROCESSING: Package,
  SHIPPED: Truck,
  DELIVERED: PackageCheck,
} as const;

const STEP_LABEL: Partial<Record<OrderStatus, string>> = {
  PENDING_PAYMENT: "Order placed",
  PAID: "Payment received",
};

type ProgressEvent = { status: string | null; createdAt: Date | string };

/** Horizontal (desktop) / vertical (mobile) tracker across the happy-path order lifecycle. */
export function OrderProgress({
  status,
  events,
  createdAt,
  className,
}: {
  status: string;
  events: ProgressEvent[];
  createdAt: Date | string;
  className?: string;
}) {
  if (status === "CANCELLED" || status === "REFUNDED") {
    const event = events.find((e) => e.status === status);
    return (
      <div className={cn("flex items-center gap-3 rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200", className)}>
        <XCircle className="size-5 shrink-0 text-slate-500" />
        <div className="text-sm">
          <p className="font-semibold text-ink-900">Order {ORDER_STATUS_LABEL[status as OrderStatus].toLowerCase()}</p>
          {event ? <p className="text-slate-500">{formatDateTime(event.createdAt)}</p> : null}
        </div>
      </div>
    );
  }

  const current = Math.max(0, ORDER_PROGRESS.indexOf(status as OrderStatus));
  const timestampFor = (step: OrderStatus) => {
    if (step === "PENDING_PAYMENT") return createdAt;
    return events.find((e) => e.status === step)?.createdAt ?? null;
  };

  return (
    <ol className={cn("grid gap-0 sm:grid-cols-5", className)}>
      {ORDER_PROGRESS.map((step, i) => {
        const done = i <= current;
        const active = i === current;
        const Icon = ICONS[step as keyof typeof ICONS];
        const at = done ? timestampFor(step) : null;
        return (
          <li key={step} className="relative flex gap-3 pb-5 last:pb-0 sm:flex-col sm:items-center sm:gap-2 sm:pb-0 sm:text-center">
            {i < ORDER_PROGRESS.length - 1 ? (
              <span
                aria-hidden
                className={cn(
                  "absolute top-9 left-[17px] h-[calc(100%-2.25rem)] w-0.5 sm:top-[17px] sm:left-[calc(50%+22px)] sm:h-0.5 sm:w-[calc(100%-44px)]",
                  i < current ? "bg-mint-500" : "bg-slate-200",
                )}
              />
            ) : null}
            <span
              className={cn(
                "relative z-10 grid size-9 shrink-0 place-items-center rounded-full ring-4 ring-white transition-colors",
                done ? "bg-mint-500 text-white" : "bg-slate-100 text-slate-400",
                active && "bg-ink-900 text-mint-300 shadow-lg shadow-ink-900/20",
              )}
            >
              <Icon className="size-4" />
            </span>
            <span className="pt-1 sm:pt-0">
              <span className={cn("block text-sm font-semibold", done ? "text-ink-900" : "text-slate-400")}>
                {STEP_LABEL[step] ?? ORDER_STATUS_LABEL[step]}
              </span>
              <span className="block text-xs text-slate-500">
                {at ? formatDate(at, { hour: "numeric", minute: "2-digit" }) : active ? "In progress" : " "}
              </span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}
