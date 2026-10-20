import { MailCheck } from "lucide-react";
import { db } from "@/lib/db";
import { formatDateTime } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";
import { EmptyState, PageHeader, Pagination } from "@/components/admin/ui";
import { ListFilters } from "@/components/admin/filters";

export const metadata = { title: "Email log" };

const PAGE_SIZE = 50;
const TONE: Record<string, string> = {
  SENT: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  LOGGED: "bg-slate-100 text-slate-600",
  FAILED: "bg-rose-50 text-rose-700 ring-rose-600/20",
};

export default async function EmailLogPage({ searchParams }: { searchParams: Promise<{ q?: string; page?: string }> }) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const q = sp.q?.trim();
  const where = q ? { OR: [{ to: { contains: q.toLowerCase() } }, { subject: { contains: q } }] } : {};
  const [emails, total] = await Promise.all([
    db.emailLog.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE }),
    db.emailLog.count({ where }),
  ]);

  return (
    <>
      <PageHeader title="Email log" description="Every transactional email the store has generated — order confirmations, status updates, password resets." />
      {!process.env.RESEND_API_KEY ? (
        <Alert tone="info" className="mb-6" title="Emails are being logged, not sent">
          Add a <code className="font-mono">RESEND_API_KEY</code> environment variable to deliver emails to customers. Until then you can read
          exactly what would have been sent below.
        </Alert>
      ) : null}
      <ListFilters placeholder="Search recipient or subject…" />
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
        {emails.length === 0 ? <EmptyState icon={MailCheck} title="No emails yet" /> : null}
        <ul className="divide-y divide-slate-100">
          {emails.map((e) => (
            <li key={e.id}>
              <details className="group">
                <summary className="flex cursor-pointer list-none items-center gap-4 px-5 py-3 hover:bg-slate-50">
                  <Badge className={TONE[e.status] ?? ""}>{e.status.toLowerCase()}</Badge>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink-900">{e.subject}</p>
                    <p className="truncate text-xs text-slate-500">To {e.to}</p>
                  </div>
                  <span className="shrink-0 text-xs text-slate-400">{formatDateTime(e.createdAt)}</span>
                  <span className="text-xs text-slate-400 transition-transform group-open:rotate-90">›</span>
                </summary>
                <pre className="mx-5 mb-4 overflow-x-auto rounded-xl bg-slate-50 p-4 font-mono text-xs leading-relaxed whitespace-pre-wrap text-ink-800">{e.body}</pre>
              </details>
            </li>
          ))}
        </ul>
      </div>
      <Pagination
        page={page}
        pageCount={Math.ceil(total / PAGE_SIZE)}
        total={total}
        makeHref={(p) => `/admin/emails?${new URLSearchParams({ ...(q ? { q } : {}), page: String(p) })}`}
      />
    </>
  );
}
