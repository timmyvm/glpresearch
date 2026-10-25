import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { db } from "@/lib/db";
import { cn, formatDate, formatDateTime } from "@/lib/utils";
import { buttonClass } from "@/components/ui/button";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { Tabs } from "@/components/admin/filters";
import { EmptyState, PageHeader, TableWrap, Td, Th, textAction } from "@/components/admin/ui";
import { deleteMessage, deleteSubscriber, setMessageStatus } from "./actions";

export const metadata = { title: "Inbox" };

const FILTERS = [
  { value: "", label: "Open" },
  { value: "NEW", label: "Unread" },
  { value: "READ", label: "Read" },
  { value: "REPLIED", label: "Replied" },
  { value: "ARCHIVED", label: "Archived" },
  { value: "ALL", label: "All" },
];

const STATUS: Record<string, { label: string; tone: string }> = {
  NEW: { label: "Unread", tone: "bg-[#e3e7f1] text-ink" },
  READ: { label: "Read", tone: "bg-surface text-muted" },
  REPLIED: { label: "Replied", tone: "bg-[#dcf3e3] text-[#0b4a24]" },
  ARCHIVED: { label: "Archived", tone: "bg-surface text-muted" },
};

function StatusPill({ status }: { status: string }) {
  const s = STATUS[status] ?? { label: status, tone: "bg-surface text-muted" };
  return <span className={cn("inline-flex h-6 shrink-0 items-center rounded-full px-2.5 text-small leading-none font-medium whitespace-nowrap", s.tone)}>{s.label}</span>;
}

