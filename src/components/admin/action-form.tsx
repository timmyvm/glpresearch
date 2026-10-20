"use client";

import { createContext, startTransition, useActionState, useContext, useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button, type ButtonSize, type ButtonVariant } from "@/components/ui/button";
import { initialActionState, type ActionState } from "@/lib/actions";

type Action = (prev: ActionState, form: FormData) => Promise<ActionState>;

/**
 * useActionState wired through onSubmit instead of <form action>, so React doesn't auto-reset
 * uncontrolled fields after every submission (which would wipe edits when validation fails).
 */
export function useActionForm(action: Action, confirmMessage?: string) {
  const [state, dispatch, pending] = useActionState(action, initialActionState);
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (confirmMessage && !window.confirm(confirmMessage)) return;
    const fd = new FormData(e.currentTarget);
    const submitter = (e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
    if (submitter?.name) fd.append(submitter.name, submitter.value);
    startTransition(() => dispatch(fd));
  };
  return { state, onSubmit, pending };
}

export const PendingContext = createContext(false);

export function FormSubmit({
  children,
  pendingText,
  variant,
  size,
  className,
}: {
  children: React.ReactNode;
  pendingText?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}) {
  const pending = useContext(PendingContext);
  return (
    <Button type="submit" variant={variant} size={size} className={className} disabled={pending}>
      {pending ? <Loader2 className="size-4 animate-spin" /> : null}
      {pending && pendingText ? pendingText : children}
    </Button>
  );
}

export function FormFeedback({ state, compact }: { state: ActionState; compact?: boolean }) {
  const fieldErrors = state.fieldErrors
    ? Object.entries(state.fieldErrors)
        .filter(([, v]) => v?.length)
        .map(([k, v]) => `${k}: ${v![0]}`)
    : [];
  return (
    <>
      {state.error ? (
        <Alert tone="error" className={compact ? "mt-3 p-3 text-xs" : "mt-4"} title={state.error}>
          {fieldErrors.length ? (
            <ul className="list-disc pl-4">
              {fieldErrors.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          ) : null}
        </Alert>
      ) : null}
      {state.ok && state.message ? (
        <Alert tone="success" className={compact ? "mt-3 p-3 text-xs" : "mt-4"}>
          {state.message}
        </Alert>
      ) : null}
    </>
  );
}

/** Generic form wrapper for server actions that return ActionState. Use <FormSubmit> inside. */
export function ActionForm({
  action,
  children,
  className,
  resetOnSuccess = false,
  compact = false,
  confirmMessage,
}: {
  action: Action;
  children: React.ReactNode;
  className?: string;
  resetOnSuccess?: boolean;
  compact?: boolean;
  confirmMessage?: string;
}) {
  const { state, onSubmit, pending } = useActionForm(action, confirmMessage);
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok && resetOnSuccess) ref.current?.reset();
  }, [state, resetOnSuccess]);

  return (
    <PendingContext.Provider value={pending}>
      <form ref={ref} onSubmit={onSubmit} className={className}>
        {children}
        <FormFeedback state={state} compact={compact} />
      </form>
    </PendingContext.Provider>
  );
}

