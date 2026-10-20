"use client";

import { useActionState } from "react";
import { sendContactMessage } from "../actions";
import { initialActionState } from "@/lib/actions";
import { Alert } from "@/components/ui/alert";
import { Field, Input, Select, Textarea } from "@/components/ui/form";
import { SubmitButton } from "@/components/ui/submit-button";

const SUBJECTS = ["Order enquiry", "Payment", "Shipping & delivery", "COA request", "Product information", "Bulk / institutional pricing", "Other"];

export function ContactForm({ defaultOrder }: { defaultOrder?: string }) {
  const [state, action] = useActionState(sendContactMessage, initialActionState);
  const e = state.fieldErrors ?? {};

  if (state.ok) {
    return (
      <Alert tone="success" title="Message sent" className="mt-6">
        {state.message}
      </Alert>
    );
  }

  return (
    <form action={action} className="mt-6 grid gap-5 sm:grid-cols-2">
      {state.error ? <Alert tone="error" className="sm:col-span-2">{state.error}</Alert> : null}
      <Field label="Name" htmlFor="name" error={e.name}>
        <Input id="name" name="name" autoComplete="name" required />
      </Field>
      <Field label="Email" htmlFor="email" error={e.email}>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </Field>
      <Field label="Subject" htmlFor="subject" error={e.subject}>
        <Select id="subject" name="subject" defaultValue={defaultOrder ? "Order enquiry" : ""} required>
          <option value="" disabled>Choose a subject…</option>
          {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
        </Select>
      </Field>
      <Field label="Order number (optional)" htmlFor="orderNumber" error={e.orderNumber}>
        <Input id="orderNumber" name="orderNumber" placeholder="GLP-10250" defaultValue={defaultOrder} />
      </Field>
      <Field label="Message" htmlFor="message" error={e.message} className="sm:col-span-2">
        <Textarea id="message" name="message" rows={6} required />
      </Field>
      <div className="sm:col-span-2">
        <SubmitButton pendingText="Sending…" size="lg">Send message</SubmitButton>
      </div>
    </form>
  );
}
