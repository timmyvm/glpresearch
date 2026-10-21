import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { db } from "@/lib/db";
import { CLASS_NOTES } from "@/lib/catalogue";
import { breadcrumbLd } from "@/lib/seo";
import { siteUrl } from "@/lib/utils";
import { JsonLd } from "@/components/seo/json-ld";
import { PRODUCT_CATEGORIES, type ProductCategory } from "@/lib/orders";
import { PageIntro, TitleLines } from "@/components/store/page-intro";
import { CatalogueFilters, CatalogueFiltersFromUrl, CatalogueGrid, CatalogueGridFromUrl } from "@/components/store/catalogue";

export const metadata: Metadata = {
  title: "GLP-1 research peptides",
  description: "Seven research peptides that act on the GLP-1 receptor: GLP-1, dual and triple agonists. Every batch tested by HPLC and mass spectrometry.",
  // Filtered views (?category=, ?sort=) are the same page.
  alternates: { canonical: "/shop" },
};

export default async function ShopPage() {
  // Everything is fetched once; the class and sort filters run in the browser (see catalogue.tsx).
  const products = await db.product.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
    select: {
      slug: true,
      name: true,
      subtitle: true,
      category: true,
      image: true,
      accentColor: true,
      regulatoryStatus: true,
      variants: { where: { active: true }, select: { price: true, stock: true, label: true }, orderBy: { sortOrder: "asc" } },
    },
  });
  const counts = Object.fromEntries(
    (Object.keys(PRODUCT_CATEGORIES) as ProductCategory[]).map((key) => [key, products.filter((p) => p.category === key).length]),
  ) as Record<ProductCategory, number>;

  const itemList = {
    "@type": "ItemList",
    name: "GLP-1 research peptides",
    itemListElement: products.map((p, i) => ({ "@type": "ListItem", position: i + 1, name: p.name, url: siteUrl(`/shop/${p.slug}`) })),
  };

  return (
    <>
      <JsonLd data={[itemList, breadcrumbLd([{ name: "Home", path: "/" }, { name: "Catalogue", path: "/shop" }])]} />
      <PageIntro
        title={<TitleLines lines={["GLP-1 research", "peptides"]} />}
        lead="Seven research compounds that act on the GLP-1 receptor, supplied as lyophilised powder in 3 mL vials. Every batch is tested before release."
      >
        <Suspense fallback={<CatalogueFilters counts={counts} />}>
          <CatalogueFiltersFromUrl counts={counts} />
        </Suspense>
      </PageIntro>

      <section className="frame pt-10" aria-label="Compounds">
        <Suspense fallback={<CatalogueGrid products={products} />}>
          <CatalogueGridFromUrl products={products} />
        </Suspense>
      </section>

      <section className="frame pt-28 md:pt-40" aria-labelledby="classes-title">
        <h2 id="classes-title" className="text-head" data-reveal>
          Choosing a class
        </h2>
        <ol className="mt-10 space-y-2">
          {(Object.keys(CLASS_NOTES) as ProductCategory[]).map((key, i) => (
            <li key={key} className="grid gap-3 bg-surface p-6 md:grid-cols-12 md:gap-x-[var(--gutter)] md:p-8" data-reveal style={{ "--i": i } as React.CSSProperties}>
              <h3 className="text-lead font-medium md:col-span-4">{CLASS_NOTES[key].title}</h3>
              <p className="max-w-[56ch] md:col-span-6">{CLASS_NOTES[key].text}</p>
              <Link href={`/shop?category=${key}`} className="link self-start font-medium md:col-span-2 md:justify-self-end">
                Show {counts[key]}
              </Link>
            </li>
          ))}
        </ol>
        <p className="mt-10 max-w-[62ch] text-muted" data-reveal>
          All products are sold for in-vitro laboratory research only. They are not for human or veterinary use and are not
          a drug, food or cosmetic.
        </p>
      </section>
    </>
  );
}
