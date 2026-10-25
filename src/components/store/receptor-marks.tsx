import { splitList } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { RECEPTORS } from "./receptors";

/**
 * Which of the three incretin receptors a compound acts on, as three filled or empty squares
 * with their names: the way a data sheet ticks its boxes.
 */
export function ReceptorMarks({ targets, className, tone = "ink" }: { targets: string; className?: string; tone?: "ink" | "light" }) {
  const on = splitList(targets);
  return (
    <ul className={cn("flex flex-wrap gap-x-4 gap-y-1 text-small", className)} aria-label="Receptors it acts on">
      {RECEPTORS.map((r) => {
        const active = on.includes(r.key);
        return (
          <li key={r.key} className={cn("inline-flex items-center gap-1.5", active ? "" : tone === "light" ? "text-on-navy-muted" : "text-muted")}>
            <span
              className={cn("size-3 shrink-0", active ? (tone === "light" ? "bg-white" : "bg-ink") : tone === "light" ? "bg-white/25" : "bg-ink/15")}
              aria-hidden="true"
            />
            <span>
              {r.key}
              <span className="sr-only">{active ? ": yes" : ": no"}</span>
            </span>
          </li>
        );
      })}
    </ul>
  );
}
