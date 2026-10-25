"use client";

import { useState } from "react";
import { Field, Input, Textarea } from "./fields";
import type { ActionState } from "@/lib/actions";
import { FormFeedback, FormSubmit, PendingContext, useActionForm } from "./action-form";

export type SettingsFormValues = Record<string, string>;

const mono = "font-mono text-small"; // taste-skill-ignore: account numbers, PayIDs and wallet addresses are copied character for character

/** A settings section (app-screens §8.2): title and help on the left, the fields in a panel on the right. */
function Section({ title, description, children }: { title: string; description: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="grid gap-4 border-t border-ink/10 py-8 first:border-t-0 first:pt-0 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)] lg:gap-10">
      <div className="lg:pt-1">
        <h2 className="text-base font-medium text-ink">{title}</h2>
        <div className="mt-1 text-sm text-muted">{description}</div>
      </div>
      <div className="border border-surface-2 bg-white p-5">{children}</div>
    </section>
  );
}

export function SettingsForm({ action, values }: { action: (prev: ActionState, form: FormData) => Promise<ActionState>; values: SettingsFormValues }) {
  const { state, onSubmit, pending } = useActionForm(action);
  const [prefix, setPrefix] = useState(values.orderPrefix ?? "");
  const [windowHours, setWindowHours] = useState(values.paymentWindowHours ?? "");
  const err = (k: string) => state.fieldErrors?.[k]?.[0];
  const text = (
    name: string,
    label: string,
    opts: { hint?: React.ReactNode; placeholder?: string; mono?: boolean; prefix?: string; inputMode?: "decimal" | "numeric" | "email" | "tel"; onChange?: (v: string) => void } = {},
  ) => (
    <Field label={label} htmlFor={name} error={err(name)} hint={opts.hint}>
      <div className="relative">
        {opts.prefix ? <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-muted">{opts.prefix}</span> : null}
        <Input
          id={name}
          name={name}
          defaultValue={values[name]}
          placeholder={opts.placeholder}
          inputMode={opts.inputMode}
          autoComplete="off"
          spellCheck={opts.mono ? false : undefined}
          onChange={opts.onChange ? (e) => opts.onChange!(e.target.value) : undefined}
          className={`${opts.mono ? mono : ""} ${opts.prefix ? "tabular pl-7" : ""}`}
        />
      </div>
    </Field>
  );
  const hours = Number(windowHours);

  return (
    <PendingContext.Provider value={pending}>
      <form onSubmit={onSubmit} className="max-w-5xl">
        <Section title="Store" description="Brand and contact details shown across the site and in every email.">
          <div className="grid gap-4 sm:grid-cols-2">
            {text("storeName", "Store name")}
            {text("supportEmail", "Support email", { inputMode: "email" })}
            {text("supportPhone", "Support phone", { placeholder: "Optional", inputMode: "tel" })}
            {text("orderPrefix", "Order number prefix", {
              mono: true,
              onChange: setPrefix,
              hint: (
                <>
                  Next orders look like <span className="tabular text-ink">{(prefix || "GLP").toUpperCase()}-10245</span>.
                </>
              ),
            })}
            <Field label="Announcement bar" htmlFor="announcement" error={err("announcement")} hint="Shown above the store header. Leave empty to hide it." className="sm:col-span-2">
              <Textarea id="announcement" name="announcement" rows={2} defaultValue={values.announcement} />
            </Field>
          </div>
        </Section>

        <Section title="Shipping" description="Flat rates in Australian dollars, charged per order.">
          <div className="grid gap-4 sm:grid-cols-3">
            {text("shippingStandard", "Standard rate", { prefix: "$", inputMode: "decimal" })}
            {text("shippingExpress", "Express rate", { prefix: "$", inputMode: "decimal" })}
            {text("freeShippingThreshold", "Free standard shipping over", { prefix: "$", inputMode: "decimal", hint: "0 turns free shipping off." })}
            <div className="sm:col-span-3">{text("dispatchCutoff", "Dispatch cut-off message", { hint: "Shown on product pages and at checkout." })}</div>
          </div>
        </Section>

        <Section
          title="Payments"
          description="Shown to customers after checkout and in their confirmation email. Orders are matched to payments by order number."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            {text("bankAccountName", "Bank account name")}
            <div className="grid grid-cols-2 gap-3">
              {text("bankBsb", "BSB", { mono: true, inputMode: "numeric" })}
              {text("bankAccountNumber", "Account number", { mono: true, inputMode: "numeric" })}
            </div>
            {text("payId", "PayID", { mono: true })}
            {text("paymentWindowHours", "Payment window (hours)", {
              inputMode: "numeric",
              onChange: setWindowHours,
              hint:
                hours > 0
                  ? `Unpaid orders are cancelled ${hours} hour${hours === 1 ? "" : "s"} after they are placed and their stock released, unless the customer reports payment. Checked hourly.`
                  : "Enter a whole number of hours.",
            })}
            {text("cryptoBtcAddress", "BTC wallet address", { mono: true, placeholder: "bc1…" })}
            {text("cryptoUsdtAddress", "USDT wallet address", { mono: true, placeholder: "TRC-20 or ERC-20 address…" })}
          </div>
        </Section>

        <div className="sticky bottom-0 z-10 -mx-4 border-t border-ink/10 bg-surface px-4 py-3 sm:-mx-8 sm:px-8 lg:static lg:mx-0 lg:border-t-0 lg:bg-transparent lg:px-0 lg:py-0">
          <div className="flex flex-col items-end">
            <FormSubmit variant="ink" pendingText="Saving…">
              Save Settings
            </FormSubmit>
            <div className="w-full max-w-md">
              <FormFeedback state={state} compact />
            </div>
          </div>
        </div>
      </form>
    </PendingContext.Provider>
  );
}
