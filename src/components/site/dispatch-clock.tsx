"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const TZ = "Australia/Sydney";
const CUTOFF_HOUR = 13; // orders paid before 1pm AEST/AEDT ship the same business day

function dispatchState(now: Date) {
  const parts = new Intl.DateTimeFormat("en-AU", { timeZone: TZ, weekday: "short", hour: "numeric", hour12: false }).formatToParts(now);
  const weekday = parts.find((p) => p.type === "weekday")?.value ?? "";
  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? 0);
  const weekend = weekday === "Sat" || weekday === "Sun";
  if (!weekend && hour < CUTOFF_HOUR) return "Paid now, ships today.";
  if (weekday === "Fri" || weekday === "Sat") return "Paid now, ships Monday.";
  return "Paid now, ships next business day.";
}

/** Live Sydney time and whether an order paid now makes today's dispatch. Server render shows the rule. */
export function DispatchClock({ className }: { className?: string }) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const tick = () => setNow(new Date());
    const first = setTimeout(tick, 0);
    const id = setInterval(tick, 30_000);
    return () => {
      clearTimeout(first);
      clearInterval(id);
    };
  }, []);

  return (
    <div className={cn("flex min-h-56 flex-col justify-between bg-field-orange p-6 text-ink", className)}>
      <p className="text-small">Dispatch, Sydney time</p>
      <div aria-live="polite">
        <p className="tabular text-index font-medium whitespace-nowrap" suppressHydrationWarning>
          {now ? new Intl.DateTimeFormat("en-AU", { timeZone: TZ, hour: "numeric", minute: "2-digit" }).format(now) : "1:00 pm"}
        </p>
        <p className="mt-2 text-small">{now ? dispatchState(now) : "Paid before 1 pm, ships the same business day."}</p>
      </div>
    </div>
  );
}
