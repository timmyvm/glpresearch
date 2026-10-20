import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { formatDateTime } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { OrderProgress } from "@/components/account/order-progress";
import { OrderTimeline } from "@/components/account/order-timeline";
import { PaymentInstructions } from "@/components/account/payment-instructions";
import { OrderItems, OrderShippingInfo, OrderTotals } from "@/components/account/order-details";
import { CancelOrderButton, ClaimPaymentButton } from "@/components/account/order-actions";
import { tokenMatches } from "../access";

export const metadata: Metadata = { title: "Your order", robots: { index: false, follow: false } };

function placedWithinADay(createdAt: Date) {
  return Date.now() - createdAt.getTime() < 1000 * 60 * 60 * 24;
}

export default async function OrderConfirmationPage({
  params,
  searchParams,
}: {
  params: Promise<{ number: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const [{ number }, { token }] = await Promise.all([params, searchParams]);
  const order = await db.order.findUnique({
    where: { number: decodeURIComponent(number) },
    include: { items: true, events: { where: { visibleToCustomer: true }, orderBy: { createdAt: "asc" } } },
  });
  if (!order) notFound();

  const user = await getCurrentUser();
  const isOwner = !!user && order.userId === user.id;
  const hasToken = tokenMatches(order.accessToken, token);
  if (!isOwner && !hasToken) notFound();

  const settings = await getSettings();
  const pending = order.status === "PENDING_PAYMENT";
  const justPlaced = pending && placedWithinADay(order.createdAt);
  const guestToken = hasToken ? token : undefined;
  const invoiceHref = `/order/${order.number}/invoice${guestToken ? `?token=${encodeURIComponent(guestToken)}` : ""}`;

  const next = [
    { title: "We match your payment", text: "Usually within one business day. You get an email the moment it lands." },
    { title: "We pack and dispatch", text: `${settings.dispatchCutoff}.` },
    { title: "Tracked delivery", text: "The tracking number is emailed to you and shown on this page." },
  ];

  return (
    <div className="frame pt-10 pb-24 md:pt-16 md:pb-32">
      <header className="max-w-[60ch]">
        <h1 className="text-head">{justPlaced ? `Thank you, ${order.shipFirstName}` : `Order ${order.number}`}</h1>
        <p className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 text-muted">
          {justPlaced ? (
            <span>
              Order <span className="tabular text-ink">{order.number}</span> is placed. A copy is on its way to{" "}
              <span className="text-ink">{order.email}</span>.
            </span>
          ) : (
            <span>Placed {formatDateTime(order.createdAt)}</span>
          )}
          <StatusBadge status={order.status} />
        </p>
      </header>

      {pending ? (
        <PaymentInstructions
          className="mt-10"
          order={order}
          settings={settings}
          action={
            <div className="flex flex-col items-start gap-4">
              {order.paymentClaimedAt ? null : <ClaimPaymentButton number={order.number} token={guestToken} />}
              <CancelOrderButton number={order.number} token={guestToken} />
            </div>
          }
        />
      ) : null}

      <section aria-labelledby="progress-title" className="mt-14">
        <h2 id="progress-title" className="sr-only">
          Order progress
        </h2>
        <OrderProgress status={order.status} events={order.events} createdAt={order.createdAt} />
      </section>

      {pending ? (
        <section aria-labelledby="next-title" className="mt-16">
          <h2 id="next-title" className="text-lead font-medium">
            What happens next
          </h2>
          <ul className="mt-6 grid gap-x-8 gap-y-5 sm:grid-cols-3">
            {next.map((step) => (
              <li key={step.title} className="max-w-[36ch]">
                <p className="font-medium">{step.title}</p>
                <p className="mt-1 text-small text-muted">{step.text}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <div className="mt-16 grid gap-14 lg:grid-cols-12 lg:gap-8">
        <section aria-labelledby="items-title" className="lg:col-span-7">
          <h2 id="items-title" className="text-lead font-medium">
            Items
          </h2>
          <div className="mt-6">
            <OrderItems items={order.items} />
          </div>
          <div className="mt-8 bg-surface p-5">
            <OrderTotals order={order} />
          </div>
        </section>

        <aside className="space-y-12 lg:col-span-4 lg:col-start-9">
          <section aria-labelledby="updates-title">
            <h2 id="updates-title" className="text-lead font-medium">
              Updates
            </h2>
            <div className="mt-6">
              <OrderTimeline events={order.events} />
            </div>
          </section>
          <div className="flex flex-col items-start gap-3">
            <ButtonLink href={invoiceHref} variant="outline">
              {order.paymentStatus === "PAID" ? "View Receipt" : "View Invoice"}
            </ButtonLink>
            {isOwner ? (
              <Link href={`/account/orders/${order.number}`} className="link text-small">
                See this order in your account
              </Link>
            ) : user ? null : (
              <Link href="/register" className="link text-small">
                Create an account to keep your orders in one place
              </Link>
            )}
          </div>
        </aside>
      </div>

      <section aria-labelledby="delivery-title" className="mt-16">
        <h2 id="delivery-title" className="text-lead font-medium">
          Delivery and payment
        </h2>
        <div className="mt-6">
          <OrderShippingInfo order={order} />
        </div>
      </section>

      <p className="mt-16 text-small text-muted">
        Questions about this order?{" "}
        <Link href={`/contact?order=${order.number}`} className="link text-ink">
          Contact support
        </Link>{" "}
        and quote <span className="tabular text-ink">{order.number}</span>. Bookmark this page to check on it any time.
      </p>
    </div>
  );
}
