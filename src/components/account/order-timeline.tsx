import { formatDateTime } from "@/lib/utils";
import { statusLabel } from "@/lib/orders";

type TimelineEvent = {
  id: string;
  type: string;
  status: string | null;
  message: string;
  createdAt: Date | string;
};

const TYPE_LABEL: Record<string, string> = { PAYMENT: "Payment", NOTE: "Note from our team", EMAIL: "Email sent", STATUS: "Update" };

/** Newest-first list of customer-visible order events. */
export function OrderTimeline({ events }: { events: TimelineEvent[] }) {
  if (events.length === 0) return <p className="text-small text-muted">No updates yet. We&apos;ll post each step here.</p>;
  const sorted = [...events].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  return (
    <ol className="space-y-5">
      {sorted.map((event) => (
        <li key={event.id} className="grid gap-0.5">
          <p className="font-medium">{event.status ? statusLabel(event.status) : (TYPE_LABEL[event.type] ?? "Update")}</p>
          <p className="text-small">{event.message}</p>
          <p className="tabular text-small text-muted">{formatDateTime(event.createdAt)}</p>
        </li>
      ))}
    </ol>
  );
}
