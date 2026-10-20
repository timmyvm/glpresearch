import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { PRODUCT_CATEGORIES, type ProductCategory } from "@/lib/orders";
import { cn } from "@/lib/utils";
import { PageIntro, TitleLines } from "@/components/store/page-intro";
import { SpecimenTile } from "@/components/store/specimen-tile";

export const metadata: Metadata = {
  title: "Catalogue",
  description: "Seven research peptides that act on the GLP-1 receptor: GLP-1, dual and triple agonists. Every batch tested by HPLC and mass spectrometry.",
};

const SORTS = {
  featured: "Catalogue order",
  "price-asc": "Price, low to high",
  "price-desc": "Price, high to low",
  name: "Name",
} as const;

const CLASS_NOTES: Record<ProductCategory, { title: string; text: string; href: string }> = {
  GLP1: {
    title: "GLP-1 receptor agonists",
    text: "Act on the GLP-1 receptor alone. The best-characterised class and the reference point for every newer compound.",
    href: "/research/how-glp-1-receptor-agonists-work",
  },
  DUAL: {
    title: "Dual agonists",
    text: "Add a second receptor to GLP-1: GIP for tirzepatide, glucagon for survodutide and mazdutide.",
    href: "/research/single-dual-triple-agonists",
  },
  TRIPLE: {
    title: "Triple agonists",
    text: "Act on the GIP, GLP-1 and glucagon receptors from a single peptide. Retatrutide is the furthest along.",
    href: "/research/single-dual-triple-agonists",
  },
};

export default async function ShopPage({ searchParams }: { searchParams: Promise<{ category?: string; sort?: string }> }) {
  const params = await searchParams;
  const category = params.category && params.category in PRODUCT_CATEGORIES ? (params.category as ProductCategory) : undefined;
  const sort = params.sort && params.sort in SORTS ? (params.sort as keyof typeof SORTS) : "featured";

  const [products, counts] = await Promise.all([
    db.product.findMany({
      where: { active: true, ...(category ? { category } : {}) },
      orderBy: sort === "name" ? { name: "asc" } : { sortOrder: "asc" },
      select: {
        slug: true,
        name: true,
        subtitle: true,
        image: true,
        accentColor: true,
        regulatoryStatus: true,
        variants: { where: { active: true }, select: { price: true, stock: true, label: true }, orderBy: { sortOrder: "asc" } },
      },
    }),
    db.product.groupBy({ by: ["category"], where: { active: true }, _count: true }),
  ]);

  const minPrice = (p: (typeof products)[number]) => Math.min(...p.variants.map((v) => v.price));
  if (sort === "price-asc") products.sort((a, b) => minPrice(a) - minPrice(b));
  if (sort === "price-desc") products.sort((a, b) => minPrice(b) - minPrice(a));
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

  // One double-width tile leads; a class note closes any row the tiles leave open.
  const cells = products.length + (products.length ? 1 : 0);
  const spare = (4 - (cells % 4)) % 4;

  return (
    <>
      <PageIntro
        title={<TitleLines lines={["GLP-1 research", "peptides"]} />}
        lead="Seven research compounds that act on the GLP-1 receptor, supplied as lyophilised powder in 3 mL vials. Every batch is tested before release."
      >
        <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-baseline md:justify-between">
          <nav aria-label="Filter by receptor class" className="flex flex-wrap gap-x-6 gap-y-2">
            {[{ key: undefined, label: "All", count: total }, ...(Object.keys(PRODUCT_CATEGORIES) as ProductCategory[]).map((key) => ({ key, label: PRODUCT_CATEGORIES[key].label, count: counts.find((c) => c.category === key)?._count ?? 0 }))].map((f) => {
              const active = category === f.key;
              return (
                <Link
                  key={f.label}
                  href={href({ category: f.key })}
                  aria-current={active ? "page" : undefined}
                  className={cn("link text-body", active ? "text-ink decoration-ink" : "text-muted decoration-transparent hover:text-ink")}
                >
                  {f.label} <span className="tabular">{f.count}</span>
                </Link>
              );
            })}
          </nav>
          <nav aria-label="Sort" className="flex flex-wrap items-baseline gap-x-5 gap-y-1 text-small">
            <span className="text-muted">Sort by</span>
            {(Object.keys(SORTS) as (keyof typeof SORTS)[]).map((key) => (
              <Link
                key={key}
                href={href({ sort: key })}
                aria-current={sort === key ? "true" : undefined}
                className={cn("link", sort === key ? "text-ink decoration-ink" : "text-muted decoration-transparent hover:text-ink")}
              >
                {SORTS[key]}
              </Link>
            ))}
          </nav>
        </div>
      </PageIntro>

      <section className="frame pt-10" aria-label="Compounds">
        {products.length ? (
          <div className="grid grid-cols-2 gap-x-2 gap-y-10 md:grid-cols-4 md:gap-x-3 md:gap-y-14">
            {products.map((p, i) => (
              <div key={p.slug} className={i === 0 ? "col-span-2" : undefined} data-reveal style={{ "--i": i % 4 } as React.CSSProperties}>
                <SpecimenTile product={p} wide={i === 0} priority={i < 3} />
              </div>
            ))}
            {spare ? (
              <div className={cn("flex flex-col justify-between gap-6 bg-surface p-6", spare === 1 ? "col-span-2 md:col-span-1" : spare === 2 ? "col-span-2" : "col-span-2 md:col-span-3")}>
                <p className="max-w-[34ch] text-lead">
                  {category ? CLASS_NOTES[category].text : "Every compound has a full monograph, its batch results and the published studies on its page."}
                </p>
                <Link href={category ? CLASS_NOTES[category].href : "/compare"} className="link font-medium">
                  {category ? "Read the explainer" : "Compare all seven"}
                </Link>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="bg-surface p-8">
            <p className="text-lead">No compounds in this class right now.</p>
            <Link href="/shop" className="link mt-3 inline-block">
              Show the whole catalogue
            </Link>
          </div>
        )}
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
                Show {counts.find((c) => c.category === key)?._count ?? 0}
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
