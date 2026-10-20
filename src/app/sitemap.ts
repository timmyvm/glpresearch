import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { siteUrl } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, articles] = await Promise.all([
    db.product.findMany({ where: { active: true }, select: { slug: true, updatedAt: true } }),
    db.article.findMany({ where: { published: true }, select: { slug: true, updatedAt: true } }),
  ]);
  const pages = ["", "/shop", "/research", "/compare", "/coa", "/faq", "/about", "/contact", "/shipping", "/terms", "/privacy", "/disclaimer"];
  return [
    ...pages.map((p) => ({ url: siteUrl(p), changeFrequency: "weekly" as const, priority: p === "" ? 1 : 0.7 })),
    ...products.map((p) => ({ url: siteUrl(`/shop/${p.slug}`), lastModified: p.updatedAt, priority: 0.9 })),
    ...articles.map((a) => ({ url: siteUrl(`/research/${a.slug}`), lastModified: a.updatedAt, priority: 0.8 })),
  ];
}
