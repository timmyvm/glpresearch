"use client";

import { useState, useTransition } from "react";
import { deleteAddress, saveAddress, setDefaultAddress } from "@/app/(store)/account/actions";
import { AU_STATES } from "@/components/checkout/au-states";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox, Field, Input, Select } from "@/components/ui/form";
import { FormMessage, PendingButton, useFormAction } from "./form-helpers";

export type SavedAddress = {
  id: string;
  label: string | null;
  firstName: string;
  lastName: string;
  company: string | null;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  postcode: string;
  country: string;
  phone: string | null;
  isDefault: boolean;
};

function AddressForm({ address, onDone }: { address?: SavedAddress; onDone: () => void }) {
  const { state, pending, onSubmit, ref } = useFormAction(async (prev, form) => {
    const result = await saveAddress(prev, form);
    if (result.ok) onDone();
    return result;
  });
  const fe = state.fieldErrors ?? {};
  return (
    <Card aria-labelledby="address-form-title" className="p-5">
      <h2 id="address-form-title" className="text-lead font-semibold">
        {address ? `Edit ${address.label || "address"}` : "New address"}
      </h2>
      <form ref={ref} onSubmit={onSubmit} className="mt-5 space-y-4" noValidate>
        {address ? <input type="hidden" name="id" value={address.id} /> : null}
        <FormMessage state={{ error: state.error }} />
        <Field label="Label (optional)" htmlFor="label" hint="For example Lab, Office or Home" error={fe.label}>
          <Input id="label" name="label" defaultValue={address?.label ?? ""} className="sm:max-w-xs" />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="First name" htmlFor="firstName" error={fe.firstName}>
            <Input id="firstName" name="firstName" autoComplete="given-name" defaultValue={address?.firstName} aria-invalid={!!fe.firstName} />
          </Field>
          <Field label="Last name" htmlFor="lastName" error={fe.lastName}>
            <Input id="lastName" name="lastName" autoComplete="family-name" defaultValue={address?.lastName} aria-invalid={!!fe.lastName} />
          </Field>
        </div>
        <Field label="Institution or company (optional)" htmlFor="company" error={fe.company}>
          <Input id="company" name="company" autoComplete="organization" defaultValue={address?.company ?? ""} />
        </Field>
        <Field label="Street address" htmlFor="line1" error={fe.line1}>
          <Input id="line1" name="line1" autoComplete="address-line1" defaultValue={address?.line1} aria-invalid={!!fe.line1} />
        </Field>
        <Field label="Apartment, suite or unit (optional)" htmlFor="line2" error={fe.line2}>
          <Input id="line2" name="line2" autoComplete="address-line2" defaultValue={address?.line2 ?? ""} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-[1.4fr_1fr_0.8fr]">
          <Field label="Suburb or city" htmlFor="city" error={fe.city}>
            <Input id="city" name="city" autoComplete="address-level2" defaultValue={address?.city} aria-invalid={!!fe.city} />
          </Field>
          <Field label="State" htmlFor="state" error={fe.state}>
            <Select id="state" name="state" autoComplete="address-level1" defaultValue={address?.state ?? ""} aria-invalid={!!fe.state}>
              <option value="" disabled>
                Select…
              </option>
              {AU_STATES.map((s) => (
                <option key={s.code} value={s.code}>
                  {s.code}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Postcode" htmlFor="postcode" error={fe.postcode}>
            <Input
              id="postcode"
              name="postcode"
              inputMode="numeric"
              maxLength={4}
              autoComplete="postal-code"
              defaultValue={address?.postcode}
              aria-invalid={!!fe.postcode}
            />
          </Field>
        </div>
        <Field label="Phone (optional)" htmlFor="phone" hint="Only used if the courier has a question" error={fe.phone}>
          <Input id="phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" defaultValue={address?.phone ?? ""} className="sm:max-w-xs" />
        </Field>
        <label className="flex cursor-pointer items-center gap-3 py-1 text-small">
          <Checkbox name="isDefault" defaultChecked={address?.isDefault} /> Use as my default shipping address
        </label>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onDone} disabled={pending}>
            Cancel
          </Button>
          <PendingButton pending={pending} pendingText="Saving…">
            Save Address
          </PendingButton>
        </div>
      </form>
    </Card>
  );
}

function AddressRow({ address: a, onEdit }: { address: SavedAddress; onEdit: () => void }) {
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();
  const name = a.label || `${a.firstName} ${a.lastName}`;

  const run = (action: (form: FormData) => Promise<void>) => {
    const form = new FormData();
    form.set("id", a.id);
    startTransition(() => action(form));
  };

  return (
    <li data-ui className="grid gap-4 border-t border-ink/[0.06] px-5 py-4 first:border-t-0 sm:grid-cols-[minmax(0,1fr)_auto]">
      <div className="min-w-0 text-small">
        <p className="flex flex-wrap items-center gap-2">
          <span className="text-body font-medium">{name}</span>
          {a.isDefault ? <Badge className="bg-[#dcfae5] text-[#04250e]">Default</Badge> : null}
        </p>
        <address className="mt-1 leading-relaxed text-muted not-italic">
          {a.firstName} {a.lastName}
          {a.company ? `, ${a.company}` : ""}
          <br />
          {a.line1}
          {a.line2 ? `, ${a.line2}` : ""}, {a.city} {a.state} {a.postcode}
          {a.phone ? (
            <>
              <br />
              {a.phone}
            </>
          ) : null}
        </address>
      </div>

      {confirming ? (
        <div className="flex flex-wrap items-center gap-2 self-start bg-[#ffedea] px-3 py-2 text-small text-[#831c1e]" role="group" aria-label={`Delete ${name}`}>
          <span>Delete {name}?</span>
          <Button variant="danger" size="sm" disabled={pending} onClick={() => run(deleteAddress)}>
            {pending ? "Deleting…" : "Yes, Delete"}
          </Button>
          <Button variant="ghost" size="sm" disabled={pending} onClick={() => setConfirming(false)} className="hover:bg-white">
            Keep
          </Button>
        </div>
      ) : (
        <div className="-mx-3 flex flex-wrap items-start gap-1 sm:mx-0 sm:justify-end">
          <Button variant="ghost" size="sm" onClick={onEdit}>
            Edit
          </Button>
          {a.isDefault ? null : (
            <Button variant="ghost" size="sm" disabled={pending} onClick={() => run(setDefaultAddress)}>
              Make Default
            </Button>
          )}
          <Button variant="ghost" size="sm" className="text-danger hover:bg-[#ffedea]" onClick={() => setConfirming(true)}>
            Delete
          </Button>
        </div>
      )}
    </li>
  );
}

export function AddressBook({ addresses }: { addresses: SavedAddress[] }) {
  const [editing, setEditing] = useState<string | "new" | null>(null);
  const current = editing && editing !== "new" ? addresses.find((a) => a.id === editing) : undefined;

  return (
    <div className="space-y-6">
      {editing === "new" ? <AddressForm onDone={() => setEditing(null)} /> : null}
      {current ? <AddressForm key={current.id} address={current} onDone={() => setEditing(null)} /> : null}

      <Card aria-labelledby="saved-title">
        <div className="flex items-center justify-between gap-4 px-5 pt-4 pb-3">
          <h2 id="saved-title" className="text-lead font-semibold">
            Saved addresses <span className="tabular text-muted">{addresses.length}</span>
          </h2>
          {editing === null ? (
            <Button variant="ink" size="sm" onClick={() => setEditing("new")}>
              Add Address
            </Button>
          ) : null}
        </div>
        {addresses.length === 0 ? (
          <p className="px-5 pb-5 text-small text-muted">No saved addresses. Add one and it fills in at checkout.</p>
        ) : (
          <ul className="pb-1">
            {addresses.map((a) => (
              <AddressRow key={a.id} address={a} onEdit={() => setEditing(a.id)} />
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
