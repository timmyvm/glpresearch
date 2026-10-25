import Link from "next/link";
import { formatMoney } from "@/lib/money";
import { cn } from "@/lib/utils";

export type DayPoint = { date: string; revenue: number; orders: number };

export const CHART_RANGES = [30, 60, 90] as const;
export type ChartRange = (typeof CHART_RANGES)[number];

// The one chart hue (achromatic ledger): it marks the screen's main data element, nothing else.
const HUE = "#1f2b4d";

/** Round, even y steps with the top tick above the maximum. */
function niceScale(max: number, ticks = 4) {
  if (max <= 0) return { top: 4, step: 1 };
  const raw = max / ticks;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s * ticks >= max * 1.0001) ?? 10 * mag;
  return { top: step * ticks, step };
}

const day = new Intl.DateTimeFormat("en-AU", { day: "numeric", month: "short", timeZone: "UTC" });
const dollars = new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD", currencyDisplay: "narrowSymbol", maximumFractionDigits: 0 });

/** Daily paid revenue as square columns. Server-rendered SVG; the range is in the URL. */
export function RevenueChart({
  data,
  range,
  makeHref,
  className,
}: {
  data: DayPoint[];
  range: ChartRange;
  makeHref: (r: ChartRange) => string;
  className?: string;
}) {
  const series = data.slice(-range);
  const total = series.reduce((s, d) => s + d.revenue, 0);
  const orders = series.reduce((s, d) => s + d.orders, 0);
  const { top, step } = niceScale(Math.max(...series.map((d) => d.revenue)) / 100);

  const W = 760;
  const H = 220;
  const padL = 52;
  const padB = 24;
  const plotW = W - padL;
  const plotH = H - padB - 8;
  const slot = plotW / series.length;
  const bar = Math.max(2, Math.min(14, slot * 0.6));
  const y = (cents: number) => 8 + plotH - (cents / 100 / top) * plotH;
  const ticks = Array.from({ length: Math.round(top / step) + 1 }, (_, i) => i * step);
  const labelEvery = Math.ceil(series.length / 5);

  return (
    <section className={cn("border border-surface-2 bg-white", className)} aria-labelledby="revenue-title">
      <div className="flex flex-col gap-3 px-5 pt-4 pb-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 id="revenue-title" className="text-base font-medium">
            Paid revenue by day
          </h2>
          <p className="tabular mt-0.5 text-sm text-muted">
            {formatMoney(total)} from {orders} order{orders === 1 ? "" : "s"} placed in the last {range} days
          </p>
        </div>
        <nav className="flex gap-4 text-sm" aria-label="Chart range">
          {CHART_RANGES.map((r) => (
            <Link
              key={r}
              href={makeHref(r)}
              scroll={false}
              aria-current={r === range ? "true" : undefined}
              className={cn("border-b-2 pb-1", r === range ? "border-ink text-ink" : "border-transparent text-muted hover:text-ink")}
            >
              {r} days
            </Link>
          ))}
        </nav>
      </div>
      <div className="px-3 pb-4">
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={`Bar chart of daily paid revenue over ${range} days, ${formatMoney(total)} in total`}>
          {ticks.map((t) => {
            const ty = 8 + plotH - (t / top) * plotH;
            return (
              <g key={t}>
                <line x1={padL} x2={W} y1={ty} y2={ty} stroke={t === 0 ? "#1f2b4d" : "#e9e8e4"} strokeWidth={1} />
                <text x={padL - 8} y={ty + 4} textAnchor="end" fontSize={12} fill="#5d6479" className="tabular">
                  {dollars.format(t)}
                </text>
              </g>
            );
          })}
          {series.map((d, i) => {
            const x = padL + i * slot + (slot - bar) / 2;
            const yy = y(d.revenue);
            return (
              <g key={d.date}>
                {d.revenue > 0 ? (
                  <rect x={x} y={yy} width={bar} height={8 + plotH - yy} fill={HUE}>
                    <title>{`${day.format(new Date(d.date))}: ${formatMoney(d.revenue)}, ${d.orders} order${d.orders === 1 ? "" : "s"}`}</title>
                  </rect>
                ) : null}
                {i % labelEvery === 0 ? (
                  <text x={padL + i * slot + slot / 2} y={H - 6} textAnchor={i === 0 ? "start" : "middle"} fontSize={12} fill="#5d6479">
                    {day.format(new Date(d.date))}
                  </text>
                ) : null}
              </g>
            );
          })}
        </svg>
      </div>
    </section>
  );
}
