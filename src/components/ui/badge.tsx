import { cn } from "@/lib/utils";
import { statusLabel, statusTone } from "@/lib/orders";

export function Badge({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700 ring-1 ring-slate-500/10 ring-inset",
        className,
      )}
      {...props}
    />
  );
}

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  return <Badge className={cn(statusTone(status), className)}>{statusLabel(status)}</Badge>;
}
