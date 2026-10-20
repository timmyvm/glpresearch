"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { previewCoupon, submitCheckout, type CheckoutPayload } from "@/app/(store)/checkout/actions";
import { cartSubtotal, useCart, type CartItem } from "@/lib/cart";
import { formatMoney } from "@/lib/money";
import { PAYMENT_METHODS, SHIPPING_METHODS, type PaymentMethod, type ShippingMethod } from "@/lib/orders";
import { specimenImage } from "@/lib/plates";
import { cn } from "@/lib/utils";
import { Alert } from "@/components/ui/alert";
import { Button, ButtonLink } from "@/components/ui/button";
import { Checkbox, Field, Input, Select, Textarea } from "@/components/ui/form";
import type { SavedAddress } from "@/components/account/address-book";
import { useFocusFirstError } from "@/components/account/form-helpers";
import { AU_STATES } from "./au-states";
import { useCartSync } from "./use-cart-sync";

export type CheckoutSettings = {
  shippingStandard: number;
  shippingExpress: number;
  freeShippingThreshold: number;
  paymentWindowHours: number;
  dispatchCutoff: string;
};

type CheckoutUser = { email: string; firstName: string; lastName: string; phone: string | null; institution: string | null };

type AppliedCoupon = { code: string; description: string | null; type: string; value: number; minSubtotal: number };

type Fields = {
  email: string;
  firstName: string;
  lastName: string;
  company: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  postcode: string;
  phone: string;
  saveAddress: boolean;
  shippingMethod: ShippingMethod;
  paymentMethod: PaymentMethod;
  customerNote: string;
  researchAck: boolean;
  termsAck: boolean;
  createAccount: boolean;
  password: string;
};

const ADDRESS_KEYS = ["firstName", "lastName", "company", "line1", "line2", "city", "state", "postcode", "phone"] as const;

function shippingFor(settings: CheckoutSettings, method: ShippingMethod, afterDiscount: number) {
  if (method === "EXPRESS") return settings.shippingExpress;
  if (settings.freeShippingThreshold > 0 && afterDiscount >= settings.freeShippingThreshold) return 0;
  return settings.shippingStandard;
}

function couponDiscount(coupon: AppliedCoupon | null, subtotal: number) {
  if (!coupon || subtotal < coupon.minSubtotal) return 0;
  return coupon.type === "PERCENT" ? Math.min(subtotal, Math.round((subtotal * coupon.value) / 100)) : Math.min(subtotal, coupon.value);
}

function fromAddress(a: SavedAddress) {
  return {
    firstName: a.firstName,
    lastName: a.lastName,
    company: a.company ?? "",
    line1: a.line1,
    line2: a.line2 ?? "",
    city: a.city,
    state: a.state,
    postcode: a.postcode,
    phone: a.phone ?? "",
  };
}

function Section({ id, title, aside, children }: { id: string; title: string; aside?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section aria-labelledby={id} className="pt-12 first:pt-0">
      <div className="mb-6 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <h2 id={id} className="text-lead font-medium">
          {title}
        </h2>
        {aside}
      </div>
      {children}
    </section>
  );
}

/** A selectable row: the whole row is the hit target, the chosen one ringed in ink. */
function ChoiceRow({
  name,
  value,
  checked,
  onChange,
  children,
}: {
  name: string;
  value: string;
  checked: boolean;
  onChange: () => void;
  children: React.ReactNode;
}) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-start gap-3 p-4 transition-[background-color,box-shadow] duration-150",
        checked ? "bg-white ring-2 ring-ink ring-inset" : "bg-surface hover:bg-surface-2",
      )}
    >
      <input type="radio" name={name} value={value} checked={checked} onChange={onChange} className="mt-0.5 size-5 shrink-0 accent-ink" />
      <span className="min-w-0 flex-1">{children}</span>
    </label>
  );
}

