"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  variantId: string;
  productSlug: string;
  productName: string;
  variantLabel: string;
  sku: string;
  price: number; // cents — display only; the server re-prices at checkout
  image: string;
  quantity: number;
};

type CartState = {
  items: CartItem[];
  open: boolean;
  add: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  setQuantity: (variantId: string, quantity: number) => void;
  remove: (variantId: string) => void;
  clear: () => void;
  setOpen: (open: boolean) => void;
};

export const MAX_LINE_QTY = 20;

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      open: false,
      add: (item, quantity = 1) =>
        set((state) => {
          const existing = state.items.find((i) => i.variantId === item.variantId);
          const items = existing
            ? state.items.map((i) =>
                i.variantId === item.variantId
                  ? { ...i, ...item, quantity: Math.min(MAX_LINE_QTY, i.quantity + quantity) }
                  : i,
              )
            : [...state.items, { ...item, quantity: Math.min(MAX_LINE_QTY, quantity) }];
          return { items, open: true };
        }),
      setQuantity: (variantId, quantity) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((i) => i.variantId !== variantId)
              : state.items.map((i) =>
                  i.variantId === variantId ? { ...i, quantity: Math.min(MAX_LINE_QTY, quantity) } : i,
                ),
        })),
      remove: (variantId) => set((state) => ({ items: state.items.filter((i) => i.variantId !== variantId) })),
      clear: () => set({ items: [] }),
      setOpen: (open) => set({ open }),
    }),
    {
      name: "glp-cart",
      partialize: (state) => ({ items: state.items }),
    },
  ),
);

export function cartCount(items: CartItem[]) {
  return items.reduce((sum, i) => sum + i.quantity, 0);
}

export function cartSubtotal(items: CartItem[]) {
  return items.reduce((sum, i) => sum + i.price * i.quantity, 0);
}
