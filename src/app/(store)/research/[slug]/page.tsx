import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { db } from "@/lib/db";
import { ORG_ID, breadcrumbLd, organizationLd } from "@/lib/seo";
import { getSettings } from "@/lib/settings";
import { cn, formatDate, siteUrl } from "@/lib/utils";
import { JsonLd } from "@/components/seo/json-ld";
import { splitTitle } from "@/components/store/article-title";
import { Markdown, extractHeadings } from "@/components/store/markdown";

type Params = { params: Promise<{ slug: string }> };

// Shared by generateMetadata and the page, so each render queries once.
const getArticle = cache(async (slug: string) => db.article.findFirst({ where: { slug, published: true } }));

// Every published article is built ahead of time; new ones are built on their first visit.
export async function generateStaticParams() {
  const articles = await db.article.findMany({ where: { published: true }, select: { slug: true } });
  return articles.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const article = await getArticle((await params).slug);
  if (!article) return {};
  return {
    title: article.title,
    description: article.excerpt,
    alternates: { canonical: `/research/${article.slug}` },
    // Replaces the layout's openGraph object, so it repeats the site fields.
    openGraph: {
      type: "article",
      siteName: "GLP Research",
      locale: "en_AU",
      title: article.title,
      description: article.excerpt,
      publishedTime: article.publishedAt.toISOString(),
      modifiedTime: article.updatedAt.toISOString(),
      section: article.category,
    },
  };
}

