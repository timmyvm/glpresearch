import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

// Admin kit, after references/app-screens.md (achromatic ledger): white panels with one quiet
// border on the blue-grey ground, 13–14px grey sentence-case labels, ink figures, no icons in tiles.

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
      <div className="min-w-0">
        {back ? (
          <Link href={back.href} className="mb-2 inline-flex items-center gap-1 text-small text-muted hover:text-ink">
            <ChevronLeft className="size-3.5" aria-hidden="true" /> {back.label}
          </Link>
        ) : null}
        <h1 className="text-2xl leading-tight font-medium tracking-[-0.02em] text-ink">{title}</h1>
        {description ? <p className="mt-1 max-w-[80ch] text-sm text-muted">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2 sm:shrink-0">{actions}</div> : null}
    </div>
  );
}

/** A white panel with one quiet border, optionally titled. */
export function Panel({
  title,
  description,
  action,
  children,
  className,
  bodyClassName,
}: {
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section className={cn("border border-surface-2 bg-white", className)}>
      {title ? (
        <div className="flex items-start justify-between gap-4 px-5 pt-4 pb-3">
          <div className="min-w-0">
            <h2 className="text-base font-medium text-ink">{title}</h2>
            {description ? <p className="mt-0.5 text-sm text-muted">{description}</p> : null}
          </div>
          {action ? <div className="shrink-0 text-sm">{action}</div> : null}
        </div>
      ) : null}
      <div className={cn(title ? "px-5 pb-5" : "p-5", bodyClassName)}>{children}</div>
    </section>
  );
}

export function TableWrap({ children, className, minWidth = 720 }: { children: React.ReactNode; className?: string; minWidth?: number }) {
  return (
    <div className={cn("min-w-0 border border-surface-2 bg-white", className)}>
      <div className="relative overflow-x-auto overscroll-x-contain">
        <table className="w-full text-left text-sm" style={{ minWidth }}>
          {children}
        </table>
      </div>
    </div>
  );
}

export function Th({ children, className }: { children?: React.ReactNode; className?: string }) {
  return (
    <th
      scope="col"
      className={cn("bg-white px-4 pt-3 pb-2 text-small font-normal whitespace-nowrap text-muted", className)}
    >
      {children}
    </th>
  );
}

export function Td({ children, className, colSpan }: { children?: React.ReactNode; className?: string; colSpan?: number }) {
  return (
    <td colSpan={colSpan} className={cn("border-t border-ink/[0.07] px-4 py-3 align-middle", className)}>
      {children}
    </td>
  );
}

/** One sentence inside the frame, the next step beside it. No illustration. */
export function EmptyState({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-start gap-2 px-5 py-8 text-sm", className)}>
      <p className="font-medium text-ink">{title}</p>
      {description ? <p className="text-muted">{description}</p> : null}
      {action}
    </div>
  );
}

