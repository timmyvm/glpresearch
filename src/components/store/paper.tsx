import { zigzagBottom } from "@/lib/edges";
import { cn } from "@/lib/utils";

/**
 * Pieces of lab paperwork, the site's stationery (DESIGN.md): every panel is a filled shape with
 * a real edge, never an outlined box.
 */

/** A row of semicircles along a panel's top edge (the back of the certificate, receipts). */
export function Scallops({ className, colour = "bg-paper", count = 12 }: { className?: string; colour?: string; count?: number }) {
  return (
    <div className={cn("absolute inset-x-0 bottom-full flex", className)} aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <span key={i} className={cn("aspect-[2/1] flex-1 rounded-t-full", colour, i >= count / 2 && "max-md:hidden")} />
      ))}
    </div>
  );
}

/** A paper slip torn off along its bottom edge (dispatch slip, order receipt, totals). */
export function Slip({ children, className, teeth = 18, as: Tag = "div", ...rest }: React.HTMLAttributes<HTMLElement> & { teeth?: number; as?: "div" | "section" | "article" | "aside" }) {
  return (
    <Tag {...rest} className={cn("edge-zigzag bg-paper text-ink", className)} style={{ ...rest.style, "--zigzag": zigzagBottom(teeth, 12) } as React.CSSProperties}>
      {children}
    </Tag>
  );
}

/** A row on a slip: what happens, a dot leader, and its value. */
export function SlipRow({ label, value, className }: { label: React.ReactNode; value: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex items-baseline gap-2", className)}>
      <span>{label}</span>
      <span className="leader min-w-4 flex-1" aria-hidden="true" />
      <span className="tabular text-right whitespace-nowrap">{value}</span>
    </div>
  );
}
