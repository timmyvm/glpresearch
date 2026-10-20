"use client";

import { useActionState } from "react";
import { subscribe } from "@/app/(store)/actions";
import { initialActionState } from "@/lib/actions";
import { SubmitButton } from "@/components/ui/submit-button";

export function NewsletterForm() {
  const [state, action] = useActionState(subscribe, initialActionState);

  if (state.ok) {
    return <p className="rounded-lg bg-mint-400/10 px-3 py-2 text-sm text-mint-200">{state.message}</p>;
  }

  return (
    <form action={action} className="flex max-w-sm gap-2">
      <input
        type="email"
        name="email"
        required
        placeholder="you@institution.edu"
        aria-label="Email address"
        className="h-10 min-w-0 flex-1 rounded-lg border border-white/15 bg-white/5 px-3 text-sm text-white placeholder:text-ink-400 focus:border-mint-400 focus:outline-none"
      />
      <SubmitButton variant="accent">Subscribe</SubmitButton>
      {state.error ? <p className="sr-only">{state.error}</p> : null}
    </form>
  );
}
