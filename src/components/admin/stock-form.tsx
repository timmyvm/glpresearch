"use client";

import { Check, Loader2 } from "lucide-react";
import { useActionForm } from "./action-form";
import type { ActionState } from "@/lib/actions";

export function StockForm({
  action,
  stock,
  lowStockThreshold,
}: {
  action: (prev: ActionState, form: FormData) => Promise<ActionState>;
  stock: number;
  lowStockThreshold: number;
}) {
  const { state, onSubmit, pending } = useActionForm(action);
  return (
    <form onSubmit={onSubmit} className="flex items-center justify-end gap-2">
      <input
        name="stock"
        type="number"
        min={0}
        defaultValue={stock}
        aria-label="Stock on hand"
        className="h-8 w-20 rounded-md border border-slate-300 px-2 text-right text-sm tabular-nums focus:border-mint-500 focus:ring-2 focus:ring-mint-500/20 focus:outline-none"
      />
      <input
        name="lowStockThreshold"
        type="number"
        min={0}
        defaultValue={lowStockThreshold}
        aria-label="Low stock threshold"
        title="Low stock threshold"
        className="h-8 w-16 rounded-md border border-slate-200 bg-slate-50 px-2 text-right text-xs text-slate-600 tabular-nums focus:border-mint-500 focus:outline-none"
      />
      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-8 items-center gap-1 rounded-md bg-ink-900 px-3 text-xs font-semibold text-white hover:bg-ink-800 disabled:opacity-50"
      >
        {pending ? <Loader2 className="size-3.5 animate-spin" /> : null} Save
      </button>
      <span className="w-4">
        {state.ok && !pending ? <Check className="size-4 text-emerald-600" aria-label={state.message} /> : null}
      </span>
      {state.error ? <span className="text-xs text-rose-600">{state.error}</span> : null}
    </form>
  );
}
