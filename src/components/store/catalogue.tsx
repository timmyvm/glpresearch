"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CLASS_NOTES, SORTS, catalogueHref, parseCategory, parseSort, type CatalogueSort } from "@/lib/catalogue";
import { PRODUCT_CATEGORIES, type ProductCategory } from "@/lib/orders";
import { cn } from "@/lib/utils";
import { SpecimenTile, type SpecimenData } from "./specimen-tile";

/*
 * The catalogue filters run in the browser so /shop can be served as static HTML. The page
 * renders the plain components (no filter) as Suspense fallbacks, which is what the static
 * HTML and search engines see; the *FromUrl versions take over with the URL's filter.
 */

type CatalogueProduct = SpecimenData & { category: string };

function useQuery() {
  const params = useSearchParams();
  return { category: parseCategory(params.get("category")), sort: parseSort(params.get("sort")) };
}

export function CatalogueFilters({ counts, category, sort = "featured" }: { counts: Record<ProductCategory, number>; category?: ProductCategory; sort?: CatalogueSort }) {
  const total = Object.values(counts).reduce((s, n) => s + n, 0);
  const options = [{ key: undefined, label: "All", count: total }, ...(Object.keys(PRODUCT_CATEGORIES) as ProductCategory[]).map((key) => ({ key, label: PRODUCT_CATEGORIES[key].label, count: counts[key] }))];
  return (
    <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-baseline md:justify-between">
      <nav aria-label="Filter by receptor class" className="flex flex-wrap gap-x-6 gap-y-2">
        {options.map((f) => {
          const active = category === f.key;
          return (
            <Link
              key={f.label}
              href={catalogueHref(f.key, sort)}
              scroll={false}
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
        {(Object.keys(SORTS) as CatalogueSort[]).map((key) => (
          <Link
            key={key}
            href={catalogueHref(category, key)}
            scroll={false}
            aria-current={sort === key ? "true" : undefined}
            className={cn("link", sort === key ? "text-ink decoration-ink" : "text-muted decoration-transparent hover:text-ink")}
          >
            {SORTS[key]}
          </Link>
        ))}
      </nav>
    </div>
  );
}

export function CatalogueFiltersFromUrl({ counts }: { counts: Record<ProductCategory, number> }) {
  const { category, sort } = useQuery();
  return <CatalogueFilters counts={counts} category={category} sort={sort} />;
}

const minPrice = (p: CatalogueProduct) => Math.min(...p.variants.map((v) => v.price));

export function CatalogueGrid({ products: all, category, sort = "featured" }: { products: CatalogueProduct[]; category?: ProductCategory; sort?: CatalogueSort }) {
  const products = all.filter((p) => !category || p.category === category);
  if (sort === "price-asc") products.sort((a, b) => minPrice(a) - minPrice(b));
  if (sort === "price-desc") products.sort((a, b) => minPrice(b) - minPrice(a));
  if (sort === "name") products.sort((a, b) => a.name.localeCompare(b.name));

  // One double-width tile leads; a class note closes any row the tiles leave open.
  const cells = products.length + (products.length ? 1 : 0);
  const spare = (4 - (cells % 4)) % 4;

  if (!products.length) {
    return (
      <div className="bg-surface p-8">
        <p className="text-lead">No compounds in this class right now.</p>
        <Link href="/shop" className="link mt-3 inline-block">
          Show the whole catalogue
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-x-2 gap-y-10 md:grid-cols-4 md:gap-x-3 md:gap-y-14">
      {products.map((p, i) => (
        <div key={p.slug} className={i === 0 ? "col-span-2" : undefined} data-reveal style={{ "--i": i % 4 } as React.CSSProperties}>
          <SpecimenTile product={p} wide={i === 0} priority={i === 0} />
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
  );
}

export function CatalogueGridFromUrl({ products }: { products: CatalogueProduct[] }) {
  const { category, sort } = useQuery();
  return <CatalogueGrid products={products} category={category} sort={sort} />;
}
