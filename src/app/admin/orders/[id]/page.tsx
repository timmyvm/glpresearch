import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CreditCard, ExternalLink, Mail, MapPin, Printer, StickyNote, Truck, User } from "lucide-react";
import { db } from "@/lib/db";
import { formatMoney } from "@/lib/money";
import { PAYMENT_METHODS, SHIPPING_METHODS, statusLabel, type PaymentMethod, type ShippingMethod } from "@/lib/orders";
import { getSettings } from "@/lib/settings";
import { cn, formatDateTime } from "@/lib/utils";
import { orderLink } from "@/lib/admin/emails";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { buttonClass } from "@/components/ui/button";
import { DefinitionList, PageHeader } from "@/components/admin/ui";
import { CopyButton } from "@/components/admin/copy-button";
import { AdminNoteForm, NoteForm, StatusForm, TrackingForm } from "@/components/admin/order-forms";
import { addOrderNote, updateAdminNote, updateOrderStatus, updateTracking } from "../actions";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await db.order.findUnique({ where: { id }, select: { number: true } });
  return { title: order ? `Order ${order.number}` : "Order" };
}

const EVENT_DOT: Record<string, string> = {
  STATUS: "bg-ink-900",
  PAYMENT: "bg-emerald-500",
  NOTE: "bg-amber-400",
  EMAIL: "bg-sky-400",
};

