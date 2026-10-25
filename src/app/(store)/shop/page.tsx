import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { db } from "@/lib/db";
import { CLASS_NOTES } from "@/lib/catalogue";
import { breadcrumbLd } from "@/lib/seo";
import { siteUrl } from "@/lib/utils";
import { ARCHIVE } from "@/content/credits";
import { JsonLd } from "@/components/seo/json-ld";
import { PRODUCT_CATEGORIES, type ProductCategory } from "@/lib/orders";
import { PageIntro, TitleLines } from "@/components/store/page-intro";
import { CatalogueFilters, CatalogueFiltersFromUrl, CatalogueGrid, CatalogueGridFromUrl, type CatalogueProduct } from "@/components/store/catalogue";
import { ReceptorMarks } from "@/components/store/receptor-marks";

export const metadata: Metadata = {
  title: "GLP-1 research peptides",
  description: "Seven research peptides that act on the GLP-1 receptor: GLP-1, dual and triple agonists. Every batch tested by HPLC and mass spectrometry.",
  // Filtered views (?category=, ?sort=) are the same page.
  alternates: { canonical: "/shop" },
};

export default async function ShopPage() {
  // Everything is fetched once; the class and sort filters run in the browser (see catalogue.tsx).
  const rows = await db.product.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
    select: {
      slug: true,
      name: true,
      subtitle: true,
      shortDescription: true,
      category: true,
      image: true,
      accentColor: true,
      receptorTargets: true,
      halfLife: true,
      regulatoryStatus: true,
      variants: { where: { active: true }, select: { price: true, stock: true, label: true }, orderBy: { sortOrder: "asc" } },
      batches: { where: { published: true }, orderBy: { testedAt: "desc" }, take: 1, select: { batchNumber: true, purity: true } },
    },
  });
  const products: CatalogueProduct[] = rows.map(({ batches, ...p }) => ({ ...p, batch: batches[0] ?? null }));
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

      <section className="frame pt-8" aria-label="Compounds">
        <Suspense fallback={<CatalogueGrid products={products} />}>
          <CatalogueGridFromUrl products={products} />
        </Suspense>
      </section>

      <section className="frame grid gap-12 pt-28 md:grid-cols-12 md:gap-x-[var(--gutter)] md:pt-40" aria-labelledby="classes-title">
        <div className="md:col-span-5" data-reveal>
          <h2 id="classes-title" className="text-head font-semibold">
            Choosing a class
          </h2>
          <p className="mt-6 max-w-[40ch] text-lead">
            The classes differ by which receptors they reach. All seven act on the GLP-1 receptors of the pancreas; the newer ones add GIP, glucagon or both.
          </p>
          <figure className="mt-10">
            <div className="relative aspect-[3/2] bg-paper">
              <Image src={ARCHIVE.pancreas.src} alt="Wirsung's 1642 engraving of the pancreas and its duct, with lettered parts" fill sizes="(min-width: 768px) 40vw, 100vw" className="object-cover" />
            </div>
            <figcaption className="mt-3 text-small text-muted">{ARCHIVE.pancreas.title}. {ARCHIVE.pancreas.by}, {ARCHIVE.pancreas.licence}.</figcaption>
          </figure>
        </div>

        <ol className="space-y-2 md:col-span-6 md:col-start-7 md:pt-3">
          {(Object.keys(CLASS_NOTES) as ProductCategory[]).map((key, i) => {
            const members = products.filter((p) => p.category === key);
            return (
              <li key={key} className="bg-surface p-6 md:p-8" data-reveal style={{ "--i": i } as React.CSSProperties}>
                <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
                  <h3 className="text-index font-semibold">{CLASS_NOTES[key].title}</h3>
                  <Link href={`/shop?category=${key}`} className="link text-body font-medium">
                    Show {counts[key]}
                  </Link>
                </div>
                <p className="mt-3 max-w-[52ch] text-body">{CLASS_NOTES[key].text}</p>
                <ul className="mt-5 space-y-2.5">
                  {members.map((p) => (
                    <li key={p.slug} className="grid gap-1 sm:grid-cols-[11rem_1fr] sm:items-center">
                      <span className="inline-flex items-center gap-2 text-body font-medium">
                        <span className="size-2.5 shrink-0" style={{ backgroundColor: p.accentColor }} aria-hidden="true" />
                        {p.name}
                      </span>
                      <ReceptorMarks targets={p.receptorTargets} />
                    </li>
                  ))}
                </ul>
              </li>
            );
          })}
        </ol>
      </section>

      <div className="frame mt-16">
        <p className="max-w-[70ch] text-muted">
          All products are sold for in-vitro laboratory research only. They are not for human or veterinary use and are not a drug, food or cosmetic.
        </p>
      </div>
    </>
  );
}
