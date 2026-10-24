import type { Residue } from "@/lib/sequence";
import { cn } from "@/lib/utils";

/**
 * A peptide written out residue by residue, the way a data sheet prints it. Residues that differ
 * from native GLP-1 at the same position sit on the compound's label colour; a residue carrying a
 * side chain (the fatty acid that binds albumin) is underlined; residues past position 31 are muted.
 */
export function SequenceStrip({ residues, plate, ink, className }: { residues: Residue[]; plate: string; ink: string; className?: string }) {
  return (
    <ol className={cn("flex flex-wrap gap-[3px]", className)} aria-label="Amino-acid sequence">
      {residues.map((r, i) => {
        const changed = r.status === "changed";
        const label = `${i + 1}: ${r.code}${r.mod ? ` with ${r.mod}` : ""}${changed ? ", changed from native GLP-1" : r.status === "added" ? ", beyond native GLP-1" : ""}`;
        return (
          <li
            key={i}
            title={label}
            aria-label={label}
            className={cn(
              "tabular grid h-7 min-w-6 place-items-center px-1 text-small font-medium",
              r.code.length > 1 && "px-1.5",
              changed ? "" : r.status === "added" ? "bg-surface-2 text-muted" : "bg-white",
              r.mod && "underline decoration-2 underline-offset-[3px]",
            )}
            style={changed ? { backgroundColor: plate, color: ink } : undefined}
          >
            {r.code}
          </li>
        );
      })}
    </ol>
  );
}
