import { cn } from "@/lib/utils";
import { statusLabel, statusTone } from "@/lib/orders";

// Status pills: a pale tint with dark text of the same hue (app-screen rule). Never above a heading.
export function Badge({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex h-6 flex-none items-center gap-1 rounded-full bg-surface px-2.5 text-small leading-none font-medium whitespace-nowrap text-muted",
        className,
      )}
      {...props}
    />
  );
}

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  return <Badge className={cn(statusTone(status), className)}>{statusLabel(status)}</Badge>;
}
