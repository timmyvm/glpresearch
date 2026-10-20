import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { formatMoney } from "@/lib/money";
import { PAYMENT_METHODS, SHIPPING_METHODS, statusLabel, type PaymentMethod, type ShippingMethod } from "@/lib/orders";
import { getSettings } from "@/lib/settings";
import { cn, formatDateTime } from "@/lib/utils";
import { orderLink } from "@/lib/admin/emails";
import { StatusBadge } from "@/components/ui/badge";
import { buttonClass } from "@/components/ui/button";
import { DefinitionList, Notice, PageHeader, Panel, textAction } from "@/components/admin/ui";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { CopyButton } from "@/components/admin/copy-button";
import { AdminNoteForm, NoteForm, StatusForm, TrackingForm } from "@/components/admin/order-forms";
import { addOrderNote, markOrderPaid, updateAdminNote, updateOrderStatus, updateTracking } from "../actions";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await db.order.findUnique({ where: { id }, select: { number: true } });
  return { title: order ? `Order ${order.number}` : "Order" };
}

const EVENT_LABEL: Record<string, string> = { NOTE: "Note", EMAIL: "Email", PAYMENT: "Payment" };
const PAYMENT_STATUS: Record<string, { label: string; className: string }> = {
  PAID: { label: "Paid", className: "text-success" },
  REFUNDED: { label: "Refunded", className: "text-danger" },
  UNPAID: { label: "Not paid", className: "text-[#92400e]" },
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
  const units = order.items.reduce((s, i) => s + i.quantity, 0);
  const pending = order.status === "PENDING_PAYMENT";
  const claimed = pending && order.paymentClaimedAt;
  const windowEnds = new Date(order.createdAt.getTime() + settings.paymentWindowHours * 3_600_000);
  const paymentState = PAYMENT_STATUS[order.paymentStatus] ?? { label: order.paymentStatus, className: "text-ink" };

  return (
    <>
      <PageHeader
        back={{ href: "/admin/orders", label: "Orders" }}
        title={
          <span className="flex flex-wrap items-center gap-3">
            <span className="tabular">{order.number}</span>
            <StatusBadge status={order.status} />
          </span>
        }
        description={`Placed ${formatDateTime(order.createdAt)}. ${units} unit${units === 1 ? "" : "s"}, ${formatMoney(order.total)}.`}
        actions={
          <>
            <a href={orderLink(order)} target="_blank" rel="noreferrer" className={buttonClass("ghost", "sm")}>
              Customer View
            </a>
            <Link href={`/admin/orders/${order.id}/packing-slip`} className={buttonClass("outline", "sm", "ring-1 ring-ink/25")}>
              Packing Slip
            </Link>
            {pending ? (
              <ConfirmButton
                action={markOrderPaid.bind(null, order.id)}
                variant="ink"
                message={`Mark ${order.number} as paid? Only do this once ${formatMoney(order.total)} with reference ${order.number} is in your account. The customer is emailed.`}
              >
                Mark Paid
              </ConfirmButton>
            ) : null}
          </>
        }
      />

      {claimed ? (
        <Notice className="mb-6">
          Customer reported payment on {formatDateTime(order.paymentClaimedAt!)}. Check your account for {formatMoney(order.total)} with reference{" "}
          <span className="tabular font-medium">{order.number}</span>, then mark it paid. It will not be cancelled automatically.
        </Notice>
      ) : pending ? (
        <Notice className="mb-6">
          {windowEnds > new Date()
            ? `Waiting for payment. Cancelled automatically at ${formatDateTime(windowEnds)} unless the customer reports payment.`
            : `Past the ${settings.paymentWindowHours}-hour payment window. The next expiry run will cancel it and return its stock.`}
        </Notice>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="min-w-0 space-y-6">
          <Panel
            title="Items"
            description={shippingMethod ? `${shippingMethod.label}, ${shippingMethod.eta}` : order.shippingMethod}
            bodyClassName="px-0 pb-0"
          >
            <ul>
              {order.items.map((item) => (
                <li key={item.id} className="flex items-center gap-4 border-t border-ink/[0.07] px-5 py-3">
                  <div className="relative size-12 shrink-0 overflow-hidden bg-surface">
                    {item.image ? <Image src={item.image} alt="" fill sizes="48px" className="object-cover" /> : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-ink">
                      {item.variant?.productId ? (
                        <Link href={`/admin/products/${item.variant.productId}`} className="hover:underline">
                          {item.productName}
                        </Link>
                      ) : (
                        item.productName
                      )}{" "}
                      <span className="font-normal text-muted">{item.variantLabel}</span>
                    </p>
                    <p className="tabular text-small text-muted">
                      {item.sku}
                      {item.variant ? `, ${item.variant.stock} in stock` : ""}
                    </p>
                  </div>
                  <p className="tabular hidden text-muted sm:block">
                    {formatMoney(item.unitPrice)} × {item.quantity}
                  </p>
                  <p className="tabular w-24 text-right font-medium">
                    <span className="block text-small font-normal text-muted sm:hidden">× {item.quantity}</span>
                    {formatMoney(item.lineTotal)}
                  </p>
                </li>
              ))}
            </ul>
            <dl className="tabular border-t border-ink/10 px-5 py-4 text-sm">
              <div className="ml-auto max-w-xs space-y-1.5">
                <div className="flex justify-between">
                  <dt className="text-muted">Subtotal</dt>
                  <dd>{formatMoney(order.subtotal)}</dd>
                </div>
                {order.discount ? (
                  <div className="flex justify-between">
                    <dt className="text-muted">Discount{order.couponCode ? ` (${order.couponCode})` : ""}</dt>
                    <dd>−{formatMoney(order.discount)}</dd>
                  </div>
                ) : null}
                <div className="flex justify-between">
                  <dt className="text-muted">Shipping</dt>
                  <dd>{order.shipping ? formatMoney(order.shipping) : "Free"}</dd>
                </div>
                <div className="flex justify-between border-t border-ink/10 pt-2 text-base font-medium">
                  <dt>Total</dt>
                  <dd>{formatMoney(order.total)}</dd>
                </div>
              </div>
            </dl>
          </Panel>

          {order.customerNote ? (
            <Panel title="Note from the customer">
              <p className="text-sm whitespace-pre-line text-ink">{order.customerNote}</p>
            </Panel>
          ) : null}

          <Panel title="Timeline" description="Status changes, payments, notes and emails, newest first.">
            <NoteForm action={addOrderNote.bind(null, order.id)} />
            <ol className="mt-6 border-l border-ink/10 pl-5">
              {order.events.map((e, i) => (
                <li key={e.id} className={cn("relative", i > 0 && "mt-5")}>
                  <span
                    className={cn("absolute top-1.5 -left-[24.5px] size-2 rounded-full ring-4 ring-white", i === 0 ? "bg-ink" : "bg-ink/30")}
                    aria-hidden="true"
                  />
                  <p className="flex flex-wrap items-baseline gap-x-2 text-sm">
                    <span className="font-medium text-ink">{e.status ? statusLabel(e.status) : (EVENT_LABEL[e.type] ?? e.type)}</span>
                    {!e.visibleToCustomer ? <span className="text-small text-muted">Internal</span> : null}
                    <span className="tabular text-small text-muted">
                      {formatDateTime(e.createdAt)}
                      {e.createdBy ? `, ${e.createdBy}` : ""}
                    </span>
                  </p>
                  <p className="mt-0.5 text-sm whitespace-pre-line text-muted">{e.message}</p>
                </li>
              ))}
            </ol>
          </Panel>
        </div>

        <div className="min-w-0 space-y-6">
          <Panel title="Order status">
            <StatusForm action={updateOrderStatus.bind(null, order.id)} current={order.status} />
          </Panel>

          <Panel title="Shipping and tracking">
            <TrackingForm action={updateTracking.bind(null, order.id)} carrier={order.carrier} trackingNumber={order.trackingNumber} status={order.status} />
          </Panel>

          <Panel title="Customer">
            <div className="space-y-2 text-sm">
              {order.user ? (
                <div>
                  <Link href={`/admin/customers/${order.user.id}`} className="font-medium text-ink hover:underline">
                    {order.user.firstName} {order.user.lastName}
                  </Link>
                  {order.user.institution ? <p className="text-muted">{order.user.institution}</p> : null}
                  <p className="tabular text-small text-muted">
                    {order.user._count.orders} order{order.user._count.orders === 1 ? "" : "s"} in total
                  </p>
                </div>
              ) : (
                <p className="text-muted">Guest checkout</p>
              )}
              <a href={`mailto:${order.email}?subject=${encodeURIComponent(`Your order ${order.number}`)}`} className={cn(textAction, "break-all")}>
                {order.email}
              </a>
            </div>
          </Panel>

          <Panel title="Shipping address" action={<CopyButton text={address} label="Copy Address" />}>
            <p className="text-sm leading-relaxed whitespace-pre-line text-ink">{address}</p>
          </Panel>

          <Panel title="Payment">
            <DefinitionList
              items={[
                { label: "Method", value: payment?.label ?? order.paymentMethod },
                { label: "Status", value: <span className={paymentState.className}>{paymentState.label}</span> },
                { label: "Reference", value: <span className="tabular">{order.number}</span> },
                { label: "Amount due", value: <span className="tabular">{formatMoney(order.total)}</span> },
                { label: "Customer reported", value: order.paymentClaimedAt ? formatDateTime(order.paymentClaimedAt) : null },
                { label: "Paid at", value: order.paidAt ? formatDateTime(order.paidAt) : null },
                ...(order.paymentMethod === "PAYID" ? [{ label: "PayID", value: settings.payId || null }] : []),
                ...(order.paymentMethod === "BANK_TRANSFER"
                  ? [{ label: "BSB and account", value: <span className="tabular">{`${settings.bankBsb} ${settings.bankAccountNumber}`}</span> }]
                  : []),
              ]}
            />
          </Panel>

          <Panel title="Pinned internal note" description="Only admins see this.">
            <AdminNoteForm action={updateAdminNote.bind(null, order.id)} value={order.adminNote} />
          </Panel>
        </div>
      </div>
    </>
  );
}
