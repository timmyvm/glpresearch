import Image from "next/image";
import Link from "next/link";
import { formatMoney } from "@/lib/money";
import { PAYMENT_METHODS, SHIPPING_METHODS, type PaymentMethod, type ShippingMethod } from "@/lib/orders";
import { specimenImage } from "@/lib/plates";
import { cn } from "@/lib/utils";
import { SlipRow } from "@/components/store/paper";

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
    <ul className="space-y-4">
      {items.map((item) => {
        const slug = productSlugs[item.id];
        const img = specimenImage(item.image) ?? item.image;
        return (
          <li key={item.id} className="flex gap-4">
            <div className="relative h-20 w-16 shrink-0 bg-white">
              {img ? <Image src={img} alt={`${item.productName} ${item.variantLabel}`} fill sizes="64px" className="object-contain p-1" /> : null}
            </div>
            <div className="flex min-w-0 flex-1 justify-between gap-4">
              <div className="min-w-0">
                {slug ? (
                  <Link href={`/shop/${slug}`} className="link font-medium decoration-transparent hover:decoration-ink">
                    {item.productName}
                  </Link>
                ) : (
                  <p className="font-medium">{item.productName}</p>
                )}
                <p className="text-small text-muted">
                  {item.variantLabel}, SKU {item.sku}
                </p>
                <p className="tabular text-small text-muted">
                  {item.quantity} × {formatMoney(item.unitPrice)}
                </p>
              </div>
              <p className="tabular shrink-0 font-medium">{formatMoney(item.lineTotal)}</p>
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
  // Receipt rows with dot leaders; the total is an inverted bar across the slip (set --slip-pad on the slip).
  return (
    <div>
      <div className="space-y-2 text-body">
        <SlipRow label="Subtotal" value={formatMoney(order.subtotal)} />
        {order.discount > 0 ? <SlipRow label={`Discount${order.couponCode ? ` (${order.couponCode})` : ""}`} value={`−${formatMoney(order.discount)}`} /> : null}
        <SlipRow label={`Shipping${shipping ? `, ${shipping.label.toLowerCase()}` : ""}`} value={order.shipping ? formatMoney(order.shipping) : "Free"} />
      </div>
      <p className="-mx-[var(--slip-pad,0px)] mt-5 flex h-12 items-center justify-between gap-3 bg-ink px-[var(--slip-pad,1rem)] text-white">
        <span className="font-medium">Total</span>
        <span className="tabular text-lead font-semibold">{formatMoney(order.total)}</span>
      </p>
    </div>
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

export function ShippingAddress({
  order,
  className,
}: {
  order: Omit<ShippingOrder, "shippingMethod" | "paymentMethod" | "carrier" | "trackingNumber">;
  className?: string;
}) {
  return (
    <address className={cn("leading-normal not-italic", className)}>
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
          <span className="text-muted">{order.shipPhone}</span>
        </>
      ) : null}
    </address>
  );
}

export function OrderShippingInfo({ order }: { order: ShippingOrder }) {
  const url = trackingUrl(order.carrier, order.trackingNumber);
  const shipping = SHIPPING_METHODS[order.shippingMethod as ShippingMethod];
  return (
    <div className="grid gap-6 sm:grid-cols-3">
      <div>
        <p className="mb-2 text-small text-muted">Ship to</p>
        <ShippingAddress order={order} />
      </div>
      <div>
        <p className="mb-2 text-small text-muted">Delivery</p>
        <p>{shipping?.label ?? order.shippingMethod}</p>
        {shipping ? <p className="text-small text-muted">{shipping.eta} after dispatch</p> : null}
        {order.trackingNumber ? (
          <div className="mt-3 bg-paper px-4 py-3">
            <p className="text-small text-muted">{order.carrier ?? "Tracking number"}</p>
            <p className="tabular font-medium break-all">{order.trackingNumber}</p>
            {url ? (
              <a href={url} target="_blank" rel="noopener noreferrer" className="link mt-1 inline-block text-small">
                Track with {order.carrier ?? "Australia Post"}
              </a>
            ) : null}
          </div>
        ) : null}
      </div>
      <div>
        <p className="mb-2 text-small text-muted">Payment</p>
        <p>{PAYMENT_METHODS[order.paymentMethod as PaymentMethod]?.label ?? order.paymentMethod}</p>
      </div>
    </div>
  );
}
