import Link from "next/link";
import { db } from "@/lib/db";
import { formatDate, formatDateTime } from "@/lib/utils";
import { ActionForm, FormSubmit } from "@/components/admin/action-form";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { EmptyState, PageHeader, Panel, StockPill, Swatch, TableWrap, Td, Th, textAction } from "@/components/admin/ui";
import { deleteStockAlert, sendStockAlerts } from "./actions";

export const metadata = { title: "Stock alerts" };

const variantSelect = {
  select: {
    id: true,
    label: true,
    stock: true,
    lowStockThreshold: true,
    active: true,
    product: { select: { id: true, name: true, accentColor: true, active: true } },
  },
} as const;

export default async function StockAlertsPage() {
  const now = new Date();
  const since = new Date(now.getTime() - 30 * 86_400_000);
  const [waiting, sent, sentCount] = await Promise.all([
    db.stockAlert.findMany({ where: { notifiedAt: null }, orderBy: { createdAt: "asc" }, include: { variant: variantSelect } }),
    db.stockAlert.findMany({ where: { notifiedAt: { gte: since } }, orderBy: { notifiedAt: "desc" }, take: 20, include: { variant: variantSelect } }),
    db.stockAlert.count({ where: { notifiedAt: { gte: since } } }),
  ]);

  // One row per variant, most-requested first.
  const groups = [...Map.groupBy(waiting, (a) => a.variantId).values()]
    .map((alerts) => ({ variant: alerts[0].variant, alerts, oldest: alerts[0].createdAt }))
    .sort((a, b) => b.alerts.length - a.alerts.length || a.oldest.getTime() - b.oldest.getTime());
  const people = new Set(waiting.map((a) => a.email)).size;

  return (
    <>
      <PageHeader
        title="Stock alerts"
        description={
          waiting.length
            ? `${people} customer${people === 1 ? " is" : "s are"} waiting on ${groups.length} sold-out variant${groups.length === 1 ? "" : "s"}. They are emailed automatically when stock goes above zero.`
            : "Nobody is waiting on a sold-out variant. Customers who ask to be told about a restock appear here."
        }
        actions={
          <Link href="/admin/inventory?filter=low" className={textAction}>
            Open Inventory
          </Link>
        }
      />

      <section aria-labelledby="by-variant" className="mb-8">
        <h2 id="by-variant" className="mb-3 text-base font-medium text-ink">
          Waiting, by variant
        </h2>
        <TableWrap minWidth={0}>
          <thead>
            <tr>
              <Th>Variant</Th>
              <Th className="text-right">Waiting</Th>
              <Th className="hidden text-right md:table-cell">First asked</Th>
              <Th className="hidden sm:table-cell">Stock</Th>
              <Th className="text-right">
                <span className="sr-only">Action</span>
              </Th>
            </tr>
          </thead>
          <tbody>
            {groups.length === 0 ? (
              <tr>
                <Td colSpan={5} className="p-0">
                  <EmptyState title="No one is waiting for a restock." />
                </Td>
              </tr>
            ) : null}
            {groups.map(({ variant: v, alerts, oldest }) => {
              const hidden = !v.active || !v.product.active;
              const canSend = v.stock > 0 && !hidden;
              return (
                <tr key={v.id} className="hover:bg-surface/50">
                  <Td>
                    <div className="flex items-center gap-2.5">
                      <Swatch color={v.product.accentColor} />
                      <Link href={`/admin/products/${v.product.id}`} className="font-medium text-ink hover:underline">
                        {v.product.name} <span className="font-normal text-muted">{v.label}</span>
                      </Link>
                    </div>
                    <p className="tabular mt-0.5 pl-5 text-small text-muted sm:hidden">{v.stock} in stock</p>
                  </Td>
                  <Td className="tabular text-right font-medium">{alerts.length}</Td>
                  <Td className="tabular hidden text-right whitespace-nowrap text-muted md:table-cell">{formatDate(oldest)}</Td>
                  <Td className="hidden sm:table-cell">
                    <span className="flex items-center gap-2">
                      <StockPill stock={v.stock} threshold={v.lowStockThreshold} hidden={hidden} />
                      <span className="tabular text-muted">{v.stock}</span>
                    </span>
                  </Td>
                  <Td className="text-right">
                    {canSend ? (
                      <ActionForm action={sendStockAlerts.bind(null, v.id)} compact className="flex flex-col items-end">
                        <FormSubmit variant="ink" size="sm" className="h-8" pendingText="Sending…">
                          Email {alerts.length} Now
                        </FormSubmit>
                      </ActionForm>
                    ) : (
                      <Link href="/admin/inventory?filter=low" className={`${textAction} text-sm whitespace-nowrap`}>
                        {hidden ? "Hidden in store" : "Restock"}
                      </Link>
                    )}
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </TableWrap>
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <Panel title="Requests" description="Every waiting customer, oldest first." bodyClassName="px-0 pb-0">
          {waiting.length === 0 ? <EmptyState title="No open requests." className="py-6" /> : null}
          <ul>
            {waiting.map((a) => (
              <li key={a.id} className="flex items-center gap-3 border-t border-ink/[0.07] px-5 py-2.5 text-sm">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-ink">{a.email}</p>
                  <p className="truncate text-small text-muted">
                    {a.variant.product.name} {a.variant.label}, <span className="tabular">{formatDate(a.createdAt)}</span>
                  </p>
                </div>
                <ConfirmButton
                  action={deleteStockAlert.bind(null, a.id)}
                  message={`Remove ${a.email}'s alert for ${a.variant.product.name} ${a.variant.label}? They won't be emailed.`}
                  variant="ghost"
                  className="h-8 text-muted hover:text-danger"
                >
                  Remove
                </ConfirmButton>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Emailed in the last 30 days" description={`${sentCount} restock email${sentCount === 1 ? "" : "s"} sent.`} bodyClassName="px-0 pb-0">
          {sent.length === 0 ? <EmptyState title="No restock emails sent in the last 30 days." className="py-6" /> : null}
          <ul>
            {sent.map((a) => (
              <li key={a.id} className="flex items-center justify-between gap-3 border-t border-ink/[0.07] px-5 py-2.5 text-sm">
                <div className="min-w-0">
                  <p className="truncate text-ink">{a.email}</p>
                  <p className="truncate text-small text-muted">
                    {a.variant.product.name} {a.variant.label}
                  </p>
                </div>
                <span className="tabular shrink-0 text-small text-muted">{a.notifiedAt ? formatDateTime(a.notifiedAt) : "–"}</span>
              </li>
            ))}
          </ul>
          {sentCount > sent.length ? <p className="border-t border-ink/[0.07] px-5 py-2.5 text-small text-muted">Showing the latest {sent.length}.</p> : null}
        </Panel>
      </div>
    </>
  );
}
