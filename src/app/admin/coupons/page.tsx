import Link from "next/link";
import { db } from "@/lib/db";
import { formatMoney, fromCents } from "@/lib/money";
import { formatDate } from "@/lib/utils";
import { toDateInput } from "@/lib/admin/format";
import { Alert } from "@/components/ui/alert";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { CouponForm } from "@/components/admin/coupon-form";
import { EmptyState, PageHeader, Panel, TableWrap, Td, Th, textAction } from "@/components/admin/ui";
import { deleteCoupon, saveCoupon, toggleCoupon } from "./actions";

export const metadata = { title: "Coupons" };

function couponState(c: { active: boolean; startsAt: Date | null; expiresAt: Date | null; maxUses: number | null; usedCount: number }) {
  const now = new Date();
  if (!c.active) return { label: "Disabled", tone: "bg-surface text-muted" };
  if (c.expiresAt && c.expiresAt < now) return { label: "Expired", tone: "bg-surface text-muted" };
  if (c.startsAt && c.startsAt > now) return { label: "Scheduled", tone: "bg-[#e3f8fd] text-[#0c4a5e]" };
  if (c.maxUses && c.usedCount >= c.maxUses) return { label: "Used up", tone: "bg-[#fffbeb] text-[#92400e]" };
  return { label: "Live", tone: "bg-[#dcfae5] text-[#04250e]" };
}

export default async function CouponsPage({ searchParams }: { searchParams: Promise<{ edit?: string; saved?: string }> }) {
  const sp = await searchParams;
  const [coupons, editing, revenue] = await Promise.all([
    db.coupon.findMany({ orderBy: { createdAt: "desc" } }),
    sp.edit ? db.coupon.findUnique({ where: { id: sp.edit } }) : null,
    db.order.groupBy({
      by: ["couponCode"],
      where: { couponCode: { not: null }, paymentStatus: "PAID" },
      _sum: { discount: true, total: true },
      _count: true,
    }),
  ]);
  const statsFor = (code: string) => revenue.find((r) => r.couponCode === code);
  const live = coupons.filter((c) => couponState(c).label === "Live").length;

  return (
    <>
      <PageHeader title="Coupons" description={`Discount codes customers apply at checkout. ${live} of ${coupons.length} ${coupons.length === 1 ? "is" : "are"} live.`} />
      {sp.saved ? (
        <Alert tone="success" className="mb-6">
          Coupon <span className="tabular font-medium">{sp.saved}</span> saved.
        </Alert>
      ) : null}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <TableWrap minWidth={0} className="self-start">
          <thead>
            <tr>
              <Th>Code</Th>
              <Th className="text-right">Discount</Th>
              <Th className="hidden text-right md:table-cell">Used</Th>
              <Th className="hidden text-right 2xl:table-cell">Paid orders</Th>
              <Th className="hidden sm:table-cell">Status</Th>
              <Th className="text-right">
                <span className="sr-only">Actions</span>
              </Th>
            </tr>
          </thead>
          <tbody>
            {coupons.length === 0 ? (
              <tr>
                <Td colSpan={6} className="p-0">
                  <EmptyState title="No coupons yet." description="Create one with the form beside this table." />
                </Td>
              </tr>
            ) : null}
            {coupons.map((c) => {
              const state = couponState(c);
              const stats = statsFor(c.code);
              const conditions = [
                c.minSubtotal ? `Min ${formatMoney(c.minSubtotal)}` : "No minimum",
                c.startsAt ? `from ${formatDate(c.startsAt)}` : null,
                c.expiresAt ? `until ${formatDate(c.expiresAt)}` : null,
              ].filter(Boolean);
              return (
                <tr key={c.id} className={sp.edit === c.id ? "bg-surface" : "hover:bg-surface/50"}>
                  <Td>
                    <Link href={`/admin/coupons?edit=${c.id}`} className="tabular font-medium text-ink hover:underline" aria-current={sp.edit === c.id ? "true" : undefined}>
                      {c.code}
                    </Link>
                    {c.description ? <p className="max-w-[18ch] truncate text-small text-muted sm:max-w-[34ch]">{c.description}</p> : null}
                    <p className="tabular text-small text-muted">{conditions.join(", ")}</p>
                  </Td>
                  <Td className="tabular text-right font-medium">{c.type === "PERCENT" ? `${c.value}%` : formatMoney(c.value)}</Td>
                  <Td className="tabular hidden text-right whitespace-nowrap md:table-cell">
                    {c.usedCount}
                    {c.maxUses ? <span className="text-muted"> of {c.maxUses}</span> : null}
                  </Td>
                  <Td className="tabular hidden text-right whitespace-nowrap 2xl:table-cell">
                    {stats ? (
                      <>
                        <p>{formatMoney(stats._sum.total ?? 0)}</p>
                        <p className="text-small text-muted">
                          {stats._count} orders, −{formatMoney(stats._sum.discount ?? 0)} off
                        </p>
                      </>
                    ) : (
                      <span className="text-muted">–</span>
                    )}
                  </Td>
                  <Td className="hidden sm:table-cell">
                    <span className={`inline-flex h-6 items-center rounded-full px-2.5 text-small leading-none font-medium whitespace-nowrap ${state.tone}`}>{state.label}</span>
                  </Td>
                  <Td>
                    <div className="flex justify-end gap-1">
                      {/* Phone: toggle from the edit form's Active box instead. */}
                      <div className="hidden sm:block">
                        <ConfirmButton
                          action={toggleCoupon.bind(null, c.id)}
                          message={c.active ? `Disable ${c.code}? Customers can no longer apply it.` : ""}
                          variant="ghost"
                          className="h-8"
                        >
                          {c.active ? "Disable" : "Enable"}
                        </ConfirmButton>
                      </div>
                      <ConfirmButton
                        action={deleteCoupon.bind(null, c.id)}
                        message={`Delete coupon ${c.code}? Past orders keep their discount. This can't be undone.`}
                        variant="ghost"
                        className="h-8 text-danger hover:bg-[#ffedea]"
                      >
                        Delete
                      </ConfirmButton>
                    </div>
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </TableWrap>

        <Panel
          className="xl:sticky xl:top-8 xl:self-start"
          title={editing ? `Edit ${editing.code}` : "New coupon"}
          action={
            editing ? (
              <Link href="/admin/coupons" className={textAction}>
                New Coupon Instead
              </Link>
            ) : null
          }
        >
          <CouponForm
            key={editing?.id ?? "new"}
            action={saveCoupon.bind(null, editing?.id ?? null)}
            initial={
              editing
                ? {
                    ...editing,
                    value: editing.type === "PERCENT" ? String(editing.value) : fromCents(editing.value),
                    minSubtotal: fromCents(editing.minSubtotal),
                    startsAt: toDateInput(editing.startsAt),
                    expiresAt: toDateInput(editing.expiresAt),
                  }
                : undefined
            }
          />
        </Panel>
      </div>
    </>
  );
}
