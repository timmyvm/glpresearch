"use client";

import { useState } from "react";
import { RotateCcw } from "lucide-react";
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
        <RotateCcw className="size-3.5" /> Reorder unavailable
      </Button>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          for (const { quantity, ...item } of lines) add(item, quantity);
          setDone(true);
        }}
      >
        <RotateCcw className="size-3.5" /> {done ? "Added to cart" : "Reorder"}
      </Button>
      {unavailable > 0 ? (
        <span className="text-xs text-slate-500">
          {unavailable} item{unavailable === 1 ? " is" : "s are"} no longer available
        </span>
      ) : null}
    </div>
  );
}
