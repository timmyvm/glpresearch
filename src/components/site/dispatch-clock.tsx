"use client";

import { useEffect, useState } from "react";

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

/** One line for the dispatch slip: Sydney time now and what that means for an order paid now. */
export function DispatchLine({ className }: { className?: string }) {
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
    <p className={className} aria-live="polite" suppressHydrationWarning>
      {now ? (
        <>
          It is <span className="tabular whitespace-nowrap">{new Intl.DateTimeFormat("en-AU", { timeZone: TZ, hour: "numeric", minute: "2-digit" }).format(now)}</span> in
          Sydney. {dispatchState(now)}
        </>
      ) : (
        "Paid before 1 pm Sydney time, ships the same business day."
      )}
    </p>
  );
}
