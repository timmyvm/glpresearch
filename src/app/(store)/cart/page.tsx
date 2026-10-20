import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { db } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { formatMoney } from "@/lib/money";
import { CartView } from "@/components/checkout/cart-view";

export const metadata: Metadata = { title: "Cart", robots: { index: false } };

export default async function CartPage() {
  const [settings, featured] = await Promise.all([
    getSettings(),
    db.product.findMany({
      where: { active: true, featured: true },
      orderBy: { sortOrder: "asc" },
      take: 3,
      include: { variants: { where: { active: true }, orderBy: { price: "asc" }, take: 1 } },
    }),
  ]);

  return (
    <div className="container-page py-10 sm:py-14">
      <div className="mb-8">
        <p className="eyebrow">Cart</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink-900">Your cart</h1>
      </div>
      <CartView freeShippingThreshold={settings.freeShippingThreshold} />

      {featured.length > 0 ? (
        <section className="mt-16">
          <h2 className="text-lg font-semibold text-ink-900">Researchers also order</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            {featured.map((p) => (
              <Link
                key={p.id}
                href={`/shop/${p.slug}`}
                className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition-shadow hover:shadow-lg hover:shadow-ink-900/5"
              >
                <div className="relative aspect-[4/3] bg-slate-100">
                  <Image src={p.image} alt={p.name} fill sizes="(min-width: 640px) 33vw, 100vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                </div>
                <div className="flex items-start justify-between gap-3 p-4">
                  <div>
                    <p className="font-semibold text-ink-900">{p.name}</p>
                    <p className="text-xs text-slate-500">{p.subtitle}</p>
                  </div>
                  {p.variants[0] ? (
                    <p className="shrink-0 text-sm font-semibold text-ink-900">from {formatMoney(p.variants[0].price)}</p>
                  ) : null}
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
