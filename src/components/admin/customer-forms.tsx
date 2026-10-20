"use client";

import { ActionForm, FormSubmit } from "./action-form";
import { Textarea } from "@/components/ui/form";
import type { ActionState } from "@/lib/actions";

type Action = (prev: ActionState, form: FormData) => Promise<ActionState>;

export function CustomerNotesForm({ action, value }: { action: Action; value: string | null }) {
  return (
    <ActionForm action={action} compact className="space-y-2">
      <Textarea name="adminNotes" rows={4} defaultValue={value ?? ""} placeholder="Internal notes about this customer (never shown to them)." />
      <FormSubmit size="sm" variant="outline" pendingText="Saving…">
        Save notes
      </FormSubmit>
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
  variant?: "outline" | "danger" | "primary" | "ghost";
  confirm?: string;
}) {
  return (
    <ActionForm action={action} compact confirmMessage={confirm}>
      {hidden ? Object.entries(hidden).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />) : null}
      <FormSubmit size="sm" variant={variant} className="w-full" pendingText="Working…">
        {label}
      </FormSubmit>
    </ActionForm>
  );
}
