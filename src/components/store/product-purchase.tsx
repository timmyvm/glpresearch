"use client";

import Image from "next/image";
import { useState } from "react";
import { Check, Minus, Plus } from "lucide-react";
import { MAX_LINE_QTY, useCart } from "@/lib/cart";
import { formatMoney } from "@/lib/money";
import { plateInk, specimenImage } from "@/lib/plates";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { StockAlertForm } from "./stock-alert-form";

type Variant = {
  id: string;
  label: string;
  sku: string;
  price: number;
  compareAtPrice: number | null;
  stock: number;
  image: string | null;
};

/**
 * The product's specimen plate and its purchase panel. Choosing a vial size swaps the cut-out
 * on the plate; a sold-out size offers a back-in-stock email instead of Add to Cart.
 */
export function ProductPurchase({
  product,
  variants,
  header,
  footer,
}: {
  product: { slug: string; name: string; image: string; accentColor: string };
  variants: Variant[];
  header: React.ReactNode;
  footer: React.ReactNode;
}) {
  const firstAvailable = variants.find((v) => v.stock > 0) ?? variants[0];
  const [selectedId, setSelectedId] = useState(firstAvailable?.id);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const add = useCart((s) => s.add);

  const selected = variants.find((v) => v.id === selectedId) ?? variants[0];
  const photo = selected?.image ?? product.image;
  const soldOut = !selected || selected.stock <= 0;
  const maxQty = Math.max(1, Math.min(MAX_LINE_QTY, selected?.stock ?? 1));
  const ink = plateInk(product.accentColor);

  const onAdd = () => {
    if (!selected || soldOut) return;
    add(
      {
        variantId: selected.id,
        productSlug: product.slug,
        productName: product.name,
        variantLabel: selected.label,
        sku: selected.sku,
        price: selected.price,
        image: photo,
      },
      qty,
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-12 lg:gap-x-[var(--gutter)] lg:gap-y-0">
      {/* Phones read the title first; wide screens put it beside the plate. */}
      <div className="lg:col-span-5 lg:col-start-8 lg:row-start-1">{header}</div>
      <div className="lg:sticky lg:top-16 lg:col-span-7 lg:row-span-2 lg:row-start-1 lg:self-start">
        <div className="relative aspect-[5/4] overflow-clip lg:aspect-auto lg:h-[min(calc(100svh-9rem),56rem)] lg:min-h-[32rem]" style={{ backgroundColor: product.accentColor, color: ink }}>
          {variants.map((v) => (
            <Image
              key={v.id}
              src={specimenImage(v.image ?? product.image) ?? product.image}
              alt={v.id === selected?.id ? `${product.name} ${v.label} research vial` : ""}
              fill
              priority={v.id === selected?.id}
              sizes="(min-width: 1024px) 58vw, 100vw"
              className={cn(
                "object-contain px-[12%] pt-[5%] pb-[3%] lg:pt-[9%] lg:pb-[6%] transition-[opacity,transform] duration-300 ease-[var(--ease-out)]",
                v.id === selected?.id ? "opacity-100" : "translate-y-3 opacity-0",
              )}
            />
          ))}
          <p className="absolute top-4 left-4 text-small font-medium" aria-hidden="true">
            {selected?.label}
          </p>
        </div>
      </div>

      <div className="lg:col-span-5 lg:col-start-8 lg:row-start-2">
        <div className="bg-surface p-5 md:p-6 lg:mt-8">
          <div className="flex items-baseline gap-3">
            <p className="tabular text-head">{formatMoney(selected?.price ?? 0)}</p>
            {selected?.compareAtPrice && selected.compareAtPrice > selected.price ? (
              <p className="tabular text-body text-muted line-through">{formatMoney(selected.compareAtPrice)}</p>
            ) : null}
          </div>

          <fieldset className="mt-6">
            <legend className="text-small font-medium">Vial size</legend>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {variants.map((v) => {
                const active = v.id === selected?.id;
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => {
                      setSelectedId(v.id);
                      setQty(1);
                    }}
                    aria-pressed={active}
                    className={cn(
                      "press px-3 py-3 text-left",
                      active ? "bg-ink text-on-navy" : "bg-white text-ink hover:bg-surface-2",
                    )}
                  >
                    <span className="block font-medium">{v.label}</span>
                    <span className={cn("tabular block text-small", active ? "text-on-navy-muted" : "text-muted")}>
                      {v.stock > 0 ? formatMoney(v.price) : "Sold out"}
                    </span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          <div className="mt-6">
            {soldOut ? (
              <StockAlertForm key={selected?.id} variantId={selected!.id} label={selected!.label} />
            ) : (
              <div className="flex gap-2">
                <div className="flex h-14 items-center bg-white">
                  <button
                    type="button"
                    className="press grid size-14 place-items-center hover:bg-surface-2 disabled:opacity-40"
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    disabled={qty <= 1}
                    aria-label="Decrease quantity"
                  >
                    <Minus className="size-4" aria-hidden="true" />
                  </button>
                  <span className="tabular w-8 text-center font-medium" aria-live="polite" aria-label={`Quantity ${qty}`}>
                    {qty}
                  </span>
                  <button
                    type="button"
                    className="press grid size-14 place-items-center hover:bg-surface-2 disabled:opacity-40"
                    onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
                    disabled={qty >= maxQty}
                    aria-label="Increase quantity"
                  >
                    <Plus className="size-4" aria-hidden="true" />
                  </button>
                </div>
                <Button size="lg" className="flex-1" onClick={onAdd}>
                  {added ? <Check className="size-4" aria-hidden="true" /> : null}
                  {added ? "Added to Cart" : "Add to Cart"}
                </Button>
              </div>
            )}
          </div>

          <p className="mt-4 text-small" aria-live="polite">
            {soldOut
              ? "This size is out of stock."
              : selected!.stock < 15
                ? `Only ${selected!.stock} vials left. Ships within one business day of payment.`
                : "In stock. Ships within one business day of payment."}
          </p>
        </div>

        {footer}
      </div>
    </div>
  );
}
