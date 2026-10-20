import { formatMoney } from "@/lib/money";
import { PAYMENT_METHODS, SHIPPING_METHODS, statusLabel, type PaymentMethod, type ShippingMethod } from "@/lib/orders";
import type { StoreSettings } from "@/lib/settings";
import { formatDate } from "@/lib/utils";
import { ShippingAddress } from "./order-details";
import { PrintButton } from "./print-button";

type InvoiceOrder = {
  number: string;
  email: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  shippingMethod: string;
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  couponCode: string | null;
  createdAt: Date;
  paidAt: Date | null;
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
  items: { id: string; productName: string; variantLabel: string; sku: string; quantity: number; unitPrice: number; lineTotal: number }[];
};

/** Hides everything but the document when printing, without touching the shared layout. */
const PRINT_CSS = `@media print {
  body > div > :not(main), .no-print { display: none !important; }
  main { padding: 0 !important; }
  @page { margin: 16mm; }
}`;

/** A printable invoice (unpaid) or receipt (paid). No tax figures are stated because none are collected. */
export function Invoice({ order, settings, backHref }: { order: InvoiceOrder; settings: StoreSettings; backHref: string }) {
  const paid = order.paymentStatus === "PAID";
  const shipping = SHIPPING_METHODS[order.shippingMethod as ShippingMethod];
  return (
    <div className="frame py-10 md:py-14 print:py-0">
      <style dangerouslySetInnerHTML={{ __html: PRINT_CSS }} />
      <div className="no-print mb-8 flex flex-wrap items-center justify-between gap-4">
        <a href={backHref} className="link text-small">
          Back to the order
        </a>
        <PrintButton />
      </div>

      <article className="mx-auto max-w-4xl bg-white text-ink" aria-labelledby="invoice-title">
        <header className="flex flex-wrap items-start justify-between gap-6 pb-8">
          <div>
            <p className="text-lead font-medium" translate="no">
              {settings.storeName}
            </p>
            <p className="text-small text-muted">{settings.supportEmail}</p>
          </div>
          <div className="text-right">
            <h1 id="invoice-title" className="text-index font-medium">
              {paid ? "Receipt" : "Invoice"}
            </h1>
            <p className="tabular text-small">Order {order.number}</p>
          </div>
        </header>

        <dl className="tabular grid gap-4 bg-surface p-5 text-small sm:grid-cols-4">
          <div>
            <dt className="text-muted">Date issued</dt>
            <dd className="font-medium">{formatDate(order.createdAt)}</dd>
          </div>
          <div>
            <dt className="text-muted">Status</dt>
            <dd className="font-medium">{statusLabel(order.status)}</dd>
          </div>
          <div>
            <dt className="text-muted">Payment</dt>
            <dd className="font-medium">{PAYMENT_METHODS[order.paymentMethod as PaymentMethod]?.label ?? order.paymentMethod}</dd>
          </div>
          <div>
            <dt className="text-muted">{paid ? "Paid on" : "Amount due"}</dt>
            <dd className="font-medium">{paid ? (order.paidAt ? formatDate(order.paidAt) : "Paid") : formatMoney(order.total)}</dd>
          </div>
        </dl>

        <div className="grid gap-8 py-8 sm:grid-cols-2">
          <div>
            <p className="mb-2 text-small text-muted">Billed to</p>
            <p className="text-small font-medium">
              {order.shipFirstName} {order.shipLastName}
            </p>
            <p className="text-small [overflow-wrap:anywhere]">{order.email}</p>
          </div>
          <div>
            <p className="mb-2 text-small text-muted">Shipped to</p>
            <ShippingAddress order={order} className="text-small" />
          </div>
        </div>

        <table className="tabular w-full text-left text-small">
          <thead>
            <tr data-ui className="border-b border-ink text-muted">
              <th scope="col" className="py-2 pr-4 font-medium">Item</th>
              <th scope="col" className="hidden py-2 pr-4 font-medium sm:table-cell">SKU</th>
              <th scope="col" className="py-2 pr-4 text-right font-medium">Qty</th>
              <th scope="col" className="hidden py-2 pr-4 text-right font-medium sm:table-cell">Unit price</th>
              <th scope="col" className="py-2 text-right font-medium">Amount</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((i) => (
              <tr key={i.id} data-ui className="border-b border-ink/10">
                <td className="py-3 pr-4">
                  {i.productName}, {i.variantLabel}
                </td>
                <td className="hidden py-3 pr-4 sm:table-cell">{i.sku}</td>
                <td className="py-3 pr-4 text-right">{i.quantity}</td>
                <td className="hidden py-3 pr-4 text-right sm:table-cell">{formatMoney(i.unitPrice)}</td>
                <td className="py-3 text-right">{formatMoney(i.lineTotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <dl className="tabular mt-6 ml-auto max-w-xs space-y-2 text-small">
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Subtotal</dt>
            <dd>{formatMoney(order.subtotal)}</dd>
          </div>
          {order.discount > 0 ? (
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Discount{order.couponCode ? ` (${order.couponCode})` : ""}</dt>
              <dd>−{formatMoney(order.discount)}</dd>
            </div>
          ) : null}
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Shipping{shipping ? `, ${shipping.label.toLowerCase()}` : ""}</dt>
            <dd>{order.shipping ? formatMoney(order.shipping) : "Free"}</dd>
          </div>
          <div data-ui className="flex justify-between gap-4 border-t border-ink pt-2 text-body font-medium">
            <dt>Total (AUD)</dt>
            <dd>{formatMoney(order.total)}</dd>
          </div>
        </dl>

        <p className="mt-12 text-small text-muted">
          {paid ? "Payment received with thanks." : `Please pay using ${order.number} as the payment reference.`} All products are
          supplied for laboratory research use only, not for human or veterinary use. Questions: {settings.supportEmail}.
        </p>
      </article>
    </div>
  );
}
