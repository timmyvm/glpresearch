import type { Prisma } from "@prisma/client";
import { isOrderStatus } from "@/lib/orders";

export type OrderFilters = { q?: string; status?: string };

/** Shared filter logic for the orders table and the CSV export. */
export function orderWhere({ q, status }: OrderFilters): Prisma.OrderWhereInput {
  const where: Prisma.OrderWhereInput = {};
  if (status && isOrderStatus(status)) where.status = status;
  const term = q?.trim();
  if (term) {
    where.OR = [
      { number: { contains: term } },
      { email: { contains: term.toLowerCase() } },
      { shipFirstName: { contains: term } },
      { shipLastName: { contains: term } },
      { user: { is: { firstName: { contains: term } } } },
      { user: { is: { lastName: { contains: term } } } },
    ];
  }
  return where;
}
