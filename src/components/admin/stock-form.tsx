"use client";

import { Loader2 } from "lucide-react";
import { useActionForm } from "./action-form";
import type { ActionState } from "@/lib/actions";

const field =
  "tabular h-8 border border-ink/20 bg-white px-2 text-right text-sm text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-ink";

/** Inline stock edit for a table row: count on hand, the low-stock threshold, Save. */
export function StockForm({
  action,
  stock,
  lowStockThreshold,
  label,
}: {
  action: (prev: ActionState, form: FormData) => Promise<ActionState>;
  stock: number;
  lowStockThreshold: number;
  label: string;
}) {
  const { state, onSubmit, pending } = useActionForm(action);
  return (
    <form onSubmit={onSubmit} className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-2">
        <input
          name="stock"
          type="number"
          inputMode="numeric"
          min={0}
          defaultValue={stock}
          aria-label={`Stock on hand, ${label}`}
          className={`${field} w-16 sm:w-20`}
        />
        <input
          name="lowStockThreshold"
          type="number"
          inputMode="numeric"
          min={0}
          defaultValue={lowStockThreshold}
          aria-label={`Low stock threshold, ${label}`}
          title="Low stock threshold"
          className={`${field} w-12 text-muted sm:w-16`}
        />
        <button
          type="submit"
          disabled={pending}
          className="press inline-flex h-8 items-center gap-1 bg-ink px-3 text-small font-medium text-on-navy hover:bg-ink-800 disabled:opacity-50"
        >
          {pending ? <Loader2 className="size-3.5 animate-spin" aria-hidden="true" /> : null}
          Save
        </button>
      </div>
      <p className="text-right text-small" aria-live="polite">
        {state.error ? <span className="text-danger">{state.error}</span> : state.ok && !pending ? <span className="text-success">{state.message}</span> : null}
      </p>
    </form>
  );
}
