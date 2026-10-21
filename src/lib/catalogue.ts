import { PRODUCT_CATEGORIES, type ProductCategory } from "@/lib/orders";

export const SORTS = {
  featured: "Catalogue order",
  "price-asc": "Price, low to high",
  "price-desc": "Price, high to low",
  name: "Name",
} as const;

export type CatalogueSort = keyof typeof SORTS;

export const CLASS_NOTES: Record<ProductCategory, { title: string; text: string; href: string }> = {
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

export function parseCategory(value: string | null | undefined): ProductCategory | undefined {
  return value && value in PRODUCT_CATEGORIES ? (value as ProductCategory) : undefined;
}

export function parseSort(value: string | null | undefined): CatalogueSort {
  return value && value in SORTS ? (value as CatalogueSort) : "featured";
}

export function catalogueHref(category: ProductCategory | undefined, sort: CatalogueSort) {
  const q = new URLSearchParams();
  if (category) q.set("category", category);
  if (sort !== "featured") q.set("sort", sort);
  const qs = q.toString();
  return qs ? `/shop?${qs}` : "/shop";
}
