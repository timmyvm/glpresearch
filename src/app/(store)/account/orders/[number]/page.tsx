import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { formatDateTime } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { OrderProgress } from "@/components/account/order-progress";
import { OrderTimeline } from "@/components/account/order-timeline";
import { PaymentInstructions } from "@/components/account/payment-instructions";
import { OrderItems, OrderShippingInfo, OrderTotals } from "@/components/account/order-details";
import { ReorderButton, type ReorderLine } from "@/components/account/reorder-button";
import { CancelOrderButton, ClaimPaymentButton } from "@/components/account/order-actions";
import { PageTitle, PanelTitle } from "@/components/account/account-ui";

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
  const pending = order.status === "PENDING_PAYMENT";

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
      <nav aria-label="Breadcrumb" className="text-small text-muted">
        <Link href="/account/orders" className="link">
          Orders
        </Link>
        <span aria-hidden="true"> / </span>
        <span className="tabular text-ink" aria-current="page">
          {order.number}
        </span>
      </nav>

      <PageTitle
        title={
          <span className="flex flex-wrap items-center gap-3">
            <span className="tabular">Order {order.number}</span>
            <StatusBadge status={order.status} />
          </span>
        }
        action={
          <>
            <ButtonLink href={`/account/orders/${order.number}/invoice`} variant="ghost" size="sm">
              {order.paymentStatus === "PAID" ? "Receipt" : "Invoice"}
            </ButtonLink>
            {pending ? null : <ReorderButton lines={reorder} unavailable={unavailable} />}
          </>
        }
      >
        Placed {formatDateTime(order.createdAt)}
      </PageTitle>

      {pending ? (
        <PaymentInstructions
          order={order}
          settings={settings}
          action={
            <div className="flex flex-col items-start gap-4">
              {order.paymentClaimedAt ? null : <ClaimPaymentButton number={order.number} />}
              <CancelOrderButton number={order.number} />
            </div>
          }
        />
      ) : null}

      <Card className="px-5 py-5">
        <h2 className="sr-only">Progress</h2>
        <OrderProgress status={order.status} events={order.events} createdAt={order.createdAt} />
      </Card>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card aria-labelledby="items-title" className="flex flex-col xl:col-span-2">
          <PanelTitle id="items-title" title="Items" />
          <div className="flex flex-1 flex-col gap-6 px-5 pb-5">
            <OrderItems items={order.items} productSlugs={slugs} />
            <div className="mt-auto bg-surface p-4">
              <OrderTotals order={order} />
            </div>
          </div>
        </Card>
        <Card aria-labelledby="updates-title" className="flex flex-col">
          <PanelTitle id="updates-title" title="Updates" />
          <div className="px-5 pb-5">
            <OrderTimeline events={order.events} />
          </div>
          <p className="mt-auto border-t border-ink/[0.06] px-5 py-4 text-small text-muted" data-ui>
            Questions?{" "}
            <Link href={`/contact?order=${order.number}`} className="link text-ink">
              Contact support
            </Link>{" "}
            and quote <span className="tabular text-ink">{order.number}</span>.
          </p>
        </Card>
        <Card aria-labelledby="delivery-title" className="xl:col-span-3">
          <PanelTitle id="delivery-title" title="Delivery and payment" />
          <div className="px-5 pb-5">
            <OrderShippingInfo order={order} />
            {order.customerNote ? (
              <p className="mt-6 bg-surface px-4 py-3 text-small">
                <span className="text-muted">Your note: </span>
                {order.customerNote}
              </p>
            ) : null}
          </div>
        </Card>
      </div>
    </div>
  );
}
