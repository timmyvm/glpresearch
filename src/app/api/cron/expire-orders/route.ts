import { NextResponse } from "next/server";
import { expireUnpaidOrders } from "@/lib/admin/expire-orders";

export const dynamic = "force-dynamic";

// Hourly via vercel.json. Vercel Cron sends `Authorization: Bearer $CRON_SECRET`.
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return NextResponse.json({ error: "CRON_SECRET is not configured." }, { status: 500 });
  if (request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const cancelled = await expireUnpaidOrders();
  return NextResponse.json({ cancelled: cancelled.length, orders: cancelled });
}
