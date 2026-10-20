"use client";

import { useState } from "react";
import { Checkbox, Field, Input, Label, Select, Textarea } from "./fields";
import { ActionForm, FormSubmit } from "./action-form";
import { ORDER_STATUSES, ORDER_STATUS_LABEL } from "@/lib/orders";
import type { ActionState } from "@/lib/actions";

type Action = (prev: ActionState, form: FormData) => Promise<ActionState>;

export function StatusForm({ action, current }: { action: Action; current: string }) {
  return (
    <ActionForm action={action} compact className="space-y-3">
      <Field label="New status" htmlFor="status">
        <Select id="status" name="status" defaultValue={current}>
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>
              {ORDER_STATUS_LABEL[s]}
              {s === current ? " (current)" : ""}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Message (optional)" htmlFor="status-note" hint="Shown on the customer timeline and included in the email.">
        <Textarea id="status-note" name="note" rows={2} placeholder="Payment matched, thank you…" />
      </Field>
      <label className="flex items-center gap-2 text-sm text-ink">
        <Checkbox name="notify" defaultChecked /> Email the customer
      </label>
      <FormSubmit className="h-10 w-full" variant="ink" pendingText="Updating…">
        Update Status
      </FormSubmit>
    </ActionForm>
  );
}

export function TrackingForm({
  action,
  carrier,
  trackingNumber,
  status,
}: {
  action: Action;
  carrier: string | null;
  trackingNumber: string | null;
  status: string;
}) {
  const canShip = ["PAID", "PROCESSING"].includes(status);
  return (
    <ActionForm action={action} compact className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Carrier" htmlFor="carrier">
          <Input id="carrier" name="carrier" defaultValue={carrier ?? "Australia Post"} list="carriers" autoComplete="off" />
          <datalist id="carriers">
            <option value="Australia Post" />
            <option value="StarTrack" />
            <option value="Sendle" />
            <option value="Aramex" />
            <option value="DHL Express" />
          </datalist>
        </Field>
        <Field label="Tracking number" htmlFor="trackingNumber">
          <Input id="trackingNumber" name="trackingNumber" defaultValue={trackingNumber ?? ""} autoComplete="off" spellCheck={false} className="tabular" />
        </Field>
      </div>
      {canShip ? (
        <label className="flex items-center gap-2 text-sm text-ink">
          <Checkbox name="markShipped" defaultChecked /> Mark the order shipped
        </label>
      ) : null}
      <label className="flex items-center gap-2 text-sm text-ink">
        <Checkbox name="notify" defaultChecked /> Email tracking to the customer once shipped
      </label>
      <FormSubmit className="h-10 w-full ring-1 ring-ink/25" variant="outline" pendingText="Saving…">
        Save Tracking
      </FormSubmit>
    </ActionForm>
  );
}

export function NoteForm({ action }: { action: Action }) {
  const [visibility, setVisibility] = useState("internal");
  return (
    <ActionForm action={action} compact resetOnSuccess className="space-y-3">
      <div>
        <Label htmlFor="note-message">Add a note</Label>
        <Textarea id="note-message" name="message" rows={3} placeholder="Write a note…" />
      </div>
      <div className="flex flex-wrap items-center gap-4 text-sm">
        <label className="flex items-center gap-2">
          <input type="radio" name="visibility" value="internal" checked={visibility === "internal"} onChange={() => setVisibility("internal")} className="size-4 accent-ink" />
          Internal only
        </label>
        <label className="flex items-center gap-2">
          <input type="radio" name="visibility" value="customer" checked={visibility === "customer"} onChange={() => setVisibility("customer")} className="size-4 accent-ink" />
          Visible to customer
        </label>
        {visibility === "customer" ? (
          <label className="flex items-center gap-2">
            <Checkbox name="notify" defaultChecked /> Email it
          </label>
        ) : null}
      </div>
      <FormSubmit size="sm" variant="outline" className="ring-1 ring-ink/25" pendingText="Saving…">
        Add Note
      </FormSubmit>
    </ActionForm>
  );
}

export function AdminNoteForm({ action, value }: { action: Action; value: string | null }) {
  return (
    <ActionForm action={action} compact className="space-y-2">
      <Textarea name="adminNote" aria-label="Pinned note" rows={3} defaultValue={value ?? ""} placeholder="Only staff see this note…" />
      <FormSubmit size="sm" variant="ghost" className="-ml-3" pendingText="Saving…">
        Save Pinned Note
      </FormSubmit>
    </ActionForm>
  );
}
