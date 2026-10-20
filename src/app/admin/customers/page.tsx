import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { formatMoney } from "@/lib/money";
import { formatDate } from "@/lib/utils";
import { ListFilters } from "@/components/admin/filters";
import { AccountPill, EmptyState, PageHeader, Pagination, TableWrap, Td, Th } from "@/components/admin/ui";

export const metadata = { title: "Customers" };

const PAGE_SIZE = 25;
const nf = new Intl.NumberFormat("en-AU");

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

  const [users, total, everyone] = await Promise.all([
    db.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { _count: { select: { orders: true } } },
    }),
    db.user.count({ where }),
    db.user.count(),
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
      <PageHeader title="Customers" description={`${nf.format(everyone)} accounts. Lifetime spend counts paid orders that were not cancelled or refunded.`} />
      <ListFilters
        label="Search customers"
        placeholder="Name, email or institution…"
        selectName="filter"
        selectLabel="Filter customers"
        selectOptions={[
          { value: "", label: "All accounts" },
          { value: "ADMIN", label: "Admins" },
          { value: "SUSPENDED", label: "Suspended" },
          { value: "OPTIN", label: "Marketing opt-in" },
        ]}
        count={`${nf.format(total)} account${total === 1 ? "" : "s"}`}
      />
      <TableWrap minWidth={0}>
        <thead>
          <tr>
            <Th>Customer</Th>
            <Th className="hidden lg:table-cell">Institution</Th>
            <Th className="hidden text-right md:table-cell">Orders</Th>
            <Th className="text-right">Lifetime spend</Th>
            <Th className="hidden text-right lg:table-cell">Joined</Th>
            <Th className="hidden text-right xl:table-cell">Last sign-in</Th>
            <Th className="hidden sm:table-cell">Status</Th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 ? (
            <tr>
              <Td colSpan={7} className="p-0">
                <EmptyState title="No customers match this search." description="Try another name, or clear the filter." />
              </Td>
            </tr>
          ) : null}
          {users.map((u) => (
            <tr key={u.id} className="hover:bg-surface/50">
              <Td>
                <Link href={`/admin/customers/${u.id}`} className="font-medium text-ink hover:underline">
                  {u.firstName} {u.lastName}
                </Link>
                <p className="max-w-[32ch] truncate text-small text-muted">{u.email}</p>
              </Td>
              <Td className="hidden max-w-[24ch] truncate text-muted lg:table-cell">{u.institution ?? "–"}</Td>
              <Td className="tabular hidden text-right md:table-cell">{u._count.orders}</Td>
              <Td className="tabular text-right font-medium">{formatMoney(spendFor(u.id))}</Td>
              <Td className="tabular hidden text-right whitespace-nowrap text-muted lg:table-cell">{formatDate(u.createdAt)}</Td>
              <Td className="tabular hidden text-right whitespace-nowrap text-muted xl:table-cell">{u.lastLoginAt ? formatDate(u.lastLoginAt) : "–"}</Td>
              <Td className="hidden sm:table-cell">
                <AccountPill role={u.role} status={u.status} />
              </Td>
            </tr>
          ))}
        </tbody>
      </TableWrap>
      <Pagination
        page={page}
        pageCount={Math.ceil(total / PAGE_SIZE)}
        total={total}
        pageSize={PAGE_SIZE}
        noun="account"
        makeHref={(p) => {
          const next = new URLSearchParams(params);
          next.set("page", String(p));
          return `/admin/customers?${next}`;
        }}
      />
    </>
  );
}
