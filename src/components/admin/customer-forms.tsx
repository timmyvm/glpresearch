"use client";

import { ActionForm, FormSubmit } from "./action-form";
import { Textarea } from "./fields";
import type { ActionState } from "@/lib/actions";

type Action = (prev: ActionState, form: FormData) => Promise<ActionState>;

export function CustomerNotesForm({ action, value }: { action: Action; value: string | null }) {
  return (
    <ActionForm action={action} compact className="space-y-3">
      <Textarea name="adminNotes" aria-label="Internal notes" rows={4} defaultValue={value ?? ""} placeholder="Notes about this customer. Never shown to them…" />
      <div className="flex justify-end">
        <FormSubmit size="sm" variant="outline" className="ring-1 ring-ink/25" pendingText="Saving…">
          Save Notes
        </FormSubmit>
      </div>
    </ActionForm>
  );
}

/** One-button form that posts fixed hidden values to an ActionState action. */
export function QuickAction({
  action,
  hidden,
  label,
  variant = "outline",
  confirm,
}: {
  action: Action;
  hidden?: Record<string, string>;
  label: string;
  variant?: "outline" | "danger" | "ink" | "ghost";
  confirm?: string;
}) {
  return (
    <ActionForm action={action} compact confirmMessage={confirm}>
      {hidden ? Object.entries(hidden).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />) : null}
      <FormSubmit
        size="sm"
        variant={variant === "danger" ? "ghost" : variant}
        className={`w-full ${variant === "outline" ? "ring-1 ring-ink/25" : variant === "danger" ? "text-danger ring-1 ring-danger/40 ring-inset hover:bg-[#fbe4e1]" : ""}`}
        pendingText="Working…"
      >
        {label}
      </FormSubmit>
    </ActionForm>
  );
}
