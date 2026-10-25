export const ORDER_STATUSES = [
  "PENDING_PAYMENT",
  "PAID",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING_PAYMENT: "Awaiting payment",
  PAID: "Payment received",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  REFUNDED: "Refunded",
};

/** Tailwind classes for status pills: pale tints of the palette, each at 7:1 or better. */
export const ORDER_STATUS_TONE: Record<OrderStatus, string> = {
  PENDING_PAYMENT: "bg-[#fdebd3] text-[#7a3d00]",
  PAID: "bg-[#e3e7f1] text-[#1f2b4d]",
  PROCESSING: "bg-[#e3e1dc] text-[#1f2b4d]",
  SHIPPED: "bg-[#dcf0f2] text-[#0b4650]",
  DELIVERED: "bg-[#dcf3e3] text-[#0b4a24]",
  CANCELLED: "bg-surface-2 text-muted",
  REFUNDED: "bg-[#fbe4e1] text-[#8a1c14]",
};

/** The happy-path order lifecycle shown as a progress tracker. */
export const ORDER_PROGRESS: OrderStatus[] = ["PENDING_PAYMENT", "PAID", "PROCESSING", "SHIPPED", "DELIVERED"];

export const PAYMENT_METHODS = {
  BANK_TRANSFER: { label: "Bank transfer", description: "Direct deposit to our business account. Orders ship once funds clear." },
  PAYID: { label: "PayID / Osko", description: "Instant transfer using our PayID. Usually clears within minutes." },
  CRYPTO: { label: "Cryptocurrency", description: "Pay in BTC or USDT. Wallet address and exact amount provided after checkout." },
} as const;

export type PaymentMethod = keyof typeof PAYMENT_METHODS;

export const SHIPPING_METHODS = {
  STANDARD: { label: "Standard tracked", eta: "2–6 business days" },
  EXPRESS: { label: "Express tracked", eta: "1–3 business days" },
} as const;

export type ShippingMethod = keyof typeof SHIPPING_METHODS;

export function isOrderStatus(value: string): value is OrderStatus {
  return (ORDER_STATUSES as readonly string[]).includes(value);
}

export function statusLabel(value: string) {
  return isOrderStatus(value) ? ORDER_STATUS_LABEL[value] : value;
}

export function statusTone(value: string) {
  return isOrderStatus(value) ? ORDER_STATUS_TONE[value] : ORDER_STATUS_TONE.CANCELLED;
}

export const PRODUCT_CATEGORIES = {
  GLP1: { label: "GLP-1 agonists", short: "GLP-1" },
  DUAL: { label: "Dual agonists", short: "Dual" },
  TRIPLE: { label: "Triple agonists", short: "Triple" },
} as const;

export type ProductCategory = keyof typeof PRODUCT_CATEGORIES;

export function categoryLabel(value: string) {
  return value in PRODUCT_CATEGORIES ? PRODUCT_CATEGORIES[value as ProductCategory].label : value;
}
