"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus } from "lucide-react";
import { cartSubtotal, MAX_LINE_QTY, useCart } from "@/lib/cart";
import { formatMoney } from "@/lib/money";
import { plateInk, specimenImage } from "@/lib/plates";
import { cn } from "@/lib/utils";
import { Alert } from "@/components/ui/alert";
import { ButtonLink } from "@/components/ui/button";
import { Slip, SlipRow } from "@/components/store/paper";
import { useCartSync } from "./use-cart-sync";

export function QuantityStepper({
  value,
  onChange,
  max = MAX_LINE_QTY,
  label,
}: {
  value: number;
  onChange: (value: number) => void;
  max?: number;
  label: string;
}) {
  const step = "press grid size-11 place-items-center text-ink transition-colors duration-150 hover:bg-surface-2 disabled:opacity-40";
  return (
    <div className="inline-flex items-center bg-surface" role="group" aria-label={`Quantity of ${label}`}>
      <button type="button" className={step} onClick={() => onChange(value - 1)} aria-label={value <= 1 ? `Remove ${label}` : "Decrease quantity"}>
        <Minus className="size-4" aria-hidden="true" />
      </button>
      <span className="tabular w-8 text-center font-medium" aria-live="polite">
        {value}
      </span>
      <button type="button" className={step} onClick={() => onChange(value + 1)} disabled={value >= max} aria-label="Increase quantity">
        <Plus className="size-4" aria-hidden="true" />
      </button>
    </div>
  );
}

/** The final layout with flat grey blocks in place of each value, so nothing shifts when the cart loads. */
function CartSkeleton() {
  return (
    <div className="grid gap-12 lg:grid-cols-12 lg:gap-8" aria-busy="true" aria-label="Loading your cart">
      <div className="space-y-8 lg:col-span-7">
        {[0, 1].map((i) => (
          <div key={i} className="flex gap-5">
            <div className="h-32 w-26 shrink-0 bg-surface" />
            <div className="flex-1 space-y-3 py-1">
              <div className="h-6 w-1/3 bg-surface" />
              <div className="h-4 w-1/4 bg-surface" />
            </div>
          </div>
        ))}
      </div>
      <div className="h-72 bg-surface lg:col-span-4 lg:col-start-9" />
    </div>
  );
}

