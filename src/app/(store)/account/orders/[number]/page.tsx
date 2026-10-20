import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { formatDateTime } from "@/lib/utils";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { OrderProgress } from "@/components/account/order-progress";
import { OrderTimeline } from "@/components/account/order-timeline";
import { PaymentInstructions } from "@/components/account/payment-instructions";
import { OrderItems, OrderShippingInfo, OrderTotals } from "@/components/account/order-details";
import { ReorderButton, type ReorderLine } from "@/components/account/reorder-button";

export async function generateMetadata({ params }: { params: Promise<{ number: string }> }) {
  const { number } = await params;
  return { title: `Order ${decodeURIComponent(number)}` };
}

export default async function AccountOrderPage({ params }: { params: Promise<{ number: string }> }) {
  const { number } = await params;
  const user = await requireUser(`/account/orders/${number}`);
  const order = await db.order.findUnique({
    where: { number: decodeURIComponent(number) },
    include: {
      items: { include: { variant: { include: { product: true } } } },
      events: { where: { visibleToCustomer: true }, orderBy: { createdAt: "asc" } },
    },
  });
  if (!order || order.userId !== user.id) notFound();

  const settings = await getSettings();

  const reorder: ReorderLine[] = [];
  let unavailable = 0;
  const slugs: Record<string, string> = {};
  for (const item of order.items) {
    const v = item.variant;
    if (v?.product) slugs[item.id] = v.product.slug;
    if (v && v.active && v.product.active && v.stock > 0) {
      reorder.push({
        variantId: v.id,
        productSlug: v.product.slug,
        productName: v.product.name,
        variantLabel: v.label,
        sku: v.sku,
        price: v.price,
        image: v.image ?? v.product.image,
        quantity: Math.min(item.quantity, v.stock),
      });
    } else {
      unavailable++;
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href="/account/orders" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-ink-900">
          <ArrowLeft className="size-3.5" /> All orders
        </Link>
        <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="flex flex-wrap items-center gap-3 text-2xl font-semibold tracking-tight text-ink-900">
              Order <span className="font-mono">{order.number}</span>
              <StatusBadge status={order.status} className="text-sm" />
            </h1>
            <p className="mt-1 text-sm text-slate-500">Placed {formatDateTime(order.createdAt)}</p>
          </div>
          <ReorderButton lines={reorder} unavailable={unavailable} />
        </div>
      </div>

      <Card>
        <CardBody className="py-6">
          <OrderProgress status={order.status} events={order.events} createdAt={order.createdAt} />
        </CardBody>
      </Card>

      {order.status === "PENDING_PAYMENT" ? <PaymentInstructions order={order} settings={settings} /> : null}

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader title="Items" />
            <CardBody className="space-y-6">
              <OrderItems items={order.items} productSlugs={slugs} />
              <div className="border-t border-slate-100 pt-5">
                <OrderTotals order={order} />
              </div>
            </CardBody>
          </Card>
          <Card>
            <CardHeader title="Shipping & payment" />
            <CardBody>
              <OrderShippingInfo order={order} />
              {order.customerNote ? (
                <div className="mt-6 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
                  <span className="font-medium text-ink-800">Your note:</span> {order.customerNote}
                </div>
              ) : null}
            </CardBody>
          </Card>
        </div>
        <Card className="xl:self-start">
          <CardHeader title="Order updates" />
          <CardBody>
            <OrderTimeline events={order.events} />
          </CardBody>
        </Card>
      </div>

      <p className="text-sm text-slate-500">
        Questions about this order?{" "}
        <Link href={`/contact?order=${order.number}`} className="font-medium text-mint-700 hover:underline">
          Contact support
        </Link>{" "}
        and quote <span className="font-mono">{order.number}</span>.
      </p>
    </div>
  );
}
