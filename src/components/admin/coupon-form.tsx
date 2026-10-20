"use client";

import { useState } from "react";
import { ActionForm, FormSubmit } from "./action-form";
import { Checkbox, Field, Input, Select } from "@/components/ui/form";
import type { ActionState } from "@/lib/actions";

type Coupon = {
  code: string;
  description: string | null;
  type: string;
  value: string;
  minSubtotal: string;
  maxUses: number | null;
  startsAt: string;
  expiresAt: string;
  active: boolean;
};

export function CouponForm({ action, initial }: { action: (prev: ActionState, form: FormData) => Promise<ActionState>; initial?: Coupon }) {
  const [type, setType] = useState(initial?.type ?? "PERCENT");
  return (
    <ActionForm action={action} compact className="space-y-4">
      <Field label="Code" htmlFor="code">
        <Input id="code" name="code" defaultValue={initial?.code ?? ""} className="font-mono uppercase" placeholder="WELCOME10" />
      </Field>
      <Field label="Description" htmlFor="description">
        <Input id="description" name="description" defaultValue={initial?.description ?? ""} placeholder="10% off first order" />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Type" htmlFor="type">
          <Select id="type" name="type" value={type} onChange={(e) => setType(e.target.value)}>
            <option value="PERCENT">Percent off</option>
            <option value="FIXED">Fixed amount</option>
          </Select>
        </Field>
        <Field label={type === "PERCENT" ? "Percent (%)" : "Amount ($)"} htmlFor="value">
          <Input id="value" name="value" inputMode="decimal" defaultValue={initial?.value ?? ""} placeholder={type === "PERCENT" ? "10" : "25.00"} />
        </Field>
        <Field label="Min. subtotal ($)" htmlFor="minSubtotal">
          <Input id="minSubtotal" name="minSubtotal" inputMode="decimal" defaultValue={initial?.minSubtotal ?? "0"} />
        </Field>
        <Field label="Max uses" htmlFor="maxUses" hint="Blank = unlimited">
          <Input id="maxUses" name="maxUses" type="number" min={1} defaultValue={initial?.maxUses ?? ""} />
        </Field>
        <Field label="Starts" htmlFor="startsAt">
          <Input id="startsAt" name="startsAt" type="date" defaultValue={initial?.startsAt ?? ""} />
        </Field>
        <Field label="Expires" htmlFor="expiresAt">
          <Input id="expiresAt" name="expiresAt" type="date" defaultValue={initial?.expiresAt ?? ""} />
        </Field>
      </div>
      <label className="flex items-center gap-2 text-sm text-ink-800">
        <Checkbox name="active" defaultChecked={initial?.active ?? true} /> Active
      </label>
      <FormSubmit className="w-full" pendingText="Saving…">
        {initial ? "Save coupon" : "Create coupon"}
      </FormSubmit>
    </ActionForm>
  );
}