export function Pagination({
  page,
  pageCount,
  total,
  pageSize,
  noun = "result",
  makeHref,
}: {
  page: number;
  pageCount: number;
  total: number;
  pageSize: number;
  noun?: string;
  makeHref: (page: number) => string;
}) {
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);
  const nf = new Intl.NumberFormat("en-AU");
  return (
    <div className="mt-3 flex items-center justify-between text-sm text-muted">
      <p className="tabular">
        {total === 0 ? `No ${noun}s` : `${nf.format(from)}–${nf.format(to)} of ${nf.format(total)} ${noun}${total === 1 ? "" : "s"}`}
      </p>
      {pageCount > 1 ? (
        <div className="flex gap-2">
          {page > 1 ? (
            <Link href={makeHref(page - 1)} className="press inline-flex h-8 items-center border border-ink/20 bg-white px-3 font-medium text-ink hover:bg-surface">
              Previous
            </Link>
          ) : null}
          {page < pageCount ? (
            <Link href={makeHref(page + 1)} className="press inline-flex h-8 items-center border border-ink/20 bg-white px-3 font-medium text-ink hover:bg-surface">
              Next
            </Link>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export type Stat = {
  label: string;
  value: React.ReactNode;
  note?: React.ReactNode;
  /** Colour only the note: good, bad or neutral (grey). */
  tone?: "good" | "bad" | "neutral";
  href?: string;
};

/** KPIs as type, not tiles: one container split by 1px dividers into equal columns. */
export function StatStrip({ stats, className }: { stats: Stat[]; className?: string }) {
  const cols = { 2: "sm:grid-cols-2", 3: "sm:grid-cols-3", 4: "sm:grid-cols-4", 5: "sm:grid-cols-5", 6: "sm:grid-cols-6" }[stats.length] ?? "sm:grid-cols-4";
  return (
    <div className={cn("grid grid-cols-2 border border-surface-2 bg-white", cols, className)}>
      {stats.map((s, i) => {
        const inner = (
          <>
            <p className="text-sm text-muted">{s.label}</p>
            <p className="tabular mt-1 text-2xl leading-tight font-medium tracking-[-0.01em] text-ink">{s.value}</p>
            {s.note ? (
              <p className={cn("tabular mt-1 text-small", s.tone === "good" ? "text-success" : s.tone === "bad" ? "text-danger" : "text-muted")}>{s.note}</p>
            ) : null}
          </>
        );
        const cell = cn(
          "block min-w-0 px-5 py-4",
          // dividers: left rule on every cell but the first in a row, top rule from the second row on phones
          i % 2 === 1 ? "border-l border-surface-2" : "",
          i >= 2 ? "border-t border-surface-2 sm:border-t-0" : "",
          i > 0 ? "sm:border-l" : "sm:border-l-0",
          stats.length % 2 === 1 && i === stats.length - 1 ? "col-span-2 border-l-0 sm:col-span-1 sm:border-l" : "",
        );
        return s.href ? (
          <Link key={s.label} href={s.href} className={cn(cell, "hover:bg-surface/60")}>
            {inner}
          </Link>
        ) : (
          <div key={s.label} className={cell}>
            {inner}
          </div>
        );
      })}
    </div>
  );
}

export function DefinitionList({ items, className }: { items: { label: string; value: React.ReactNode }[]; className?: string }) {
  return (
    <dl className={cn("text-sm", className)}>
      {items.map((item) => (
        <div key={item.label} className="flex justify-between gap-4 py-1.5">
          <dt className="text-muted">{item.label}</dt>
          <dd className="min-w-0 text-right text-ink">{item.value ?? <span className="text-muted">–</span>}</dd>
        </div>
      ))}
    </dl>
  );
}

/** A compound's label colour as a small identity mark next to its name. */
export function Swatch({ color, className }: { color: string; className?: string }) {
  return <span className={cn("inline-block size-2.5 shrink-0", className)} style={{ backgroundColor: color }} aria-hidden="true" />;
}

/** A quiet notice (one per screen at most), e.g. a queue that needs attention. */
export function Notice({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("border border-[#f6cf9f] bg-[#fdebd3] px-4 py-2.5 text-sm text-[#7a3d00]", className)}>{children}</div>;
}

/** Inline text action in ink, for a row that needs doing. */
export const textAction = "font-medium text-ink underline decoration-ink/30 underline-offset-[0.2em] hover:decoration-ink";

const STOCK_TONE = {
  out: "bg-[#fbe4e1] text-[#8a1c14]",
  low: "bg-[#fdebd3] text-[#7a3d00]",
  ok: "bg-surface text-muted",
  hidden: "bg-surface text-muted",
} as const;

/** One stock pill per row: hidden beats out, out beats low. */
export function StockPill({ stock, threshold, hidden, className }: { stock: number; threshold: number; hidden?: boolean; className?: string }) {
  const [tone, label] = hidden
    ? (["hidden", "Hidden"] as const)
    : stock <= 0
      ? (["out", "Out of stock"] as const)
      : stock <= threshold
        ? (["low", "Low"] as const)
        : (["ok", "In stock"] as const);
  return (
    <span className={cn("inline-flex h-6 items-center rounded-full px-2.5 text-small leading-none font-medium whitespace-nowrap", STOCK_TONE[tone], className)}>
      {label}
    </span>
  );
}

/** One account pill: suspended beats admin. */
export function AccountPill({ role, status }: { role: string; status: string }) {
  const [label, tone] =
    status === "SUSPENDED" ? ["Suspended", "bg-[#fbe4e1] text-[#8a1c14]"] : role === "ADMIN" ? ["Admin", "bg-[#e3e7f1] text-ink"] : ["Active", "bg-surface text-muted"];
  return <span className={cn("inline-flex h-6 items-center rounded-full px-2.5 text-small leading-none font-medium whitespace-nowrap", tone)}>{label}</span>;
}
