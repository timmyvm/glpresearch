import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { toDateInput } from "@/lib/admin/format";
import { PageHeader } from "@/components/admin/ui";
import { BatchForm } from "@/components/admin/batch-form";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { deleteBatch, saveBatch } from "../actions";

export const metadata = { title: "Edit batch" };

export default async function EditBatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [batch, products] = await Promise.all([
    db.batch.findUnique({ where: { id }, include: { product: { select: { name: true } } } }),
    db.product.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, name: true, variants: { select: { label: true } } } }),
  ]);
  if (!batch) notFound();

  return (
    <>
      <PageHeader
        back={{ href: "/admin/batches", label: "Batch certificates" }}
        title={<span className="tabular">{batch.batchNumber}</span>}
        description={`${batch.product.name}${batch.variantLabel ? ` ${batch.variantLabel}` : ""}, tested ${formatDate(batch.testedAt)}. ${
          batch.published ? "Published on the Lab Testing page." : "Hidden from the public."
        }`}
        actions={
          <ConfirmButton
            action={deleteBatch.bind(null, batch.id)}
            message={`Delete batch ${batch.batchNumber}? Its certificate disappears from the Lab Testing page and product page. This can't be undone.`}
            variant="ghost"
            className="text-danger hover:bg-[#fbe4e1]"
          >
            Delete Batch
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