export function CartView({ freeShippingThreshold }: { freeShippingThreshold: number }) {
  const { hydrated, items, quotes, problems } = useCartSync();
  const setQuantity = useCart((s) => s.setQuantity);
  const remove = useCart((s) => s.remove);

  if (!hydrated) return <CartSkeleton />;

  if (items.length === 0) {
    return (
      <div className="max-w-xl">
        <p className="text-lead font-medium">Nothing in your cart yet.</p>
        <p className="mt-2 text-muted">Every vial carries a batch number whose certificate of analysis is on file, and orders over the free-shipping line go tracked at no cost.</p>
        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
          <ButtonLink href="/shop" variant="ink">
            Shop Peptides
          </ButtonLink>
          <Link href="/coa" className="link text-small">
            Look up a batch result
          </Link>
        </div>
      </div>
    );
  }

  const subtotal = cartSubtotal(items);
  const remaining = freeShippingThreshold > 0 ? Math.max(0, freeShippingThreshold - subtotal) : 0;
  const progress = freeShippingThreshold > 0 ? Math.min(100, (subtotal / freeShippingThreshold) * 100) : 100;
  const blocked = problems.length > 0;
  const count = items.reduce((s, i) => s + i.quantity, 0);

  return (
    <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
      <section aria-label="Items in your cart" className="lg:col-span-7">
        {problems.length > 0 ? (
          <Alert tone="warning" title="Some items need your attention" className="mb-8">
            <ul className="list-inside list-disc">
              {problems.map((p) => (
                <li key={p.variantId}>{p.message}</li>
              ))}
            </ul>
          </Alert>
        ) : null}
        <ul className="space-y-8">
          {items.map((item) => {
            const q = quotes[item.variantId];
            const unavailable = q && !q.available;
            const plate = q?.plate || undefined;
            const href = item.productSlug ? `/shop/${item.productSlug}` : "/shop";
            const label = `${item.productName} ${item.variantLabel}`;
            return (
              <li key={item.variantId} className="flex gap-5">
                <Link
                  href={href}
                  className={cn("relative h-32 w-26 shrink-0 overflow-clip", !plate && "bg-surface")}
                  style={plate ? { backgroundColor: plate, color: plateInk(plate) } : undefined}
                  tabIndex={-1}
                  aria-hidden="true"
                >
                  {item.image ? (
                    <Image src={specimenImage(item.image) ?? item.image} alt="" fill sizes="104px" className="object-contain px-2 pt-3 pb-1" />
                  ) : null}
                </Link>
                <div className="flex min-w-0 flex-1 flex-col justify-between gap-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <Link href={href} className="link text-lead font-medium decoration-transparent hover:decoration-current">
                        {item.productName}
                      </Link>
                      <p className="text-small text-muted">
                        {item.variantLabel}, {formatMoney(item.price)} each
                      </p>
                      {unavailable ? <p className="mt-1 text-small font-medium text-danger">No longer available. Remove it to check out.</p> : null}
                    </div>
                    <p className="tabular shrink-0 text-lead font-medium">{formatMoney(item.price * item.quantity)}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <QuantityStepper
                      label={label}
                      value={item.quantity}
                      max={Math.min(MAX_LINE_QTY, q?.stock ?? MAX_LINE_QTY)}
                      onChange={(v) => setQuantity(item.variantId, v)}
                    />
                    <button type="button" onClick={() => remove(item.variantId)} className="link text-small text-muted hover:text-ink">
                      Remove<span className="sr-only"> {label}</span>
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
        <Link href="/shop" className="link mt-10 inline-block text-small">
          Continue shopping
        </Link>
      </section>

      <aside aria-labelledby="summary-title" className="lg:sticky lg:top-24 lg:col-span-4 lg:col-start-9 lg:self-start">
        <Slip className="px-6 pt-6 md:px-7 md:pt-7">
          <h2 id="summary-title" className="text-lead font-semibold">
            Summary
          </h2>
          <div className="mt-5 space-y-2 text-body">
            <SlipRow label={`Subtotal, ${count} ${count === 1 ? "vial" : "vials"}`} value={formatMoney(subtotal)} />
            <SlipRow label="Shipping" value={remaining === 0 && freeShippingThreshold > 0 ? "Free standard" : "At checkout"} />
          </div>
          <p className="-mx-6 mt-5 flex h-12 items-center justify-between gap-3 bg-ink px-6 text-white md:-mx-7 md:px-7">
            <span className="font-medium">{remaining === 0 && freeShippingThreshold > 0 ? "Total" : "Total before shipping"}</span>
            <span className="tabular text-lead font-semibold">{formatMoney(subtotal)}</span>
          </p>

          {freeShippingThreshold > 0 ? (
            <div className="mt-5">
              <div className="h-1.5 bg-white" aria-hidden="true">
                <div className="h-full bg-ink" style={{ width: `${progress}%` }} />
              </div>
              <p className="mt-2 text-small text-muted">
                {remaining > 0 ? (
                  <>
                    <span className="tabular text-ink">{formatMoney(remaining)}</span> more for free standard shipping
                  </>
                ) : (
                  "Free standard shipping applies to this order."
                )}
              </p>
            </div>
          ) : null}

          <ButtonLink
            href="/checkout"
            variant="accent"
            size="lg"
            className={cn("mt-6 w-full", blocked && "pointer-events-none opacity-50")}
            aria-disabled={blocked || undefined}
            tabIndex={blocked ? -1 : undefined}
          >
            Checkout
          </ButtonLink>
          <p className="mt-4 text-small text-muted">
            Discount codes go in at checkout. Every compound is sold for laboratory research use only.
          </p>
        </Slip>
      </aside>
    </div>
  );
}
