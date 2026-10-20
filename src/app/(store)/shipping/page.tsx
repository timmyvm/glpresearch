import type { Metadata } from "next";
import { getSettings } from "@/lib/settings";
import { formatMoney } from "@/lib/money";
import { LegalPage } from "@/components/store/legal-page";

export const metadata: Metadata = { title: "Shipping & returns" };

export default async function ShippingPage() {
  const s = await getSettings();
  return (
    <LegalPage
      eyebrow="Support"
      title="Shipping & returns"
      description="How we pack, ship and handle problems with your order."
      updated="October 2026"
      content={`## Dispatch

${s.dispatchCutoff}. Orders are dispatched only after payment has been confirmed. You'll receive an email with your tracking number as soon as your order ships.

## Shipping rates (Australia)

| Service | Estimated delivery | Price |
|---|---|---|
| Standard tracked | 2–6 business days | ${formatMoney(s.shippingStandard)}${s.freeShippingThreshold > 0 ? ` — free over ${formatMoney(s.freeShippingThreshold)}` : ""} |
| Express tracked | 1–3 business days | ${formatMoney(s.shippingExpress)} |

Delivery estimates are provided by the carrier and are not guaranteed. Remote areas may take longer.

## Packaging

Every order ships in plain outer packaging with no product names visible. Inside, vials are packed in a rigid insulated box with protective foam inserts and a cold pack, with a packing slip listing each item's batch number.

## Payment window

Unpaid orders are held for ${s.paymentWindowHours} hours. After that they are cancelled automatically and reserved stock is released.

## Damaged or incorrect items

If anything arrives damaged, or you receive the wrong item, contact us within **48 hours of delivery** with your order number and a photo. We will replace affected items at no cost.

## Returns

Because product integrity can't be verified once a parcel has left our control, we cannot accept returns of opened or unsealed products. Unopened items in their original sealed condition may be returned within 14 days of delivery by arrangement; contact us first for a returns authorisation. Return shipping is the customer's responsibility unless the item was faulty or sent in error.

## Lost parcels

If tracking hasn't updated for 7 business days, contact us and we'll open an investigation with the carrier. Confirmed lost parcels are reshipped or refunded.

## International orders

We currently ship within Australia only.`}
    />
  );
}
