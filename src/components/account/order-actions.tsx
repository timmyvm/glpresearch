"use client";

import { useState } from "react";
import { cancelOrder, claimPayment } from "@/app/(store)/order/actions";
import { Button } from "@/components/ui/button";
import { FormMessage, PendingButton, useFormAction } from "./form-helpers";

function Hidden({ number, token }: { number: string; token?: string }) {
  return (
    <>
      <input type="hidden" name="number" value={number} />
      {token ? <input type="hidden" name="token" value={token} /> : null}
    </>
  );
}

/** "I've Sent Payment": lets the store know to look for the transfer. */
export function ClaimPaymentButton({ number, token }: { number: string; token?: string }) {
  const { state, pending, onSubmit, ref } = useFormAction(claimPayment);
  if (state.ok) {
    return (
      <p className="bg-white px-4 py-3 text-small" role="status">
        {state.message}
      </p>
    );
  }
  return (
    <form ref={ref} onSubmit={onSubmit} className="space-y-3">
      <Hidden number={number} token={token} />
      <FormMessage state={state} />
      <PendingButton pending={pending} pendingText="Letting us know…" size="lg">
        I&apos;ve Sent Payment
      </PendingButton>
    </form>
  );
}

/** Cancel an unpaid order, after a confirmation step that names the order. */
export function CancelOrderButton({ number, token }: { number: string; token?: string }) {
  const [confirming, setConfirming] = useState(false);
  const { state, pending, onSubmit, ref } = useFormAction(cancelOrder);

  if (state.ok) {
    return (
      <p className="bg-surface px-4 py-3 text-small" role="status">
        {state.message}
      </p>
    );
  }

  if (!confirming) {
    return (
      <Button variant="ghost" size="sm" className="-ml-3 text-danger hover:bg-[#ffedea]" onClick={() => setConfirming(true)}>
        Cancel This Order
      </Button>
    );
  }

  return (
    <form ref={ref} onSubmit={onSubmit} className="space-y-3 bg-[#ffedea] p-4 text-[#831c1e]" aria-live="polite">
      <Hidden number={number} token={token} />
      <p className="text-small">
        Cancel order <span className="tabular font-medium">{number}</span>? The vials go back into stock and this can&apos;t be undone.
      </p>
      <FormMessage state={state} />
      <div className="flex flex-wrap gap-2">
        <PendingButton pending={pending} pendingText="Cancelling…" variant="danger" size="sm">
          Yes, Cancel {number}
        </PendingButton>
        <Button variant="ghost" size="sm" onClick={() => setConfirming(false)} disabled={pending}>
          Keep Order
        </Button>
      </div>
    </form>
  );
}
