import Link from "next/link";
import { Tag } from "lucide-react";
import { db } from "@/lib/db";
import { formatMoney, fromCents } from "@/lib/money";
import { formatDate } from "@/lib/utils";
import { toDateInput } from "@/lib/admin/format";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { CouponForm } from "@/components/admin/coupon-form";
import { EmptyState, PageHeader, TableWrap, Td, Th } from "@/components/admin/ui";
import { deleteCoupon, saveCoupon, toggleCoupon } from "./actions";

export const metadata = { title: "Coupons" };

function couponState(c: { active: boolean; startsAt: Date | null; expiresAt: Date | null; maxUses: number | null; usedCount: number }) {
  const now = new Date();
  if (!c.active) return { label: "Disabled", tone: "" };
  if (c.expiresAt && c.expiresAt < now) return { label: "Expired", tone: "bg-slate-100 text-slate-600" };
  if (c.startsAt && c.startsAt > now) return { label: "Scheduled", tone: "bg-sky-50 text-sky-700 ring-sky-600/20" };
  if (c.maxUses && c.usedCount >= c.maxUses) return { label: "Used up", tone: "bg-amber-50 text-amber-700 ring-amber-600/20" };
  return { label: "Live", tone: "bg-emerald-50 text-emerald-700 ring-emerald-600/20" };
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

  return (
    <>
      <PageHeader title="Coupons" description="Discount codes customers can apply at checkout." />
      {sp.saved ? (
        <Alert tone="success" className="mb-6">
          Coupon <span className="font-mono font-semibold">{sp.saved}</span> saved.
        </Alert>
      ) : null}
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <TableWrap>
          <thead>
            <tr>
              <Th>Code</Th>
              <Th>Discount</Th>
              <Th>Conditions</Th>
              <Th>Usage</Th>
              <Th>Paid orders</Th>
              <Th>Status</Th>
              <Th className="text-right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {coupons.length === 0 ? (
              <tr>
                <Td colSpan={7}>
                  <EmptyState icon={Tag} title="No coupons yet" description="Create one with the form." />
                </Td>
              </tr>
            ) : null}
            {coupons.map((c) => {
              const state = couponState(c);
              const stats = statsFor(c.code);
              return (
                <tr key={c.id} className={`hover:bg-slate-50 ${sp.edit === c.id ? "bg-mint-50/50" : ""}`}>
                  <Td>
                    <Link href={`/admin/coupons?edit=${c.id}`} className="font-mono text-sm font-semibold text-ink-900 hover:text-mint-700">
                      {c.code}
                    </Link>
                    {c.description ? <p className="text-xs text-slate-500">{c.description}</p> : null}
                  </Td>
                  <Td className="font-semibold">{c.type === "PERCENT" ? `${c.value}%` : formatMoney(c.value)}</Td>
                  <Td className="text-xs text-slate-500">
                    {c.minSubtotal ? <p>Min {formatMoney(c.minSubtotal)}</p> : <p>No minimum</p>}
                    {c.expiresAt ? <p>Until {formatDate(c.expiresAt)}</p> : null}
                    {c.startsAt ? <p>From {formatDate(c.startsAt)}</p> : null}
                  </Td>
                  <Td className="tabular-nums">
                    {c.usedCount}
                    {c.maxUses ? <span className="text-slate-400"> / {c.maxUses}</span> : null}
                  </Td>
                  <Td className="text-xs text-slate-600">
                    {stats ? (
                      <>
                        <p>{stats._count} orders · {formatMoney(stats._sum.total ?? 0)}</p>
                        <p className="text-slate-400">−{formatMoney(stats._sum.discount ?? 0)} discounted</p>
                      </>
                    ) : (
                      "—"
                    )}
                  </Td>
                  <Td>
                    <Badge className={state.tone}>{state.label}</Badge>
                  </Td>
                  <Td>
                    <div className="flex justify-end gap-1">
                      <ConfirmButton action={toggleCoupon.bind(null, c.id)} message="" variant="ghost">
                        {c.active ? "Disable" : "Enable"}
                      </ConfirmButton>
                      <ConfirmButton action={deleteCoupon.bind(null, c.id)} message={`Delete coupon ${c.code}?`} variant="ghost" className="text-rose-600 hover:bg-rose-50">
                        Delete
                      </ConfirmButton>
                    </div>
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </TableWrap>

        <Card className="xl:sticky xl:top-24 xl:self-start">
          <CardHeader
            title={editing ? `Edit ${editing.code}` : "New coupon"}
            action={
              editing ? (
                <Link href="/admin/coupons" className="text-xs font-semibold text-mint-700">
                  + New instead
                </Link>
              ) : null
            }
          />
          <CardBody>
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
          </CardBody>
        </Card>
      </div>
    </>
  );
}
