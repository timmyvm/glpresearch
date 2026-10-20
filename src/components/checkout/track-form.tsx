"use client";

import Link from "next/link";
import { trackOrder } from "@/app/(store)/track/actions";
import { Field, Input } from "@/components/ui/form";
import { FormMessage, PendingButton, useFormAction } from "@/components/account/form-helpers";

export function TrackForm() {
  const { state, pending, onSubmit, ref } = useFormAction(trackOrder);
  const fe = state.fieldErrors ?? {};
  return (
    <>
      <form ref={ref} onSubmit={onSubmit} className="mt-10 space-y-5" noValidate>
        <FormMessage state={state} />
        <Field label="Order number" htmlFor="number" error={fe.number}>
          <Input id="number" name="number" placeholder="e.g. GLP-10245…" className="tabular uppercase placeholder:normal-case" autoComplete="off" spellCheck={false} aria-invalid={!!fe.number || undefined} />
        </Field>
        <Field label="Email used at checkout" htmlFor="email" error={fe.email}>
          <Input id="email" name="email" type="email" autoComplete="email" spellCheck={false} placeholder="you@institution.edu…" aria-invalid={!!fe.email || undefined} />
        </Field>
        <PendingButton pending={pending} pendingText="Looking up…" size="lg">
          Find My Order
        </PendingButton>
      </form>
      <p className="mt-10 text-muted">
        Have an account?{" "}
        <Link href="/account/orders" className="link text-ink">
          See all your orders
        </Link>
        .
      </p>
    </>
  );
}
