import { cn } from "@/lib/utils";

// Fields are filled surfaces with no border; focus draws a 2px ink ring. See DESIGN.md.
const control =
  "block w-full bg-surface px-3.5 text-base text-ink placeholder:text-muted/80 transition-[background-color,box-shadow] duration-150 hover:bg-surface-2 focus:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-ink disabled:cursor-not-allowed disabled:text-muted aria-invalid:bg-[#ffedea] aria-invalid:ring-2 aria-invalid:ring-danger/60";

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(control, "h-12", className)} {...props} />;
}

export function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(control, "py-3 leading-relaxed", className)} {...props} />;
}

export function Select({ className, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn(control, "h-12 pr-9", className)} {...props} />;
}

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn("mb-2 block text-small font-medium text-ink", className)} {...props} />;
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
  hint?: string;
  className?: string;
  children: React.ReactNode;
}) {
  const message = Array.isArray(error) ? error[0] : error;
  return (
    <div className={className}>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {message ? (
        <p className="mt-2 text-small text-danger" role="alert">
          {message}
        </p>
      ) : hint ? (
        <p className="mt-2 text-small text-muted">{hint}</p>
      ) : null}
    </div>
  );
}

export function Checkbox({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input type="checkbox" className={cn("size-5 shrink-0 accent-ink", className)} {...props} />;
}
