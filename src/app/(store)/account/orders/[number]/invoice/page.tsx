import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { Invoice } from "@/components/account/invoice";

export async function generateMetadata({ params }: { params: Promise<{ number: string }> }) {
  const { number } = await params;
  return { title: `Invoice ${decodeURIComponent(number)}` };
}

export default async function AccountInvoicePage({ params }: { params: Promise<{ number: string }> }) {
  const { number } = await params;
  const user = await requireUser(`/account/orders/${number}/invoice`);
  const order = await db.order.findUnique({ where: { number: decodeURIComponent(number) }, include: { items: true } });
  if (!order || order.userId !== user.id) notFound();
  const settings = await getSettings();
  return <Invoice order={order} settings={settings} backHref={`/account/orders/${order.number}`} />;
}
