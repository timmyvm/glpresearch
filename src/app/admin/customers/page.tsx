import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { Users } from "lucide-react";
import { db } from "@/lib/db";
import { formatMoney } from "@/lib/money";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ListFilters } from "@/components/admin/filters";
import { EmptyState, PageHeader, Pagination, TableWrap, Td, Th } from "@/components/admin/ui";

export const metadata = { title: "Customers" };

const PAGE_SIZE = 25;

export default async function CustomersPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const where: Prisma.UserWhereInput = {};
  if (sp.filter === "ADMIN") where.role = "ADMIN";
  if (sp.filter === "SUSPENDED") where.status = "SUSPENDED";
  if (sp.filter === "OPTIN") where.marketingOptIn = true;
  const q = sp.q?.trim();
  if (q) {
    where.OR = [
      { email: { contains: q.toLowerCase() } },
      { firstName: { contains: q } },
      { lastName: { contains: q } },
      { institution: { contains: q } },
    ];
  }

  const [users, total] = await Promise.all([
    db.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { _count: { select: { orders: true } } },
    }),
    db.user.count({ where }),
  ]);
  const spend = await db.order.groupBy({
    by: ["userId"],
    where: { userId: { in: users.map((u) => u.id) }, paymentStatus: "PAID", status: { notIn: ["CANCELLED", "REFUNDED"] } },
    _sum: { total: true },
  });
  const spendFor = (id: string) => spend.find((s) => s.userId === id)?._sum.total ?? 0;

  const params = new URLSearchParams();
  if (sp.q) params.set("q", sp.q);
  if (sp.filter) params.set("filter", sp.filter);

  return (
    <>
      <PageHeader title="Customers" description="Accounts, order history and lifetime value." />
      <ListFilters
        placeholder="Search name, email or institution…"
        selectName="filter"
        selectLabel="Filter customers"
        selectOptions={[
          { value: "", label: "All accounts" },
          { value: "ADMIN", label: "Admins" },
          { value: "SUSPENDED", label: "Suspended" },
          { value: "OPTIN", label: "Marketing opt-in" },
        ]}
      />
      <TableWrap>
        <thead>
          <tr>
            <Th>Customer</Th>
            <Th>Institution</Th>
            <Th>Orders</Th>
            <Th>Lifetime spend</Th>
            <Th>Joined</Th>
            <Th>Last sign-in</Th>
            <Th>Status</Th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 ? (
            <tr>
              <Td colSpan={7}>
                <EmptyState icon={Users} title="No customers found" />
              </Td>
            </tr>
          ) : null}
          {users.map((u) => (
            <tr key={u.id} className="group hover:bg-slate-50">
              <Td>
                <Link href={`/admin/customers/${u.id}`} className="flex items-center gap-3">
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-ink-100 text-xs font-semibold text-ink-700">
                    {u.firstName[0]}
                    {u.lastName[0]}
                  </span>
                  <span>
                    <span className="block font-medium text-ink-900 group-hover:text-mint-700">
                      {u.firstName} {u.lastName}
                    </span>
                    <span className="block text-xs text-slate-500">{u.email}</span>
                  </span>
                </Link>
              </Td>
              <Td className="text-xs text-slate-600">{u.institution ?? "—"}</Td>
              <Td className="tabular-nums">{u._count.orders}</Td>
              <Td className="font-semibold tabular-nums">{formatMoney(spendFor(u.id))}</Td>
              <Td className="text-xs whitespace-nowrap text-slate-500">{formatDate(u.createdAt)}</Td>
              <Td className="text-xs whitespace-nowrap text-slate-500">{u.lastLoginAt ? formatDate(u.lastLoginAt) : "—"}</Td>
              <Td>
                <div className="flex flex-wrap gap-1">
                  {u.role === "ADMIN" ? <Badge className="bg-ink-900 text-white ring-ink-900">Admin</Badge> : null}
                  {u.status === "SUSPENDED" ? (
                    <Badge className="bg-rose-50 text-rose-700 ring-rose-600/20">Suspended</Badge>
                  ) : (
                    <Badge className="bg-emerald-50 text-emerald-700 ring-emerald-600/20">Active</Badge>
                  )}
                </div>
              </Td>
            </tr>
          ))}
        </tbody>
      </TableWrap>
      <Pagination
        page={page}
        pageCount={Math.ceil(total / PAGE_SIZE)}
        total={total}
        makeHref={(p) => {
          const next = new URLSearchParams(params);
          next.set("page", String(p));
          return `/admin/customers?${next}`;
        }}
      />
    </>
  );
}
