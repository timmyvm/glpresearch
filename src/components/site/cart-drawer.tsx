"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { Minus, Plus, X } from "lucide-react";
import { cartSubtotal, useCart } from "@/lib/cart";
import { formatMoney } from "@/lib/money";
import { ButtonLink } from "@/components/ui/button";
import { specimenImage } from "@/lib/plates";

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
        className="absolute inset-0 bg-ink/40"
        onClick={() => setOpen(false)}
        aria-label="Close cart"
      />
      <div className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col overscroll-contain bg-white shadow-[-16px_0_40px_rgba(11,21,48,0.18)]" /* taste-skill-ignore: the drawer is a real overlay */>
        <div className="flex items-center justify-between px-6 py-5">
          <h2 className="text-lead font-medium">Cart</h2>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="press -mr-2 p-2 text-ink hover:bg-surface"
            aria-label="Close cart"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col justify-center gap-5 px-6 pb-10">
            <p className="text-lead">Nothing in your cart yet.</p>
            <p className="text-muted">Seven compounds, each on its own page with batch results and the published research.</p>
            <ButtonLink href="/shop" onClick={() => setOpen(false)} className="self-start">
              Browse Peptides
            </ButtonLink>
          </div>
        ) : (
          <>
            {freeShippingThreshold > 0 ? (
              <div className="bg-surface px-6 py-3">
                <p className="text-small text-ink">
                  {remaining > 0 ? (
                    <>
                      Add <span className="tabular font-medium">{formatMoney(remaining)}</span> for free standard shipping
                    </>
                  ) : (
                    <span className="font-medium">Free standard shipping applies</span>
                  )}
                </p>
                <div className="mt-2 h-1 bg-surface-2">
                  <div className="h-full origin-left bg-ink transition-transform duration-500" style={{ transform: `scaleX(${progress / 100})` }} />
                </div>
              </div>
            ) : null}
            <ul className="flex-1 space-y-2 overflow-y-auto overscroll-contain px-6 py-4">
              {items.map((item) => (
                <li key={item.variantId} className="flex gap-4">
                  <Link
                    href={`/shop/${item.productSlug}`}
                    onClick={() => setOpen(false)}
                    className="relative h-24 w-20 shrink-0 overflow-hidden bg-surface"
                  >
                    <Image src={specimenImage(item.image) ?? item.image} alt={`${item.productName} ${item.variantLabel}`} fill sizes="80px" className="object-contain p-1.5" />
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex justify-between gap-2">
                      <div>
                        <p className="font-medium text-ink">{item.productName}</p>
                        <p className="text-small text-muted">{item.variantLabel}</p>
                      </div>
                      <p className="tabular font-medium">{formatMoney(item.price * item.quantity)}</p>
                    </div>
                    <div className="mt-auto flex items-center justify-between pt-2">
                      <div className="inline-flex items-center bg-surface">
                        <button
                          type="button"
                          className="press grid size-9 place-items-center text-ink hover:bg-surface-2"
                          onClick={() => setQuantity(item.variantId, item.quantity - 1)}
                          aria-label="Decrease quantity"
                        >
                          <Minus className="size-3.5" aria-hidden="true" />
                        </button>
                        <span className="tabular w-8 text-center text-small font-medium" aria-live="polite">{item.quantity}</span>
                        <button
                          type="button"
                          className="press grid size-9 place-items-center text-ink hover:bg-surface-2"
                          onClick={() => setQuantity(item.variantId, item.quantity + 1)}
                          aria-label="Increase quantity"
                        >
                          <Plus className="size-3.5" aria-hidden="true" />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => remove(item.variantId)}
                        className="link text-small text-muted hover:text-danger"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="space-y-4 bg-surface px-6 py-6">
              <div className="flex items-baseline justify-between">
                <span>Subtotal</span>
                <span className="tabular text-lead font-medium">{formatMoney(subtotal)}</span>
              </div>
              <p className="text-small text-muted">Shipping and discount codes are applied at checkout.</p>
              <div className="grid grid-cols-2 gap-2">
                <ButtonLink href="/cart" variant="outline" onClick={() => setOpen(false)}>
                  View Cart
                </ButtonLink>
                <ButtonLink href="/checkout" variant="primary" onClick={() => setOpen(false)}>
                  Checkout
                </ButtonLink>
              </div>
              <p className="text-small text-muted">For laboratory research use only.</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
