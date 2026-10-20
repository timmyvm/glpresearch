"use client";

import { useActionState } from "react";
import { requestStockAlert } from "@/app/(store)/actions";
import { initialActionState } from "@/lib/actions";
import { SubmitButton } from "@/components/ui/submit-button";

/** Shown in place of Add to Cart when the selected vial size is sold out. */
export function StockAlertForm({ variantId, label }: { variantId: string; label: string }) {
  const [state, action] = useActionState(requestStockAlert, initialActionState);

  return (
    <div aria-live="polite">
      {state.ok ? (
        <p className="bg-white px-4 py-3">{state.message}</p>
      ) : (
        <form action={action} className="space-y-2">
          <input type="hidden" name="variantId" value={variantId} />
          <label htmlFor={`alert-${variantId}`} className="block text-small font-medium">
            The {label} vial is sold out. Get one email when it&apos;s back.
          </label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              id={`alert-${variantId}`}
              name="email"
              type="email"
              required
              autoComplete="email"
              spellCheck={false}
              placeholder="you@institution.edu…"
              aria-invalid={state.error ? true : undefined}
              className="h-14 min-w-0 sm:flex-1 bg-white px-4 text-body placeholder:text-muted/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-ink"
            />
            <SubmitButton variant="ink" size="lg" pendingText="Saving…">
              Email Me When It&apos;s Back
            </SubmitButton>
          </div>
          {state.error ? (
            <p className="text-small text-danger" role="alert">
              {state.error}
            </p>
          ) : null}
        </form>
      )}
    </div>
  );
}
