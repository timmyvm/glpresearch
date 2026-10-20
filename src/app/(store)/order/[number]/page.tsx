import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { timingSafeEqual } from "node:crypto";
import { CheckCircle2, ClipboardCheck, CreditCard, Mail, PackageCheck, Truck } from "lucide-react";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { formatDateTime } from "@/lib/utils";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { OrderProgress } from "@/components/account/order-progress";
import { OrderTimeline } from "@/components/account/order-timeline";
import { PaymentInstructions } from "@/components/account/payment-instructions";
import { OrderItems, OrderShippingInfo, OrderTotals } from "@/components/account/order-details";

export const metadata: Metadata = { title: "Your order", robots: { index: false, follow: false } };

function tokenMatches(expected: string, given: string | undefined) {
  if (!given) return false;
  const a = Buffer.from(expected);
  const b = Buffer.from(given);
  return a.length === b.length && timingSafeEqual(a, b);
}

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
  if (!isOwner && !tokenMatches(order.accessToken, token)) notFound();

  const settings = await getSettings();
  const pending = order.status === "PENDING_PAYMENT";
  const justPlaced = pending && placedWithinADay(order.createdAt);

  const steps = [
    { icon: CreditCard, title: "Make your payment", text: `Use the details above with ${order.number} as the reference.` },
    { icon: ClipboardCheck, title: "We confirm payment", text: "You'll get an email as soon as your payment is matched." },
    { icon: PackageCheck, title: "Packed & dispatched", text: settings.dispatchCutoff + "." },
    { icon: Truck, title: "Tracked delivery", text: "Your tracking number is emailed and shown on this page." },
  ];

  return (
    <div className="bg-slate-50/60">
      <div className="container-page max-w-5xl py-10 sm:py-14">
        <div className="mb-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-mint-400/15 ring-1 ring-mint-400/40">
            <CheckCircle2 className="size-7 text-mint-600" />
          </span>
          <div>
            <p className="eyebrow">{justPlaced ? "Order received" : "Order details"}</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-ink-900 sm:text-3xl">
              {justPlaced ? `Thank you, ${order.shipFirstName}!` : <>Order <span className="font-mono">{order.number}</span></>}
            </h1>
            <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-600">
              {justPlaced ? (
                <>
                  Your order <span className="font-mono font-semibold text-ink-900">{order.number}</span> has been placed.
                </>
              ) : (
                <>Placed {formatDateTime(order.createdAt)}</>
              )}
              <StatusBadge status={order.status} />
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {pending ? <PaymentInstructions order={order} settings={settings} /> : null}

          <Card>
            <CardBody className="py-6">
              <OrderProgress status={order.status} events={order.events} createdAt={order.createdAt} />
            </CardBody>
          </Card>

          {pending ? (
            <Card>
              <CardHeader title="What happens next" />
              <CardBody>
                <ol className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                  {steps.map(({ icon: Icon, title, text }, i) => (
                    <li key={title} className="flex gap-3">
                      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-ink-50 text-ink-700">
                        <Icon className="size-4" />
                      </span>
                      <span>
                        <span className="block text-sm font-semibold text-ink-900">
                          {i + 1}. {title}
                        </span>
                        <span className="block text-xs leading-relaxed text-slate-500">{text}</span>
                      </span>
                    </li>
                  ))}
                </ol>
              </CardBody>
            </Card>
          ) : null}

          <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
            <div className="space-y-6">
              <Card>
                <CardHeader title="Items" />
                <CardBody className="space-y-6">
                  <OrderItems items={order.items} />
                  <div className="border-t border-slate-100 pt-5">
                    <OrderTotals order={order} />
                  </div>
                </CardBody>
              </Card>
              <Card>
                <CardHeader title="Shipping & payment" />
                <CardBody>
                  <OrderShippingInfo order={order} />
                </CardBody>
              </Card>
            </div>
            <div className="space-y-6">
              <Card>
                <CardHeader title="Order updates" />
                <CardBody>
                  <OrderTimeline events={order.events} />
                </CardBody>
              </Card>
              <Card className="p-5 text-sm">
                <p className="flex items-center gap-2 font-semibold text-ink-900">
                  <Mail className="size-4 text-mint-600" /> Confirmation sent
                </p>
                <p className="mt-1 text-slate-600">
                  We&apos;ve emailed a copy of this order and payment details to{" "}
                  <span className="font-medium text-ink-800">{order.email}</span>. Bookmark this page to check your order
                  status any time.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {isOwner ? (
                    <ButtonLink href={`/account/orders/${order.number}`} variant="outline" size="sm">
                      View in my account
                    </ButtonLink>
                  ) : (
                    <ButtonLink href="/register" variant="outline" size="sm">
                      Create an account
                    </ButtonLink>
                  )}
                  <ButtonLink href="/shop" variant="ghost" size="sm">
                    Continue shopping
                  </ButtonLink>
                </div>
              </Card>
            </div>
          </div>

          <p className="text-center text-sm text-slate-500">
            Need help?{" "}
            <Link href={`/contact?order=${order.number}`} className="font-medium text-mint-700 hover:underline">
              Contact support
            </Link>{" "}
            and quote <span className="font-mono">{order.number}</span>.
          </p>
        </div>
      </div>
    </div>
  );
}
