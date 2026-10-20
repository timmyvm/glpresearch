import Link from "next/link";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { formatMoney } from "@/lib/money";
import { getSettings } from "@/lib/settings";
import { formatDate } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { OrderProgress } from "@/components/account/order-progress";
import { ItemThumbs, OrderRow, PageTitle, PanelTitle } from "@/components/account/account-ui";

export const metadata = { title: "Overview" };

const COUNTED = ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"];

export default async function AccountOverviewPage() {
  const user = await requireUser("/account");
  const [orders, address, settings, batches] = await Promise.all([
    db.order.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        number: true,
        status: true,
        total: true,
        createdAt: true,
        paymentClaimedAt: true,
        items: { select: { id: true, quantity: true, productName: true, image: true } },
        events: { where: { visibleToCustomer: true }, select: { status: true, createdAt: true } },
      },
    }),
    db.address.findFirst({ where: { userId: user.id }, orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }] }),
    getSettings(),
    // The latest certificate for each compound this customer has ordered.
    db.batch.findMany({
      where: { published: true, product: { variants: { some: { orderItems: { some: { order: { userId: user.id } } } } } } },
      orderBy: { testedAt: "desc" },
      select: { batchNumber: true, purity: true, testedAt: true, product: { select: { id: true, name: true, accentColor: true } } },
    }),
  ]);
  const certificates = batches.filter((b, i) => batches.findIndex((x) => x.product.id === b.product.id) === i).slice(0, 4);

  const latest = orders[0];
  const spent = orders.filter((o) => COUNTED.includes(o.status)).reduce((s, o) => s + o.total, 0);
  const since = formatDate(user.createdAt, { day: undefined, month: "long" });
  const summary =
    orders.length === 0
      ? `Member since ${since}. No orders yet.`
      : `${orders.length} ${orders.length === 1 ? "order" : "orders"} and ${formatMoney(spent)} paid since ${since}.`;
  const deadline = latest
    ? new Intl.DateTimeFormat("en-AU", { weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }).format(
        new Date(latest.createdAt.getTime() + settings.paymentWindowHours * 3600000),
      )
    : "";

  return (
    <div className="space-y-6">
      <PageTitle title="Overview">{summary}</PageTitle>

      {latest ? (
        <Card aria-labelledby="latest-title">
          <PanelTitle
            id="latest-title"
            title="Latest order"
            action={
              <ButtonLink href={`/account/orders/${latest.number}`} variant="outline" size="sm">
                View Order
              </ButtonLink>
            }
          />
          <div className="space-y-6 px-5 pb-5">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
              <ItemThumbs items={latest.items} />
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-center gap-3">
                  <span className="tabular text-lead font-medium">{latest.number}</span>
                  <StatusBadge status={latest.status} />
                </p>
                <p className="tabular text-small text-muted">
                  Placed {formatDate(latest.createdAt)}, {formatMoney(latest.total)}
                </p>
              </div>
            </div>
            {latest.status === "PENDING_PAYMENT" ? (
              <div className="flex flex-wrap items-center justify-between gap-4 bg-surface px-4 py-3">
                <p className="text-small">
                  {latest.paymentClaimedAt
                    ? "You've told us the payment is on its way. We'll email you once it's matched."
                    : `Awaiting payment of ${formatMoney(latest.total)}. Pay by ${deadline} to keep the stock held.`}
                </p>
                {latest.paymentClaimedAt ? null : (
                  <ButtonLink href={`/account/orders/${latest.number}#pay-title`} size="sm">
                    See Payment Details
                  </ButtonLink>
                )}
              </div>
            ) : null}
            <OrderProgress status={latest.status} events={latest.events} createdAt={latest.createdAt} />
          </div>
        </Card>
      ) : (
        <Card className="px-5 py-8">
          <h2 className="text-base font-medium">Latest order</h2>
          <p className="mt-1 text-small text-muted">Nothing ordered yet. When you place an order, its progress shows here.</p>
          <ButtonLink href="/shop" className="mt-5">
            Shop Peptides
          </ButtonLink>
        </Card>
      )}

      <div className="grid items-start gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2" aria-labelledby="recent-title">
          <PanelTitle
            id="recent-title"
            title="Recent orders"
            action={
              orders.length > 0 ? (
                <Link href="/account/orders" className="link text-small">
                  View all {orders.length}
                </Link>
              ) : null
            }
          />
          {orders.length > 1 ? (
            <ul className="pb-2">
              {orders.slice(1, 6).map((o) => (
                <OrderRow key={o.id} order={o} />
              ))}
            </ul>
          ) : (
            <p className="px-5 pb-5 text-small text-muted">
              {orders.length === 1 ? "Your earlier orders will be listed here." : "No orders yet."}
            </p>
          )}
        </Card>

        <div className="space-y-6">
          <Card aria-labelledby="details-title">
            <PanelTitle
              id="details-title"
              title="Your details"
              action={
                <Link href="/account/settings" className="link text-small">
                  Edit
                </Link>
              }
            />
            <dl className="space-y-4 px-5 pb-5 text-small">
              <div>
                <dt className="text-muted">Name</dt>
                <dd>
                  {user.firstName} {user.lastName}
                  {user.institution ? <span className="text-muted">, {user.institution}</span> : null}
                </dd>
              </div>
              <div>
                <dt className="text-muted">Email</dt>
                <dd className="[overflow-wrap:anywhere]">{user.email}</dd>
              </div>
              <div>
                <dt className="text-muted">Ships to</dt>
                <dd>
                  {address ? (
                    <>
                      {address.line1}, {address.city} {address.state} {address.postcode}{" "}
                      <Link href="/account/addresses" className="link text-muted">
                        Change
                      </Link>
                    </>
                  ) : (
                    <Link href="/account/addresses" className="link">
                      Add a shipping address
                    </Link>
                  )}
                </dd>
              </div>
            </dl>
          </Card>

          {certificates.length > 0 ? (
            <Card aria-labelledby="coa-title">
              <PanelTitle
                id="coa-title"
                title="Lab results for your compounds"
                action={
                  <Link href="/coa" className="link shrink-0 text-small">
                    All batches
                  </Link>
                }
              />
              <ul className="px-5 pb-4 text-small">
                {certificates.map((b) => (
                  <li key={b.batchNumber} className="flex items-center gap-3 py-2">
                    <span className="size-2.5 shrink-0" style={{ backgroundColor: b.product.accentColor }} aria-hidden="true" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate">{b.product.name}</span>
                      <Link href={`/coa?batch=${encodeURIComponent(b.batchNumber)}`} className="link tabular text-muted">
                        Batch {b.batchNumber}
                      </Link>
                    </span>
                    <span className="tabular text-right">
                      <span className="block font-medium">{b.purity.toFixed(2)}%</span>
                      <span className="block text-muted">{formatDate(b.testedAt, { day: undefined, month: "short" })}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
}
