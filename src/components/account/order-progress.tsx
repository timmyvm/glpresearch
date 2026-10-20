import { ORDER_PROGRESS, ORDER_STATUS_LABEL, type OrderStatus } from "@/lib/orders";
import { cn, formatDate, formatDateTime } from "@/lib/utils";

const STEP_LABEL: Partial<Record<OrderStatus, string>> = {
  PENDING_PAYMENT: "Order placed",
  PAID: "Payment received",
};

type ProgressEvent = { status: string | null; createdAt: Date | string };

/**
 * The order's lifecycle as a plain stepped list: one 4px track filled to the current step,
 * with each step's name and time beneath it.
 */
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
    const event = [...events].reverse().find((e) => e.status === status);
    return (
      <div className={cn("bg-surface px-5 py-4", className)}>
        <p className="font-medium">This order was {ORDER_STATUS_LABEL[status as OrderStatus].toLowerCase()}.</p>
        {event ? <p className="text-small text-muted">{formatDateTime(event.createdAt)}</p> : null}
      </div>
    );
  }

  const current = Math.max(0, ORDER_PROGRESS.indexOf(status as OrderStatus));
  const timestampFor = (step: OrderStatus) => {
    if (step === "PENDING_PAYMENT") return createdAt;
    return events.find((e) => e.status === step)?.createdAt ?? null;
  };
  const filled = ((current + 1) / ORDER_PROGRESS.length) * 100;

  return (
    <div className={className}>
      <div className="h-1 bg-surface-2" aria-hidden="true">
        <div className="h-full bg-ink" style={{ width: `${filled}%` }} />
      </div>
      <ol className="mt-4 grid gap-3 sm:grid-cols-5" aria-label="Order progress">
        {ORDER_PROGRESS.map((step, i) => {
          const done = i <= current;
          const at = done ? timestampFor(step) : null;
          return (
            <li key={step} aria-current={i === current ? "step" : undefined} className="flex items-baseline justify-between gap-3 sm:block">
              <span className={cn("block text-small font-medium", done ? "text-ink" : "text-muted")}>{STEP_LABEL[step] ?? ORDER_STATUS_LABEL[step]}</span>
              <span className="tabular block text-small text-muted">
                {at ? formatDate(at, { hour: "numeric", minute: "2-digit" }) : i === current + 1 ? "Next" : "Waiting"}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
