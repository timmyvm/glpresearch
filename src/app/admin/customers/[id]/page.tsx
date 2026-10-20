import Link from "next/link";
import { notFound } from "next/navigation";
import { Building2, Mail, MapPin, Phone } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatMoney } from "@/lib/money";
import { formatDate, formatDateTime } from "@/lib/utils";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { DefinitionList, PageHeader, StatCard, TableWrap, Td, Th } from "@/components/admin/ui";
import { CustomerNotesForm, QuickAction } from "@/components/admin/customer-forms";
import { saveCustomerNotes, sendPasswordReset, setCustomerRole, setCustomerStatus } from "../actions";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const u = await db.user.findUnique({ where: { id }, select: { firstName: true, lastName: true } });
  return { title: u ? `${u.firstName} ${u.lastName}` : "Customer" };
}

export default async function CustomerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const admin = await requireAdmin();
  const user = await db.user.findUnique({
    where: { id },
    include: {
      addresses: { orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }] },
      orders: { orderBy: { createdAt: "desc" }, include: { _count: { select: { items: true } } } },
    },
  });
  if (!user) notFound();

  const paid = user.orders.filter((o) => o.paymentStatus === "PAID" && !["CANCELLED", "REFUNDED"].includes(o.status));
  const ltv = paid.reduce((s, o) => s + o.total, 0);
  const aov = paid.length ? Math.round(ltv / paid.length) : 0;
  const units = await db.orderItem.groupBy({
    by: ["productName"],
    where: { order: { userId: id, paymentStatus: "PAID" } },
    _sum: { quantity: true, lineTotal: true },
    orderBy: { _sum: { lineTotal: "desc" } },
    take: 5,
  });
  const isSelf = admin.id === user.id;

  return (
    <>
      <PageHeader
        back={{ href: "/admin/customers", label: "Customers" }}
        title={
          <span className="flex flex-wrap items-center gap-3">
            {user.firstName} {user.lastName}
            {user.role === "ADMIN" ? <Badge className="bg-ink-900 text-white ring-ink-900">Admin</Badge> : null}
            {user.status === "SUSPENDED" ? <Badge className="bg-rose-50 text-rose-700 ring-rose-600/20">Suspended</Badge> : null}
          </span>
        }
        description={`Customer since ${formatDate(user.createdAt)}${user.lastLoginAt ? ` · last signed in ${formatDateTime(user.lastLoginAt)}` : ""}`}
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Lifetime value" value={formatMoney(ltv)} hint="paid orders" />
        <StatCard label="Orders" value={user.orders.length} hint={`${paid.length} paid`} />
        <StatCard label="Avg order value" value={formatMoney(aov)} />
        <StatCard
          label="Last order"
          value={user.orders[0] ? formatDate(user.orders[0].createdAt) : "—"}
          hint={user.orders[0] ? user.orders[0].number : undefined}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <div>
            <h2 className="mb-3 text-sm font-semibold text-ink-900">Order history</h2>
            <TableWrap>
              <thead>
                <tr>
                  <Th>Order</Th>
                  <Th>Placed</Th>
                  <Th>Status</Th>
                  <Th>Items</Th>
                  <Th className="text-right">Total</Th>
                </tr>
              </thead>
              <tbody>
                {user.orders.length === 0 ? (
                  <tr>
                    <Td colSpan={5} className="py-8 text-center text-sm text-slate-500">
                      No orders yet.
                    </Td>
                  </tr>
                ) : null}
                {user.orders.map((o) => (
                  <tr key={o.id} className="group hover:bg-slate-50">
                    <Td>
                      <Link href={`/admin/orders/${o.id}`} className="font-mono text-xs font-semibold text-ink-900 group-hover:text-mint-700">
                        {o.number}
                      </Link>
                    </Td>
                    <Td className="text-xs text-slate-500">{formatDateTime(o.createdAt)}</Td>
                    <Td>
                      <StatusBadge status={o.status} />
                    </Td>
                    <Td>{o._count.items}</Td>
                    <Td className="text-right font-semibold tabular-nums">{formatMoney(o.total)}</Td>
                  </tr>
                ))}
              </tbody>
            </TableWrap>
          </div>

          <Card>
            <CardHeader title="Top products" description="By paid revenue" />
            <CardBody>
              {units.length === 0 ? <p className="text-sm text-slate-500">No paid purchases yet.</p> : null}
              <ul className="space-y-2 text-sm">
                {units.map((u) => (
                  <li key={u.productName} className="flex justify-between">
                    <span className="font-medium text-ink-900">{u.productName}</span>
                    <span className="text-slate-500 tabular-nums">
                      {u._sum.quantity} units · {formatMoney(u._sum.lineTotal ?? 0)}
                    </span>
                  </li>
                ))}
              </ul>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Addresses" />
            <div className="grid gap-4 p-5 sm:grid-cols-2">
              {user.addresses.length === 0 ? <p className="text-sm text-slate-500">No saved addresses.</p> : null}
              {user.addresses.map((a) => (
                <div key={a.id} className="rounded-xl border border-slate-200 p-4 text-sm">
                  <div className="mb-2 flex items-center gap-2">
                    <MapPin className="size-4 text-slate-400" />
                    <span className="font-semibold text-ink-900">{a.label ?? "Address"}</span>
                    {a.isDefault ? <Badge className="bg-mint-50 text-mint-700 ring-mint-600/20">Default</Badge> : null}
                  </div>
                  <p className="leading-relaxed text-slate-600">
                    {a.firstName} {a.lastName}
                    {a.company ? (
                      <>
                        <br />
                        {a.company}
                      </>
                    ) : null}
                    <br />
                    {a.line1}
                    {a.line2 ? (
                      <>
                        <br />
                        {a.line2}
                      </>
                    ) : null}
                    <br />
                    {a.city} {a.state} {a.postcode}
                    <br />
                    {a.country}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Profile" />
            <CardBody className="space-y-3 text-sm">
              <a href={`mailto:${user.email}`} className="flex items-center gap-2 text-mint-700 hover:underline">
                <Mail className="size-4" /> {user.email}
              </a>
              {user.phone ? (
                <p className="flex items-center gap-2 text-ink-800">
                  <Phone className="size-4 text-slate-400" /> {user.phone}
                </p>
              ) : null}
              {user.institution ? (
                <p className="flex items-center gap-2 text-ink-800">
                  <Building2 className="size-4 text-slate-400" /> {user.institution}
                </p>
              ) : null}
              <DefinitionList
                items={[
                  { label: "Role", value: user.role === "ADMIN" ? "Admin" : "Customer" },
                  { label: "Status", value: user.status === "ACTIVE" ? "Active" : "Suspended" },
                  { label: "Marketing emails", value: user.marketingOptIn ? "Opted in" : "Not opted in" },
                ]}
              />
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Account actions" />
            <CardBody className="space-y-2">
              <QuickAction action={sendPasswordReset.bind(null, user.id)} label="Email password reset link" />
              {user.status === "ACTIVE" ? (
                !isSelf ? (
                  <QuickAction
                    action={setCustomerStatus.bind(null, user.id)}
                    hidden={{ status: "SUSPENDED" }}
                    label="Suspend account"
                    variant="danger"
                    confirm={`Suspend ${user.firstName}? They will be signed out and unable to log in.`}
                  />
                ) : null
              ) : (
                <QuickAction action={setCustomerStatus.bind(null, user.id)} hidden={{ status: "ACTIVE" }} label="Reactivate account" variant="primary" />
              )}
              {user.role === "ADMIN" ? (
                isSelf ? (
                  <p className="text-xs text-slate-500">This is your account — you can&apos;t remove your own admin access.</p>
                ) : (
                  <QuickAction
                    action={setCustomerRole.bind(null, user.id)}
                    hidden={{ role: "CUSTOMER" }}
                    label="Remove admin access"
                    variant="ghost"
                    confirm={`Remove admin access from ${user.firstName}?`}
                  />
                )
              ) : (
                <QuickAction
                  action={setCustomerRole.bind(null, user.id)}
                  hidden={{ role: "ADMIN" }}
                  label="Promote to admin"
                  variant="ghost"
                  confirm={`Give ${user.firstName} full admin access?`}
                />
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Internal notes" />
            <CardBody>
              <CustomerNotesForm action={saveCustomerNotes.bind(null, user.id)} value={user.adminNotes} />
            </CardBody>
          </Card>
        </div>
      </div>
    </>
  );
}
