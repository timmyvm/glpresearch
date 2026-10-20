"use client";

import Image from "next/image";
import { useState } from "react";
import { Check, Minus, Plus, ShoppingBag } from "lucide-react";
import { MAX_LINE_QTY, useCart } from "@/lib/cart";
import { formatMoney } from "@/lib/money";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type Variant = {
  id: string;
  label: string;
  sku: string;
  price: number;
  compareAtPrice: number | null;
  stock: number;
  image: string | null;
};

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
  const image = selected?.image ?? product.image;
  const soldOut = !selected || selected.stock <= 0;
  const maxQty = Math.max(1, Math.min(MAX_LINE_QTY, selected?.stock ?? 1));

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
        image,
      },
      qty,
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
      <div className="lg:sticky lg:top-24 lg:self-start">
        <div className="relative aspect-square overflow-hidden rounded-3xl border border-slate-200 bg-[#eef0f3]">
          <Image key={image} src={image} alt={`${product.name} ${selected?.label ?? ""} research vial`} fill priority sizes="(min-width: 1024px) 50vw, 100vw" className="animate-fade-up object-cover" />
        </div>
        {variants.length > 1 ? (
          <div className="mt-4 grid grid-cols-4 gap-3">
            {variants.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => setSelectedId(v.id)}
                className={cn(
                  "relative aspect-square overflow-hidden rounded-xl border bg-[#eef0f3] transition-all",
                  v.id === selected?.id ? "border-ink-900 ring-2 ring-ink-900/10" : "border-slate-200 hover:border-slate-300",
                )}
                aria-label={`Show ${v.label}`}
              >
                <Image src={v.image ?? product.image} alt="" fill sizes="120px" className="object-cover" />
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div>
        {header}

        <div className="mt-8 rounded-3xl border border-slate-200 bg-slate-50/60 p-6">
          <div className="flex items-baseline gap-3">
            <p className="text-3xl font-semibold tracking-tight text-ink-900">{formatMoney(selected?.price ?? 0)}</p>
            {selected?.compareAtPrice && selected.compareAtPrice > selected.price ? (
              <p className="text-base text-slate-400 line-through">{formatMoney(selected.compareAtPrice)}</p>
            ) : null}
            <p className="ml-auto font-mono text-xs text-slate-500">SKU {selected?.sku}</p>
          </div>

          <fieldset className="mt-6">
            <legend className="text-sm font-medium text-ink-800">Vial size</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {variants.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => {
                    setSelectedId(v.id);
                    setQty(1);
                  }}
                  disabled={v.stock <= 0}
                  className={cn(
                    "min-w-20 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-40",
                    v.id === selected?.id
                      ? "border-ink-900 bg-ink-900 text-white"
                      : "border-slate-300 bg-white text-ink-900 hover:border-ink-400",
                  )}
                  aria-pressed={v.id === selected?.id}
                >
                  {v.label}
                  <span className={cn("block text-[11px] font-normal", v.id === selected?.id ? "text-ink-200" : "text-slate-500")}>
                    {v.stock > 0 ? formatMoney(v.price) : "Sold out"}
                  </span>
                </button>
              ))}
            </div>
          </fieldset>

          <div className="mt-6 flex gap-3">
            <div className="inline-flex h-12 items-center rounded-lg border border-slate-300 bg-white">
              <button type="button" className="px-3 text-slate-500 hover:text-ink-900 disabled:opacity-40" onClick={() => setQty((q) => Math.max(1, q - 1))} disabled={qty <= 1} aria-label="Decrease quantity">
                <Minus className="size-4" />
              </button>
              <span className="w-8 text-center text-sm font-semibold tabular-nums">{qty}</span>
              <button type="button" className="px-3 text-slate-500 hover:text-ink-900 disabled:opacity-40" onClick={() => setQty((q) => Math.min(maxQty, q + 1))} disabled={qty >= maxQty} aria-label="Increase quantity">
                <Plus className="size-4" />
              </button>
            </div>
            <Button size="lg" className="flex-1" onClick={onAdd} disabled={soldOut}>
              {added ? <Check className="size-4" /> : <ShoppingBag className="size-4" />}
              {soldOut ? "Out of stock" : added ? "Added to cart" : `Add to cart · ${formatMoney((selected?.price ?? 0) * qty)}`}
            </Button>
          </div>

          <p className={cn("mt-3 flex items-center gap-2 text-xs", soldOut ? "text-rose-600" : "text-slate-600")}>
            <span className={cn("size-2 rounded-full", soldOut ? "bg-rose-500" : selected!.stock < 15 ? "bg-amber-500" : "bg-emerald-500")} />
            {soldOut ? "Currently out of stock" : selected!.stock < 15 ? `Low stock — ${selected!.stock} vials left` : "In stock · ships within 1 business day of payment"}
          </p>
        </div>

        {footer}
      </div>
    </div>
  );
}
