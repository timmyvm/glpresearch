import Link from "next/link";
import { Archive, Download, Inbox, Mail, Reply, Trash2, Users } from "lucide-react";
import { db } from "@/lib/db";
import { cn, formatDate, formatDateTime } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { buttonClass } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { EmptyState, PageHeader, TableWrap, Td, Th } from "@/components/admin/ui";
import { deleteMessage, deleteSubscriber, setMessageStatus } from "./actions";

export const metadata = { title: "Inbox" };

const FILTERS = [
  { value: "", label: "Open" },
  { value: "NEW", label: "New" },
  { value: "READ", label: "Read" },
  { value: "REPLIED", label: "Replied" },
  { value: "ARCHIVED", label: "Archived" },
  { value: "ALL", label: "All" },
];

const TONE: Record<string, string> = {
  NEW: "bg-mint-50 text-mint-700 ring-mint-600/20",
  READ: "bg-slate-100 text-slate-600",
  REPLIED: "bg-sky-50 text-sky-700 ring-sky-600/20",
  ARCHIVED: "bg-slate-100 text-slate-400",
};

export default async function MessagesPage({ searchParams }: { searchParams: Promise<{ tab?: string; status?: string; id?: string }> }) {
  const sp = await searchParams;
  const tab = sp.tab === "subscribers" ? "subscribers" : "messages";

  const counts = await db.contactMessage.groupBy({ by: ["status"], _count: true });
  const count = (s: string) => counts.find((c) => c.status === s)?._count ?? 0;
  const subscriberCount = await db.subscriber.count();

  const tabs = (
    <div className="mb-6 flex gap-1 border-b border-slate-200">
      <Link
        href="/admin/messages"
        className={cn("-mb-px flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium", tab === "messages" ? "border-ink-900 text-ink-900" : "border-transparent text-slate-500 hover:text-ink-900")}
      >
        <Mail className="size-4" /> Messages {count("NEW") ? <Badge className={TONE.NEW}>{count("NEW")} new</Badge> : null}
      </Link>
      <Link
        href="/admin/messages?tab=subscribers"
        className={cn("-mb-px flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium", tab === "subscribers" ? "border-ink-900 text-ink-900" : "border-transparent text-slate-500 hover:text-ink-900")}
      >
        <Users className="size-4" /> Subscribers <Badge>{subscriberCount}</Badge>
      </Link>
    </div>
  );

  if (tab === "subscribers") {
    const subscribers = await db.subscriber.findMany({ orderBy: { createdAt: "desc" } });
    return (
      <>
        <PageHeader
          title="Inbox"
          description="Contact form messages and newsletter subscribers."
          actions={
            <a href="/api/admin/subscribers/export" className={buttonClass("outline", "md")}>
              <Download className="size-4" /> Export CSV
            </a>
          }
        />
        {tabs}
        <p className="mb-3 text-xs text-slate-500">The CSV export also includes customers who opted in to marketing emails at sign-up.</p>
        <TableWrap>
          <thead>
            <tr>
              <Th>Email</Th>
              <Th>Subscribed</Th>
              <Th className="text-right">Remove</Th>
            </tr>
          </thead>
          <tbody>
            {subscribers.length === 0 ? (
              <tr>
                <Td colSpan={3}>
                  <EmptyState icon={Users} title="No subscribers yet" />
                </Td>
              </tr>
            ) : null}
            {subscribers.map((s) => (
              <tr key={s.id} className="hover:bg-slate-50">
                <Td className="font-medium">{s.email}</Td>
                <Td className="text-xs text-slate-500">{formatDateTime(s.createdAt)}</Td>
                <Td>
                  <div className="flex justify-end">
                    <ConfirmButton action={deleteSubscriber.bind(null, s.id)} message={`Remove ${s.email}?`} variant="ghost">
                      <Trash2 className="size-3.5" />
                    </ConfirmButton>
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </TableWrap>
      </>
    );
  }

  const status = sp.status ?? "";
  const where = status === "ALL" ? {} : status ? { status } : { status: { not: "ARCHIVED" } };
  const messages = await db.contactMessage.findMany({ where, orderBy: { createdAt: "desc" } });
  let selected = sp.id ? await db.contactMessage.findUnique({ where: { id: sp.id } }) : null;
  if (selected?.status === "NEW") {
    selected = await db.contactMessage.update({ where: { id: selected.id }, data: { status: "READ" } });
  }
  const order = selected?.orderNumber ? await db.order.findUnique({ where: { number: selected.orderNumber }, select: { id: true } }) : null;
  const customer = selected ? await db.user.findUnique({ where: { email: selected.email }, select: { id: true } }) : null;

  const qs = (extra: Record<string, string>) => {
    const p = new URLSearchParams();
    if (status) p.set("status", status);
    for (const [k, v] of Object.entries(extra)) p.set(k, v);
    return `/admin/messages?${p}`;
  };

  return (
    <>
      <PageHeader title="Inbox" description="Contact form messages and newsletter subscribers." />
      {tabs}
      <div className="mb-4 flex flex-wrap gap-1.5">
        {FILTERS.map((f) => (
          <Link
            key={f.value}
            href={f.value ? `/admin/messages?status=${f.value}` : "/admin/messages"}
            className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${status === f.value ? "bg-ink-900 text-white ring-ink-900" : "bg-white text-slate-600 ring-slate-200 hover:bg-slate-50"}`}
          >
            {f.label}
            {f.value && f.value !== "ALL" ? ` · ${count(f.value)}` : ""}
          </Link>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,380px)_1fr]">
        <Card className="overflow-hidden">
          {messages.length === 0 ? <EmptyState icon={Inbox} title="Nothing here" description="No messages match this filter." /> : null}
          <ul className="max-h-[70vh] divide-y divide-slate-100 overflow-y-auto">
            {messages.map((m) => (
              <li key={m.id}>
                <Link href={qs({ id: m.id })} className={cn("block px-4 py-3 hover:bg-slate-50", selected?.id === m.id && "bg-mint-50/60")}>
                  <div className="flex items-center justify-between gap-2">
                    <p className={cn("truncate text-sm", m.status === "NEW" ? "font-semibold text-ink-900" : "font-medium text-ink-800")}>{m.name}</p>
                    <span className="shrink-0 text-xs text-slate-400">{formatDate(m.createdAt)}</span>
                  </div>
                  <p className="truncate text-sm text-ink-800">{m.subject}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <Badge className={cn("text-[10px]", TONE[m.status])}>{m.status.toLowerCase()}</Badge>
                    <p className="truncate text-xs text-slate-500">{m.message}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="min-h-80">
          {selected ? (
            <div className="flex h-full flex-col">
              <div className="flex flex-col gap-3 border-b border-slate-100 px-6 py-5 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-ink-900">{selected.subject}</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {selected.name} &lt;{selected.email}&gt; · {formatDateTime(selected.createdAt)}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs">
                    {selected.orderNumber ? (
                      order ? (
                        <Link href={`/admin/orders/${order.id}`} className="font-mono font-semibold text-mint-700 hover:underline">
                          Order {selected.orderNumber}
                        </Link>
                      ) : (
                        <span className="font-mono text-slate-500">Order {selected.orderNumber} (not found)</span>
                      )
                    ) : null}
                    {customer ? (
                      <Link href={`/admin/customers/${customer.id}`} className="font-semibold text-mint-700 hover:underline">
                        View customer
                      </Link>
                    ) : (
                      <span className="text-slate-400">No account</span>
                    )}
                  </div>
                </div>
                <Badge className={TONE[selected.status]}>{selected.status.toLowerCase()}</Badge>
              </div>
              <div className="flex-1 px-6 py-5 text-sm leading-relaxed whitespace-pre-line text-ink-900">{selected.message}</div>
              <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 px-6 py-4">
                <a
                  href={`mailto:${selected.email}?subject=${encodeURIComponent(`Re: ${selected.subject}`)}&body=${encodeURIComponent(`Hi ${selected.name.split(" ")[0]},\n\n\n\n> ${selected.message.split("\n").join("\n> ")}`)}`}
                  className={buttonClass("primary", "sm")}
                >
                  <Reply className="size-3.5" /> Reply by email
                </a>
                {selected.status !== "REPLIED" ? (
                  <ConfirmButton action={setMessageStatus.bind(null, selected.id, "REPLIED")} message="" variant="outline">
                    Mark replied
                  </ConfirmButton>
                ) : null}
                {selected.status !== "NEW" ? (
                  <ConfirmButton action={setMessageStatus.bind(null, selected.id, "NEW")} message="" variant="ghost">
                    Mark unread
                  </ConfirmButton>
                ) : null}
                {selected.status !== "ARCHIVED" ? (
                  <ConfirmButton action={setMessageStatus.bind(null, selected.id, "ARCHIVED")} message="" variant="ghost">
                    <Archive className="size-3.5" /> Archive
                  </ConfirmButton>
                ) : null}
                <div className="ml-auto">
                  <ConfirmButton action={deleteMessage.bind(null, selected.id)} message="Delete this message permanently?" variant="ghost" className="text-rose-600 hover:bg-rose-50">
                    <Trash2 className="size-3.5" /> Delete
                  </ConfirmButton>
                </div>
              </div>
            </div>
          ) : (
            <EmptyState icon={Mail} title="Select a message" description="Choose a message from the list to read it." />
          )}
        </Card>
      </div>
    </>
  );
}
