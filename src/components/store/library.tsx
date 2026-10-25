"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { pictureCaption } from "@/content/credits";
import { cn, formatDate } from "@/lib/utils";
import { splitTitle } from "./article-title";
import { TIMELINE } from "@/content/timeline";

/*
 * The research library's topic filter runs in the browser so /research can be served as static
 * HTML. The page renders the plain components (all topics) as Suspense fallbacks, which is what
 * the static HTML and search engines see; the *FromUrl versions take over with the URL's topic.
 * The body is the journal's contents sheet: one paper page with the lead article and the contents.
 */

export const TOPICS = ["Fundamentals", "Compounds", "Clinical Research", "Lab Practice", "Reference"];

export type LibraryArticle = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  coverImage: string | null;
  readingMinutes: number;
  publishedAt: Date;
};

function useTopic() {
  const category = useSearchParams().get("category");
  return category && TOPICS.includes(category) ? category : undefined;
}

export function LibraryTopics({ active }: { active?: string }) {
  return (
    <nav aria-label="Filter by topic" className="mt-8 flex flex-wrap gap-x-6 gap-y-2">
      {[undefined, ...TOPICS].map((c) => (
        <Link
          key={c ?? "all"}
          href={c ? `/research?category=${encodeURIComponent(c)}` : "/research"}
          scroll={false}
          aria-current={active === c ? "page" : undefined}
          className={cn("link text-lead", active === c ? "text-ink decoration-ink" : "text-muted decoration-transparent hover:text-ink")}
        >
          {c ?? "All topics"}
        </Link>
      ))}
    </nav>
  );
}

export function LibraryTopicsFromUrl() {
  return <LibraryTopics active={useTopic()} />;
}

