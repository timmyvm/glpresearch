import { PageHeader } from "@/components/admin/ui";
import { ProductForm } from "@/components/admin/product-form";
import { saveProduct } from "../actions";

export const metadata = { title: "New product" };

export default function NewProductPage() {
  return (
    <>
      <PageHeader
        back={{ href: "/admin/products", label: "Products" }}
        title="New product"
        description="Add a compound and at least one variant. It stays hidden until you tick On sale."
      />
      <ProductForm action={saveProduct.bind(null, null)} />
    </>
  );
}
