import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { db } from "@/lib/db";
import { cn, formatDate } from "@/lib/utils";
import { splitTitle } from "@/components/store/article-title";
import { PageIntro, TitleLines } from "@/components/store/page-intro";
import { TIMELINE } from "@/content/timeline";

export const metadata: Metadata = {
  title: "Research library",
  description:
    "Referenced articles on GLP-1 and incretin biology, receptor pharmacology, the landmark clinical trials, analytical testing and laboratory handling of peptides.",
};

const CATEGORIES = ["Fundamentals", "Compounds", "Clinical Research", "Lab Practice", "Reference"];

export default async function ResearchPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category } = await searchParams;
  const active = category && CATEGORIES.includes(category) ? category : undefined;

  const articles = await db.article.findMany({
    where: { published: true, ...(active ? { category: active } : {}) },
    orderBy: [{ featured: "desc" }, { publishedAt: "desc" }],
    select: { slug: true, title: true, excerpt: true, category: true, coverImage: true, readingMinutes: true, publishedAt: true },
  });
  const [lead, ...rest] = articles;
  const leadTitle = lead ? splitTitle(lead.title) : null;

  return (
    <>
      <PageIntro
        title={<TitleLines lines={["The research", "library"]} />}
        lead="Referenced articles on GLP-1 biology, receptor pharmacology, the clinical trials and good laboratory practice, written for researchers."
      >
        <nav aria-label="Filter by topic" className="mt-8 flex flex-wrap gap-x-6 gap-y-2">
          {[undefined, ...CATEGORIES].map((c) => (
            <Link
              key={c ?? "all"}
              href={c ? `/research?category=${encodeURIComponent(c)}` : "/research"}
              aria-current={active === c ? "page" : undefined}
              className={cn("link", active === c ? "text-ink decoration-ink" : "text-muted decoration-transparent hover:text-ink")}
            >
              {c ?? "All topics"}
            </Link>
          ))}
        </nav>
      </PageIntro>

      {lead && leadTitle ? (
        <section className="frame pt-10" aria-labelledby="lead-title">
          <Link href={`/research/${lead.slug}`} className="group grid gap-6 md:grid-cols-12 md:gap-x-[var(--gutter)]">
            <div className="relative aspect-[16/10] overflow-clip bg-ink md:col-span-7" data-reveal>
              {lead.coverImage ? (
                <Image src={lead.coverImage} alt="" fill priority sizes="(min-width: 768px) 58vw, 100vw" className="object-cover transition-transform duration-700 ease-[var(--ease-out)] group-hover:scale-[1.02]" />
              ) : null}
            </div>
            <div className="flex flex-col justify-end md:col-span-5" data-reveal style={{ "--i": 1 } as React.CSSProperties}>
              <h2 id="lead-title" className="text-index font-medium group-hover:underline group-hover:decoration-[0.06em] group-hover:underline-offset-[0.15em]">
                {leadTitle.head}
              </h2>
              <p className="mt-4 max-w-[44ch] text-lead">{leadTitle.rest ?? lead.excerpt}</p>
              {leadTitle.rest ? <p className="mt-4 max-w-[52ch] text-muted">{lead.excerpt}</p> : null}
              <p className="mt-6 text-small text-muted">
                {lead.category}, {lead.readingMinutes} minute read
              </p>
            </div>
          </Link>
        </section>
      ) : (
        <section className="frame pt-10">
          <div className="bg-surface p-8">
            <p className="text-lead">No articles on this topic yet.</p>
            <Link href="/research" className="link mt-3 inline-block">
              Show every article
            </Link>
          </div>
        </section>
      )}

      {rest.length ? (
        <section className="frame pt-20 md:pt-28" aria-labelledby="index-title">
          <h2 id="index-title" className="text-head" data-reveal>
            {active ? active : "Every article"}
          </h2>
          <ol className="mt-10">
            {rest.map((a, i) => {
              const t = splitTitle(a.title);
              return (
                <li key={a.slug} data-reveal style={{ "--i": i % 4 } as React.CSSProperties}>
                  <Link
                    href={`/research/${a.slug}`}
                    className={cn("group grid grid-cols-[5.5rem_1fr] gap-4 p-3 transition-colors duration-200 md:grid-cols-12 md:gap-x-[var(--gutter)] md:p-4", i % 2 ? "" : "bg-surface", "hover:bg-surface-2")}
                  >
                    <div className="relative aspect-[4/3] overflow-clip bg-ink md:col-span-2">
                      {a.coverImage ? <Image src={a.coverImage} alt="" fill sizes="(min-width: 768px) 16vw, 88px" className="object-cover" /> : null}
                    </div>
                    <div className="min-w-0 md:col-span-7">
                      <p className="text-lead font-medium group-hover:underline group-hover:decoration-[0.07em] group-hover:underline-offset-[0.2em]">{t.head}</p>
                      <p className="mt-1 line-clamp-2 max-w-[62ch] text-muted">{t.rest ?? a.excerpt}</p>
                    </div>
                    <p className="col-start-2 text-small text-muted md:col-span-3 md:col-start-auto md:text-right">
                      {a.category}, {a.readingMinutes} min
                      <br className="hidden md:block" />
                      <span className="md:hidden">, </span>
                      {formatDate(a.publishedAt)}
                    </p>
                  </Link>
                </li>
              );
            })}
          </ol>
        </section>
      ) : null}

      {!active ? (
        <section id="timeline" className="mt-28 bg-field-navy py-20 text-on-navy md:mt-40 md:py-28" aria-labelledby="timeline-title">
          <div className="frame grid gap-10 lg:grid-cols-12 lg:gap-x-[var(--gutter)]">
            <div className="lg:col-span-4" data-reveal>
              <h2 id="timeline-title" className="text-head">
                Six decades of incretin science
              </h2>
              <p className="mt-5 max-w-[36ch] text-on-navy-muted">
                From a hormone predicted in the proglucagon gene to one of the most studied classes of medicine.
              </p>
              <Link href="/research/history-of-glp-1" className="link mt-5 inline-block">
                Read the history
              </Link>
            </div>
            <ol className="space-y-6 lg:col-span-8">
              {TIMELINE.map((t, i) => (
                <li key={t.year + t.event} className="grid gap-1 sm:grid-cols-[7rem_1fr] sm:gap-6" data-reveal style={{ "--i": i % 3 } as React.CSSProperties}>
                  <p className="tabular text-index font-medium">{t.year}</p>
                  <p className="max-w-[62ch] sm:pt-1.5">{t.event}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      ) : null}
    </>
  );
}
