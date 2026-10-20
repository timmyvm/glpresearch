"use client";

import { useState } from "react";
import { MapPin, Pencil, Plus, Star, Trash2, X } from "lucide-react";
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
  const { state, pending, onSubmit } = useFormAction(async (prev, form) => {
    const result = await saveAddress(prev, form);
    if (result.ok) onDone();
    return result;
  });
  const fe = state.fieldErrors ?? {};
  return (
    <Card className="p-5 sm:p-6">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-base font-semibold text-ink-900">{address ? "Edit address" : "New address"}</h2>
        <button type="button" onClick={onDone} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-ink-900" aria-label="Cancel">
          <X className="size-4" />
        </button>
      </div>
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        {address ? <input type="hidden" name="id" value={address.id} /> : null}
        <FormMessage state={{ error: state.error }} />
        <Field label="Label" htmlFor="label" hint="Optional — e.g. Lab, Office, Home" error={fe.label}>
          <Input id="label" name="label" defaultValue={address?.label ?? ""} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="First name" htmlFor="firstName" error={fe.firstName}>
            <Input id="firstName" name="firstName" autoComplete="given-name" defaultValue={address?.firstName} aria-invalid={!!fe.firstName} />
          </Field>
          <Field label="Last name" htmlFor="lastName" error={fe.lastName}>
            <Input id="lastName" name="lastName" autoComplete="family-name" defaultValue={address?.lastName} aria-invalid={!!fe.lastName} />
          </Field>
        </div>
        <Field label="Company / institution" htmlFor="company" hint="Optional" error={fe.company}>
          <Input id="company" name="company" autoComplete="organization" defaultValue={address?.company ?? ""} />
        </Field>
        <Field label="Street address" htmlFor="line1" error={fe.line1}>
          <Input id="line1" name="line1" autoComplete="address-line1" defaultValue={address?.line1} aria-invalid={!!fe.line1} />
        </Field>
        <Field label="Apartment, suite, unit" htmlFor="line2" hint="Optional" error={fe.line2}>
          <Input id="line2" name="line2" autoComplete="address-line2" defaultValue={address?.line2 ?? ""} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-[1.4fr_1fr_0.8fr]">
          <Field label="Suburb / city" htmlFor="city" error={fe.city}>
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
            <Input id="postcode" name="postcode" inputMode="numeric" maxLength={4} autoComplete="postal-code" defaultValue={address?.postcode} aria-invalid={!!fe.postcode} />
          </Field>
        </div>
        <Field label="Phone" htmlFor="phone" hint="Optional — for courier delivery questions" error={fe.phone}>
          <Input id="phone" name="phone" type="tel" autoComplete="tel" defaultValue={address?.phone ?? ""} />
        </Field>
        <label className="flex items-center gap-2.5 text-sm text-slate-700">
          <Checkbox name="isDefault" defaultChecked={address?.isDefault} /> Use as my default shipping address
        </label>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onDone}>
            Cancel
          </Button>
          <PendingButton pending={pending} pendingText="Saving…">
            Save address
          </PendingButton>
        </div>
      </form>
    </Card>
  );
}

export function AddressBook({ addresses }: { addresses: SavedAddress[] }) {
  const [editing, setEditing] = useState<string | "new" | null>(addresses.length === 0 ? "new" : null);

  return (
    <div className="space-y-6">
      {editing === "new" ? <AddressForm onDone={() => setEditing(null)} /> : null}
      {editing && editing !== "new" ? (
        <AddressForm key={editing} address={addresses.find((a) => a.id === editing)} onDone={() => setEditing(null)} />
      ) : null}

      {editing === null ? (
        <Button onClick={() => setEditing("new")}>
          <Plus className="size-4" /> Add address
        </Button>
      ) : null}

      {addresses.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {addresses.map((a) => (
            <Card key={a.id} className={a.isDefault ? "ring-2 ring-mint-400/60" : undefined}>
              <div className="flex items-start gap-3 p-5">
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-ink-50 text-ink-600">
                  <MapPin className="size-4" />
                </span>
                <div className="min-w-0 flex-1 text-sm">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-ink-900">{a.label || `${a.firstName} ${a.lastName}`}</span>
                    {a.isDefault ? <Badge className="bg-mint-50 text-mint-800 ring-mint-600/20">Default</Badge> : null}
                  </div>
                  <address className="leading-relaxed text-slate-600 not-italic">
                    {a.firstName} {a.lastName}
                    {a.company ? `, ${a.company}` : ""}
                    <br />
                    {a.line1}
                    {a.line2 ? `, ${a.line2}` : ""}
                    <br />
                    {a.city} {a.state} {a.postcode}
                    {a.phone ? (
                      <>
                        <br />
                        {a.phone}
                      </>
                    ) : null}
                  </address>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-1 border-t border-slate-100 px-3 py-2">
                <Button variant="ghost" size="sm" onClick={() => setEditing(a.id)}>
                  <Pencil className="size-3.5" /> Edit
                </Button>
                {!a.isDefault ? (
                  <form action={setDefaultAddress}>
                    <input type="hidden" name="id" value={a.id} />
                    <Button type="submit" variant="ghost" size="sm">
                      <Star className="size-3.5" /> Make default
                    </Button>
                  </form>
                ) : null}
                <form
                  action={deleteAddress}
                  className="ml-auto"
                  onSubmit={(e) => {
                    if (!confirm("Delete this address?")) e.preventDefault();
                  }}
                >
                  <input type="hidden" name="id" value={a.id} />
                  <Button type="submit" variant="ghost" size="sm" className="text-rose-600 hover:bg-rose-50 hover:text-rose-700">
                    <Trash2 className="size-3.5" /> Delete
                  </Button>
                </form>
              </div>
            </Card>
          ))}
        </div>
      ) : null}
    </div>
  );
}
