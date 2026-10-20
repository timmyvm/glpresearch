import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { Invoice } from "@/components/account/invoice";
import { canAccessOrder } from "../../access";

export const metadata: Metadata = { title: "Invoice", robots: { index: false, follow: false } };

export default async function GuestInvoicePage({
  params,
  searchParams,
}: {
  params: Promise<{ number: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const [{ number }, { token }] = await Promise.all([params, searchParams]);
  const order = await db.order.findUnique({ where: { number: decodeURIComponent(number) }, include: { items: true } });
  if (!order || !(await canAccessOrder(order, token))) notFound();
  const settings = await getSettings();
  const back = `/order/${order.number}${token ? `?token=${encodeURIComponent(token)}` : ""}`;
  return <Invoice order={order} settings={settings} backHref={back} />;
}
