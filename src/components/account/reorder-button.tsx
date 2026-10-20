"use client";

import { useState } from "react";
import { useCart, type CartItem } from "@/lib/cart";
import { Button } from "@/components/ui/button";

export type ReorderLine = Omit<CartItem, "quantity"> & { quantity: number };

/** Adds still-available items from a past order back to the cart at current prices. */
export function ReorderButton({ lines, unavailable = 0 }: { lines: ReorderLine[]; unavailable?: number }) {
  const add = useCart((s) => s.add);
  const [done, setDone] = useState(false);

  if (lines.length === 0) {
    return (
      <Button variant="outline" size="sm" disabled title="These items are no longer available">
        Items No Longer Available
      </Button>
    );
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          for (const { quantity, ...item } of lines) add(item, quantity);
          setDone(true);
        }}
      >
        <span aria-live="polite">{done ? "Added to Cart" : "Order Again"}</span>
      </Button>
      {unavailable > 0 ? (
        <span className="text-small text-muted">
          {unavailable} item{unavailable === 1 ? " is" : "s are"} no longer available
        </span>
      ) : null}
    </div>
  );
}
