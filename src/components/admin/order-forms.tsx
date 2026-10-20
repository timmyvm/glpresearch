"use client";

import { useState } from "react";
import { Checkbox, Field, Input, Label, Select, Textarea } from "@/components/ui/form";
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
        <Textarea id="status-note" name="note" rows={2} placeholder="e.g. Payment matched — thank you!" />
      </Field>
      <label className="flex items-center gap-2 text-sm text-ink-800">
        <Checkbox name="notify" defaultChecked /> Notify customer by email
      </label>
      <FormSubmit className="w-full" pendingText="Updating…">
        Update status
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
          <Input id="carrier" name="carrier" defaultValue={carrier ?? "Australia Post"} list="carriers" />
          <datalist id="carriers">
            <option value="Australia Post" />
            <option value="StarTrack" />
            <option value="Sendle" />
            <option value="Aramex" />
            <option value="DHL Express" />
          </datalist>
        </Field>
        <Field label="Tracking number" htmlFor="trackingNumber">
          <Input id="trackingNumber" name="trackingNumber" defaultValue={trackingNumber ?? ""} className="font-mono" />
        </Field>
      </div>
      {canShip ? (
        <label className="flex items-center gap-2 text-sm text-ink-800">
          <Checkbox name="markShipped" defaultChecked /> Mark order as shipped
        </label>
      ) : null}
      <label className="flex items-center gap-2 text-sm text-ink-800">
        <Checkbox name="notify" defaultChecked /> Email tracking to customer (when shipped)
      </label>
      <FormSubmit className="w-full" variant="outline" pendingText="Saving…">
        Save tracking
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
          <input type="radio" name="visibility" value="internal" checked={visibility === "internal"} onChange={() => setVisibility("internal")} className="accent-mint-600" />
          Internal only
        </label>
        <label className="flex items-center gap-2">
          <input type="radio" name="visibility" value="customer" checked={visibility === "customer"} onChange={() => setVisibility("customer")} className="accent-mint-600" />
          Visible to customer
        </label>
        {visibility === "customer" ? (
          <label className="flex items-center gap-2">
            <Checkbox name="notify" defaultChecked /> Email it
          </label>
        ) : null}
      </div>
      <FormSubmit size="sm" variant="outline" pendingText="Saving…">
        Add note
      </FormSubmit>
    </ActionForm>
  );
}

export function AdminNoteForm({ action, value }: { action: Action; value: string | null }) {
  return (
    <ActionForm action={action} compact className="space-y-2">
      <Textarea name="adminNote" rows={3} defaultValue={value ?? ""} placeholder="Pinned internal note (not visible to customer)" />
      <FormSubmit size="sm" variant="ghost" pendingText="Saving…">
        Save pinned note
      </FormSubmit>
    </ActionForm>
  );
}