export function LibraryBody({ articles: all, active }: { articles: LibraryArticle[]; active?: string }) {
  const shown = active ? all.filter((a) => a.category === active) : all;
  const [lead, ...rest] = shown;
  const leadTitle = lead ? splitTitle(lead.title) : null;
  const caption = pictureCaption(lead?.coverImage);

  return (
    <>
      <section className="bg-field-paper pt-12 pb-24 md:pt-16 md:pb-32" aria-labelledby="contents-title">
        <div className="frame">
          <article className="bg-paper px-5 pt-8 pb-10 sm:px-8 md:px-12 md:pt-12 md:pb-14">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
              <h2 id="contents-title" className="text-index font-semibold">
                {active ? `Contents: ${active}` : "Contents"}
              </h2>
              <p className="tabular text-body text-muted">
                {shown.length} {shown.length === 1 ? "article" : "articles"}
                {all.length ? `, latest ${formatDate(all.reduce((d, a) => (a.publishedAt > d ? a.publishedAt : d), all[0].publishedAt), { day: "numeric", month: "long", year: "numeric" })}` : ""}
              </p>
            </div>

            {lead && leadTitle ? (
              <Link href={`/research/${lead.slug}`} className="group mt-8 grid gap-6 md:mt-10 md:grid-cols-12 md:gap-x-10">
                <figure className="md:col-span-7" data-reveal>
                  <div className="relative aspect-[16/10] overflow-clip bg-surface-2">
                    {lead.coverImage ? (
                      <Image src={lead.coverImage} alt="" fill preload sizes="(min-width: 768px) 55vw, 100vw" className="object-cover transition-transform duration-700 ease-[var(--ease-out)] group-hover:scale-[1.02]" />
                    ) : null}
                  </div>
                  {caption ? <figcaption className="mt-2 text-small text-muted">{caption}</figcaption> : null}
                </figure>
                <div className="flex flex-col md:col-span-5" data-reveal style={{ "--i": 1 } as React.CSSProperties}>
                  <p className="text-body text-muted">
                    {lead.category}, {lead.readingMinutes} minute read
                  </p>
                  <h3 className="mt-3 text-index font-semibold group-hover:underline group-hover:decoration-[0.06em] group-hover:underline-offset-[0.15em]">
                    {leadTitle.head}
                  </h3>
                  {leadTitle.rest ? <p className="mt-4 max-w-[40ch] text-lead">{leadTitle.rest}</p> : null}
                  <p className="mt-5 max-w-[52ch] text-body">{lead.excerpt}</p>
                  <p className="mt-6 text-body font-medium md:mt-auto md:pt-6">
                    <span className="link">Read the article</span>
                  </p>
                </div>
              </Link>
            ) : (
              <div className="mt-8 bg-surface p-8">
                <p className="text-lead">No articles on this topic yet.</p>
                <Link href="/research" className="link mt-3 inline-block">
                  Show every article
                </Link>
              </div>
            )}

            {rest.length ? (
              <ol className="mt-12 space-y-1 md:mt-16" aria-label="More articles">
                {rest.map((a, i) => {
                  const t = splitTitle(a.title);
                  return (
                    <li key={a.slug} data-reveal style={{ "--i": i % 4 } as React.CSSProperties}>
                      <Link
                        href={`/research/${a.slug}`}
                        className="group grid grid-cols-[5.5rem_1fr] items-start gap-4 p-2 transition-colors duration-200 hover:bg-white sm:grid-cols-[7.5rem_1fr] md:grid-cols-[9rem_1fr_19rem] md:items-center md:gap-x-8 md:p-3"
                      >
                        <span className="relative block aspect-[4/3] overflow-clip bg-surface-2">
                          {a.coverImage ? <Image src={a.coverImage} alt="" fill sizes="(min-width: 768px) 144px, 120px" className="object-cover" /> : null}
                        </span>
                        <span className="min-w-0">
                          <span className="block text-lead font-medium group-hover:underline group-hover:decoration-[0.07em] group-hover:underline-offset-[0.2em]">{t.head}</span>
                          <span className="mt-1 block max-w-[64ch] text-body text-muted md:line-clamp-1">{t.rest ?? a.excerpt}</span>
                          <span className="mt-2 block text-small text-muted md:hidden">
                            {a.category}, {a.readingMinutes} min
                          </span>
                        </span>
                        <span className="hidden items-baseline gap-3 text-body md:flex">
                          <span className="leader min-w-6 flex-1" aria-hidden="true" />
                          <span className="whitespace-nowrap text-muted">{a.category}</span>
                          <span className="tabular w-16 text-right whitespace-nowrap">{a.readingMinutes} min</span>
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ol>
            ) : null}
          </article>
        </div>
      </section>

      {!active ? (
        <section id="timeline" className="bg-field-black py-24 text-white md:py-32" aria-labelledby="timeline-title">
          <div className="frame grid gap-6 md:grid-cols-12 md:items-end md:gap-x-[var(--gutter)]" data-reveal>
            <h2 id="timeline-title" className="max-w-[16ch] text-head font-semibold md:col-span-7">
              Six decades of incretin science
            </h2>
            <div className="md:col-span-5 lg:col-span-4 lg:col-start-9">
              <p className="max-w-[36ch] text-lead text-on-black-muted">
                From a hormone predicted in the proglucagon gene to one of the most studied classes of medicine.
              </p>
              <Link href="/research/history-of-glp-1" className="link mt-5 inline-block text-body font-medium">
                Read the history
              </Link>
            </div>
          </div>
          <div className="frame mt-12 grid md:mt-16 lg:grid-cols-12 lg:gap-x-[var(--gutter)]">
            <ol className="lg:col-span-8 lg:col-start-5">
              {TIMELINE.map((t, i) => (
                <li key={t.year + t.event} className="grid gap-1 py-5 sm:grid-cols-[8rem_1fr] sm:gap-8" data-reveal style={{ "--i": i % 3 } as React.CSSProperties}>
                  <p className="tabular text-index font-semibold">{t.year}</p>
                  <p className="max-w-[60ch] text-body sm:pt-2 md:text-lead">{t.event}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      ) : null}
    </>
  );
}

export function LibraryBodyFromUrl({ articles }: { articles: LibraryArticle[] }) {
  return <LibraryBody articles={articles} active={useTopic()} />;
}
