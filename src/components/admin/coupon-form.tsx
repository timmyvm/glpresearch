"use client";

import { useState } from "react";
import { ActionForm, FormSubmit } from "./action-form";
import { CheckRow, Field, Input, Select } from "./fields";
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
        <Input id="code" name="code" defaultValue={initial?.code ?? ""} className="tabular uppercase" placeholder="WELCOME10…" autoComplete="off" spellCheck={false} />
      </Field>
      <Field label="Description" htmlFor="description">
        <Input id="description" name="description" defaultValue={initial?.description ?? ""} placeholder="10% off a first order…" />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Type" htmlFor="type">
          <Select id="type" name="type" value={type} onChange={(e) => setType(e.target.value)}>
            <option value="PERCENT">Percent off</option>
            <option value="FIXED">Fixed amount</option>
          </Select>
        </Field>
        <Field label={type === "PERCENT" ? "Percent (%)" : "Amount ($)"} htmlFor="value">
          <Input id="value" name="value" inputMode="decimal" defaultValue={initial?.value ?? ""} placeholder={type === "PERCENT" ? "10" : "25.00"} className="tabular" />
        </Field>
        <Field label="Minimum spend ($)" htmlFor="minSubtotal">
          <Input id="minSubtotal" name="minSubtotal" inputMode="decimal" defaultValue={initial?.minSubtotal ?? "0"} className="tabular" />
        </Field>
        <Field label="Max uses" htmlFor="maxUses" hint="Leave empty for no limit.">
          <Input id="maxUses" name="maxUses" type="number" inputMode="numeric" min={1} defaultValue={initial?.maxUses ?? ""} className="tabular" />
        </Field>
        <Field label="Starts" htmlFor="startsAt">
          <Input id="startsAt" name="startsAt" type="date" defaultValue={initial?.startsAt ?? ""} className="tabular" />
        </Field>
        <Field label="Expires" htmlFor="expiresAt">
          <Input id="expiresAt" name="expiresAt" type="date" defaultValue={initial?.expiresAt ?? ""} className="tabular" />
        </Field>
      </div>
      <CheckRow name="active" defaultChecked={initial?.active ?? true} title="Active" description="Customers can apply it while it is within its dates." />
      <FormSubmit className="w-full" variant="ink" pendingText="Saving…">
        {initial ? "Save Coupon" : "Create Coupon"}
      </FormSubmit>
    </ActionForm>
  );
}
