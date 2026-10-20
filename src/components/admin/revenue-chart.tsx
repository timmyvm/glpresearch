"use client";

import { useMemo, useState } from "react";
import { Area, Bar, CartesianGrid, ComposedChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatMoney } from "@/lib/money";
import { cn } from "@/lib/utils";

export type DayPoint = { date: string; revenue: number; orders: number };

const RANGES = [30, 60, 90] as const;

export function RevenueChart({ data }: { data: DayPoint[] }) {
  const [range, setRange] = useState<(typeof RANGES)[number]>(30);
  const series = useMemo(() => data.slice(-range), [data, range]);
  const totals = useMemo(
    () => series.reduce((acc, d) => ({ revenue: acc.revenue + d.revenue, orders: acc.orders + d.orders }), { revenue: 0, orders: 0 }),
    [series],
  );

  return (
    <div className="flex flex-col rounded-2xl border border-slate-200 bg-white shadow-xs">
      <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold text-ink-900">Revenue & orders</h3>
          <p className="mt-0.5 text-sm text-slate-500">
            {formatMoney(totals.revenue)} paid revenue · {totals.orders} orders in the last {range} days
          </p>
        </div>
        <div className="inline-flex rounded-lg bg-slate-100 p-0.5">
          {RANGES.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRange(r)}
              className={cn(
                "rounded-md px-3 py-1 text-xs font-semibold transition-colors",
                r === range ? "bg-white text-ink-900 shadow-sm" : "text-slate-500 hover:text-ink-900",
              )}
            >
              {r}d
            </button>
          ))}
        </div>
      </div>
      <div className="h-72 min-h-72 flex-1 px-2 py-4">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={series} margin={{ top: 8, right: 12, bottom: 0, left: 4 }}>
            <defs>
              <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#14b8a6" stopOpacity={0.28} />
                <stop offset="100%" stopColor="#14b8a6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="#e2e8f0" strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: "#64748b" }}
              tickFormatter={(d: string) => new Date(d).toLocaleDateString("en-AU", { day: "numeric", month: "short" })}
              minTickGap={24}
            />
            <YAxis
              yAxisId="rev"
              tickLine={false}
              axisLine={false}
              width={56}
              tick={{ fontSize: 11, fill: "#64748b" }}
              tickFormatter={(v: number) => `$${Math.round(v / 100).toLocaleString()}`}
            />
            <YAxis yAxisId="orders" orientation="right" tickLine={false} axisLine={false} width={28} allowDecimals={false} tick={{ fontSize: 11, fill: "#94a3b8" }} />
            <Tooltip
              cursor={{ fill: "rgba(11,21,48,0.04)" }}
              contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12, boxShadow: "0 8px 24px rgba(11,21,48,0.08)" }}
              labelFormatter={(d) => new Date(String(d)).toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "short" })}
              formatter={(value, name) => (name === "revenue" ? [formatMoney(Number(value)), "Revenue"] : [value, "Orders"])}
            />
            <Bar yAxisId="orders" dataKey="orders" fill="#c9d2e8" radius={[4, 4, 0, 0]} maxBarSize={14} />
            <Area yAxisId="rev" type="monotone" dataKey="revenue" stroke="#0d9488" strokeWidth={2} fill="url(#rev)" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
