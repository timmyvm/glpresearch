import { cn, splitList } from "@/lib/utils";

const RECEPTOR_STYLE: Record<string, string> = {
  "GLP-1R": "bg-mint-50 text-mint-800 ring-mint-600/20",
  GIPR: "bg-violet-50 text-violet-800 ring-violet-600/20",
  GCGR: "bg-amber-50 text-amber-800 ring-amber-600/20",
};

export function ReceptorChips({ targets, className, dark }: { targets: string; className?: string; dark?: boolean }) {
  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {splitList(targets).map((t) => (
        <span
          key={t}
          className={cn(
            "rounded-md px-1.5 py-0.5 font-mono text-[10.5px] font-medium ring-1 ring-inset",
            dark ? "bg-white/10 text-white ring-white/20" : (RECEPTOR_STYLE[t] ?? "bg-slate-100 text-slate-700 ring-slate-500/20"),
          )}
        >
          {t}
        </span>
      ))}
    </div>
  );
}
