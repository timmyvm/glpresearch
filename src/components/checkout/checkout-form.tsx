"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Bitcoin, Check, Landmark, Loader2, Lock, ShieldCheck, ShoppingBag, Tag, Truck, X, Zap } from "lucide-react";
import { previewCoupon, submitCheckout, type CheckoutPayload } from "@/app/(store)/checkout/actions";
import { cartSubtotal, useCart } from "@/lib/cart";
import { formatMoney } from "@/lib/money";
import { PAYMENT_METHODS, SHIPPING_METHODS, type PaymentMethod, type ShippingMethod } from "@/lib/orders";
import { cn } from "@/lib/utils";
import { Alert } from "@/components/ui/alert";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox, Field, Input, Select, Textarea } from "@/components/ui/form";
import type { SavedAddress } from "@/components/account/address-book";
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

const PAYMENT_ICON = { BANK_TRANSFER: Landmark, PAYID: Zap, CRYPTO: Bitcoin } as const;

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

function Section({ step, title, action, children }: { step: number; title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <Card className="p-5 sm:p-6">
      <div className="mb-5 flex items-center justify-between gap-4">
        <h2 className="flex items-center gap-3 text-base font-semibold text-ink-900">
          <span className="grid size-7 place-items-center rounded-full bg-ink-900 text-xs font-bold text-mint-300">{step}</span>
          {title}
        </h2>
        {action}
      </div>
      {children}
    </Card>
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

  const [addressId, setAddressId] = useState<string>(defaultAddress?.id ?? "new");
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

  const set = <K extends keyof Fields>(key: K, value: Fields[K]) => {
    setFields((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };
  const err = (key: keyof Fields) => errors[key];

  if (placed) {
    return (
      <Card className="flex flex-col items-center gap-3 px-6 py-20 text-center">
        <Loader2 className="size-6 animate-spin text-mint-600" />
        <p className="font-semibold text-ink-900">Order placed — loading your confirmation…</p>
      </Card>
    );
  }

  if (!hydrated) {
    return (
      <div className="grid gap-8 lg:grid-cols-[1fr_400px]" aria-busy="true">
        <div className="space-y-4">
          {[0, 1, 2].map((i) => (
            <Card key={i} className="h-40 animate-pulse bg-slate-50" />
          ))}
        </div>
        <Card className="h-96 animate-pulse bg-slate-50" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <Card className="flex flex-col items-center gap-4 px-6 py-16 text-center">
        <span className="grid size-14 place-items-center rounded-full bg-ink-50">
          <ShoppingBag className="size-6 text-ink-400" />
        </span>
        <div>
          <p className="text-lg font-semibold text-ink-900">Your cart is empty</p>
          <p className="mt-1 text-sm text-slate-500">Add a compound to your cart to check out.</p>
        </div>
        <ButtonLink href="/shop">Browse peptides</ButtonLink>
      </Card>
    );
  }

  const subtotal = cartSubtotal(items);
  const discount = couponDiscount(coupon, subtotal);
  const couponBelowMinimum = !!coupon && subtotal < coupon.minSubtotal;
  const standardCost = shippingFor(settings, "STANDARD", subtotal - discount);
  const shipping = shippingFor(settings, fields.shippingMethod, subtotal - discount);
  const total = subtotal - discount + shipping;

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
      setFormError(result.error);
      window.scrollTo({ top: 0, behavior: "smooth" });
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
      <Field label="Company / institution" htmlFor="company" hint="Optional" error={err("company")}>
        <Input id="company" autoComplete="organization" value={fields.company} onChange={(e) => set("company", e.target.value)} />
      </Field>
      <Field label="Street address" htmlFor="line1" error={err("line1")}>
        <Input id="line1" autoComplete="address-line1" value={fields.line1} onChange={(e) => set("line1", e.target.value)} aria-invalid={!!err("line1")} />
      </Field>
      <Field label="Apartment, suite, unit" htmlFor="line2" hint="Optional" error={err("line2")}>
        <Input id="line2" autoComplete="address-line2" value={fields.line2} onChange={(e) => set("line2", e.target.value)} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-[1.4fr_1fr_0.8fr]">
        <Field label="Suburb / city" htmlFor="city" error={err("city")}>
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
          <Input id="postcode" inputMode="numeric" maxLength={4} autoComplete="postal-code" value={fields.postcode} onChange={(e) => set("postcode", e.target.value.replace(/\D/g, ""))} aria-invalid={!!err("postcode")} />
        </Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Country" htmlFor="country">
          <Input id="country" value="Australia" disabled />
        </Field>
        <Field label="Phone" htmlFor="phone" hint="Optional — for delivery questions" error={err("phone")}>
          <Input id="phone" type="tel" autoComplete="tel" value={fields.phone} onChange={(e) => set("phone", e.target.value)} />
        </Field>
      </div>
      {user ? (
        <label className="flex items-center gap-2.5 text-sm text-slate-700">
          <Checkbox checked={fields.saveAddress} onChange={(e) => set("saveAddress", e.target.checked)} /> Save this address to my account
        </label>
      ) : null}
    </div>
  );

  return (
    <form onSubmit={placeOrder} noValidate className="grid gap-8 lg:grid-cols-[1fr_400px]">
      <div className="space-y-5">
        {formError ? <Alert tone="error">{formError}</Alert> : null}
        {problems.length > 0 ? (
          <Alert tone="warning" title="Some items in your cart need attention">
            <ul className="list-inside list-disc">
              {problems.map((p) => (
                <li key={p.variantId}>{p.message}</li>
              ))}
            </ul>
            <Link href="/cart" className="mt-1 inline-block font-semibold underline">
              Review cart
            </Link>
          </Alert>
        ) : null}

        <Section
          step={1}
          title="Contact"
          action={
            user ? (
              <span className="text-xs text-slate-500">Signed in</span>
            ) : (
              <Link href="/login?next=/checkout" className="text-sm font-medium text-mint-700 hover:underline">
                Sign in for faster checkout
              </Link>
            )
          }
        >
          <Field label="Email" htmlFor="email" hint="Order confirmation and tracking updates are sent here." error={err("email")}>
            <Input id="email" type="email" autoComplete="email" value={fields.email} onChange={(e) => set("email", e.target.value)} aria-invalid={!!err("email")} />
          </Field>
          {!user ? (
            <div className="mt-4 rounded-xl bg-ink-50/60 p-4">
              <label className="flex items-start gap-2.5 text-sm text-slate-700">
                <Checkbox className="mt-0.5" checked={fields.createAccount} onChange={(e) => set("createAccount", e.target.checked)} />
                <span>
                  <span className="font-medium text-ink-900">Create an account with this email</span>
                  <span className="block text-slate-500">Track orders, save addresses and reorder in one click.</span>
                </span>
              </label>
              {fields.createAccount ? (
                <Field label="Choose a password" htmlFor="password" hint="8+ characters with a letter and a number" error={err("password")} className="mt-4">
                  <Input id="password" type="password" autoComplete="new-password" value={fields.password} onChange={(e) => set("password", e.target.value)} aria-invalid={!!err("password")} />
                </Field>
              ) : null}
            </div>
          ) : null}
        </Section>

        <Section step={2} title="Shipping address">
          {addresses.length > 0 ? (
            <div className="mb-5 grid gap-2 sm:grid-cols-2">
              {addresses.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => {
                    setAddressId(a.id);
                    setFields((f) => ({ ...f, ...fromAddress(a) }));
                    setErrors({});
                  }}
                  className={cn(
                    "rounded-xl border p-3 text-left text-sm transition-colors",
                    addressId === a.id ? "border-mint-500 bg-mint-50/50 ring-2 ring-mint-500/20" : "border-slate-200 hover:border-ink-200",
                  )}
                >
                  <span className="flex items-center justify-between gap-2 font-semibold text-ink-900">
                    {a.label || `${a.firstName} ${a.lastName}`}
                    {addressId === a.id ? <Check className="size-4 text-mint-600" /> : null}
                  </span>
                  <span className="mt-0.5 block text-slate-500">
                    {a.line1}, {a.city} {a.state} {a.postcode}
                  </span>
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  setAddressId("new");
                  setFields((f) => ({ ...f, company: "", line1: "", line2: "", city: "", state: "", postcode: "" }));
                }}
                className={cn(
                  "rounded-xl border border-dashed p-3 text-left text-sm font-medium transition-colors",
                  addressId === "new" ? "border-mint-500 bg-mint-50/50 text-ink-900" : "border-slate-300 text-slate-600 hover:border-ink-300",
                )}
              >
                + Use a new address
              </button>
            </div>
          ) : null}
          {addressId === "new" || addresses.length === 0 ? (
            addressFields
          ) : (
            <details className="group text-sm">
              <summary className="cursor-pointer font-medium text-mint-700 hover:underline">Edit details for this order</summary>
              <div className="mt-4">{addressFields}</div>
            </details>
          )}
          {addressId !== "new" && Object.values(errors).some(Boolean) ? (
            <p className="mt-3 text-xs text-rose-600">Please check the address details above.</p>
          ) : null}
        </Section>

        <Section step={3} title="Shipping method">
          <div className="grid gap-3 sm:grid-cols-2">
            {(Object.keys(SHIPPING_METHODS) as ShippingMethod[]).map((key) => {
              const method = SHIPPING_METHODS[key];
              const cost = key === "EXPRESS" ? settings.shippingExpress : standardCost;
              const selected = fields.shippingMethod === key;
              return (
                <label
                  key={key}
                  className={cn(
                    "flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors",
                    selected ? "border-mint-500 bg-mint-50/50 ring-2 ring-mint-500/20" : "border-slate-200 hover:border-ink-200",
                  )}
                >
                  <input type="radio" name="shippingMethod" value={key} checked={selected} onChange={() => set("shippingMethod", key)} className="mt-1 accent-mint-600" />
                  <span className="flex-1">
                    <span className="flex items-center justify-between gap-2 text-sm font-semibold text-ink-900">
                      <span className="flex items-center gap-1.5">
                        <Truck className="size-4 text-slate-400" /> {method.label}
                      </span>
                      <span>{cost === 0 ? <span className="text-mint-700">Free</span> : formatMoney(cost)}</span>
                    </span>
                    <span className="mt-0.5 block text-xs text-slate-500">{method.eta} after dispatch</span>
                  </span>
                </label>
              );
            })}
          </div>
          <p className="mt-3 text-xs text-slate-500">{settings.dispatchCutoff}. Tracking number emailed on dispatch.</p>
        </Section>

        <Section step={4} title="Payment">
          <div className="grid gap-3">
            {(Object.keys(PAYMENT_METHODS) as PaymentMethod[]).map((key) => {
              const method = PAYMENT_METHODS[key];
              const Icon = PAYMENT_ICON[key];
              const selected = fields.paymentMethod === key;
              return (
                <label
                  key={key}
                  className={cn(
                    "flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors",
                    selected ? "border-mint-500 bg-mint-50/50 ring-2 ring-mint-500/20" : "border-slate-200 hover:border-ink-200",
                  )}
                >
                  <input type="radio" name="paymentMethod" value={key} checked={selected} onChange={() => set("paymentMethod", key)} className="mt-1 accent-mint-600" />
                  <span className={cn("grid size-9 shrink-0 place-items-center rounded-lg", selected ? "bg-ink-900 text-mint-300" : "bg-slate-100 text-slate-500")}>
                    <Icon className="size-4" />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-ink-900">{method.label}</span>
                    <span className="block text-xs text-slate-500">{method.description}</span>
                  </span>
                </label>
              );
            })}
          </div>
          <p className="mt-3 text-xs text-slate-500">
            Payment details and your reference number are shown on the next page and emailed to you. Orders are held for{" "}
            {settings.paymentWindowHours} hours awaiting payment.
          </p>
          <Field label="Order note" htmlFor="customerNote" hint="Optional — delivery instructions or anything we should know" className="mt-5">
            <Textarea id="customerNote" rows={3} value={fields.customerNote} onChange={(e) => set("customerNote", e.target.value)} maxLength={1000} />
          </Field>
        </Section>
      </div>

      <aside className="lg:sticky lg:top-24 lg:self-start">
        <Card className="overflow-hidden">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="flex items-center justify-between text-base font-semibold text-ink-900">
              Order summary
              <Link href="/cart" className="text-xs font-medium text-mint-700 hover:underline">
                Edit cart
              </Link>
            </h2>
          </div>
          <ul className="max-h-72 divide-y divide-slate-100 overflow-y-auto px-5">
            {items.map((item) => (
              <li key={item.variantId} className="flex items-center gap-3 py-3">
                <div className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-slate-100 ring-1 ring-slate-200">
                  {item.image ? <Image src={item.image} alt={item.productName} fill sizes="56px" className="object-cover" /> : null}
                  <span className="absolute -top-0 -right-0 grid min-w-5 place-items-center rounded-bl-lg bg-ink-900 px-1 text-[10px] font-bold text-white">
                    {item.quantity}
                  </span>
                </div>
                <div className="min-w-0 flex-1 text-sm">
                  <p className="truncate font-semibold text-ink-900">{item.productName}</p>
                  <p className="text-xs text-slate-500">{item.variantLabel}</p>
                </div>
                <p className="text-sm font-semibold">{formatMoney(item.price * item.quantity)}</p>
              </li>
            ))}
          </ul>

          <div className="space-y-4 border-t border-slate-100 px-5 py-4">
            {coupon ? (
              <div className="flex items-start justify-between gap-3 rounded-lg bg-mint-50 px-3 py-2 text-sm ring-1 ring-mint-200">
                <span>
                  <span className="flex items-center gap-1.5 font-semibold text-mint-800">
                    <Tag className="size-3.5" /> {coupon.code}
                  </span>
                  {coupon.description ? <span className="block text-xs text-mint-900/70">{coupon.description}</span> : null}
                  {couponBelowMinimum ? (
                    <span className="block text-xs text-amber-700">Requires a {formatMoney(coupon.minSubtotal)} minimum subtotal.</span>
                  ) : null}
                </span>
                <button type="button" onClick={() => setCoupon(null)} className="rounded p-0.5 text-mint-700 hover:bg-mint-100" aria-label="Remove discount code">
                  <X className="size-4" />
                </button>
              </div>
            ) : (
              <div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Discount code"
                    aria-label="Discount code"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        applyCoupon();
                      }
                    }}
                    className="uppercase"
                  />
                  <Button variant="outline" onClick={applyCoupon} disabled={couponPending || !couponInput.trim()}>
                    {couponPending ? <Loader2 className="size-4 animate-spin" /> : "Apply"}
                  </Button>
                </div>
                {couponError ? <p className="mt-1.5 text-xs text-rose-600">{couponError}</p> : null}
              </div>
            )}

            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-500">Subtotal</dt>
                <dd className="font-medium">{formatMoney(subtotal)}</dd>
              </div>
              {discount > 0 ? (
                <div className="flex justify-between text-mint-700">
                  <dt>Discount</dt>
                  <dd className="font-medium">−{formatMoney(discount)}</dd>
                </div>
              ) : null}
              <div className="flex justify-between">
                <dt className="text-slate-500">Shipping</dt>
                <dd className="font-medium">{shipping === 0 ? "Free" : formatMoney(shipping)}</dd>
              </div>
              <div className="flex items-baseline justify-between border-t border-slate-200 pt-3">
                <dt className="font-semibold text-ink-900">Total</dt>
                <dd className="text-xl font-semibold tracking-tight text-ink-900">
                  <span className="mr-1 text-xs font-normal text-slate-400">AUD</span>
                  {formatMoney(total)}
                </dd>
              </div>
            </dl>
          </div>

          <div className="space-y-3 border-t border-slate-100 bg-slate-50/70 px-5 py-4">
            <label className="flex items-start gap-2.5 text-xs leading-relaxed text-slate-700">
              <Checkbox className="mt-0.5" checked={fields.researchAck} onChange={(e) => set("researchAck", e.target.checked)} aria-invalid={!!err("researchAck")} />
              <span>
                I confirm I am 18+ and these products are for <strong>laboratory research use only</strong>, not for human or
                veterinary use.
              </span>
            </label>
            {err("researchAck") ? <p className="pl-6 text-xs text-rose-600">{err("researchAck")?.[0]}</p> : null}
            <label className="flex items-start gap-2.5 text-xs leading-relaxed text-slate-700">
              <Checkbox className="mt-0.5" checked={fields.termsAck} onChange={(e) => set("termsAck", e.target.checked)} aria-invalid={!!err("termsAck")} />
              <span>
                I agree to the{" "}
                <Link href="/terms" target="_blank" className="font-medium text-mint-700 hover:underline">
                  Terms of Sale
                </Link>{" "}
                and{" "}
                <Link href="/disclaimer" target="_blank" className="font-medium text-mint-700 hover:underline">
                  Research Use Policy
                </Link>
                .
              </span>
            </label>
            {err("termsAck") ? <p className="pl-6 text-xs text-rose-600">{err("termsAck")?.[0]}</p> : null}

            <Button type="submit" size="lg" className="w-full" disabled={placing || !synced || problems.length > 0}>
              {placing ? <Loader2 className="size-4 animate-spin" /> : <Lock className="size-4" />}
              {placing ? "Placing order…" : `Place order · ${formatMoney(total)}`}
            </Button>
            <p className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
              <ShieldCheck className="size-3.5 text-mint-600" /> Prices and stock are confirmed when you place your order
            </p>
          </div>
        </Card>
      </aside>
    </form>
  );
}
