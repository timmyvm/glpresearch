"use client";

import { useCart } from "@/lib/cart";
import { SpecimenTile, type SpecimenData } from "@/components/store/specimen-tile";
import { useHydrated } from "./use-cart-sync";

/** Up to three compounds that aren't already in the cart. */
export function CartSuggestions({ products }: { products: SpecimenData[] }) {
  const hydrated = useHydrated();
  const items = useCart((s) => s.items);
  const inCart = new Set(hydrated ? items.map((i) => i.productSlug) : []);
  const shown = products.filter((p) => !inCart.has(p.slug)).slice(0, 3);
  if (shown.length === 0) return null;

  return (
    <section aria-labelledby="also-title" className="mt-24 md:mt-32">
      <h2 id="also-title" className="text-index font-medium">
        Often ordered alongside
      </h2>
      <div className="mt-8 grid grid-cols-2 gap-x-[var(--gutter)] gap-y-10 md:grid-cols-3">
        {shown.map((p, i) => (
          <SpecimenTile key={p.slug} product={p} className={i === 2 ? "hidden md:block" : undefined} />
        ))}
      </div>
    </section>
  );
}
