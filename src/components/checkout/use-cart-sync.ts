"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { refreshCart } from "@/app/(store)/checkout/actions";
import { useCart } from "@/lib/cart";
import type { QuotedLine } from "@/lib/checkout";

const noop = () => () => {};

/** True only after hydration — the cart lives in localStorage so the server always renders it empty. */
export function useHydrated() {
  return useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );
}

/**
 * Re-prices the persisted cart against the database once per mount (or when its lines change)
 * and returns per-line availability so the UI can flag sold-out items.
 */
export function useCartSync() {
  const hydrated = useHydrated();
  const items = useCart((s) => s.items);
  const [quotes, setQuotes] = useState<Record<string, QuotedLine>>({});
  const [synced, setSynced] = useState(false);
  const key = items.map((i) => `${i.variantId}:${i.quantity}`).join("|");

  useEffect(() => {
    if (!hydrated) return;
    const lines = useCart.getState().items.map((i) => ({ variantId: i.variantId, quantity: i.quantity }));
    if (lines.length === 0) {
      Promise.resolve().then(() => setSynced(true));
      return;
    }
    let cancelled = false;
    refreshCart(lines)
      .then((quoted) => {
        if (cancelled) return;
        const map = Object.fromEntries(quoted.map((q) => [q.variantId, q]));
        setQuotes(map);
        setSynced(true);
        // Bring display data (price, name, image) in line with the catalogue.
        useCart.setState((state) => ({
          items: state.items.map((item) => {
            const q = map[item.variantId];
            return q && q.sku
              ? { ...item, price: q.price, productName: q.productName, productSlug: q.productSlug, variantLabel: q.variantLabel, sku: q.sku, image: q.image }
              : item;
          }),
        }));
      })
      .catch(() => !cancelled && setSynced(true));
    return () => {
      cancelled = true;
    };
  }, [hydrated, key]);

  const problems = items
    .map((item) => {
      const q = quotes[item.variantId];
      if (!q) return null;
      if (!q.available) return { variantId: item.variantId, message: `${item.productName} ${item.variantLabel} is no longer available.` };
      if (q.stock < item.quantity) {
        return { variantId: item.variantId, message: `Only ${q.stock} × ${item.productName} ${item.variantLabel} in stock.` };
      }
      return null;
    })
    .filter((p): p is { variantId: string; message: string } => p !== null);

  return { hydrated, items, quotes, synced, problems };
}
