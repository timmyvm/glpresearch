import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const tones = {
  info: { box: "bg-sky-50 text-sky-900 ring-sky-200", Icon: Info, icon: "text-sky-600" },
  success: { box: "bg-emerald-50 text-emerald-900 ring-emerald-200", Icon: CheckCircle2, icon: "text-emerald-600" },
  warning: { box: "bg-amber-50 text-amber-900 ring-amber-200", Icon: AlertTriangle, icon: "text-amber-600" },
  error: { box: "bg-rose-50 text-rose-900 ring-rose-200", Icon: XCircle, icon: "text-rose-600" },
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
    <div className={cn("flex gap-3 rounded-xl p-4 text-sm ring-1 ring-inset", t.box, className)} role="status">
      <t.Icon className={cn("mt-0.5 size-4 shrink-0", t.icon)} />
      <div className="space-y-1">
        {title ? <p className="font-semibold">{title}</p> : null}
        {children ? <div className="leading-relaxed opacity-90">{children}</div> : null}
      </div>
    </div>
  );
}
