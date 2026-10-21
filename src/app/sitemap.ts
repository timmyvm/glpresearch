import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { siteUrl } from "@/lib/utils";

export const revalidate = 3600;

// Indexable pages only: search, cart, checkout, account and order pages are noindex.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, articles] = await Promise.all([
    db.product.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" }, select: { slug: true, image: true, updatedAt: true } }),
    db.article.findMany({ where: { published: true }, orderBy: { publishedAt: "desc" }, select: { slug: true, coverImage: true, updatedAt: true } }),
  ]);
  const newest = (dates: Date[]) => (dates.length ? new Date(Math.max(...dates.map((d) => d.getTime()))) : undefined);
  const catalogueUpdated = newest(products.map((p) => p.updatedAt));
  const libraryUpdated = newest(articles.map((a) => a.updatedAt));

  const pages: MetadataRoute.Sitemap = [
    { url: siteUrl("/"), lastModified: newest([catalogueUpdated, libraryUpdated].filter((d): d is Date => !!d)), changeFrequency: "weekly", priority: 1 },
    { url: siteUrl("/shop"), lastModified: catalogueUpdated, changeFrequency: "weekly", priority: 0.9 },
    { url: siteUrl("/research"), lastModified: libraryUpdated, changeFrequency: "weekly", priority: 0.8 },
    { url: siteUrl("/compare"), lastModified: catalogueUpdated, changeFrequency: "monthly", priority: 0.7 },
    { url: siteUrl("/coa"), changeFrequency: "weekly", priority: 0.7 },
    { url: siteUrl("/faq"), changeFrequency: "monthly", priority: 0.6 },
    { url: siteUrl("/about"), changeFrequency: "monthly", priority: 0.5 },
    { url: siteUrl("/contact"), changeFrequency: "yearly", priority: 0.4 },
  ];
  const policies = ["/shipping", "/terms", "/privacy", "/disclaimer"].map((p) => ({ url: siteUrl(p), changeFrequency: "yearly" as const, priority: 0.3 }));

  return [
    ...pages,
    ...products.map((p) => ({ url: siteUrl(`/shop/${p.slug}`), lastModified: p.updatedAt, changeFrequency: "weekly" as const, priority: 0.9, images: [siteUrl(p.image)] })),
    ...articles.map((a) => ({
      url: siteUrl(`/research/${a.slug}`),
      lastModified: a.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.7,
      ...(a.coverImage ? { images: [siteUrl(a.coverImage)] } : {}),
    })),
    ...policies,
  ];
}
