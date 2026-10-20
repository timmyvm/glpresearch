"use client";

import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Field, Input, Textarea } from "@/components/ui/form";
import type { ActionState } from "@/lib/actions";
import { FormFeedback, FormSubmit, PendingContext, useActionForm } from "./action-form";

export type SettingsFormValues = Record<string, string>;

export function SettingsForm({ action, values }: { action: (prev: ActionState, form: FormData) => Promise<ActionState>; values: SettingsFormValues }) {
  const { state, onSubmit, pending } = useActionForm(action);
  const err = (k: string) => state.fieldErrors?.[k]?.[0];
  const text = (name: string, label: string, opts: { hint?: string; placeholder?: string; mono?: boolean; prefix?: string } = {}) => (
    <Field label={label} htmlFor={name} error={err(name)} hint={opts.hint}>
      <div className="relative">
        {opts.prefix ? <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-slate-400">{opts.prefix}</span> : null}
        <Input
          id={name}
          name={name}
          defaultValue={values[name]}
          placeholder={opts.placeholder}
          className={`${opts.mono ? "font-mono text-xs" : ""} ${opts.prefix ? "pl-7" : ""}`}
        />
      </div>
    </Field>
  );

  return (
    <PendingContext.Provider value={pending}>
      <form onSubmit={onSubmit} className="max-w-4xl space-y-6">
        <Card>
          <CardHeader title="Store" description="Brand and contact details shown across the site and in emails." />
          <CardBody className="grid gap-4 sm:grid-cols-2">
            {text("storeName", "Store name")}
            {text("supportEmail", "Support email")}
            {text("supportPhone", "Support phone", { placeholder: "Optional" })}
            {text("orderPrefix", "Order number prefix", { hint: "e.g. GLP → GLP-10245", mono: true })}
            <Field label="Announcement bar" htmlFor="announcement" error={err("announcement")} hint="Leave blank to hide the bar." className="sm:col-span-2">
              <Textarea id="announcement" name="announcement" rows={2} defaultValue={values.announcement} />
            </Field>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Shipping" description="Flat rates in AUD." />
          <CardBody className="grid gap-4 sm:grid-cols-3">
            {text("shippingStandard", "Standard rate", { prefix: "$" })}
            {text("shippingExpress", "Express rate", { prefix: "$" })}
            {text("freeShippingThreshold", "Free standard shipping over", { prefix: "$", hint: "0 disables free shipping" })}
            <div className="sm:col-span-3">{text("dispatchCutoff", "Dispatch cut-off message")}</div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Payments" description="Instructions shown to customers after checkout and in confirmation emails." />
          <CardBody className="grid gap-4 sm:grid-cols-2">
            {text("bankAccountName", "Bank account name")}
            <div className="grid grid-cols-2 gap-3">
              {text("bankBsb", "BSB", { mono: true })}
              {text("bankAccountNumber", "Account number", { mono: true })}
            </div>
            {text("payId", "PayID", { mono: true })}
            {text("paymentWindowHours", "Payment window (hours)", { hint: "Unpaid orders can be cancelled after this." })}
            {text("cryptoBtcAddress", "BTC wallet address", { mono: true, placeholder: "bc1…" })}
            {text("cryptoUsdtAddress", "USDT wallet address", { mono: true, placeholder: "TRC-20 / ERC-20 address" })}
          </CardBody>
        </Card>

        <div className="flex items-center gap-4">
          <FormSubmit size="lg" pendingText="Saving…">
            Save settings
          </FormSubmit>
        </div>
        <FormFeedback state={state} />
      </form>
    </PendingContext.Provider>
  );
}
