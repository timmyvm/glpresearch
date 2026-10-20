import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink, FlaskConical } from "lucide-react";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { Alert } from "@/components/ui/alert";
import { buttonClass } from "@/components/ui/button";
import { PageHeader } from "@/components/admin/ui";
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
  const unitsSold = await db.orderItem.aggregate({
    where: { variant: { productId: id }, order: { paymentStatus: "PAID" } },
    _sum: { quantity: true },
  });

  return (
    <>
      <PageHeader
        back={{ href: "/admin/products", label: "Products" }}
        title={product.name}
        description={`${product.variants.length} variants · ${unitsSold._sum.quantity ?? 0} units sold · last updated ${formatDate(product.updatedAt)}`}
        actions={
          <>
            <Link href={`/shop/${product.slug}`} target="_blank" className={buttonClass("ghost", "md")}>
              <ExternalLink className="size-4" /> View in store
            </Link>
            <Link href={`/admin/batches?product=${product.id}`} className={buttonClass("outline", "md")}>
              <FlaskConical className="size-4" /> Batches ({product._count.batches})
            </Link>
            <ConfirmButton
              action={deleteProduct.bind(null, product.id)}
              message={`Delete ${product.name}? This removes its variants and batches. Past orders keep their line items.`}
              size="md"
            >
              Delete
            </ConfirmButton>
          </>
        }
      />
      {sp.created ? (
        <Alert tone="success" className="mb-6">
          Product created. You can keep editing below.
        </Alert>
      ) : null}
      <ProductForm action={saveProduct.bind(null, product.id)} initial={product} />
    </>
  );
}
