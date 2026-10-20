import { CircleDot, CreditCard, Mail, MessageSquare } from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import { statusLabel } from "@/lib/orders";

type TimelineEvent = {
  id: string;
  type: string;
  status: string | null;
  message: string;
  createdAt: Date | string;
};

const ICON = { STATUS: CircleDot, PAYMENT: CreditCard, EMAIL: Mail, NOTE: MessageSquare } as const;

/** Newest-first list of customer-visible order events. */
export function OrderTimeline({ events }: { events: TimelineEvent[] }) {
  if (events.length === 0) return <p className="text-sm text-slate-500">No updates yet.</p>;
  const sorted = [...events].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  return (
    <ol className="relative space-y-5 border-l border-slate-200 pl-6">
      {sorted.map((event, i) => {
        const Icon = ICON[event.type as keyof typeof ICON] ?? CircleDot;
        return (
          <li key={event.id} className="relative">
            <span
              className={`absolute -left-[37px] grid size-6 place-items-center rounded-full ring-4 ring-white ${
                i === 0 ? "bg-mint-500 text-white" : "bg-slate-100 text-slate-500"
              }`}
            >
              <Icon className="size-3" />
            </span>
            <p className="text-sm font-medium text-ink-900">
              {event.status ? statusLabel(event.status) : "Update"}
            </p>
            <p className="text-sm text-slate-600">{event.message}</p>
            <p className="mt-0.5 text-xs text-slate-400">{formatDateTime(event.createdAt)}</p>
          </li>
        );
      })}
    </ol>
  );
}
