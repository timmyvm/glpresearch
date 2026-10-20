import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { Alert } from "@/components/ui/alert";
import { buttonClass } from "@/components/ui/button";
import { PageHeader, Swatch } from "@/components/admin/ui";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { ProductForm } from "@/components/admin/product-form";
import { deleteProduct, saveProduct } from "../actions";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = await db.product.findUnique({ where: { id }, select: { name: true } });
  return { title: p ? `Edit ${p.name}` : "Product" };
}

export default async function EditProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string }>;
}) {
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const product = await db.product.findUnique({
    where: { id },
    include: {
      variants: { orderBy: { sortOrder: "asc" } },
      batches: { orderBy: { testedAt: "desc" }, take: 5 },
      _count: { select: { batches: true } },
    },
  });
  if (!product) notFound();
  const [unitsSold, waiting] = await Promise.all([
    db.orderItem.aggregate({
      where: { variant: { productId: id }, order: { paymentStatus: "PAID" } },
      _sum: { quantity: true },
    }),
    db.stockAlert.count({ where: { notifiedAt: null, variant: { productId: id } } }),
  ]);
  const sold = unitsSold._sum.quantity ?? 0;

  return (
    <>
      <PageHeader
        back={{ href: "/admin/products", label: "Products" }}
        title={
          <span className="flex items-center gap-3">
            <Swatch color={product.accentColor} className="size-3.5" />
            {product.name}
          </span>
        }
        description={`${product.variants.length} variant${product.variants.length === 1 ? "" : "s"}, ${sold} unit${sold === 1 ? "" : "s"} sold${
          waiting ? `, ${waiting} customer${waiting === 1 ? "" : "s"} waiting for restock` : ""
        }. Last updated ${formatDate(product.updatedAt)}.`}
        actions={
          <>
            <Link href={`/shop/${product.slug}`} target="_blank" className={buttonClass("ghost", "sm")}>
              View in Store
            </Link>
            <Link href={`/admin/batches?product=${product.id}`} className={buttonClass("outline", "sm", "ring-1 ring-ink/25")}>
              Batches ({product._count.batches})
            </Link>
            <ConfirmButton
              action={deleteProduct.bind(null, product.id)}
              message={`Delete ${product.name}? This removes its ${product.variants.length} variants and ${product._count.batches} batch certificates. Past orders keep their line items. This can't be undone.`}
              variant="ghost"
              className="text-danger hover:bg-[#ffedea]"
            >
              Delete Product
            </ConfirmButton>
          </>
        }
      />
      {sp.created ? (
        <Alert tone="success" className="mb-6">
          Product created. Keep editing below, or tick On sale and save to publish it.
        </Alert>
      ) : null}
      <ProductForm action={saveProduct.bind(null, product.id)} initial={product} />
    </>
  );
}
