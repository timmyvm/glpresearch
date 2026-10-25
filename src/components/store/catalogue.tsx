"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CLASS_NOTES, SORTS, catalogueHref, parseCategory, parseSort, type CatalogueSort } from "@/lib/catalogue";
import { formatMoney } from "@/lib/money";
import { PRODUCT_CATEGORIES, type ProductCategory } from "@/lib/orders";
import { plateInk, specimenImage } from "@/lib/plates";
import { cn } from "@/lib/utils";
import { Chromatogram } from "./chromatogram";
import { SlipRow } from "./paper";
import { ReceptorMarks } from "./receptor-marks";

/*
 * The catalogue is a supplier's price list printed on one sheet. The filters run in the browser
 * so /shop can be served as static HTML: the page renders the plain components (no filter) as
 * Suspense fallbacks, which is what the static HTML and search engines see; the *FromUrl
 * versions take over with the URL's filter.
 */

export type CatalogueProduct = {
  slug: string;
  name: string;
  subtitle: string;
  shortDescription: string;
  category: string;
  image: string;
  accentColor: string;
  receptorTargets: string;
  halfLife: string | null;
  regulatoryStatus: string | null;
  variants: { price: number; stock: number; label: string }[];
  batch: { batchNumber: string; purity: number } | null;
};

function useQuery() {
  const params = useSearchParams();
  return { category: parseCategory(params.get("category")), sort: parseSort(params.get("sort")) };
}

export function CatalogueFilters({ counts, category, sort = "featured" }: { counts: Record<ProductCategory, number>; category?: ProductCategory; sort?: CatalogueSort }) {
  const total = Object.values(counts).reduce((s, n) => s + n, 0);
  const options = [{ key: undefined, label: "All", count: total }, ...(Object.keys(PRODUCT_CATEGORIES) as ProductCategory[]).map((key) => ({ key, label: PRODUCT_CATEGORIES[key].label, count: counts[key] }))];
  return (
    <div className="mt-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
      <nav aria-label="Filter by receptor class" className="flex flex-wrap gap-1.5">
        {options.map((f) => {
          const active = category === f.key;
          return (
            <Link
              key={f.label}
              href={catalogueHref(f.key, sort)}
              scroll={false}
              aria-current={active ? "page" : undefined}
              className={cn("press inline-flex h-11 items-center gap-2 px-4 text-body font-medium", active ? "bg-ink text-white" : "bg-surface-2 text-ink hover:bg-field-paper")}
            >
              {f.label} <span className={cn("tabular", active ? "text-on-navy-muted" : "text-muted")}>{f.count}</span>
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

/** One compound on the price list. The whole entry is one link, to its data sheet. */
function Entry({ p, index }: { p: CatalogueProduct; index: number }) {
  const ink = plateInk(p.accentColor);
  const inStock = p.variants.some((v) => v.stock > 0);
  const investigational = p.regulatoryStatus?.toLowerCase().startsWith("investigational");
  return (
    <li className="group relative grid grid-cols-[7.5rem_1fr] gap-x-5 gap-y-5 py-6 sm:grid-cols-[10rem_1fr] md:grid-cols-12 md:gap-x-[var(--gutter)] md:py-8" data-reveal style={{ "--i": index % 3 } as React.CSSProperties}>
      <div className="relative row-span-2 aspect-[4/5] self-start overflow-clip md:col-span-2 md:row-span-1" style={{ backgroundColor: p.accentColor, color: ink }}>
        <Image
          src={specimenImage(p.image) ?? p.image}
          alt={`${p.name} research vial`}
          fill
          loading={index === 0 ? "eager" : undefined}
          fetchPriority={index === 0 ? "high" : undefined}
          sizes="(min-width: 768px) 14vw, 10rem"
          className="object-contain px-[12%] pt-[10%] pb-[4%] transition-transform duration-500 ease-[var(--ease-out)] group-hover:-translate-y-1.5"
        />
        {investigational || !inStock ? <p className="absolute top-2 left-2.5 text-small font-medium">{!inStock ? "Out of stock" : "Investigational"}</p> : null}
      </div>

      <div className="min-w-0 md:col-span-5">
        <h2 className="text-index font-semibold">
          <Link href={`/shop/${p.slug}`} className="after:absolute after:inset-0 group-hover:underline group-hover:decoration-[0.06em] group-hover:underline-offset-[0.14em]">
            {p.name}
          </Link>
        </h2>
        <p className="mt-1 text-body font-medium">{p.subtitle}</p>
        {p.halfLife ? <p className="text-small text-muted">Half-life {p.halfLife.replace(/^~/, "about ").replace(/\s*\(.*\)$/, "")}</p> : null}
        <ReceptorMarks targets={p.receptorTargets} className="mt-4" />
        <p className="mt-4 hidden max-w-[52ch] text-body sm:block">{p.shortDescription}</p>
      </div>

      <div className="col-span-2 sm:col-span-1 sm:col-start-2 md:col-span-5 md:col-start-auto">
        <ul className="space-y-1.5 text-body" aria-label={`${p.name} vial sizes`}>
          {p.variants.map((v) => (
            <li key={v.label}>
              <SlipRow label={v.label} value={v.stock > 0 ? formatMoney(v.price) : "Sold out"} />
            </li>
          ))}
        </ul>
        {p.batch ? (
          <div className="mt-5 grid grid-cols-[1fr_7rem] items-end gap-4">
            <p className="tabular text-small text-muted">
              Latest batch {p.batch.batchNumber}, {p.batch.purity.toFixed(2)}% purity by HPLC
            </p>
            <Chromatogram purity={p.batch.purity} seed={p.batch.batchNumber} className="h-14 text-ink [&>div:last-child]:hidden [&_span]:hidden" label={`HPLC trace for batch ${p.batch.batchNumber}`} />
          </div>
        ) : null}
      </div>
    </li>
  );
}

export function CatalogueGrid({ products: all, category, sort = "featured" }: { products: CatalogueProduct[]; category?: ProductCategory; sort?: CatalogueSort }) {
  const products = all.filter((p) => !category || p.category === category);
  if (sort === "price-asc") products.sort((a, b) => minPrice(a) - minPrice(b));
  if (sort === "price-desc") products.sort((a, b) => minPrice(b) - minPrice(a));
  if (sort === "name") products.sort((a, b) => a.name.localeCompare(b.name));

  if (!products.length) {
    return (
      <div className="bg-paper p-8">
        <p className="text-lead">No compounds in this class right now.</p>
        <Link href="/shop" className="link mt-3 inline-block">
          Show the whole catalogue
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-paper px-5 pt-6 pb-8 md:px-10 md:pt-10">
      <div className="flex flex-col gap-1 text-small text-muted md:flex-row md:justify-between">
        <p>
          {category ? PRODUCT_CATEGORIES[category].label : "Every compound"}, prices in Australian dollars per vial
        </p>
        <p>Lyophilised powder, 3 mL vials, every batch tested</p>
      </div>
      <ol className="mt-2 [&>li+li]:border-t-4 [&>li+li]:border-dotted [&>li+li]:border-ink/20">
        {products.map((p, i) => (
          <Entry key={p.slug} p={p} index={i} />
        ))}
      </ol>
      {category ? (
        <div className="mt-2 flex flex-col gap-3 bg-surface-2 p-5 md:flex-row md:items-baseline md:justify-between md:p-6">
          <p className="max-w-[56ch] text-body">{CLASS_NOTES[category].text}</p>
          <Link href={CLASS_NOTES[category].href} className="link shrink-0 font-medium">
            Read the explainer
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
