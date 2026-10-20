import Link from "next/link";
import { FileCheck2, FlaskConical, Plus } from "lucide-react";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { EmptyState, PageHeader, TableWrap, Td, Th } from "@/components/admin/ui";
import { toggleBatchPublished } from "./actions";

export const metadata = { title: "Batches & COAs" };

export default async function BatchesPage({ searchParams }: { searchParams: Promise<{ product?: string }> }) {
  const sp = await searchParams;
  const [batches, products] = await Promise.all([
    db.batch.findMany({
      where: sp.product ? { productId: sp.product } : undefined,
      orderBy: { testedAt: "desc" },
      include: { product: { select: { name: true, accentColor: true } } },
    }),
    db.product.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, name: true } }),
  ]);

  return (
    <>
      <PageHeader
        title="Batches & certificates of analysis"
        description="Third-party test results per manufacturing lot, shown on the public Lab Testing page and product pages."
        actions={
          <ButtonLink href={`/admin/batches/new${sp.product ? `?product=${sp.product}` : ""}`}>
            <Plus className="size-4" /> New batch
          </ButtonLink>
        }
      />
      <div className="mb-4 flex flex-wrap gap-1.5">
        <Link
          href="/admin/batches"
          className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${!sp.product ? "bg-ink-900 text-white ring-ink-900" : "bg-white text-slate-600 ring-slate-200 hover:bg-slate-50"}`}
        >
          All products
        </Link>
        {products.map((p) => (
          <Link
            key={p.id}
            href={`/admin/batches?product=${p.id}`}
            className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${sp.product === p.id ? "bg-ink-900 text-white ring-ink-900" : "bg-white text-slate-600 ring-slate-200 hover:bg-slate-50"}`}
          >
            {p.name}
          </Link>
        ))}
      </div>
      <TableWrap>
        <thead>
          <tr>
            <Th>Batch</Th>
            <Th>Product</Th>
            <Th>Purity</Th>
            <Th>Mass spec</Th>
            <Th>Tested</Th>
            <Th>Expires</Th>
            <Th>COA</Th>
            <Th className="text-right">Public</Th>
          </tr>
        </thead>
        <tbody>
          {batches.length === 0 ? (
            <tr>
              <Td colSpan={8}>
                <EmptyState icon={FlaskConical} title="No batches recorded" description="Add a batch to publish its certificate of analysis." />
              </Td>
            </tr>
          ) : null}
          {batches.map((b) => (
            <tr key={b.id} className="group hover:bg-slate-50">
              <Td>
                <Link href={`/admin/batches/${b.id}`} className="font-mono text-xs font-semibold text-ink-900 group-hover:text-mint-700">
                  {b.batchNumber}
                </Link>
                {b.notes ? <p className="text-xs text-slate-500">{b.notes}</p> : null}
              </Td>
              <Td>
                <span className="flex items-center gap-2 text-sm font-medium">
                  <span className="size-2 rounded-full" style={{ backgroundColor: b.product.accentColor }} />
                  {b.product.name}
                  {b.variantLabel ? <span className="text-xs font-normal text-slate-500">· {b.variantLabel}</span> : null}
                </span>
              </Td>
              <Td>
                <span className={`font-semibold tabular-nums ${b.purity >= 99 ? "text-emerald-600" : b.purity >= 98 ? "text-amber-600" : "text-rose-600"}`}>
                  {b.purity.toFixed(2)}%
                </span>
              </Td>
              <Td className="max-w-xs truncate text-xs text-slate-500">{b.massSpec ?? "—"}</Td>
              <Td className="text-xs whitespace-nowrap text-slate-600">{formatDate(b.testedAt)}</Td>
              <Td className="text-xs whitespace-nowrap text-slate-600">{b.expiresAt ? formatDate(b.expiresAt) : "—"}</Td>
              <Td>
                {b.coaUrl ? (
                  <a href={b.coaUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-medium text-mint-700 hover:underline">
                    <FileCheck2 className="size-3.5" /> View
                  </a>
                ) : (
                  <span className="text-xs text-slate-400">Data only</span>
                )}
              </Td>
              <Td className="text-right">
                <div className="flex items-center justify-end gap-2">
                  {b.published ? <Badge className="bg-emerald-50 text-emerald-700 ring-emerald-600/20">Published</Badge> : <Badge>Hidden</Badge>}
                  <ConfirmButton action={toggleBatchPublished.bind(null, b.id)} message="" variant="ghost" size="sm">
                    {b.published ? "Hide" : "Publish"}
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
