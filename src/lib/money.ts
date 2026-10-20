// All prices are stored as integer cents.
export const CURRENCY = process.env.NEXT_PUBLIC_CURRENCY ?? "AUD";

export function formatMoney(cents: number, currency = CURRENCY) {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency,
    currencyDisplay: "narrowSymbol",
  }).format(cents / 100);
}

export function toCents(value: string | number) {
  const n = typeof value === "number" ? value : parseFloat(value.replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? Math.round(n * 100) : 0;
}

export function fromCents(cents: number) {
  return (cents / 100).toFixed(2);
}
