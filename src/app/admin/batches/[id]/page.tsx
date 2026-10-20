import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { toDateInput } from "@/lib/admin/format";
import { PageHeader } from "@/components/admin/ui";
import { BatchForm } from "@/components/admin/batch-form";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { deleteBatch, saveBatch } from "../actions";

export const metadata = { title: "Edit batch" };

export default async function EditBatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [batch, products] = await Promise.all([
    db.batch.findUnique({ where: { id } }),
    db.product.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, name: true, variants: { select: { label: true } } } }),
  ]);
  if (!batch) notFound();

  return (
    <>
      <PageHeader
        back={{ href: "/admin/batches", label: "Batches" }}
        title={<span className="font-mono">{batch.batchNumber}</span>}
        actions={
          <ConfirmButton action={deleteBatch.bind(null, batch.id)} message={`Delete batch ${batch.batchNumber}?`} size="md">
            Delete batch
          </ConfirmButton>
        }
      />
      <BatchForm
        action={saveBatch.bind(null, batch.id)}
        products={products}
        initial={{ ...batch, testedAt: toDateInput(batch.testedAt), expiresAt: toDateInput(batch.expiresAt) }}
      />
    </>
  );
}
