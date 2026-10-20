"use client";

import Link from "next/link";
import { trackOrder } from "@/app/(store)/track/actions";
import { Card } from "@/components/ui/card";
import { Field, Input } from "@/components/ui/form";
import { FormMessage, PendingButton, useFormAction } from "@/components/account/form-helpers";

export function TrackForm() {
  const { state, pending, onSubmit } = useFormAction(trackOrder);
  const fe = state.fieldErrors ?? {};
  return (
    <Card className="p-6 sm:p-8">
      <form onSubmit={onSubmit} className="space-y-5" noValidate>
        <FormMessage state={state} />
        <Field label="Order number" htmlFor="number" error={fe.number}>
          <Input id="number" name="number" placeholder="GLP-10245" className="font-mono uppercase" autoComplete="off" aria-invalid={!!fe.number} />
        </Field>
        <Field label="Email" htmlFor="email" error={fe.email}>
          <Input id="email" name="email" type="email" autoComplete="email" aria-invalid={!!fe.email} />
        </Field>
        <PendingButton pending={pending} pendingText="Looking up…" size="lg" className="w-full">
          Track order
        </PendingButton>
      </form>
      <p className="mt-6 border-t border-slate-100 pt-5 text-center text-sm text-slate-500">
        Have an account?{" "}
        <Link href="/account/orders" className="font-medium text-mint-700 hover:underline">
          See all your orders
        </Link>
      </p>
    </Card>
  );
}
