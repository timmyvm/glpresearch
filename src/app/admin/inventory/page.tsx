import Link from "next/link";
import { db } from "@/lib/db";
import { formatMoney } from "@/lib/money";
import { Tabs } from "@/components/admin/filters";
import { EmptyState, PageHeader, StatStrip, StockPill, Swatch, TableWrap, Td, Th, textAction } from "@/components/admin/ui";
import { StockForm } from "@/components/admin/stock-form";
import { updateStock } from "./actions";

export const metadata = { title: "Inventory" };

const nf = new Intl.NumberFormat("en-AU");

export default async function InventoryPage({ searchParams }: { searchParams: Promise<{ filter?: string }> }) {
  const sp = await searchParams;
  const variants = await db.productVariant.findMany({
    include: {
      product: { select: { id: true, name: true, accentColor: true, sortOrder: true, active: true } },
      _count: { select: { stockAlerts: { where: { notifiedAt: null } } } },
    },
    orderBy: [{ product: { sortOrder: "asc" } }, { sortOrder: "asc" }],
  });

  const low = variants.filter((v) => v.stock > 0 && v.stock <= v.lowStockThreshold);
  const out = variants.filter((v) => v.stock <= 0);
  const units = variants.reduce((s, v) => s + v.stock, 0);
  const value = variants.reduce((s, v) => s + v.stock * v.price, 0);
  const waiting = variants.reduce((s, v) => s + v._count.stockAlerts, 0);

  const needsAttention = sp.filter === "low";
  const shown = needsAttention ? variants.filter((v) => v.stock <= v.lowStockThreshold) : variants;

  return (
    <>
      <PageHeader
        title="Inventory"
        description={
          out.length || low.length
            ? `${out.length} variant${out.length === 1 ? " is" : "s are"} out of stock and ${low.length} ${low.length === 1 ? "is" : "are"} running low. Edit counts in the row; the second box is the low-stock threshold.`
            : "Every variant is above its low-stock threshold. Edit counts in the row; the second box is the low-stock threshold."
        }
      />

      <StatStrip
        className="mb-6"
        stats={[
          { label: "Units on hand", value: nf.format(units), note: `across ${variants.length} variants`, tone: "neutral" },
          { label: "Retail value", value: formatMoney(value), note: "at current prices", tone: "neutral" },
          { label: "Low or out of stock", value: nf.format(low.length + out.length), note: `${out.length} out, ${low.length} low`, tone: out.length ? "bad" : "neutral", href: "/admin/inventory?filter=low" },
          { label: "Waiting for restock", value: nf.format(waiting), note: "customer alerts not yet sent", tone: "neutral", href: "/admin/stock-alerts" },
        ]}
      />

      <Tabs
        label="Inventory filter"
        tabs={[
          { href: "/admin/inventory", label: "All variants", count: variants.length, active: !needsAttention },
          { href: "/admin/inventory?filter=low", label: "Needs attention", count: low.length + out.length, active: needsAttention },
        ]}
      />

      <TableWrap minWidth={0}>
        <thead>
          <tr>
            <Th>Variant</Th>
            <Th className="hidden md:table-cell">SKU</Th>
            <Th className="hidden text-right lg:table-cell">Price</Th>
            <Th className="hidden sm:table-cell">Status</Th>
            <Th className="text-right">Stock and alert level</Th>
          </tr>
        </thead>
        <tbody>
          {shown.length === 0 ? (
            <tr>
              <Td colSpan={5} className="p-0">
                <EmptyState title="Nothing needs attention." description="Every variant is above its low-stock threshold." />
              </Td>
            </tr>
          ) : null}
          {shown.map((v) => {
            const hidden = !v.active || !v.product.active;
            return (
              <tr key={v.id} className="hover:bg-surface/50">
                <Td>
                  <div className="flex items-center gap-2.5">
                    <Swatch color={v.product.accentColor} />
                    <Link href={`/admin/products/${v.product.id}`} className="font-medium text-ink hover:underline">
                      {v.product.name} <span className="font-normal text-muted">{v.label}</span>
                    </Link>
                  </div>
                  <p className="mt-1 pl-5 sm:hidden">
                    <StockPill stock={v.stock} threshold={v.lowStockThreshold} hidden={hidden} />
                  </p>
                  {v._count.stockAlerts ? (
                    <Link href="/admin/stock-alerts" className={`${textAction} mt-1 ml-5 inline-block text-small`}>
                      {v._count.stockAlerts} waiting for restock
                    </Link>
                  ) : null}
                </Td>
                <Td className="tabular hidden text-small text-muted md:table-cell">{v.sku}</Td>
                <Td className="tabular hidden text-right lg:table-cell">{formatMoney(v.price)}</Td>
                <Td className="hidden sm:table-cell">
                  <StockPill stock={v.stock} threshold={v.lowStockThreshold} hidden={hidden} />
                </Td>
                <Td>
                  <StockForm action={updateStock.bind(null, v.id)} stock={v.stock} lowStockThreshold={v.lowStockThreshold} label={`${v.product.name} ${v.label}`} />
                </Td>
              </tr>
            );
          })}
        </tbody>
      </TableWrap>
    </>
  );
}
