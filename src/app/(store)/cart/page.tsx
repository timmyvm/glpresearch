import type { Metadata } from "next";
import { db } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { CartView } from "@/components/checkout/cart-view";
import { CartSuggestions } from "@/components/checkout/cart-suggestions";

export const metadata: Metadata = { title: "Cart", robots: { index: false } };

export default async function CartPage() {
  const [settings, featured] = await Promise.all([
    getSettings(),
    db.product.findMany({
      where: { active: true },
      orderBy: [{ featured: "desc" }, { sortOrder: "asc" }],
      select: {
        slug: true,
        name: true,
        subtitle: true,
        image: true,
        accentColor: true,
        regulatoryStatus: true,
        variants: { where: { active: true }, select: { price: true, stock: true, label: true } },
      },
    }),
  ]);

  return (
    <div className="frame pt-10 pb-24 md:pt-16 md:pb-32">
      <h1 className="mb-10 text-head md:mb-14">Your cart</h1>
      <CartView freeShippingThreshold={settings.freeShippingThreshold} />

      <CartSuggestions products={featured} />
    </div>
  );
}