export default async function AdminOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [order, settings] = await Promise.all([
    db.order.findUnique({
      where: { id },
      include: {
        items: { include: { variant: { select: { productId: true, stock: true } } } },
        events: { orderBy: { createdAt: "desc" } },
        user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true, institution: true, _count: { select: { orders: true } } } },
      },
    }),
    getSettings(),
  ]);
  if (!order) notFound();

  const address = [
    `${order.shipFirstName} ${order.shipLastName}`,
    order.shipCompany,
    order.shipLine1,
    order.shipLine2,
    `${order.shipCity} ${order.shipState} ${order.shipPostcode}`,
    order.shipCountry,
    order.shipPhone,
  ]
    .filter(Boolean)
    .join("\n");

  const payment = PAYMENT_METHODS[order.paymentMethod as PaymentMethod];
  const shippingMethod = SHIPPING_METHODS[order.shippingMethod as ShippingMethod];

  return (
    <>
      <PageHeader
        back={{ href: "/admin/orders", label: "Orders" }}
        title={
          <span className="flex flex-wrap items-center gap-3">
            <span className="font-mono">{order.number}</span>
            <StatusBadge status={order.status} className="text-sm" />
          </span>
        }
        description={`Placed ${formatDateTime(order.createdAt)} · ${order.items.reduce((s, i) => s + i.quantity, 0)} units · ${formatMoney(order.total)}`}
        actions={
          <>
            <a href={orderLink(order)} target="_blank" rel="noreferrer" className={buttonClass("ghost", "md")}>
              <ExternalLink className="size-4" /> Customer view
            </a>
            <Link href={`/admin/orders/${order.id}/packing-slip`} className={buttonClass("outline", "md")}>
              <Printer className="size-4" /> Packing slip
            </Link>
          </>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <Card>
            <CardHeader title="Items" description={shippingMethod ? `${shippingMethod.label} · ${shippingMethod.eta}` : order.shippingMethod} />
            <ul className="divide-y divide-slate-100">
              {order.items.map((item) => (
                <li key={item.id} className="flex items-center gap-4 px-5 py-4">
                  <div className="relative size-14 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                    {item.image ? <Image src={item.image} alt="" fill sizes="56px" className="object-cover" /> : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-ink-900">
                      {item.variant?.productId ? (
                        <Link href={`/admin/products/${item.variant.productId}`} className="hover:text-mint-700">
                          {item.productName}
                        </Link>
                      ) : (
                        item.productName
                      )}{" "}
                      <span className="font-normal text-slate-500">· {item.variantLabel}</span>
                    </p>
                    <p className="font-mono text-xs text-slate-500">
                      {item.sku}
                      {item.variant ? <span className="ml-2 font-sans">· {item.variant.stock} in stock</span> : null}
                    </p>
                  </div>
                  <p className="text-sm text-slate-500 tabular-nums">
                    {formatMoney(item.unitPrice)} × {item.quantity}
                  </p>
                  <p className="w-24 text-right text-sm font-semibold tabular-nums">{formatMoney(item.lineTotal)}</p>
                </li>
              ))}
            </ul>
            <div className="border-t border-slate-100 px-5 py-4">
              <dl className="ml-auto max-w-xs space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <dt className="text-slate-500">Subtotal</dt>
                  <dd className="tabular-nums">{formatMoney(order.subtotal)}</dd>
                </div>
                {order.discount ? (
                  <div className="flex justify-between">
                    <dt className="text-slate-500">
                      Discount {order.couponCode ? <Badge className="ml-1 font-mono">{order.couponCode}</Badge> : null}
                    </dt>
                    <dd className="text-emerald-600 tabular-nums">−{formatMoney(order.discount)}</dd>
                  </div>
                ) : null}
                <div className="flex justify-between">
                  <dt className="text-slate-500">Shipping</dt>
                  <dd className="tabular-nums">{order.shipping ? formatMoney(order.shipping) : "Free"}</dd>
                </div>
                <div className="flex justify-between border-t border-slate-100 pt-2 text-base font-semibold">
                  <dt>Total</dt>
                  <dd className="tabular-nums">{formatMoney(order.total)}</dd>
                </div>
              </dl>
            </div>
          </Card>

          {order.customerNote ? (
            <Card className="border-amber-200 bg-amber-50/50">
              <CardBody className="flex gap-3">
                <StickyNote className="mt-0.5 size-4 shrink-0 text-amber-600" />
                <div>
                  <p className="text-xs font-semibold tracking-wide text-amber-800 uppercase">Customer note</p>
                  <p className="mt-1 text-sm whitespace-pre-line text-ink-900">{order.customerNote}</p>
                </div>
              </CardBody>
            </Card>
          ) : null}

          <Card>
            <CardHeader title="Timeline" description="Status changes, payments, notes and emails." />
            <CardBody className="space-y-6">
              <NoteForm action={addOrderNote.bind(null, order.id)} />
              <ol className="relative space-y-5 border-l border-slate-200 pl-6">
                {order.events.map((e) => (
                  <li key={e.id} className="relative">
                    <span className={cn("absolute top-1.5 -left-[29px] size-2.5 rounded-full ring-4 ring-white", EVENT_DOT[e.type] ?? "bg-slate-400")} />
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-medium text-ink-900">{e.status ? statusLabel(e.status) : e.type === "NOTE" ? "Note" : e.type === "EMAIL" ? "Email" : e.type}</p>
                      {!e.visibleToCustomer ? <Badge className="bg-slate-100 text-[10px]">Internal</Badge> : null}
                      <span className="text-xs text-slate-500">
                        {formatDateTime(e.createdAt)}
                        {e.createdBy ? ` · ${e.createdBy}` : ""}
                      </span>
                    </div>
                    <p className="mt-0.5 text-sm whitespace-pre-line text-slate-600">{e.message}</p>
                  </li>
                ))}
              </ol>
            </CardBody>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Order status" />
            <CardBody>
              <StatusForm action={updateOrderStatus.bind(null, order.id)} current={order.status} />
            </CardBody>
          </Card>

          <Card>
            <CardHeader title={<span className="flex items-center gap-2"><Truck className="size-4 text-slate-400" /> Shipping & tracking</span>} />
            <CardBody>
              <TrackingForm action={updateTracking.bind(null, order.id)} carrier={order.carrier} trackingNumber={order.trackingNumber} status={order.status} />
            </CardBody>
          </Card>

          <Card>
            <CardHeader title={<span className="flex items-center gap-2"><User className="size-4 text-slate-400" /> Customer</span>} />
            <CardBody className="space-y-3 text-sm">
              {order.user ? (
                <div>
                  <Link href={`/admin/customers/${order.user.id}`} className="font-semibold text-ink-900 hover:text-mint-700">
                    {order.user.firstName} {order.user.lastName}
                  </Link>
                  {order.user.institution ? <p className="text-slate-500">{order.user.institution}</p> : null}
                  <p className="text-xs text-slate-500">
                    {order.user._count.orders} order{order.user._count.orders === 1 ? "" : "s"} total
                  </p>
                </div>
              ) : (
                <Badge>Guest checkout</Badge>
              )}
              <a href={`mailto:${order.email}?subject=${encodeURIComponent(`Your order ${order.number}`)}`} className="flex items-center gap-2 text-mint-700 hover:underline">
                <Mail className="size-4" /> {order.email}
              </a>
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              title={<span className="flex items-center gap-2"><MapPin className="size-4 text-slate-400" /> Shipping address</span>}
              action={<CopyButton text={address} />}
            />
            <CardBody>
              <pre className="font-sans text-sm leading-relaxed whitespace-pre-line text-ink-900">{address}</pre>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title={<span className="flex items-center gap-2"><CreditCard className="size-4 text-slate-400" /> Payment</span>} />
            <CardBody>
              <DefinitionList
                items={[
                  { label: "Method", value: payment?.label ?? order.paymentMethod },
                  {
                    label: "Status",
                    value: (
                      <span className={order.paymentStatus === "PAID" ? "text-emerald-600" : order.paymentStatus === "REFUNDED" ? "text-rose-600" : "text-amber-600"}>
                        {order.paymentStatus}
                      </span>
                    ),
                  },
                  { label: "Reference", value: <span className="font-mono">{order.number}</span> },
                  { label: "Amount due", value: formatMoney(order.total) },
                  { label: "Paid at", value: order.paidAt ? formatDateTime(order.paidAt) : "—" },
                  ...(order.paymentMethod === "PAYID" ? [{ label: "PayID", value: settings.payId }] : []),
                  ...(order.paymentMethod === "BANK_TRANSFER" ? [{ label: "BSB / Acc", value: `${settings.bankBsb} / ${settings.bankAccountNumber}` }] : []),
                ]}
              />
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Pinned internal note" />
            <CardBody>
              <AdminNoteForm action={updateAdminNote.bind(null, order.id)} value={order.adminNote} />
            </CardBody>
          </Card>
        </div>
      </div>
    </>
  );
}
