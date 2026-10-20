import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const tones = {
  info: { box: "bg-surface text-ink", Icon: Info },
  success: { box: "bg-[#dcfae5] text-[#04250e]", Icon: CheckCircle2 },
  warning: { box: "bg-[#fffbeb] text-[#92400e]", Icon: AlertTriangle },
  error: { box: "bg-[#ffedea] text-[#831c1e]", Icon: XCircle },
} as const;

export function Alert({
  tone = "info",
  title,
  children,
  className,
}: {
  tone?: keyof typeof tones;
  title?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}) {
  const t = tones[tone];
  return (
    <div
      className={cn("flex gap-3 px-4 py-3.5 text-small", t.box, className)}
      role={tone === "error" ? "alert" : "status"}
      aria-live="polite"
    >
      <t.Icon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <div className="min-w-0 space-y-1">
        {title ? <p className="font-medium">{title}</p> : null}
        {children ? <div className="leading-relaxed">{children}</div> : null}
      </div>
    </div>
  );
}
