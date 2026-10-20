import { ChevronRight } from "lucide-react";
import { db } from "@/lib/db";
import { cn, formatDateTime } from "@/lib/utils";
import { EmptyState, Notice, PageHeader, Pagination } from "@/components/admin/ui";
import { ListFilters } from "@/components/admin/filters";

export const metadata = { title: "Email log" };

const PAGE_SIZE = 50;
const STATUS: Record<string, { label: string; tone: string }> = {
  SENT: { label: "Sent", tone: "bg-[#dcfae5] text-[#04250e]" },
  LOGGED: { label: "Logged", tone: "bg-surface text-muted" },
  FAILED: { label: "Failed", tone: "bg-[#ffedea] text-[#831c1e]" },
};

export default async function EmailLogPage({ searchParams }: { searchParams: Promise<{ q?: string; page?: string }> }) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const q = sp.q?.trim();
  const now = new Date();
  const where = q ? { OR: [{ to: { contains: q.toLowerCase() } }, { subject: { contains: q } }] } : {};
  const [emails, total, failed] = await Promise.all([
    db.emailLog.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE }),
    db.emailLog.count({ where }),
    db.emailLog.count({ where: { status: "FAILED", createdAt: { gte: new Date(now.getTime() - 7 * 86_400_000) } } }),
  ]);

  return (
    <>
      <PageHeader
        title="Email log"
        description={`Every email the store has generated: order confirmations, status updates, restock alerts and password resets.${
          failed ? ` ${failed} failed in the last 7 days.` : ""
        }`}
      />
      {!process.env.RESEND_API_KEY ? (
        <Notice className="mb-6">
          Emails are logged here but not delivered. Add a <code className="font-mono">RESEND_API_KEY</code> environment variable to send them to customers.
        </Notice>
      ) : null}
      <ListFilters label="Search emails" placeholder="Recipient or subject…" count={`${total.toLocaleString("en-AU")} email${total === 1 ? "" : "s"}`} />
      <div className="border border-ink/10 bg-white">
        {emails.length === 0 ? <EmptyState title={q ? "No emails match this search." : "No emails yet."} /> : null}
        <ul>
          {emails.map((e, i) => {
            const s = STATUS[e.status] ?? { label: e.status, tone: "bg-surface text-muted" };
            return (
              <li key={e.id} className={i ? "border-t border-ink/[0.07]" : undefined}>
                <details className="group">
                  <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-3 hover:bg-surface/50 sm:gap-4 sm:px-5 [&::-webkit-details-marker]:hidden">
                    <span className={cn("inline-flex h-6 w-16 shrink-0 items-center justify-center rounded-full text-small leading-none font-medium", s.tone)}>{s.label}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-ink">{e.subject}</p>
                      <p className="truncate text-small text-muted">
                        To {e.to}
                        <span className="tabular sm:hidden">, {formatDateTime(e.createdAt)}</span>
                      </p>
                    </div>
                    <span className="tabular hidden shrink-0 text-small text-muted sm:block">{formatDateTime(e.createdAt)}</span>
                    <ChevronRight className="size-4 shrink-0 text-muted transition-transform duration-150 group-open:rotate-90" aria-hidden="true" />
                  </summary>
                  <pre className="mx-4 mb-4 overflow-x-auto bg-surface p-4 font-mono text-small leading-relaxed whitespace-pre-wrap text-ink sm:mx-5">{e.body}</pre>
                </details>
              </li>
            );
          })}
        </ul>
      </div>
      <Pagination
        page={page}
        pageCount={Math.ceil(total / PAGE_SIZE)}
        total={total}
        pageSize={PAGE_SIZE}
        noun="email"
        makeHref={(p) => `/admin/emails?${new URLSearchParams({ ...(q ? { q } : {}), page: String(p) })}`}
      />
    </>
  );
}
