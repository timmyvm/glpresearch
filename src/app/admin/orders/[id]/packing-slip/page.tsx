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
  const units = order.items.reduce((s, i) => s + i.quantity, 0);

  return (
    <>
      <div className="print:hidden">
        <PageHeader
          back={{ href: `/admin/orders/${order.id}`, label: `Order ${order.number}` }}
          title="Packing slip"
          description="Prints on one A4 page without the admin around it."
          actions={<PrintButton />}
        />
      </div>

      <article className="mx-auto max-w-3xl border border-surface-2 bg-white p-6 text-ink sm:p-10 print:max-w-none print:border-0 print:p-0">
        <header className="flex items-start justify-between gap-6 border-b border-ink/15 pb-6">
          <div className="flex items-center gap-3">
            <Image src="/images/logo-peak.webp" alt="" width={36} height={36} />
            <div>
              <p className="text-base font-medium">{settings.storeName}</p>
              <p className="text-small text-muted">{settings.supportEmail}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-small text-muted">Packing slip</p>
            <p className="tabular text-xl font-medium">{order.number}</p>
            <p className="text-small text-muted">Ordered {formatDate(order.createdAt)}</p>
          </div>
        </header>

        <div className="grid gap-6 py-6 text-sm sm:grid-cols-2 sm:gap-8">
          <div>
            <p className="mb-1 text-small text-muted">Ship to</p>
            <p className="font-medium">
              {order.shipFirstName} {order.shipLastName}
            </p>
            {order.shipCompany ? <p>{order.shipCompany}</p> : null}
            <p>{order.shipLine1}</p>
            {order.shipLine2 ? <p>{order.shipLine2}</p> : null}
            <p>
              {order.shipCity} {order.shipState} {order.shipPostcode}
            </p>
            <p>{order.shipCountry}</p>
            {order.shipPhone ? <p className="tabular">{order.shipPhone}</p> : null}
          </div>
          <div>
            <p className="mb-1 text-small text-muted">Shipment</p>
            <p>{SHIPPING_METHODS[order.shippingMethod as ShippingMethod]?.label ?? order.shippingMethod}</p>
            {order.carrier ? <p>{order.carrier}</p> : null}
            {order.trackingNumber ? <p className="tabular">{order.trackingNumber}</p> : null}
            <p className="mt-2 text-small text-muted">{order.email}</p>
          </div>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-y border-ink/15 text-left text-small text-muted">
              <th scope="col" className="w-8 py-2 font-normal">
                <span className="sr-only">Packed</span>
              </th>
              <th scope="col" className="py-2 font-normal">Item</th>
              <th scope="col" className="py-2 font-normal">SKU</th>
              <th scope="col" className="py-2 text-right font-normal">Quantity</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.id} className="border-b border-ink/[0.07]">
                <td className="py-3">
                  <span className="inline-block size-4 border border-ink/40" aria-hidden="true" />
                </td>
                <td className="py-3 font-medium">
                  {item.productName} <span className="font-normal text-muted">{item.variantLabel}</span>
                </td>
                <td className="tabular py-3 text-small">{item.sku}</td>
                <td className="tabular py-3 text-right text-base font-medium">{item.quantity}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={3} className="py-3 text-right text-small text-muted">
                Total units
              </td>
              <td className="tabular py-3 text-right text-base font-medium">{units}</td>
            </tr>
          </tfoot>
        </table>

        {order.customerNote ? (
          <div className="mt-6 border border-ink/15 p-3 text-sm">
            <p className="text-small text-muted">Note from the customer</p>
            <p className="mt-1 whitespace-pre-line">{order.customerNote}</p>
          </div>
        ) : null}

        <p className="mt-10 border-t border-ink/15 pt-4 text-center text-small leading-relaxed text-muted">
          Supplied strictly for in-vitro laboratory research. Not for human or veterinary use. Store lyophilised peptides at −20 °C, away from
          light and moisture. Certificates of analysis for every batch are on the Lab Testing page of {settings.storeName}.
        </p>
      </article>
    </>
  );
}