export default async function MessagesPage({ searchParams }: { searchParams: Promise<{ tab?: string; status?: string; id?: string }> }) {
  const sp = await searchParams;
  const tab = sp.tab === "subscribers" ? "subscribers" : "messages";

  // Opening a message marks it read before the list and counts are drawn.
  if (sp.id && tab === "messages") await db.contactMessage.updateMany({ where: { id: sp.id, status: "NEW" }, data: { status: "READ" } });
  const [counts, subscriberCount] = await Promise.all([db.contactMessage.groupBy({ by: ["status"], _count: true }), db.subscriber.count()]);
  const count = (s: string) => counts.find((c) => c.status === s)?._count ?? 0;
  const open = counts.filter((c) => c.status !== "ARCHIVED").reduce((s, c) => s + c._count, 0);

  const sections = (
    <Tabs
      label="Inbox sections"
      tabs={[
        { href: "/admin/messages", label: "Messages", count: open, active: tab === "messages" },
        { href: "/admin/messages?tab=subscribers", label: "Newsletter subscribers", count: subscriberCount, active: tab === "subscribers" },
      ]}
    />
  );

  if (tab === "subscribers") {
    const subscribers = await db.subscriber.findMany({ orderBy: { createdAt: "desc" } });
    return (
      <>
        <PageHeader
          title="Inbox"
          description="The export also includes customers who opted in to marketing emails when they signed up."
          actions={
            <a href="/api/admin/subscribers/export" className={buttonClass("outline", "sm", "ring-1 ring-ink/25")}>
              Export CSV
            </a>
          }
        />
        {sections}
        <TableWrap minWidth={0}>
          <thead>
            <tr>
              <Th>Email</Th>
              <Th className="text-right">Subscribed</Th>
              <Th className="text-right">
                <span className="sr-only">Remove</span>
              </Th>
            </tr>
          </thead>
          <tbody>
            {subscribers.length === 0 ? (
              <tr>
                <Td colSpan={3} className="p-0">
                  <EmptyState title="No subscribers yet." description="People who join the newsletter from the store footer appear here." />
                </Td>
              </tr>
            ) : null}
            {subscribers.map((s) => (
              <tr key={s.id} className="hover:bg-surface/50">
                <Td className="font-medium break-all">{s.email}</Td>
                <Td className="tabular text-right whitespace-nowrap text-muted">{formatDateTime(s.createdAt)}</Td>
                <Td>
                  <div className="flex justify-end">
                    <ConfirmButton
                      action={deleteSubscriber.bind(null, s.id)}
                      message={`Remove ${s.email} from the newsletter list?`}
                      variant="ghost"
                      className="h-8 text-danger hover:bg-[#fbe4e1]"
                    >
                      Remove
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
  const selected = sp.id ? await db.contactMessage.findUnique({ where: { id: sp.id } }) : null;
  const messages = await db.contactMessage.findMany({ where, orderBy: { createdAt: "desc" } });
  const [order, customer] = selected
    ? await Promise.all([
        selected.orderNumber ? db.order.findUnique({ where: { number: selected.orderNumber }, select: { id: true } }) : null,
        db.user.findUnique({ where: { email: selected.email }, select: { id: true } }),
      ])
    : [null, null];

  const listHref = status ? `/admin/messages?status=${status}` : "/admin/messages";
  const qs = (extra: Record<string, string>) => {
    const p = new URLSearchParams();
    if (status) p.set("status", status);
    for (const [k, v] of Object.entries(extra)) p.set(k, v);
    return `/admin/messages?${p}`;
  };
  const unread = count("NEW");

  return (
    <>
      <PageHeader
        title="Inbox"
        description={unread ? `${unread} unread message${unread === 1 ? "" : "s"} from the contact form.` : "Every contact form message has been read."}
      />
      {sections}
      <nav aria-label="Message status" className="mb-4 flex flex-wrap gap-x-4 gap-y-1 text-sm">
        {FILTERS.map((f) => (
          <Link
            key={f.value}
            href={f.value ? `/admin/messages?status=${f.value}` : "/admin/messages"}
            aria-current={status === f.value ? "page" : undefined}
            className={status === f.value ? "font-medium text-ink" : "text-muted hover:text-ink"}
          >
            {f.label}
            {f.value && f.value !== "ALL" ? <span className="tabular ml-1 text-muted">{count(f.value)}</span> : null}
          </Link>
        ))}
      </nav>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
        <section aria-label="Messages" className={cn("border border-surface-2 bg-white", selected && "hidden lg:block")}>
          {messages.length === 0 ? <EmptyState title="No messages here." description="Try another status." /> : null}
          <ul className="max-h-[70vh] overflow-y-auto overscroll-contain">
            {messages.map((m, i) => (
              <li key={m.id} className={i ? "border-t border-ink/[0.07]" : undefined}>
                <Link
                  href={qs({ id: m.id })}
                  aria-current={selected?.id === m.id ? "true" : undefined}
                  className={cn("block px-4 py-3", selected?.id === m.id ? "bg-surface" : "hover:bg-surface/50")}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className={cn("truncate text-sm text-ink", m.status === "NEW" ? "font-semibold" : "font-medium")}>
                      {m.status === "NEW" ? <span className="mr-1.5 inline-block size-1.5 rounded-full bg-ink align-middle" aria-label="Unread" /> : null}
                      {m.name}
                    </p>
                    <span className="tabular shrink-0 text-small text-muted">{formatDate(m.createdAt, { year: undefined })}</span>
                  </div>
                  <p className="truncate text-sm text-ink">{m.subject}</p>
                  <p className="truncate text-small text-muted">{m.message}</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section aria-label="Message" className={cn("min-h-80 border border-surface-2 bg-white", !selected && "hidden lg:block")}>
          {selected ? (
            <div className="flex h-full flex-col">
              <div className="border-b border-ink/[0.07] px-5 py-4 sm:px-6">
                <Link href={listHref} className="mb-3 inline-flex items-center gap-1 text-small text-muted hover:text-ink lg:hidden">
                  <ChevronLeft className="size-3.5" aria-hidden="true" /> All messages
                </Link>
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-lg font-medium text-ink">{selected.subject}</h2>
                  <StatusPill status={selected.status} />
                </div>
                <p className="mt-1 text-sm text-muted">
                  {selected.name}, <span className="break-all">{selected.email}</span>
                  <span className="tabular">, {formatDateTime(selected.createdAt)}</span>
                </p>
                <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                  {selected.orderNumber ? (
                    order ? (
                      <Link href={`/admin/orders/${order.id}`} className={textAction}>
                        Order {selected.orderNumber}
                      </Link>
                    ) : (
                      <span className="text-muted">Order {selected.orderNumber} was not found</span>
                    )
                  ) : null}
                  {customer ? (
                    <Link href={`/admin/customers/${customer.id}`} className={textAction}>
                      View Customer
                    </Link>
                  ) : (
                    <span className="text-muted">No account with this email</span>
                  )}
                </p>
              </div>
              <div className="flex-1 px-5 py-5 text-sm leading-relaxed whitespace-pre-line text-ink sm:px-6">{selected.message}</div>
              <div className="flex flex-wrap items-center gap-2 border-t border-ink/[0.07] px-5 py-4 sm:px-6">
                <a
                  href={`mailto:${selected.email}?subject=${encodeURIComponent(`Re: ${selected.subject}`)}&body=${encodeURIComponent(
                    `Hi ${selected.name.split(" ")[0]},\n\n\n\n> ${selected.message.split("\n").join("\n> ")}`,
                  )}`}
                  className={buttonClass("ink", "sm")}
                >
                  Reply by Email
                </a>
                {selected.status !== "REPLIED" ? (
                  <ConfirmButton action={setMessageStatus.bind(null, selected.id, "REPLIED")} message="" variant="outline" className="ring-1 ring-ink/25">
                    Mark Replied
                  </ConfirmButton>
                ) : null}
                {selected.status !== "NEW" ? (
                  <ConfirmButton action={setMessageStatus.bind(null, selected.id, "NEW")} message="" variant="ghost">
                    Mark Unread
                  </ConfirmButton>
                ) : null}
                {selected.status !== "ARCHIVED" ? (
                  <ConfirmButton action={setMessageStatus.bind(null, selected.id, "ARCHIVED")} message="" variant="ghost">
                    Archive
                  </ConfirmButton>
                ) : null}
                <div className="ml-auto">
                  <ConfirmButton
                    action={deleteMessage.bind(null, selected.id)}
                    message={`Delete the message from ${selected.name} permanently? Archive it instead to keep a record.`}
                    variant="ghost"
                    className="text-danger hover:bg-[#fbe4e1]"
                  >
                    Delete
                  </ConfirmButton>
                </div>
              </div>
            </div>
          ) : (
            <EmptyState title="Choose a message to read it." />
          )}
        </section>
      </div>
    </>
  );
}