export default async function ArticlePage({ params }: Params) {
  const article = await getArticle((await params).slug);
  if (!article) notFound();

  const { head, rest } = splitTitle(article.title);
  const headings = extractHeadings(article.content);
  const [others, products, settings] = await Promise.all([
    db.article.findMany({
      where: { published: true, id: { not: article.id } },
      orderBy: { publishedAt: "desc" },
      take: 3,
      select: { slug: true, title: true, category: true, readingMinutes: true, coverImage: true },
    }),
    db.product.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
      select: { slug: true, name: true, subtitle: true, accentColor: true },
    }),
    getSettings(),
  ]);
  const lower = article.content.toLowerCase();
  const mentioned = products.filter((p) => lower.includes(p.name.toLowerCase())).slice(0, 5);

  const url = siteUrl(`/research/${article.slug}`);
  const articleLd = {
    "@type": "Article",
    "@id": `${url}#article`,
    headline: article.title,
    description: article.excerpt,
    url,
    mainEntityOfPage: url,
    image: article.coverImage ? siteUrl(article.coverImage) : undefined,
    articleSection: article.category,
    wordCount: article.content.split(/\s+/).length,
    inLanguage: "en-AU",
    datePublished: article.publishedAt.toISOString(),
    dateModified: article.updatedAt.toISOString(),
    author: { "@type": "Organization", name: article.author },
    publisher: { "@id": ORG_ID },
  };
  const crumbs = breadcrumbLd([
    { name: "Home", path: "/" },
    { name: "Research library", path: "/research" },
    { name: article.title, path: `/research/${article.slug}` },
  ]);

  return (
    <article>
      <JsonLd data={[articleLd, crumbs, organizationLd({ name: settings.storeName, email: settings.supportEmail })]} />

      <header className="frame grid gap-6 pt-8 md:grid-cols-12 md:gap-x-[var(--gutter)] md:pt-14">
        <nav aria-label="Breadcrumb" className="text-small text-muted md:col-span-12">
          <Link href="/research" className="link">
            Research library
          </Link>{" "}
          <span aria-hidden="true">/</span>{" "}
          <Link href={`/research?category=${encodeURIComponent(article.category)}`} className="link">
            {article.category}
          </Link>
        </nav>
        {/* A long title without a "?" or ":" to split on takes the full width. */}
        <h1 className={cn("lines text-head", head.length > 40 ? "md:col-span-12" : "md:col-span-8")}>
          <span className="line">
            <span data-line>{head}</span>
          </span>
        </h1>
        <div className="md:col-span-8" data-load style={{ "--d": "280ms" } as React.CSSProperties}>
          {rest ? <p className="max-w-[40ch] text-lead font-medium">{rest}</p> : null}
          <p className="mt-3 max-w-[50ch] text-lead text-muted">{article.excerpt}</p>
          <p className="mt-6 text-small text-muted">
            {article.author}, {formatDate(article.publishedAt, { day: "numeric", month: "long", year: "numeric" })}, {article.readingMinutes} minute read
          </p>
        </div>
      </header>

      {article.coverImage ? (
        <div className="frame mt-10 md:mt-14">
          <div className="relative aspect-[4/3] overflow-clip bg-ink sm:aspect-[21/9]" data-load style={{ "--d": "450ms" } as React.CSSProperties}>
            <Image src={article.coverImage} alt="" fill preload sizes="(min-width: 1760px) 1760px, 100vw" className="object-cover" />
          </div>
        </div>
      ) : null}

      <div className="frame grid gap-12 pt-14 md:pt-20 lg:grid-cols-12 lg:gap-x-[var(--gutter)]">
        <nav className="hidden lg:col-span-3 lg:block" aria-label="In this article">
          {headings.length > 1 ? (
            <div className="sticky top-24" data-reveal>
              <p className="text-small text-muted">In this article</p>
              <ol className="mt-3 space-y-2">
                {headings.map((h) => (
                  <li key={h.id}>
                    <a href={`#${h.id}`} className="link text-small decoration-transparent hover:decoration-ink">
                      {h.text}
                    </a>
                  </li>
                ))}
              </ol>
            </div>
          ) : null}
        </nav>

        <div className="min-w-0 lg:col-span-6">
          <Markdown className="max-w-[68ch]">{article.content}</Markdown>
          <p className="mt-14 max-w-[62ch] text-muted" data-reveal>
            This article summarises published scientific literature for research and education. It is not medical advice.
            Products sold by GLP Research are for laboratory research only and are not for human or veterinary use.
          </p>
        </div>

        <aside className="space-y-10 lg:col-span-3">
          {mentioned.length ? (
            <section aria-labelledby="mentioned-title" className="lg:sticky lg:top-24">
              <h2 id="mentioned-title" className="text-small text-muted">
                Compounds in this article
              </h2>
              <ul className="mt-3 space-y-1">
                {mentioned.map((p, i) => (
                  <li key={p.slug} data-reveal style={{ "--i": i } as React.CSSProperties}>
                    <Link href={`/shop/${p.slug}`} className="group flex items-start gap-3 py-2">
                      <span className="mt-1.5 size-3 shrink-0" style={{ backgroundColor: p.accentColor }} aria-hidden="true" />
                      <span className="min-w-0">
                        <span className="block font-medium group-hover:underline">{p.name}</span>
                        <span className="block text-small text-muted">{p.subtitle}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </aside>
      </div>

      {others.length ? (
        <section className="frame pt-28 md:pt-40" aria-labelledby="next-title">
          <h2 id="next-title" className="text-index font-medium" data-reveal>
            Keep reading
          </h2>
          <ul className="mt-8 grid gap-x-3 gap-y-10 md:grid-cols-3">
            {others.map((o, i) => {
              const t = splitTitle(o.title);
              return (
                <li key={o.slug} data-reveal style={{ "--i": i } as React.CSSProperties}>
                  <Link href={`/research/${o.slug}`} className="group block">
                    <div className="relative aspect-[3/2] overflow-clip bg-ink">
                      {o.coverImage ? <Image src={o.coverImage} alt="" fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover transition-transform duration-700 ease-[var(--ease-out)] group-hover:scale-[1.02]" /> : null}
                    </div>
                    <p className="mt-3 text-lead font-medium group-hover:underline group-hover:decoration-[0.07em] group-hover:underline-offset-[0.2em]">{t.head}</p>
                    <p className="mt-1 text-small text-muted">
                      {o.category}, {o.readingMinutes} min
                    </p>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}
    </article>
  );
}
