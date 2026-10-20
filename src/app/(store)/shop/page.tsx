import type { Metadata } from "next";
import Link from "next/link";
import { BadgeCheck, FileCheck2, Snowflake } from "lucide-react";
import { db } from "@/lib/db";
import { PRODUCT_CATEGORIES, type ProductCategory } from "@/lib/orders";
import { cn } from "@/lib/utils";
import { PageHero } from "@/components/store/page-hero";
import { ProductCard } from "@/components/store/product-card";

export const metadata: Metadata = {
  title: "Shop research peptides",
  description: "GLP-1, dual GIP/GLP-1, glucagon co-agonist and triple agonist research peptides — every batch HPLC and MS verified.",
};

const SORTS = {
  featured: "Featured",
  "price-asc": "Price: low to high",
  "price-desc": "Price: high to low",
  name: "Name A–Z",
} as const;

export default async function ShopPage({ searchParams }: { searchParams: Promise<{ category?: string; sort?: string }> }) {
  const params = await searchParams;
  const category = params.category && params.category in PRODUCT_CATEGORIES ? (params.category as ProductCategory) : undefined;
  const sort = params.sort && params.sort in SORTS ? (params.sort as keyof typeof SORTS) : "featured";

  const products = await db.product.findMany({
    where: { active: true, ...(category ? { category } : {}) },
    orderBy: sort === "name" ? { name: "asc" } : { sortOrder: "asc" },
    select: {
      slug: true,
      name: true,
      subtitle: true,
      image: true,
      accentColor: true,
      receptorTargets: true,
      regulatoryStatus: true,
      variants: { where: { active: true }, select: { price: true, stock: true, label: true }, orderBy: { sortOrder: "asc" } },
    },
  });

  const minPrice = (p: (typeof products)[number]) => Math.min(...p.variants.map((v) => v.price));
  if (sort === "price-asc") products.sort((a, b) => minPrice(a) - minPrice(b));
  if (sort === "price-desc") products.sort((a, b) => minPrice(b) - minPrice(a));

  const counts = await db.product.groupBy({ by: ["category"], where: { active: true }, _count: true });
  const total = counts.reduce((s, c) => s + c._count, 0);

  const href = (next: { category?: string; sort?: string }) => {
    const q = new URLSearchParams();
    const c = "category" in next ? next.category : category;
    const s = "sort" in next ? next.sort : sort;
    if (c) q.set("category", c);
    if (s && s !== "featured") q.set("sort", s);
    const qs = q.toString();
    return qs ? `/shop?${qs}` : "/shop";
  };

  return (
    <>
      <PageHero
        eyebrow="Research peptides"
        title="The incretin catalogue"
        description="Single, dual and triple receptor agonists for laboratory research. Lyophilized, independently tested and documented with a full research monograph."
        image="/images/receptor.webp"
      >
        <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-200">
          <span className="inline-flex items-center gap-2"><BadgeCheck className="size-4 text-mint-300" /> ≥99% HPLC purity</span>
          <span className="inline-flex items-center gap-2"><FileCheck2 className="size-4 text-mint-300" /> COA for every batch</span>
          <span className="inline-flex items-center gap-2"><Snowflake className="size-4 text-mint-300" /> Cold-chain packed</span>
        </div>
      </PageHero>

      <section className="container-page py-12">
        <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 md:flex-row md:items-center md:justify-between">
          <nav className="flex flex-wrap gap-2" aria-label="Filter by receptor class">
            <Link
              href={href({ category: undefined })}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                !category ? "bg-ink-900 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200",
              )}
            >
              All <span className="ml-1 opacity-60">{total}</span>
            </Link>
            {(Object.keys(PRODUCT_CATEGORIES) as ProductCategory[]).map((key) => {
              const count = counts.find((c) => c.category === key)?._count ?? 0;
              return (
                <Link
                  key={key}
                  href={href({ category: key })}
                  className={cn(
                    "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                    category === key ? "bg-ink-900 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200",
                  )}
                >
                  {PRODUCT_CATEGORIES[key].label} <span className="ml-1 opacity-60">{count}</span>
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-500">Sort</span>
            <div className="flex flex-wrap gap-1">
              {(Object.keys(SORTS) as (keyof typeof SORTS)[]).map((key) => (
                <Link
                  key={key}
                  href={href({ sort: key })}
                  className={cn(
                    "rounded-lg px-2.5 py-1.5 text-xs font-medium",
                    sort === key ? "bg-mint-50 text-mint-800 ring-1 ring-mint-600/20" : "text-slate-600 hover:bg-slate-100",
                  )}
                >
                  {SORTS[key]}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {products.length ? (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        ) : (
          <p className="py-20 text-center text-slate-500">No compounds in this category yet.</p>
        )}

        <p className="mt-12 rounded-2xl bg-slate-50 p-5 text-center text-xs leading-relaxed text-slate-500">
          All products are sold for in-vitro laboratory research only. Not for human or veterinary use. Not a drug, food
          or cosmetic.
        </p>
      </section>
    </>
  );
}
