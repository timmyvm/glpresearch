import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatMoney } from "@/lib/money";
import { formatDate, formatDateTime } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/badge";
import { AccountPill, DefinitionList, EmptyState, PageHeader, Panel, StatStrip, TableWrap, Td, Th, textAction } from "@/components/admin/ui";
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
  const last = user.orders[0];
  const name = `${user.firstName} ${user.lastName}`;

  return (
    <>
      <PageHeader
        back={{ href: "/admin/customers", label: "Customers" }}
        title={
          <span className="flex flex-wrap items-center gap-3">
            {name}
            <AccountPill role={user.role} status={user.status} />
          </span>
        }
        description={`Customer since ${formatDate(user.createdAt)}.${user.lastLoginAt ? ` Last signed in ${formatDateTime(user.lastLoginAt)}.` : " Has not signed in yet."}`}
      />

      <StatStrip
        className="mb-6"
        stats={[
          { label: "Lifetime value", value: formatMoney(ltv), note: "paid orders only", tone: "neutral" },
          { label: "Orders", value: user.orders.length, note: `${paid.length} paid`, tone: "neutral" },
          { label: "Average order", value: paid.length ? formatMoney(aov) : "–", note: "paid orders only", tone: "neutral" },
          { label: "Last order", value: last ? formatDate(last.createdAt) : "–", note: last?.number, tone: "neutral", href: last ? `/admin/orders/${last.id}` : undefined },
        ]}
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0 space-y-6">
          <section aria-labelledby="order-history">
            <h2 id="order-history" className="mb-3 text-base font-medium text-ink">
              Order history
            </h2>
            <TableWrap minWidth={0}>
              <thead>
                <tr>
                  <Th>Order</Th>
                  <Th className="hidden sm:table-cell">Placed</Th>
                  <Th>Status</Th>
                  <Th className="hidden text-right md:table-cell">Items</Th>
                  <Th className="text-right">Total</Th>
                </tr>
              </thead>
              <tbody>
                {user.orders.length === 0 ? (
                  <tr>
                    <Td colSpan={5} className="p-0">
                      <EmptyState title="No orders yet." />
                    </Td>
                  </tr>
                ) : null}
                {user.orders.map((o) => (
                  <tr key={o.id} className="hover:bg-surface/50">
                    <Td>
                      <Link href={`/admin/orders/${o.id}`} className="tabular font-medium text-ink hover:underline">
                        {o.number}
                      </Link>
                      <p className="tabular text-small text-muted sm:hidden">{formatDate(o.createdAt)}</p>
                    </Td>
                    <Td className="tabular hidden whitespace-nowrap text-muted sm:table-cell">{formatDateTime(o.createdAt)}</Td>
                    <Td>
                      <StatusBadge status={o.status} />
                    </Td>
                    <Td className="tabular hidden text-right md:table-cell">{o._count.items}</Td>
                    <Td className="tabular text-right font-medium">{formatMoney(o.total)}</Td>
                  </tr>
                ))}
              </tbody>
            </TableWrap>
          </section>

          <div className="grid gap-6 lg:grid-cols-2">
            <Panel title="Top products" description="By paid revenue.">
              {units.length === 0 ? (
                <p className="text-sm text-muted">No paid purchases yet.</p>
              ) : (
                <ul className="text-sm">
                  {units.map((u) => (
                    <li key={u.productName} className="flex justify-between gap-4 border-t border-ink/[0.07] py-2 first:border-t-0 first:pt-0">
                      <span className="font-medium text-ink">{u.productName}</span>
                      <span className="tabular text-right text-muted">
                        {u._sum.quantity} unit{u._sum.quantity === 1 ? "" : "s"}, <span className="text-ink">{formatMoney(u._sum.lineTotal ?? 0)}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>

            <Panel title="Saved addresses">
              {user.addresses.length === 0 ? <p className="text-sm text-muted">No saved addresses.</p> : null}
              <div className="space-y-4">
                {user.addresses.map((a) => (
                  <div key={a.id} className="text-sm">
                    <p className="font-medium text-ink">
                      {a.label ?? "Address"}
                      {a.isDefault ? <span className="ml-2 font-normal text-muted">Default</span> : null}
                    </p>
                    <p className="leading-relaxed whitespace-pre-line text-muted">
                      {[`${a.firstName} ${a.lastName}`, a.company, a.line1, a.line2, `${a.city} ${a.state} ${a.postcode}`, a.country].filter(Boolean).join("\n")}
                    </p>
                  </div>
                ))}
              </div>
            </Panel>
          </div>
        </div>

        <div className="min-w-0 space-y-6">
          <Panel title="Profile">
            <a href={`mailto:${user.email}`} className={`${textAction} text-sm break-all`}>
              {user.email}
            </a>
            <DefinitionList
              className="mt-3"
              items={[
                { label: "Phone", value: user.phone ? <span className="tabular">{user.phone}</span> : null },
                { label: "Institution", value: user.institution },
                { label: "Role", value: user.role === "ADMIN" ? "Admin" : "Customer" },
                { label: "Status", value: user.status === "ACTIVE" ? "Active" : "Suspended" },
                { label: "Marketing emails", value: user.marketingOptIn ? "Opted in" : "Not opted in" },
              ]}
            />
          </Panel>

          <Panel title="Account actions">
            <div className="space-y-2">
              <QuickAction action={sendPasswordReset.bind(null, user.id)} label="Email Password Reset Link" />
              {user.role === "ADMIN" ? (
                isSelf ? (
                  <p className="text-small text-muted">This is your account, so you can&apos;t remove your own admin access or suspend it.</p>
                ) : (
                  <QuickAction
                    action={setCustomerRole.bind(null, user.id)}
                    hidden={{ role: "CUSTOMER" }}
                    label="Remove Admin Access"
                    confirm={`Remove admin access from ${name}? They keep their customer account.`}
                  />
                )
              ) : (
                <QuickAction
                  action={setCustomerRole.bind(null, user.id)}
                  hidden={{ role: "ADMIN" }}
                  label="Make Admin"
                  confirm={`Give ${name} full admin access? They will see every order and customer.`}
                />
              )}
            </div>
            {user.status === "ACTIVE" ? (
              !isSelf ? (
                <div className="mt-5 border-t border-ink/[0.07] pt-4">
                  <p className="mb-2 text-small text-muted">Suspending signs them out and blocks sign-in. Their orders are kept.</p>
                  <QuickAction
                    action={setCustomerStatus.bind(null, user.id)}
                    hidden={{ status: "SUSPENDED" }}
                    label="Suspend Account"
                    variant="danger"
                    confirm={`Suspend ${name}? They will be signed out and unable to sign in until reactivated.`}
                  />
                </div>
              ) : null
            ) : (
              <div className="mt-5 border-t border-ink/[0.07] pt-4">
                <QuickAction action={setCustomerStatus.bind(null, user.id)} hidden={{ status: "ACTIVE" }} label="Reactivate Account" variant="ink" />
              </div>
            )}
          </Panel>

          <Panel title="Internal notes" description="Only admins see these.">
            <CustomerNotesForm action={saveCustomerNotes.bind(null, user.id)} value={user.adminNotes} />
          </Panel>
        </div>
      </div>
    </>
  );
}
