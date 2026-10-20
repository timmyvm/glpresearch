"use client";

import Image from "next/image";
import Link from "next/link";
import { AlertTriangle, ArrowRight, Lock, Minus, Plus, ShieldCheck, ShoppingBag, Trash2, Truck } from "lucide-react";
import { cartSubtotal, MAX_LINE_QTY, useCart } from "@/lib/cart";
import { formatMoney } from "@/lib/money";
import { cn } from "@/lib/utils";
import { Alert } from "@/components/ui/alert";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useCartSync } from "./use-cart-sync";

export function QuantityStepper({
  value,
  onChange,
  max = MAX_LINE_QTY,
}: {
  value: number;
  onChange: (value: number) => void;
  max?: number;
}) {
  return (
    <div className="inline-flex items-center rounded-lg border border-slate-200 bg-white">
      <button
        type="button"
        className="grid size-8 place-items-center text-slate-500 hover:text-ink-900 disabled:opacity-40"
        onClick={() => onChange(value - 1)}
        aria-label="Decrease quantity"
      >
        <Minus className="size-3.5" />
      </button>
      <span className="w-8 text-center text-sm font-medium tabular-nums">{value}</span>
      <button
        type="button"
        className="grid size-8 place-items-center text-slate-500 hover:text-ink-900 disabled:opacity-40"
        onClick={() => onChange(value + 1)}
        disabled={value >= max}
        aria-label="Increase quantity"
      >
        <Plus className="size-3.5" />
      </button>
    </div>
  );
}

function CartSkeleton() {
  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]" aria-busy="true">
      <Card className="space-y-4 p-5">
        {[0, 1].map((i) => (
          <div key={i} className="flex animate-pulse gap-4">
            <div className="size-24 rounded-xl bg-slate-100" />
            <div className="flex-1 space-y-2 py-1">
              <div className="h-4 w-1/3 rounded bg-slate-100" />
              <div className="h-3 w-1/4 rounded bg-slate-100" />
            </div>
          </div>
        ))}
      </Card>
      <Card className="h-56 animate-pulse bg-slate-50" />
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
      <Card className="flex flex-col items-center gap-4 px-6 py-16 text-center">
        <span className="grid size-14 place-items-center rounded-full bg-ink-50">
          <ShoppingBag className="size-6 text-ink-400" />
        </span>
        <div>
          <p className="text-lg font-semibold text-ink-900">Your cart is empty</p>
          <p className="mt-1 text-sm text-slate-500">Browse our catalogue of third-party tested incretin peptides.</p>
        </div>
        <ButtonLink href="/shop">Browse peptides</ButtonLink>
      </Card>
    );
  }

  const subtotal = cartSubtotal(items);
  const remaining = freeShippingThreshold > 0 ? Math.max(0, freeShippingThreshold - subtotal) : 0;
  const progress = freeShippingThreshold > 0 ? Math.min(100, (subtotal / freeShippingThreshold) * 100) : 100;
  const blocked = problems.length > 0;

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <div className="space-y-4">
        {problems.length > 0 ? (
          <Alert tone="warning" title="Some items need your attention">
            <ul className="list-inside list-disc">
              {problems.map((p) => (
                <li key={p.variantId}>{p.message}</li>
              ))}
            </ul>
          </Alert>
        ) : null}
        <Card>
          <ul className="divide-y divide-slate-100">
            {items.map((item) => {
              const q = quotes[item.variantId];
              const unavailable = q && !q.available;
              return (
                <li key={item.variantId} className={cn("flex gap-4 p-5", unavailable && "bg-rose-50/40")}>
                  <Link
                    href={item.productSlug ? `/shop/${item.productSlug}` : "/shop"}
                    className="relative size-24 shrink-0 overflow-hidden rounded-xl bg-slate-100 ring-1 ring-slate-200"
                  >
                    {item.image ? <Image src={item.image} alt={item.productName} fill sizes="96px" className="object-cover" /> : null}
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <Link href={item.productSlug ? `/shop/${item.productSlug}` : "/shop"} className="font-semibold text-ink-900 hover:underline">
                        {item.productName}
                      </Link>
                      <p className="text-sm text-slate-500">
                        {item.variantLabel} · <span className="font-mono text-xs">{item.sku}</span>
                      </p>
                      <p className="mt-1 text-sm text-slate-500">{formatMoney(item.price)} each</p>
                      {unavailable ? (
                        <p className="mt-1 flex items-center gap-1 text-xs font-medium text-rose-600">
                          <AlertTriangle className="size-3.5" /> No longer available
                        </p>
                      ) : null}
                    </div>
                    <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                      <p className="font-semibold text-ink-900 sm:order-first">{formatMoney(item.price * item.quantity)}</p>
                      <div className="flex items-center gap-2">
                        <QuantityStepper
                          value={item.quantity}
                          max={Math.min(MAX_LINE_QTY, q?.stock ?? MAX_LINE_QTY)}
                          onChange={(v) => setQuantity(item.variantId, v)}
                        />
                        <button
                          type="button"
                          onClick={() => remove(item.variantId)}
                          className="grid size-8 place-items-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                          aria-label={`Remove ${item.productName}`}
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>
        <Link href="/shop" className="inline-block text-sm font-medium text-mint-700 hover:underline">
          ← Continue shopping
        </Link>
      </div>

      <aside className="lg:sticky lg:top-24 lg:self-start">
        <Card className="space-y-5 p-6">
          <h2 className="text-base font-semibold text-ink-900">Order summary</h2>
          {freeShippingThreshold > 0 ? (
            <div className="rounded-xl bg-ink-50/70 p-3">
              <p className="flex items-center gap-2 text-xs text-ink-700">
                <Truck className="size-3.5 text-mint-600" />
                {remaining > 0 ? (
                  <span>
                    Add <span className="font-semibold">{formatMoney(remaining)}</span> for free standard shipping
                  </span>
                ) : (
                  <span className="font-semibold text-mint-700">Free standard shipping unlocked</span>
                )}
              </p>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-ink-100">
                <div className="h-full rounded-full bg-mint-500 transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>
          ) : null}
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-500">Subtotal</dt>
              <dd className="font-semibold">{formatMoney(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Shipping</dt>
              <dd className="text-slate-500">Calculated at checkout</dd>
            </div>
          </dl>
          <ButtonLink
            href="/checkout"
            size="lg"
            className={cn("w-full", blocked && "pointer-events-none opacity-50")}
            aria-disabled={blocked}
          >
            <Lock className="size-4" /> Secure checkout <ArrowRight className="size-4" />
          </ButtonLink>
          <p className="flex items-start gap-2 text-xs text-slate-500">
            <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-mint-600" />
            All products are supplied strictly for laboratory research use only. Discount codes are applied at checkout.
          </p>
        </Card>
      </aside>
    </div>
  );
}
