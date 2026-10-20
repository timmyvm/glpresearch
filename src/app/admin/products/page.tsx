import Image from "next/image";
import Link from "next/link";
import { Package, Plus } from "lucide-react";
import { db } from "@/lib/db";
import { formatMoney } from "@/lib/money";
import { categoryLabel } from "@/lib/orders";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { EmptyState, PageHeader, TableWrap, Td, Th } from "@/components/admin/ui";
import { toggleProductActive } from "./actions";

export const metadata = { title: "Products" };

export default async function ProductsPage() {
  const products = await db.product.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: { variants: { orderBy: { sortOrder: "asc" } }, _count: { select: { batches: true } } },
  });

  return (
    <>
      <PageHeader
        title="Products"
        description={`${products.length} compounds in the catalogue.`}
        actions={
          <ButtonLink href="/admin/products/new">
            <Plus className="size-4" /> New product
          </ButtonLink>
        }
      />
      <TableWrap>
        <thead>
          <tr>
            <Th>Product</Th>
            <Th>Category</Th>
            <Th>Variants</Th>
            <Th>Price range</Th>
            <Th>Stock</Th>
            <Th>Batches</Th>
            <Th>Status</Th>
            <Th className="text-right">Visibility</Th>
          </tr>
        </thead>
        <tbody>
          {products.length === 0 ? (
            <tr>
              <Td colSpan={8}>
                <EmptyState icon={Package} title="No products yet" action={<ButtonLink href="/admin/products/new">Create your first product</ButtonLink>} />
              </Td>
            </tr>
          ) : null}
          {products.map((p) => {
            const stock = p.variants.reduce((s, v) => s + v.stock, 0);
            const low = p.variants.some((v) => v.active && v.stock <= v.lowStockThreshold);
            const prices = p.variants.map((v) => v.price);
            return (
              <tr key={p.id} className="group hover:bg-slate-50">
                <Td>
                  <Link href={`/admin/products/${p.id}`} className="flex items-center gap-3">
                    <span className="relative size-11 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                      <Image src={p.image} alt="" fill sizes="44px" className="object-cover" />
                    </span>
                    <span>
                      <span className="flex items-center gap-2 font-semibold text-ink-900 group-hover:text-mint-700">
                        <span className="size-2 rounded-full" style={{ backgroundColor: p.accentColor }} />
                        {p.name}
                        {p.featured ? <Badge className="bg-mint-50 text-mint-700 ring-mint-600/20">Featured</Badge> : null}
                      </span>
                      <span className="block text-xs text-slate-500">{p.subtitle}</span>
                    </span>
                  </Link>
                </Td>
                <Td className="text-xs text-slate-600">{categoryLabel(p.category)}</Td>
                <Td>
                  <div className="flex flex-wrap gap-1">
                    {p.variants.map((v) => (
                      <Badge key={v.id} className={v.active ? "" : "line-through opacity-60"}>
                        {v.label}
                      </Badge>
                    ))}
                  </div>
                </Td>
                <Td className="text-xs tabular-nums">
                  {prices.length ? `${formatMoney(Math.min(...prices))}${prices.length > 1 ? ` – ${formatMoney(Math.max(...prices))}` : ""}` : "—"}
                </Td>
                <Td>
                  <span className={`font-semibold tabular-nums ${low ? "text-amber-600" : "text-ink-900"}`}>{stock}</span>
                  {low ? <span className="ml-1.5 text-xs text-amber-600">low</span> : null}
                </Td>
                <Td className="text-slate-600">{p._count.batches}</Td>
                <Td>
                  {p.active ? (
                    <Badge className="bg-emerald-50 text-emerald-700 ring-emerald-600/20">Active</Badge>
                  ) : (
                    <Badge>Hidden</Badge>
                  )}
                </Td>
                <Td className="text-right">
                  <div className="flex justify-end">
                    <ConfirmButton action={toggleProductActive.bind(null, p.id)} message="" variant="outline" size="sm">
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
