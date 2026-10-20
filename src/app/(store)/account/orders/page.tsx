import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { formatMoney } from "@/lib/money";
import { formatDate } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import { OrderListHead, OrderRow, PageTitle } from "@/components/account/account-ui";

export const metadata = { title: "Orders" };

export default async function AccountOrdersPage() {
  const user = await requireUser("/account/orders");
  const orders = await db.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      number: true,
      status: true,
      total: true,
      createdAt: true,
      items: { select: { id: true, quantity: true, productName: true, image: true } },
    },
  });
  const awaiting = orders.filter((o) => o.status === "PENDING_PAYMENT");
  const first = orders.at(-1);
  const owed = awaiting.reduce((s, o) => s + o.total, 0);

  return (
    <div className="space-y-6">
      <PageTitle title="Orders">
        {first
          ? `${orders.length} ${orders.length === 1 ? "order" : "orders"} since ${formatDate(first.createdAt)}${
              awaiting.length ? `, ${awaiting.length} awaiting payment (${formatMoney(owed)})` : ""
            }.`
          : "Every order you place while signed in is kept here, with its invoice and tracking."}
      </PageTitle>

      <Card>
        {orders.length === 0 ? (
          <div className="px-5 py-8">
            <p className="text-small text-muted">No orders yet.</p>
            <ButtonLink href="/shop" className="mt-5">
              Shop Peptides
            </ButtonLink>
          </div>
        ) : (
          <>
            <OrderListHead />
            <ul aria-label="Your orders" className="py-1">
              {orders.map((order) => (
                <OrderRow key={order.id} order={order} />
              ))}
            </ul>
          </>
        )}
      </Card>
    </div>
  );
}
