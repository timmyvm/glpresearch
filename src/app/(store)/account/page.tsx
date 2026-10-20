import Link from "next/link";
import { ArrowRight, BookOpen, FlaskConical, MapPin, Package, UserCog } from "lucide-react";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { formatMoney } from "@/lib/money";
import { formatDate } from "@/lib/utils";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { OrderProgress } from "@/components/account/order-progress";

export const metadata = { title: "Overview" };

const OPEN = ["PENDING_PAYMENT", "PAID", "PROCESSING", "SHIPPED"];

export default async function AccountOverviewPage() {
  const user = await requireUser("/account");
  const [orders, latest] = await Promise.all([
    db.order.findMany({ where: { userId: user.id }, select: { status: true, total: true } }),
    db.order.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: { events: { select: { status: true, createdAt: true } }, _count: { select: { items: true } } },
    }),
  ]);
  const spent = orders.filter((o) => !["CANCELLED", "REFUNDED", "PENDING_PAYMENT"].includes(o.status)).reduce((s, o) => s + o.total, 0);
  const open = orders.filter((o) => OPEN.includes(o.status)).length;

  const stats = [
    { label: "Total orders", value: String(orders.length) },
    { label: "Total spent", value: formatMoney(spent) },
    { label: "Open orders", value: String(open) },
  ];

  const links = [
    { href: "/account/orders", label: "Order history", text: "Invoices, tracking and reorders", icon: Package },
    { href: "/account/addresses", label: "Addresses", text: "Manage saved shipping addresses", icon: MapPin },
    { href: "/account/settings", label: "Profile & security", text: "Details, email and password", icon: UserCog },
    { href: "/research", label: "Research library", text: "Monographs and literature reviews", icon: BookOpen },
  ];

  return (
    <div className="space-y-8">
      <div>
        <p className="eyebrow">My account</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink-900 sm:text-3xl">Hi {user.firstName}</h1>
        <p className="mt-1 text-sm text-slate-600">Member since {formatDate(user.createdAt, { month: "long" })}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <Card key={s.label} className="p-5">
            <p className="text-xs font-medium tracking-wide text-slate-500 uppercase">{s.label}</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-ink-900">{s.value}</p>
          </Card>
        ))}
      </div>

      {latest ? (
        <Card>
          <CardHeader
            title={
              <span className="flex flex-wrap items-center gap-2">
                Latest order <span className="font-mono text-slate-500">{latest.number}</span>
                <StatusBadge status={latest.status} />
              </span>
            }
            description={`${formatDate(latest.createdAt)} · ${latest._count.items} item${latest._count.items === 1 ? "" : "s"} · ${formatMoney(latest.total)}`}
            action={
              <ButtonLink href={`/account/orders/${latest.number}`} variant="outline" size="sm">
                View <ArrowRight className="size-3.5" />
              </ButtonLink>
            }
          />
          <CardBody>
            <OrderProgress status={latest.status} events={latest.events} createdAt={latest.createdAt} />
          </CardBody>
        </Card>
      ) : (
        <Card className="flex flex-col items-center gap-4 p-10 text-center">
          <span className="grid size-12 place-items-center rounded-full bg-mint-50">
            <FlaskConical className="size-5 text-mint-600" />
          </span>
          <div>
            <p className="font-semibold text-ink-900">No orders yet</p>
            <p className="mt-1 text-sm text-slate-500">When you place an order, its progress will appear here.</p>
          </div>
          <ButtonLink href="/shop">Browse peptides</ButtonLink>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {links.map(({ href, label, text, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 transition-colors hover:border-ink-200 hover:bg-ink-50/40"
          >
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-ink-50 text-ink-700 group-hover:bg-ink-900 group-hover:text-mint-300">
              <Icon className="size-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-ink-900">{label}</span>
              <span className="block text-sm text-slate-500">{text}</span>
            </span>
            <ArrowRight className="size-4 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-ink-700" />
          </Link>
        ))}
      </div>
    </div>
  );
}
