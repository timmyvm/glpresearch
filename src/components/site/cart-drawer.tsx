"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { Minus, Plus, ShieldCheck, ShoppingBag, Trash2, X } from "lucide-react";
import { cartSubtotal, useCart } from "@/lib/cart";
import { formatMoney } from "@/lib/money";
import { ButtonLink } from "@/components/ui/button";

export function CartDrawer({ freeShippingThreshold }: { freeShippingThreshold: number }) {
  const { items, open, setOpen, setQuantity, remove } = useCart();
  const subtotal = cartSubtotal(items);
  const remaining = freeShippingThreshold > 0 ? Math.max(0, freeShippingThreshold - subtotal) : 0;
  const progress = freeShippingThreshold > 0 ? Math.min(100, (subtotal / freeShippingThreshold) * 100) : 100;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, setOpen]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Shopping cart">
      <button
        type="button"
        className="absolute inset-0 bg-ink-950/50 backdrop-blur-sm"
        onClick={() => setOpen(false)}
        aria-label="Close cart"
      />
      <div className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h2 className="flex items-center gap-2 text-base font-semibold">
            <ShoppingBag className="size-4" /> Your cart
          </h2>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-ink-900"
            aria-label="Close cart"
          >
            <X className="size-5" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
            <div className="grid size-14 place-items-center rounded-full bg-ink-50">
              <ShoppingBag className="size-6 text-ink-400" />
            </div>
            <p className="text-sm text-slate-600">Your cart is empty.</p>
            <ButtonLink href="/shop" onClick={() => setOpen(false)}>
              Browse peptides
            </ButtonLink>
          </div>
        ) : (
          <>
            {freeShippingThreshold > 0 ? (
              <div className="border-b border-slate-100 bg-ink-50/60 px-5 py-3">
                <p className="text-xs text-ink-700">
                  {remaining > 0 ? (
                    <>
                      Add <span className="font-semibold">{formatMoney(remaining)}</span> for free standard shipping
                    </>
                  ) : (
                    <span className="font-semibold text-mint-700">You&apos;ve unlocked free standard shipping</span>
                  )}
                </p>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-ink-100">
                  <div className="h-full rounded-full bg-mint-500 transition-all" style={{ width: `${progress}%` }} />
                </div>
              </div>
            ) : null}
            <ul className="flex-1 divide-y divide-slate-100 overflow-y-auto px-5">
              {items.map((item) => (
                <li key={item.variantId} className="flex gap-4 py-4">
                  <Link
                    href={`/shop/${item.productSlug}`}
                    onClick={() => setOpen(false)}
                    className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-slate-100"
                  >
                    <Image src={item.image} alt={item.productName} fill sizes="80px" className="object-cover" />
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-ink-900">{item.productName}</p>
                        <p className="text-xs text-slate-500">
                          {item.variantLabel} · <span className="font-mono">{item.sku}</span>
                        </p>
                      </div>
                      <p className="text-sm font-semibold">{formatMoney(item.price * item.quantity)}</p>
                    </div>
                    <div className="mt-auto flex items-center justify-between pt-2">
                      <div className="inline-flex items-center rounded-lg border border-slate-200">
                        <button
                          type="button"
                          className="p-1.5 text-slate-500 hover:text-ink-900"
                          onClick={() => setQuantity(item.variantId, item.quantity - 1)}
                          aria-label="Decrease quantity"
                        >
                          <Minus className="size-3.5" />
                        </button>
                        <span className="w-8 text-center text-sm font-medium tabular-nums">{item.quantity}</span>
                        <button
                          type="button"
                          className="p-1.5 text-slate-500 hover:text-ink-900"
                          onClick={() => setQuantity(item.variantId, item.quantity + 1)}
                          aria-label="Increase quantity"
                        >
                          <Plus className="size-3.5" />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => remove(item.variantId)}
                        className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-rose-600"
                      >
                        <Trash2 className="size-3.5" /> Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="space-y-4 border-t border-slate-200 px-5 py-5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">Subtotal</span>
                <span className="text-base font-semibold">{formatMoney(subtotal)}</span>
              </div>
              <p className="text-xs text-slate-500">Shipping and discount codes are applied at checkout.</p>
              <div className="grid grid-cols-2 gap-2">
                <ButtonLink href="/cart" variant="outline" onClick={() => setOpen(false)}>
                  View cart
                </ButtonLink>
                <ButtonLink href="/checkout" variant="primary" onClick={() => setOpen(false)}>
                  Checkout
                </ButtonLink>
              </div>
              <p className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
                <ShieldCheck className="size-3.5 text-mint-600" /> For laboratory research use only
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
