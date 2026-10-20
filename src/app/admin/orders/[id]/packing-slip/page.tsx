import Image from "next/image";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { formatDate } from "@/lib/utils";
import { SHIPPING_METHODS, type ShippingMethod } from "@/lib/orders";
import { PageHeader } from "@/components/admin/ui";
import { PrintButton } from "@/components/admin/copy-button";

export const metadata = { title: "Packing slip" };

export default async function PackingSlipPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [order, settings] = await Promise.all([
    db.order.findUnique({ where: { id }, include: { items: true } }),
    getSettings(),
  ]);
  if (!order) notFound();

  return (
    <>
      <div className="print:hidden">
        <PageHeader back={{ href: `/admin/orders/${order.id}`, label: `Order ${order.number}` }} title="Packing slip" actions={<PrintButton />} />
      </div>

      <div className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-10 text-ink-900 shadow-xs print:max-w-none print:rounded-none print:border-0 print:p-0 print:shadow-none">
        <div className="flex items-start justify-between gap-6 border-b border-slate-200 pb-6">
          <div className="flex items-center gap-3">
            <Image src="/images/logo-mark.webp" alt="" width={40} height={40} />
            <div>
              <p className="text-lg font-bold">{settings.storeName}</p>
              <p className="text-xs text-slate-500">{settings.supportEmail}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs tracking-widest text-slate-500 uppercase">Packing slip</p>
            <p className="font-mono text-xl font-bold">{order.number}</p>
            <p className="text-xs text-slate-500">Ordered {formatDate(order.createdAt)}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 py-6 text-sm">
          <div>
            <p className="mb-1 text-xs font-semibold tracking-wide text-slate-500 uppercase">Ship to</p>
            <p className="font-semibold">
              {order.shipFirstName} {order.shipLastName}
            </p>
            {order.shipCompany ? <p>{order.shipCompany}</p> : null}
            <p>{order.shipLine1}</p>
            {order.shipLine2 ? <p>{order.shipLine2}</p> : null}
            <p>
              {order.shipCity} {order.shipState} {order.shipPostcode}
            </p>
            <p>{order.shipCountry}</p>
            {order.shipPhone ? <p>{order.shipPhone}</p> : null}
          </div>
          <div>
            <p className="mb-1 text-xs font-semibold tracking-wide text-slate-500 uppercase">Shipment</p>
            <p>{SHIPPING_METHODS[order.shippingMethod as ShippingMethod]?.label ?? order.shippingMethod}</p>
            {order.carrier ? <p>{order.carrier}</p> : null}
            {order.trackingNumber ? <p className="font-mono">{order.trackingNumber}</p> : null}
            <p className="mt-2 text-xs text-slate-500">{order.email}</p>
          </div>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-y border-slate-200 text-left text-xs tracking-wide text-slate-500 uppercase">
              <th className="py-2 pr-2 font-semibold">✓</th>
              <th className="py-2 font-semibold">Item</th>
              <th className="py-2 font-semibold">SKU</th>
              <th className="py-2 text-right font-semibold">Qty</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.id} className="border-b border-slate-100">
                <td className="py-3 pr-2">
                  <span className="inline-block size-4 rounded border border-slate-400" />
                </td>
                <td className="py-3 font-medium">
                  {item.productName} — {item.variantLabel}
                </td>
                <td className="py-3 font-mono text-xs">{item.sku}</td>
                <td className="py-3 text-right text-base font-bold">{item.quantity}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={3} className="py-3 text-right text-xs text-slate-500 uppercase">
                Total units
              </td>
              <td className="py-3 text-right text-base font-bold">{order.items.reduce((s, i) => s + i.quantity, 0)}</td>
            </tr>
          </tfoot>
        </table>

        {order.customerNote ? (
          <div className="mt-6 rounded-lg border border-slate-200 p-3 text-sm">
            <p className="text-xs font-semibold text-slate-500 uppercase">Customer note</p>
            <p className="mt-1 whitespace-pre-line">{order.customerNote}</p>
          </div>
        ) : null}

        <p className="mt-10 border-t border-slate-200 pt-4 text-center text-[11px] leading-relaxed text-slate-500">
          All products are supplied strictly for in-vitro laboratory research use only. Not for human or veterinary use. Store
          lyophilized peptides at −20 °C, protected from light and moisture. Certificates of analysis are available at{" "}
          {settings.storeName} → Lab Testing.
        </p>
      </div>
    </>
  );
}
