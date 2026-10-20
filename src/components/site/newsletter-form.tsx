"use client";

import { useActionState } from "react";
import { subscribe } from "@/app/(store)/actions";
import { initialActionState } from "@/lib/actions";
import { SubmitButton } from "@/components/ui/submit-button";

export function NewsletterForm() {
  const [state, action] = useActionState(subscribe, initialActionState);

  if (state.ok) {
    return (
      <p className="text-small text-ink" role="status">
        {state.message}
      </p>
    );
  }

  return (
    <form action={action} className="space-y-2">
      <label htmlFor="newsletter-email" className="block text-small text-muted">
        New batches and literature reviews, by email
      </label>
      <div className="flex gap-2">
        <input
          id="newsletter-email"
          type="email"
          name="email"
          required
          autoComplete="email"
          spellCheck={false}
          placeholder="you@institution.edu…"
          className="h-11 min-w-0 flex-1 bg-white px-3 text-base text-ink placeholder:text-muted/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-ink"
        />
        <SubmitButton variant="ink">Subscribe</SubmitButton>
      </div>
      {state.error ? (
        <p className="text-small text-danger" role="alert">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}
