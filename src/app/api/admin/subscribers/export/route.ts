import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { csvResponse, toCsv } from "@/lib/admin/csv";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") return new Response("Unauthorized", { status: 401 });

  const [subscribers, optedIn] = await Promise.all([
    db.subscriber.findMany({ orderBy: { createdAt: "desc" } }),
    db.user.findMany({ where: { marketingOptIn: true, status: "ACTIVE" }, select: { email: true, firstName: true, lastName: true, createdAt: true } }),
  ]);

  const rows = new Map<string, [string, string, string, Date]>();
  for (const s of subscribers) rows.set(s.email, [s.email, "", "Newsletter form", s.createdAt]);
  for (const u of optedIn) if (!rows.has(u.email)) rows.set(u.email, [u.email, `${u.firstName} ${u.lastName}`, "Customer opt-in", u.createdAt]);

  return csvResponse(`subscribers-${new Date().toISOString().slice(0, 10)}.csv`, toCsv(["Email", "Name", "Source", "Subscribed"], [...rows.values()]));
}
