import Image from "next/image";
import Link from "next/link";
import { db } from "@/lib/db";
import { formatMoney } from "@/lib/money";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { PageHeader, StatCard, TableWrap, Td, Th } from "@/components/admin/ui";
import { StockForm } from "@/components/admin/stock-form";
import { updateStock } from "./actions";

export const metadata = { title: "Inventory" };

export default async function InventoryPage({ searchParams }: { searchParams: Promise<{ filter?: string }> }) {
  const sp = await searchParams;
  const variants = await db.productVariant.findMany({
    include: { product: { select: { id: true, name: true, image: true, accentColor: true, sortOrder: true, active: true } } },
    orderBy: [{ product: { sortOrder: "asc" } }, { sortOrder: "asc" }],
  });

  const low = variants.filter((v) => v.stock > 0 && v.stock <= v.lowStockThreshold);
  const out = variants.filter((v) => v.stock === 0);
  const units = variants.reduce((s, v) => s + v.stock, 0);
  const value = variants.reduce((s, v) => s + v.stock * v.price, 0);

  const shown = sp.filter === "low" ? variants.filter((v) => v.stock <= v.lowStockThreshold) : variants;

  return (
    <>
      <PageHeader title="Inventory" description="Stock on hand for every variant. Edit counts inline; the second box is the low-stock alert threshold." />
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Units on hand" value={units.toLocaleString()} />
        <StatCard label="Retail value" value={formatMoney(value)} />
        <StatCard label="Low stock" value={low.length} tone={low.length ? "warning" : "default"} hint="variants" />
        <StatCard label="Out of stock" value={out.length} tone={out.length ? "warning" : "default"} hint="variants" />
      </div>
      <div className="mb-4 flex gap-1.5">
        <Link
          href="/admin/inventory"
          className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${sp.filter !== "low" ? "bg-ink-900 text-white ring-ink-900" : "bg-white text-slate-600 ring-slate-200"}`}
        >
          All variants · {variants.length}
        </Link>
        <Link
          href="/admin/inventory?filter=low"
          className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${sp.filter === "low" ? "bg-ink-900 text-white ring-ink-900" : "bg-white text-slate-600 ring-slate-200"}`}
        >
          Needs attention · {low.length + out.length}
        </Link>
      </div>
      <TableWrap>
        <thead>
          <tr>
            <Th>Variant</Th>
            <Th>SKU</Th>
            <Th>Price</Th>
            <Th>Status</Th>
            <Th className="text-right">Stock · alert at</Th>
          </tr>
        </thead>
        <tbody>
          {shown.map((v) => {
            const isOut = v.stock === 0;
            const isLow = !isOut && v.stock <= v.lowStockThreshold;
            return (
              <tr key={v.id} className={cn("hover:bg-slate-50", isOut ? "bg-rose-50/40" : isLow ? "bg-amber-50/40" : "")}>
                <Td>
                  <Link href={`/admin/products/${v.product.id}`} className="flex items-center gap-3">
                    <span className="relative size-9 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                      <Image src={v.image ?? v.product.image} alt="" fill sizes="36px" className="object-cover" />
                    </span>
                    <span className="font-medium text-ink-900 hover:text-mint-700">
                      {v.product.name} <span className="text-slate-500">· {v.label}</span>
                    </span>
                  </Link>
                </Td>
                <Td className="font-mono text-xs text-slate-600">{v.sku}</Td>
                <Td className="tabular-nums">{formatMoney(v.price)}</Td>
                <Td>
                  <div className="flex flex-wrap gap-1">
                    {isOut ? <Badge className="bg-rose-50 text-rose-700 ring-rose-600/20">Out of stock</Badge> : null}
                    {isLow ? <Badge className="bg-amber-50 text-amber-700 ring-amber-600/20">Low</Badge> : null}
                    {!isOut && !isLow ? <Badge className="bg-emerald-50 text-emerald-700 ring-emerald-600/20">In stock</Badge> : null}
                    {!v.active || !v.product.active ? <Badge>Hidden</Badge> : null}
                  </div>
                </Td>
                <Td>
                  <StockForm action={updateStock.bind(null, v.id)} stock={v.stock} lowStockThreshold={v.lowStockThreshold} />
                </Td>
              </tr>
            );
          })}
        </tbody>
      </TableWrap>
    </>
  );
}
