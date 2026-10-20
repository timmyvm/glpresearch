import { db } from "@/lib/db";
import { PageHeader } from "@/components/admin/ui";
import { BatchForm } from "@/components/admin/batch-form";
import { saveBatch } from "../actions";

export const metadata = { title: "New batch" };

export default async function NewBatchPage({ searchParams }: { searchParams: Promise<{ product?: string }> }) {
  const sp = await searchParams;
  const products = await db.product.findMany({
    orderBy: { sortOrder: "asc" },
    select: { id: true, name: true, variants: { select: { label: true } } },
  });
  return (
    <>
      <PageHeader back={{ href: "/admin/batches", label: "Batches" }} title="New batch" description="Record third-party test results for a manufacturing lot." />
      <BatchForm action={saveBatch.bind(null, null)} products={products} defaultProductId={sp.product} />
    </>
  );
}
