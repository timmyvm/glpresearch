import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  description,
  actions,
  back,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  back?: { href: string; label: string };
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {back ? (
          <Link href={back.href} className="mb-2 inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-ink-900">
            <ChevronLeft className="size-3.5" /> {back.label}
          </Link>
        ) : null}
        <h1 className="text-2xl font-semibold tracking-tight text-ink-900">{title}</h1>
        {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function TableWrap({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs", className)}>
      <div className="max-h-[70vh] overflow-auto">
        <table className="w-full min-w-[720px] text-left text-sm">{children}</table>
      </div>
    </div>
  );
}

export function Th({ children, className }: { children?: React.ReactNode; className?: string }) {
  return (
    <th
      className={cn(
        "sticky top-0 z-10 border-b border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-semibold tracking-wide whitespace-nowrap text-slate-500 uppercase",
        className,
      )}
    >
      {children}
    </th>
  );
}

export function Td({ children, className, colSpan }: { children?: React.ReactNode; className?: string; colSpan?: number }) {
  return (
    <td colSpan={colSpan} className={cn("border-b border-slate-100 px-4 py-3 align-middle", className)}>
      {children}
    </td>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      {Icon ? (
        <div className="grid size-12 place-items-center rounded-full bg-ink-50">
          <Icon className="size-5 text-ink-400" />
        </div>
      ) : null}
      <div>
        <p className="text-sm font-semibold text-ink-900">{title}</p>
        {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function Pagination({
  page,
  pageCount,
  total,
  makeHref,
}: {
  page: number;
  pageCount: number;
  total: number;
  makeHref: (page: number) => string;
}) {
  if (pageCount <= 1) return <p className="mt-3 text-xs text-slate-500">{total} result{total === 1 ? "" : "s"}</p>;
  return (
    <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
      <p>
        Page {page} of {pageCount} · {total} results
      </p>
      <div className="flex gap-1">
        {page > 1 ? (
          <Link href={makeHref(page - 1)} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 font-medium text-ink-800 hover:bg-slate-50">
            <ChevronLeft className="size-3.5" /> Prev
          </Link>
        ) : null}
        {page < pageCount ? (
          <Link href={makeHref(page + 1)} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 font-medium text-ink-800 hover:bg-slate-50">
            Next <ChevronRight className="size-3.5" />
          </Link>
        ) : null}
      </div>
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
  change,
  icon: Icon,
  tone = "default",
}: {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  change?: number;
  icon?: React.ComponentType<{ className?: string }>;
  tone?: "default" | "warning";
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-medium tracking-wide text-slate-500 uppercase">{label}</p>
        {Icon ? (
          <span className={cn("grid size-8 place-items-center rounded-lg", tone === "warning" ? "bg-amber-50 text-amber-600" : "bg-mint-50 text-mint-700")}>
            <Icon className="size-4" />
          </span>
        ) : null}
      </div>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-ink-900 tabular-nums">{value}</p>
      <div className="mt-1 flex items-center gap-2 text-xs">
        {typeof change === "number" ? (
          <span className={cn("font-semibold", change >= 0 ? "text-emerald-600" : "text-rose-600")}>
            {change >= 0 ? "▲" : "▼"} {Math.abs(change).toFixed(1)}%
          </span>
        ) : null}
        {hint ? <span className="text-slate-500">{hint}</span> : null}
      </div>
    </div>
  );
}

export function DefinitionList({ items }: { items: { label: string; value: React.ReactNode }[] }) {
  return (
    <dl className="divide-y divide-slate-100 text-sm">
      {items.map((item) => (
        <div key={item.label} className="flex justify-between gap-4 py-2">
          <dt className="text-slate-500">{item.label}</dt>
          <dd className="text-right font-medium text-ink-900">{item.value ?? "—"}</dd>
        </div>
      ))}
    </dl>
  );
}
