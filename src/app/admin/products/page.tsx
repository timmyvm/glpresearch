import Link from "next/link";
import { db } from "@/lib/db";
import { formatMoney } from "@/lib/money";
import { categoryLabel } from "@/lib/orders";
import { ButtonLink } from "@/components/ui/button";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { EmptyState, PageHeader, Swatch, TableWrap, Td, Th } from "@/components/admin/ui";
import { toggleProductActive } from "./actions";

export const metadata = { title: "Products" };

export default async function ProductsPage() {
  const products = await db.product.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: { variants: { orderBy: { sortOrder: "asc" } }, _count: { select: { batches: true } } },
  });
  const live = products.filter((p) => p.active).length;

  return (
    <>
      <PageHeader
        title="Products"
        description={`${products.length} compounds in the catalogue, ${live} on sale and ${products.length - live} hidden.`}
        actions={
          <ButtonLink href="/admin/products/new" variant="ink" size="sm">
            New Product
          </ButtonLink>
        }
      />
      <TableWrap minWidth={0}>
        <thead>
          <tr>
            <Th>Product</Th>
            <Th className="hidden md:table-cell">Category</Th>
            <Th className="hidden lg:table-cell">Variants</Th>
            <Th className="hidden text-right lg:table-cell">Price</Th>
            <Th className="text-right">Stock</Th>
            <Th className="hidden text-right xl:table-cell">Batches</Th>
            <Th className="hidden sm:table-cell">Status</Th>
            <Th className="text-right">
              <span className="sr-only">Visibility</span>
            </Th>
          </tr>
        </thead>
        <tbody>
          {products.length === 0 ? (
            <tr>
              <Td colSpan={8} className="p-0">
                <EmptyState
                  title="No products yet."
                  description="Add a compound with at least one variant to start selling."
                  action={
                    <ButtonLink href="/admin/products/new" variant="ink" size="sm">
                      New Product
                    </ButtonLink>
                  }
                />
              </Td>
            </tr>
          ) : null}
          {products.map((p) => {
            const stock = p.variants.reduce((s, v) => s + v.stock, 0);
            const lowest = p.variants.filter((v) => v.active).sort((a, b) => a.stock - a.lowStockThreshold - (b.stock - b.lowStockThreshold))[0];
            const prices = p.variants.map((v) => v.price);
            return (
              <tr key={p.id} className="hover:bg-surface/50">
                <Td>
                  <div className="flex items-start gap-2.5">
                    <Swatch color={p.accentColor} className="mt-1.5" />
                    <div className="min-w-0">
                      <Link href={`/admin/products/${p.id}`} className="font-medium text-ink hover:underline">
                        {p.name}
                      </Link>
                      {p.featured ? <span className="ml-2 text-small text-muted">Featured</span> : null}
                      <p className="max-w-[20ch] truncate text-small text-muted sm:max-w-[40ch]">{p.subtitle}</p>
                    </div>
                  </div>
                </Td>
                <Td className="hidden whitespace-nowrap text-muted md:table-cell">{categoryLabel(p.category)}</Td>
                <Td className="hidden text-muted lg:table-cell">
                  {p.variants.map((v, i) => (
                    <span key={v.id}>
                      {i ? ", " : ""}
                      <span className={v.active ? "whitespace-nowrap" : "whitespace-nowrap line-through"}>{v.label}</span>
                    </span>
                  ))}
                </Td>
                <Td className="tabular hidden text-right whitespace-nowrap lg:table-cell">
                  {prices.length ? `${formatMoney(Math.min(...prices))}${prices.length > 1 ? `–${formatMoney(Math.max(...prices))}` : ""}` : "–"}
                </Td>
                <Td className="text-right">
                  <span className="tabular font-medium">{stock}</span>
                  {lowest && lowest.stock <= lowest.lowStockThreshold ? (
                    <span className="block text-small whitespace-nowrap text-muted">
                      {lowest.label} {lowest.stock <= 0 ? "sold out" : "low"}
                    </span>
                  ) : null}
                </Td>
                <Td className="tabular hidden text-right text-muted xl:table-cell">{p._count.batches}</Td>
                <Td className="hidden sm:table-cell">
                  <span
                    className={`inline-flex h-6 items-center rounded-full px-2.5 text-small leading-none font-medium whitespace-nowrap ${
                      p.active ? "bg-surface text-muted" : "bg-[#fffbeb] text-[#92400e]"
                    }`}
                  >
                    {p.active ? "On sale" : "Hidden"}
                  </span>
                </Td>
                <Td className="text-right">
                  <div className="flex justify-end">
                    <ConfirmButton
                      action={toggleProductActive.bind(null, p.id)}
                      message={p.active ? `Hide ${p.name} from the store? Customers will no longer see it or be able to order it.` : ""}
                      variant="ghost"
                      size="sm"
                      className="h-8"
                    >
                      {p.active ? "Hide" : "Publish"}
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
