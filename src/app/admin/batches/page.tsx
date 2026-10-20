import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { cn, formatDate } from "@/lib/utils";
import { ButtonLink } from "@/components/ui/button";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { ListFilters } from "@/components/admin/filters";
import { EmptyState, PageHeader, Swatch, TableWrap, Td, Th, textAction } from "@/components/admin/ui";
import { toggleBatchPublished } from "./actions";

export const metadata = { title: "Batch certificates" };

const pill = "inline-flex h-6 items-center rounded-full px-2.5 text-small leading-none font-medium whitespace-nowrap";

export default async function BatchesPage({ searchParams }: { searchParams: Promise<{ product?: string; q?: string }> }) {
  const sp = await searchParams;
  const where: Prisma.BatchWhereInput = {
    ...(sp.product ? { productId: sp.product } : {}),
    ...(sp.q ? { batchNumber: { contains: sp.q.toUpperCase() } } : {}),
  };
  const now = new Date();
  const [batches, products, expiring] = await Promise.all([
    db.batch.findMany({
      where,
      orderBy: { testedAt: "desc" },
      include: { product: { select: { name: true, accentColor: true } } },
    }),
    db.product.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, name: true } }),
    db.batch.count({ where: { published: true, expiresAt: { lt: new Date(now.getTime() + 30 * 86_400_000) } } }),
  ]);

  return (
    <>
      <PageHeader
        title="Batch certificates"
        description={`Third-party test results per manufacturing lot, shown on the Lab Testing page and each product page.${
          expiring ? ` ${expiring} published batch${expiring === 1 ? " expires" : "es expire"} within 30 days.` : ""
        }`}
        actions={
          <ButtonLink href={`/admin/batches/new${sp.product ? `?product=${sp.product}` : ""}`} variant="ink" size="sm">
            New Batch
          </ButtonLink>
        }
      />
      <ListFilters
        label="Search batches"
        placeholder="Batch number…"
        selectName="product"
        selectLabel="Product"
        selectOptions={[{ value: "", label: "All products" }, ...products.map((p) => ({ value: p.id, label: p.name }))]}
        count={`${batches.length} batch${batches.length === 1 ? "" : "es"}`}
      />
      <TableWrap minWidth={0}>
        <thead>
          <tr>
            <Th>Batch</Th>
            <Th className="hidden md:table-cell">Product</Th>
            <Th className="text-right">Purity</Th>
            <Th className="hidden 2xl:table-cell">Mass spec</Th>
            <Th className="hidden text-right lg:table-cell">Tested</Th>
            <Th className="hidden text-right lg:table-cell">Expires</Th>
            <Th className="hidden xl:table-cell">Certificate</Th>
            <Th className="text-right">Public</Th>
          </tr>
        </thead>
        <tbody>
          {batches.length === 0 ? (
            <tr>
              <Td colSpan={8} className="p-0">
                <EmptyState
                  title={sp.q || sp.product ? "No batches match this filter." : "No batches recorded yet."}
                  description="Add a batch to publish its certificate of analysis."
                />
              </Td>
            </tr>
          ) : null}
          {batches.map((b) => {
            const expired = b.expiresAt && b.expiresAt < now;
            return (
              <tr key={b.id} className="hover:bg-surface/50">
                <Td>
                  <Link href={`/admin/batches/${b.id}`} className="tabular font-medium whitespace-nowrap text-ink hover:underline">
                    {b.batchNumber}
                  </Link>
                  <p className="flex items-center gap-1.5 text-small text-muted md:hidden">
                    <Swatch color={b.product.accentColor} /> {b.product.name}
                  </p>
                  {b.notes ? <p className="hidden max-w-[36ch] truncate text-small text-muted md:block">{b.notes}</p> : null}
                </Td>
                <Td className="hidden md:table-cell">
                  <span className="flex items-center gap-2 whitespace-nowrap">
                    <Swatch color={b.product.accentColor} />
                    {b.product.name}
                    {b.variantLabel ? <span className="text-muted">{b.variantLabel}</span> : null}
                  </span>
                </Td>
                <Td className={`tabular text-right font-medium ${b.purity < 98 ? "text-danger" : b.purity < 99 ? "text-[#92400e]" : ""}`}>{b.purity.toFixed(2)}%</Td>
                <Td className="hidden max-w-xs truncate text-muted 2xl:table-cell">{b.massSpec ?? "–"}</Td>
                <Td className="tabular hidden text-right whitespace-nowrap text-muted lg:table-cell">{formatDate(b.testedAt)}</Td>
                <Td className={`tabular hidden text-right whitespace-nowrap lg:table-cell ${expired ? "text-danger" : "text-muted"}`}>
                  {b.expiresAt ? formatDate(b.expiresAt) : "–"}
                </Td>
                <Td className="hidden xl:table-cell">
                  {b.coaUrl ? (
                    <a href={b.coaUrl} target="_blank" rel="noreferrer" className={textAction}>
                      View
                    </a>
                  ) : (
                    <span className="text-muted">Data only</span>
                  )}
                </Td>
                <Td className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <span className={cn(pill, "hidden sm:inline-flex", b.published ? "bg-surface text-muted" : "bg-[#fffbeb] text-[#92400e]")}>{b.published ? "Published" : "Hidden"}</span>
                    <ConfirmButton
                      action={toggleBatchPublished.bind(null, b.id)}
                      message={b.published ? `Hide batch ${b.batchNumber} from the Lab Testing page?` : ""}
                      variant="ghost"
                      size="sm"
                      className="h-8"
                    >
                      {b.published ? "Hide" : "Publish"}
                    </ConfirmButton>
                  </div>
                </Td>
              </tr>
            );
          })}
        </tbody>
      </TableWrap>
    </>
  );
}
