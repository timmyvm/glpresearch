import Image from "next/image";
import Link from "next/link";
import { ExternalLink, MapPin, Truck } from "lucide-react";
import { formatMoney } from "@/lib/money";
import { PAYMENT_METHODS, SHIPPING_METHODS, type PaymentMethod, type ShippingMethod } from "@/lib/orders";

type Item = {
  id: string;
  productName: string;
  variantLabel: string;
  sku: string;
  image: string | null;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
};

export function OrderItems({ items, productSlugs = {} }: { items: Item[]; productSlugs?: Record<string, string> }) {
  return (
    <ul className="divide-y divide-slate-100">
      {items.map((item) => {
        const slug = productSlugs[item.id];
        const name = <span className="font-semibold text-ink-900">{item.productName}</span>;
        return (
          <li key={item.id} className="flex gap-4 py-4 first:pt-0 last:pb-0">
            <div className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-slate-100 ring-1 ring-slate-200">
              {item.image ? <Image src={item.image} alt={item.productName} fill sizes="64px" className="object-cover" /> : null}
            </div>
            <div className="flex min-w-0 flex-1 justify-between gap-3">
              <div className="min-w-0 text-sm">
                {slug ? (
                  <Link href={`/shop/${slug}`} className="hover:underline">
                    {name}
                  </Link>
                ) : (
                  name
                )}
                <p className="text-slate-500">
                  {item.variantLabel} · <span className="font-mono text-xs">{item.sku}</span>
                </p>
                <p className="text-slate-500">
                  {item.quantity} × {formatMoney(item.unitPrice)}
                </p>
              </div>
              <p className="text-sm font-semibold text-ink-900">{formatMoney(item.lineTotal)}</p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export function OrderTotals({
  order,
}: {
  order: { subtotal: number; discount: number; shipping: number; total: number; couponCode: string | null; shippingMethod: string };
}) {
  const shipping = SHIPPING_METHODS[order.shippingMethod as ShippingMethod];
  return (
    <dl className="space-y-2 text-sm">
      <div className="flex justify-between">
        <dt className="text-slate-500">Subtotal</dt>
        <dd className="font-medium">{formatMoney(order.subtotal)}</dd>
      </div>
      {order.discount > 0 ? (
        <div className="flex justify-between text-mint-700">
          <dt>Discount{order.couponCode ? ` (${order.couponCode})` : ""}</dt>
          <dd className="font-medium">−{formatMoney(order.discount)}</dd>
        </div>
      ) : null}
      <div className="flex justify-between">
        <dt className="text-slate-500">Shipping{shipping ? ` · ${shipping.label}` : ""}</dt>
        <dd className="font-medium">{order.shipping ? formatMoney(order.shipping) : "Free"}</dd>
      </div>
      <div className="flex justify-between border-t border-slate-200 pt-3 text-base">
        <dt className="font-semibold text-ink-900">Total</dt>
        <dd className="font-semibold text-ink-900">{formatMoney(order.total)}</dd>
      </div>
    </dl>
  );
}

type ShippingOrder = {
  shipFirstName: string;
  shipLastName: string;
  shipCompany: string | null;
  shipLine1: string;
  shipLine2: string | null;
  shipCity: string;
  shipState: string;
  shipPostcode: string;
  shipCountry: string;
  shipPhone: string | null;
  shippingMethod: string;
  paymentMethod: string;
  carrier: string | null;
  trackingNumber: string | null;
};

export function trackingUrl(carrier: string | null, tracking: string | null) {
  if (!tracking) return null;
  if (!carrier || /australia post|auspost|startrack/i.test(carrier)) {
    return `https://auspost.com.au/mypost/track/details/${encodeURIComponent(tracking)}`;
  }
  return null;
}

export function OrderShippingInfo({ order }: { order: ShippingOrder }) {
  const url = trackingUrl(order.carrier, order.trackingNumber);
  const shipping = SHIPPING_METHODS[order.shippingMethod as ShippingMethod];
  return (
    <div className="grid gap-6 text-sm sm:grid-cols-2">
      <div>
        <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold tracking-wider text-slate-500 uppercase">
          <MapPin className="size-3.5" /> Shipping address
        </p>
        <address className="leading-relaxed text-ink-800 not-italic">
          {order.shipFirstName} {order.shipLastName}
          <br />
          {order.shipCompany ? (
            <>
              {order.shipCompany}
              <br />
            </>
          ) : null}
          {order.shipLine1}
          <br />
          {order.shipLine2 ? (
            <>
              {order.shipLine2}
              <br />
            </>
          ) : null}
          {order.shipCity} {order.shipState} {order.shipPostcode}
          <br />
          {order.shipCountry}
          {order.shipPhone ? (
            <>
              <br />
              <span className="text-slate-500">{order.shipPhone}</span>
            </>
          ) : null}
        </address>
      </div>
      <div className="space-y-4">
        <div>
          <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold tracking-wider text-slate-500 uppercase">
            <Truck className="size-3.5" /> Delivery
          </p>
          <p className="text-ink-800">
            {shipping?.label ?? order.shippingMethod}
            {shipping ? <span className="text-slate-500"> · {shipping.eta}</span> : null}
          </p>
          {order.trackingNumber ? (
            <div className="mt-2 rounded-lg bg-ink-50 p-3">
              <p className="text-xs text-slate-500">{order.carrier ?? "Tracking number"}</p>
              <p className="font-mono text-sm font-semibold text-ink-900">{order.trackingNumber}</p>
              {url ? (
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-mint-700 hover:underline"
                >
                  Track with {order.carrier ?? "Australia Post"} <ExternalLink className="size-3" />
                </a>
              ) : null}
            </div>
          ) : null}
        </div>
        <div>
          <p className="mb-1 text-xs font-semibold tracking-wider text-slate-500 uppercase">Payment</p>
          <p className="text-ink-800">{PAYMENT_METHODS[order.paymentMethod as PaymentMethod]?.label ?? order.paymentMethod}</p>
        </div>
      </div>
    </div>
  );
}
