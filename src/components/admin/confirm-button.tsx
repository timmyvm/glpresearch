"use client";

import { Button, type ButtonSize, type ButtonVariant } from "@/components/ui/button";
import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";

function Inner({ children, variant, size, className }: { children: React.ReactNode; variant: ButtonVariant; size: ButtonSize; className?: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant={variant} size={size} className={className} disabled={pending}>
      {pending ? <Loader2 className="size-3.5 animate-spin" aria-hidden="true" /> : null}
      {children}
    </Button>
  );
}

/** A single-button form that asks for confirmation before running a server action. */
export function ConfirmButton({
  action,
  message = "Are you sure?",
  children,
  variant = "danger",
  size = "sm",
  className,
  hidden,
}: {
  action: (form: FormData) => void | Promise<void>;
  message?: string;
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  hidden?: Record<string, string>;
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (message && !window.confirm(message)) e.preventDefault();
      }}
    >
      {hidden ? Object.entries(hidden).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />) : null}
      <Inner variant={variant} size={size} className={className}>
        {children}
      </Inner>
    </form>
  );
}
