import { cn } from "@/lib/utils";

// Admin form controls (app-screens §8.1): 40px, white with a 1px grey border even on grey, the label
// above at 14/500. Same API as components/ui/form so the admin forms swap the import and nothing else.
const control =
  "block w-full border border-[#dfe2e8] bg-white px-3 text-sm text-ink placeholder:text-muted/80 transition-[border-color,box-shadow] duration-150 hover:border-[#c9cdd6] focus:border-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-ink disabled:cursor-not-allowed disabled:bg-surface disabled:text-muted aria-invalid:border-danger aria-invalid:ring-1 aria-invalid:ring-danger";

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(control, "h-10", className)} {...props} />;
}

export function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(control, "py-2.5 leading-relaxed", className)} {...props} />;
}

export function Select({ className, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn(control, "h-10 border-[#d1d5db] pr-8", className)} {...props} />;
}

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn("mb-2 block text-sm font-medium text-ink", className)} {...props} />;
}

export function Field({
  label,
  htmlFor,
  error,
  hint,
  className,
  children,
}: {
  label: string;
  htmlFor?: string;
  error?: string | string[];
  hint?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  const message = Array.isArray(error) ? error[0] : error;
  return (
    <div className={className}>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {message ? (
        <p className="mt-1.5 text-small text-danger" role="alert">
          {message}
        </p>
      ) : hint ? (
        <p className="mt-1.5 text-small text-muted">{hint}</p>
      ) : null}
    </div>
  );
}

export function Checkbox({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input type="checkbox" className={cn("size-4 shrink-0 accent-ink", className)} {...props} />;
}

/** A checkbox with a 14/500 title and a grey line under it. */
export function CheckRow({
  title,
  description,
  className,
  ...props
}: { title: React.ReactNode; description?: React.ReactNode } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className={cn("flex items-start gap-3 text-sm", className)}>
      <Checkbox className="mt-0.5" {...props} />
      <span>
        <span className="font-medium text-ink">{title}</span>
        {description ? <span className="block text-small text-muted">{description}</span> : null}
      </span>
    </label>
  );
}