/** A checkbox whose whole row, sentence included, is one hit target. */
function CheckRow({
  checked,
  onChange,
  invalid,
  error,
  children,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  invalid?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className={cn("flex cursor-pointer items-start gap-3 p-4 text-small", invalid ? "bg-[#ffedea]" : "bg-surface hover:bg-surface-2")}>
        <Checkbox className="mt-0.5" checked={checked} onChange={(e) => onChange(e.target.checked)} aria-invalid={invalid || undefined} />
        <span>{children}</span>
      </label>
      {error ? (
        <p className="mt-2 text-small text-danger" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function Summary({
  items,
  subtotal,
  discount,
  couponCode,
  shipping,
  shippingLabel,
  total,
}: {
  items: CartItem[];
  subtotal: number;
  discount: number;
  couponCode?: string;
  shipping: number;
  shippingLabel: string;
  total: number;
}) {
  return (
    <>
      <ul className="space-y-4">
        {items.map((item) => {
          const img = specimenImage(item.image) ?? item.image;
          return (
            <li key={item.variantId} className="flex items-center gap-4">
              <div className="relative h-16 w-13 shrink-0 bg-white">
                {img ? <Image src={img} alt="" fill sizes="52px" className="object-contain p-1" /> : null}
              </div>
              <div className="min-w-0 flex-1 text-small">
                <p className="truncate font-medium">{item.productName}</p>
                <p className="tabular text-muted">
                  {item.variantLabel}, {item.quantity} × {formatMoney(item.price)}
                </p>
              </div>
              <p className="tabular text-small font-medium">{formatMoney(item.price * item.quantity)}</p>
            </li>
          );
        })}
      </ul>
      <dl className="tabular mt-6 space-y-2 text-small">
        <div className="flex justify-between gap-4">
          <dt className="text-muted">Subtotal</dt>
          <dd>{formatMoney(subtotal)}</dd>
        </div>
        {discount > 0 ? (
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Discount{couponCode ? ` (${couponCode})` : ""}</dt>
            <dd>−{formatMoney(discount)}</dd>
          </div>
        ) : null}
        <div className="flex justify-between gap-4">
          <dt className="text-muted">Shipping, {shippingLabel.toLowerCase()}</dt>
          <dd>{shipping === 0 ? "Free" : formatMoney(shipping)}</dd>
        </div>
        <div className="flex items-baseline justify-between gap-4 pt-3 text-body">
          <dt className="font-medium">Total (AUD)</dt>
          <dd className="text-lead font-medium">{formatMoney(total)}</dd>
        </div>
      </dl>
    </>
  );
}

export function CheckoutForm({
  user,
  addresses,
  settings,
}: {
  user: CheckoutUser | null;
  addresses: SavedAddress[];
  settings: CheckoutSettings;
}) {
  const router = useRouter();
  const { hydrated, items, problems, synced } = useCartSync();
  const clear = useCart((s) => s.clear);
  const defaultAddress = addresses.find((a) => a.isDefault) ?? addresses[0];
  const formRef = useRef<HTMLFormElement>(null);

  const [addressId, setAddressId] = useState<string>(defaultAddress?.id ?? "new");
  const [editingSaved, setEditingSaved] = useState(false);
  const [fields, setFields] = useState<Fields>({
    email: user?.email ?? "",
    firstName: user?.firstName ?? "",
    lastName: user?.lastName ?? "",
    company: user?.institution ?? "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    postcode: "",
    phone: user?.phone ?? "",
    ...(defaultAddress ? fromAddress(defaultAddress) : {}),
    saveAddress: !!user && addresses.length === 0,
    shippingMethod: "STANDARD",
    paymentMethod: "PAYID",
    customerNote: "",
    researchAck: false,
    termsAck: false,
    createAccount: false,
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string[] | undefined>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [placing, startPlacing] = useTransition();
  const [placed, setPlaced] = useState(false);

  const [couponInput, setCouponInput] = useState("");
  const [coupon, setCoupon] = useState<AppliedCoupon | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponPending, startCoupon] = useTransition();

  useFocusFirstError(formRef, errors);

  const set = <K extends keyof Fields>(key: K, value: Fields[K]) => {
    setFields((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };
  const err = (key: keyof Fields) => errors[key];

  if (placed) {
    return (
      <div className="bg-surface px-6 py-12" role="status">
        <p className="text-lead font-medium">Order placed. Opening your payment details…</p>
      </div>
    );
  }

  if (!hydrated) {
    return (
      <div className="grid gap-12 lg:grid-cols-12 lg:gap-8" aria-busy="true" aria-label="Loading checkout">
        <div className="space-y-6 lg:col-span-7">
          <div className="h-7 w-32 bg-surface" />
          <div className="h-12 bg-surface" />
          <div className="h-7 w-48 bg-surface" />
          <div className="grid grid-cols-2 gap-4">
            <div className="h-12 bg-surface" />
            <div className="h-12 bg-surface" />
          </div>
          <div className="h-12 bg-surface" />
        </div>
        <div className="h-96 bg-surface lg:col-span-4 lg:col-start-9" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-xl">
        <p className="text-lead font-medium">Nothing to check out yet.</p>
        <p className="mt-2 text-muted">Add a compound to your cart, then come back here to place the order.</p>
        <ButtonLink href="/shop" variant="ink" className="mt-6">
          Shop Peptides
        </ButtonLink>
      </div>
    );
  }

  const subtotal = cartSubtotal(items);
  const discount = couponDiscount(coupon, subtotal);
  const couponBelowMinimum = !!coupon && subtotal < coupon.minSubtotal;
  const standardCost = shippingFor(settings, "STANDARD", subtotal - discount);
  const shipping = shippingFor(settings, fields.shippingMethod, subtotal - discount);
  const total = subtotal - discount + shipping;
  const addressErrored = ADDRESS_KEYS.some((k) => errors[k]);
  const showAddressFields = addressId === "new" || addresses.length === 0 || editingSaved || addressErrored;
  const blocked = !synced || problems.length > 0;

  const summary = (
    <Summary
      items={items}
      subtotal={subtotal}
      discount={discount}
      couponCode={coupon && !couponBelowMinimum ? coupon.code : undefined}
      shipping={shipping}
      shippingLabel={SHIPPING_METHODS[fields.shippingMethod].label}
      total={total}
    />
  );

  const applyCoupon = () => {
    const code = couponInput.trim();
    if (!code) return;
    setCouponError(null);
    startCoupon(async () => {
      const result = await previewCoupon(
        code,
        items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })),
      );
      if (result.ok) {
        setCoupon({ code: result.code, description: result.description, type: result.type, value: result.value, minSubtotal: result.minSubtotal });
        setCouponInput("");
      } else {
        setCoupon(null);
        setCouponError(result.error);
      }
    });
  };

  const placeOrder = (event: React.FormEvent) => {
    event.preventDefault();
    setFormError(null);
    const payload: CheckoutPayload = {
      email: fields.email,
      items: items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })),
      firstName: fields.firstName,
      lastName: fields.lastName,
      company: fields.company,
      line1: fields.line1,
      line2: fields.line2,
      city: fields.city,
      state: fields.state,
      postcode: fields.postcode,
      phone: fields.phone,
      saveAddress: addressId === "new" && fields.saveAddress,
      shippingMethod: fields.shippingMethod,
      paymentMethod: fields.paymentMethod,
      couponCode: coupon && !couponBelowMinimum ? coupon.code : undefined,
      customerNote: fields.customerNote,
      researchAck: fields.researchAck as true,
      termsAck: fields.termsAck as true,
      createAccount: !user && fields.createAccount,
      password: !user && fields.createAccount ? fields.password : undefined,
    };
    startPlacing(async () => {
      const result = await submitCheckout(payload);
      if (result.ok) {
        setPlaced(true);
        clear();
        router.push(`/order/${result.number}?token=${result.token}`);
        return;
      }
      setErrors(result.fieldErrors ?? {});
      setFormError(
        result.fieldErrors && Object.values(result.fieldErrors).some(Boolean) ? "Some details need another look. They're marked above." : result.error,
      );
    });
  };

  const addressFields = (
    <div className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="First name" htmlFor="firstName" error={err("firstName")}>
          <Input id="firstName" autoComplete="given-name" value={fields.firstName} onChange={(e) => set("firstName", e.target.value)} aria-invalid={!!err("firstName")} />
        </Field>
        <Field label="Last name" htmlFor="lastName" error={err("lastName")}>
          <Input id="lastName" autoComplete="family-name" value={fields.lastName} onChange={(e) => set("lastName", e.target.value)} aria-invalid={!!err("lastName")} />
        </Field>
      </div>
      <Field label="Institution or company (optional)" htmlFor="company" error={err("company")}>
        <Input id="company" autoComplete="organization" value={fields.company} onChange={(e) => set("company", e.target.value)} />
      </Field>
      <Field label="Street address" htmlFor="line1" error={err("line1")}>
        <Input id="line1" autoComplete="address-line1" value={fields.line1} onChange={(e) => set("line1", e.target.value)} aria-invalid={!!err("line1")} />
      </Field>
      <Field label="Apartment, suite or unit (optional)" htmlFor="line2" error={err("line2")}>
        <Input id="line2" autoComplete="address-line2" value={fields.line2} onChange={(e) => set("line2", e.target.value)} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-[1.4fr_1fr_0.8fr]">
        <Field label="Suburb or city" htmlFor="city" error={err("city")}>
          <Input id="city" autoComplete="address-level2" value={fields.city} onChange={(e) => set("city", e.target.value)} aria-invalid={!!err("city")} />
        </Field>
        <Field label="State" htmlFor="state" error={err("state")}>
          <Select id="state" autoComplete="address-level1" value={fields.state} onChange={(e) => set("state", e.target.value)} aria-invalid={!!err("state")}>
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
        <Field label="Postcode" htmlFor="postcode" error={err("postcode")}>
          <Input
            id="postcode"
            inputMode="numeric"
            maxLength={4}
            autoComplete="postal-code"
            value={fields.postcode}
            onChange={(e) => set("postcode", e.target.value.replace(/\D/g, ""))}
            aria-invalid={!!err("postcode")}
          />
        </Field>
      </div>
      <Field label="Phone (optional)" htmlFor="phone" hint="Only used if the courier has a question" error={err("phone")}>
        <Input id="phone" type="tel" inputMode="tel" autoComplete="tel" value={fields.phone} onChange={(e) => set("phone", e.target.value)} className="sm:max-w-xs" />
      </Field>
      {user && addressId === "new" ? (
        <label className="flex cursor-pointer items-center gap-3 py-1 text-small">
          <Checkbox checked={fields.saveAddress} onChange={(e) => set("saveAddress", e.target.checked)} /> Save this address to my account
        </label>
      ) : null}
    </div>
  );

  return (
    <form ref={formRef} onSubmit={placeOrder} noValidate className="grid gap-10 lg:grid-cols-12 lg:gap-8">
      <details className="bg-surface lg:hidden">
        <summary className="flex cursor-pointer items-center justify-between gap-4 p-4 font-medium">
          <span>Order summary</span>
          <span className="tabular">{formatMoney(total)}</span>
        </summary>
        <div className="px-4 pb-5">{summary}</div>
      </details>

      <div className="min-w-0 lg:col-span-7">
        {problems.length > 0 ? (
          <Alert tone="warning" title="Some items in your cart need attention" className="mb-10">
            <ul className="list-inside list-disc">
              {problems.map((p) => (
                <li key={p.variantId}>{p.message}</li>
              ))}
            </ul>
            <Link href="/cart" className="link mt-1 inline-block font-medium">
              Review your cart
            </Link>
          </Alert>
        ) : null}

        <Section
          id="contact-title"
          title="Contact"
          aside={
            user ? (
              <span className="text-small text-muted">Signed in</span>
            ) : (
              <Link href="/login?next=/checkout" className="link text-small">
                Have an account? Sign in
              </Link>
            )
          }
        >
          <Field label="Email" htmlFor="email" hint="Your payment details, receipt and tracking go here." error={err("email")}>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              spellCheck={false}
              placeholder="you@lab.org…"
              value={fields.email}
              onChange={(e) => set("email", e.target.value)}
              aria-invalid={!!err("email")}
            />
          </Field>
          {!user ? (
            <div className="mt-4 space-y-4">
              <CheckRow checked={fields.createAccount} onChange={(v) => set("createAccount", v)}>
                <span className="font-medium">Create an account with this email</span>
                <span className="block text-muted">Follow this order, keep your addresses and reorder in one step.</span>
              </CheckRow>
              {fields.createAccount ? (
                <Field label="Choose a password" htmlFor="password" hint="At least 8 characters, with a letter and a number" error={err("password")}>
                  <Input
                    id="password"
                    type="password"
                    autoComplete="new-password"
                    value={fields.password}
                    onChange={(e) => set("password", e.target.value)}
                    aria-invalid={!!err("password")}
                    className="sm:max-w-sm"
                  />
                </Field>
              ) : null}
            </div>
          ) : null}
        </Section>

        <Section id="address-title" title="Shipping address" aside={<span className="text-small text-muted">Australia only</span>}>
          {addresses.length > 0 ? (
            <div className="mb-6 grid gap-3 sm:grid-cols-2" role="radiogroup" aria-labelledby="address-title">
              {addresses.map((a) => (
                <ChoiceRow
                  key={a.id}
                  name="savedAddress"
                  value={a.id}
                  checked={addressId === a.id}
                  onChange={() => {
                    setAddressId(a.id);
                    setEditingSaved(false);
                    setFields((f) => ({ ...f, ...fromAddress(a) }));
                    setErrors({});
                  }}
                >
                  <span className="block font-medium">{a.label || `${a.firstName} ${a.lastName}`}</span>
                  <span className="block text-small text-muted">
                    {a.line1}, {a.city} {a.state} {a.postcode}
                  </span>
                </ChoiceRow>
              ))}
              <ChoiceRow
                name="savedAddress"
                value="new"
                checked={addressId === "new"}
                onChange={() => {
                  setAddressId("new");
                  setFields((f) => ({ ...f, company: "", line1: "", line2: "", city: "", state: "", postcode: "" }));
                }}
              >
                <span className="block font-medium">A new address</span>
                <span className="block text-small text-muted">Enter it below</span>
              </ChoiceRow>
            </div>
          ) : null}
          {showAddressFields ? (
            addressFields
          ) : (
            <button type="button" onClick={() => setEditingSaved(true)} className="link text-small">
              Change details for this order only
            </button>
          )}
        </Section>

        <Section id="delivery-title" title="Delivery">
          <div className="grid gap-3" role="radiogroup" aria-labelledby="delivery-title">
            {(Object.keys(SHIPPING_METHODS) as ShippingMethod[]).map((key) => {
              const method = SHIPPING_METHODS[key];
              const cost = key === "EXPRESS" ? settings.shippingExpress : standardCost;
              return (
                <ChoiceRow key={key} name="shippingMethod" value={key} checked={fields.shippingMethod === key} onChange={() => set("shippingMethod", key)}>
                  <span className="flex items-baseline justify-between gap-4">
                    <span className="font-medium">{method.label}</span>
                    <span className="tabular font-medium">{cost === 0 ? "Free" : formatMoney(cost)}</span>
                  </span>
                  <span className="block text-small text-muted">{method.eta} after dispatch</span>
                </ChoiceRow>
              );
            })}
          </div>
          <p className="mt-3 text-small text-muted">{settings.dispatchCutoff}. The tracking number is emailed on dispatch.</p>
        </Section>

        <Section id="payment-title" title="Payment">
          <div className="grid gap-3" role="radiogroup" aria-labelledby="payment-title">
            {(Object.keys(PAYMENT_METHODS) as PaymentMethod[]).map((key) => {
              const method = PAYMENT_METHODS[key];
              return (
                <ChoiceRow key={key} name="paymentMethod" value={key} checked={fields.paymentMethod === key} onChange={() => set("paymentMethod", key)}>
                  <span className="block font-medium">{method.label}</span>
                  <span className="block text-small text-muted">{method.description}</span>
                </ChoiceRow>
              );
            })}
          </div>
          <p className="mt-3 text-small text-muted">
            The account details and your reference are on the next page and in your email. We hold the stock for {settings.paymentWindowHours} hours while
            you pay.
          </p>

          <div className="mt-8">
            {coupon ? (
              <div className="flex items-start justify-between gap-4 bg-surface px-4 py-3 text-small" aria-live="polite">
                <span>
                  <span className="block font-medium">
                    Discount code <span className="tabular">{coupon.code}</span> applied
                  </span>
                  {coupon.description ? <span className="block text-muted">{coupon.description}</span> : null}
                  {couponBelowMinimum ? (
                    <span className="block text-danger">Needs a subtotal of {formatMoney(coupon.minSubtotal)} or more.</span>
                  ) : null}
                </span>
                <button type="button" onClick={() => setCoupon(null)} className="link shrink-0 text-muted hover:text-ink">
                  Remove<span className="sr-only"> discount code</span>
                </button>
              </div>
            ) : (
              <div>
                <label htmlFor="coupon" className="mb-2 block text-small font-medium">
                  Discount code (optional)
                </label>
                <div className="flex gap-2 sm:max-w-md">
                  <Input
                    id="coupon"
                    autoComplete="off"
                    spellCheck={false}
                    placeholder="CODE…"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        applyCoupon();
                      }
                    }}
                    aria-invalid={!!couponError || undefined}
                    aria-describedby={couponError ? "coupon-error" : undefined}
                    className="uppercase"
                  />
                  <Button variant="outline" size="md" className="h-12" onClick={applyCoupon} disabled={couponPending || !couponInput.trim()}>
                    {couponPending ? "Checking…" : "Apply"}
                  </Button>
                </div>
                {couponError ? (
                  <p id="coupon-error" className="mt-2 text-small text-danger" role="alert">
                    {couponError}
                  </p>
                ) : null}
              </div>
            )}
          </div>

          <Field label="Order note (optional)" htmlFor="customerNote" hint="Delivery instructions, or anything we should know" className="mt-6">
            <Textarea id="customerNote" rows={3} value={fields.customerNote} onChange={(e) => set("customerNote", e.target.value)} maxLength={1000} />
          </Field>
        </Section>

        <Section id="confirm-title" title="Confirm and place your order">
          <div className="space-y-3">
            <CheckRow
              checked={fields.researchAck}
              onChange={(v) => set("researchAck", v)}
              invalid={!!err("researchAck")}
              error={err("researchAck")?.[0]}
            >
              I confirm I am 18 or over and that these compounds are for laboratory research use only, not for human or veterinary use.
            </CheckRow>
            <CheckRow checked={fields.termsAck} onChange={(v) => set("termsAck", v)} invalid={!!err("termsAck")} error={err("termsAck")?.[0]}>
              I agree to the{" "}
              <Link href="/terms" target="_blank" className="link">
                Terms of Sale
              </Link>{" "}
              and the{" "}
              <Link href="/disclaimer" target="_blank" className="link">
                Research Use Policy
              </Link>
              .
            </CheckRow>
          </div>

          <div aria-live="polite" className="mt-6 empty:hidden">
            {formError ? <Alert tone="error">{formError}</Alert> : null}
          </div>

          <Button type="submit" size="lg" className="mt-6 w-full" disabled={placing || blocked} aria-busy={placing}>
            <span className="tabular">{placing ? "Placing order…" : `Place Order · ${formatMoney(total)}`}</span>
          </Button>
          <p className="mt-3 text-small text-muted">Prices and stock are confirmed the moment you place the order. Nothing is charged automatically.</p>
        </Section>
      </div>

      <aside aria-labelledby="summary-title" className="hidden lg:sticky lg:top-24 lg:col-span-4 lg:col-start-9 lg:block lg:self-start">
        <div className="bg-surface p-6">
          <div className="mb-6 flex items-baseline justify-between gap-4">
            <h2 id="summary-title" className="text-lead font-medium">
              Summary
            </h2>
            <Link href="/cart" className="link text-small">
              Edit cart
            </Link>
          </div>
          {summary}
        </div>
      </aside>
    </form>
  );
}
