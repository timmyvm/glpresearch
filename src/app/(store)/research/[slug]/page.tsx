import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ChevronRight, Clock, FlaskConical } from "lucide-react";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { Markdown, extractHeadings } from "@/components/store/markdown";

type Params = { params: Promise<{ slug: string }> };

async function getArticle(slug: string) {
  return db.article.findFirst({ where: { slug, published: true } });
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const article = await getArticle((await params).slug);
  if (!article) return {};
  return {
    title: article.title,
    description: article.excerpt,
    openGraph: { type: "article", images: article.coverImage ? [{ url: article.coverImage }] : undefined },
  };
}

export default async function ArticlePage({ params }: Params) {
  const article = await getArticle((await params).slug);
  if (!article) notFound();

  const headings = extractHeadings(article.content);
  const [related, products] = await Promise.all([
    db.article.findMany({
      where: { published: true, id: { not: article.id } },
      orderBy: { publishedAt: "desc" },
      take: 3,
      select: { slug: true, title: true, category: true, readingMinutes: true },
    }),
    db.product.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
      select: { slug: true, name: true, subtitle: true, accentColor: true },
    }),
  ]);
  const mentioned = products.filter((p) => article.content.toLowerCase().includes(p.name.toLowerCase())).slice(0, 4);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt,
    image: article.coverImage ?? undefined,
    datePublished: article.publishedAt.toISOString(),
    dateModified: article.updatedAt.toISOString(),
    author: { "@type": "Organization", name: article.author },
  };

  return (
    <article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <header className="relative isolate overflow-hidden bg-ink-950 text-white">
        {article.coverImage ? (
          <Image src={article.coverImage} alt="" fill priority sizes="100vw" className="-z-10 object-cover opacity-35" />
        ) : null}
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ink-950 via-ink-950/80 to-ink-950/40" />
        <div className="container-page py-16 sm:py-24">
          <Link href="/research" className="inline-flex items-center gap-1.5 text-sm text-ink-200 hover:text-white">
            <ArrowLeft className="size-4" /> Research library
          </Link>
          <div className="mt-8 max-w-3xl animate-fade-up">
            <p className="eyebrow text-mint-300">{article.category}</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-balance sm:text-5xl">{article.title}</h1>
            <p className="mt-5 text-lg leading-relaxed text-pretty text-ink-200">{article.excerpt}</p>
            <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-ink-300">
              <span>{article.author}</span>
              <span>{formatDate(article.publishedAt)}</span>
              <span className="inline-flex items-center gap-1.5"><Clock className="size-4" /> {article.readingMinutes} min read</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container-page grid gap-12 py-14 lg:grid-cols-[220px_minmax(0,1fr)_260px]">
        <aside className="hidden lg:block">
          {headings.length > 1 ? (
            <nav className="sticky top-24" aria-label="Table of contents">
              <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">On this page</p>
              <ul className="mt-4 space-y-2 border-l border-slate-200">
                {headings.map((h) => (
                  <li key={h.id}>
                    <a href={`#${h.id}`} className="-ml-px block border-l border-transparent pl-4 text-sm text-slate-600 hover:border-mint-500 hover:text-ink-900">
                      {h.text}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ) : null}
        </aside>

        <div className="min-w-0">
          <Markdown>{article.content}</Markdown>
          <div className="mt-12 flex gap-3 rounded-2xl bg-slate-50 p-5 text-xs leading-relaxed text-slate-600 ring-1 ring-slate-200">
            <FlaskConical className="mt-0.5 size-4 shrink-0 text-mint-600" />
            <p>
              This article summarises published scientific literature for educational and research purposes. It is not
              medical advice. Products sold by GLP Research are for laboratory research use only and are not for human
              or veterinary use.
            </p>
          </div>
        </div>

        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          {mentioned.length ? (
            <div className="rounded-3xl border border-slate-200 p-5">
              <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">Compounds in this article</p>
              <ul className="mt-3 space-y-1">
                {mentioned.map((p) => (
                  <li key={p.slug}>
                    <Link href={`/shop/${p.slug}`} className="flex items-center gap-3 rounded-xl p-2 hover:bg-ink-50">
                      <span className="size-2 rounded-full" style={{ backgroundColor: p.accentColor }} />
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold text-ink-900">{p.name}</span>
                        <span className="block truncate text-xs text-slate-500">{p.subtitle}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {related.length ? (
            <div className="rounded-3xl bg-ink-950 p-5 text-white">
              <p className="text-xs font-semibold tracking-wide text-mint-300 uppercase">Keep reading</p>
              <ul className="mt-3 space-y-3">
                {related.map((r) => (
                  <li key={r.slug}>
                    <Link href={`/research/${r.slug}`} className="group block">
                      <span className="block text-sm font-medium text-white group-hover:text-mint-200">{r.title}</span>
                      <span className="text-xs text-ink-300">{r.category} · {r.readingMinutes} min</span>
                    </Link>
                  </li>
                ))}
              </ul>
              <Link href="/research" className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-mint-300">
                All articles <ChevronRight className="size-3.5" />
              </Link>
            </div>
          ) : null}
        </aside>
      </div>
    </article>
  );
}
