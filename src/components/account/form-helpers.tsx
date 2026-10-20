"use client";

import { startTransition, useActionState } from "react";
import { Loader2 } from "lucide-react";
import { initialActionState, type ActionState } from "@/lib/actions";
import { Alert } from "@/components/ui/alert";
import { Button, type ButtonSize, type ButtonVariant } from "@/components/ui/button";

type FormAction = (prev: ActionState, form: FormData) => Promise<ActionState>;

/**
 * useActionState wired through onSubmit so React doesn't reset the form's
 * uncontrolled fields when the server returns validation errors.
 */
export function useFormAction(action: FormAction) {
  const [state, formAction, pending] = useActionState(action, initialActionState);
  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    startTransition(() => formAction(data));
  };
  return { state, pending, onSubmit };
}

export function PendingButton({
  pending,
  children,
  pendingText,
  variant,
  size,
  className,
  disabled,
}: {
  pending: boolean;
  children: React.ReactNode;
  pendingText?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  disabled?: boolean;
}) {
  return (
    <Button type="submit" variant={variant} size={size} className={className} disabled={pending || disabled}>
      {pending ? <Loader2 className="size-4 animate-spin" /> : null}
      {pending && pendingText ? pendingText : children}
    </Button>
  );
}

export function FormMessage({ state }: { state: ActionState }) {
  if (state.error) return <Alert tone="error">{state.error}</Alert>;
  if (state.ok && state.message) return <Alert tone="success">{state.message}</Alert>;
  return null;
}
