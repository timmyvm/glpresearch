import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen, Clock } from "lucide-react";
import { db } from "@/lib/db";
import { cn, formatDate } from "@/lib/utils";
import { PageHero } from "@/components/store/page-hero";
import { TIMELINE } from "@/content/timeline";

export const metadata: Metadata = {
  title: "Research library",
  description:
    "In-depth explainers on GLP-1 and incretin biology, receptor pharmacology, landmark clinical trials, analytical testing and laboratory handling of peptides.",
};

const CATEGORIES = ["Fundamentals", "Compounds", "Clinical Research", "Lab Practice", "Reference"];

export default async function ResearchPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category } = await searchParams;
  const active = category && CATEGORIES.includes(category) ? category : undefined;

  const articles = await db.article.findMany({
    where: { published: true, ...(active ? { category: active } : {}) },
    orderBy: [{ featured: "desc" }, { publishedAt: "desc" }],
  });
  const [lead, ...rest] = articles;

  return (
    <>
      <PageHero
        eyebrow="Research library"
        title="The science of incretins, explained properly"
        description="Long-form, referenced articles on GLP-1 biology, receptor pharmacology, the clinical literature and good laboratory practice — written for researchers, not marketers."
        image="/images/peptide-helix.webp"
      />

      <section className="container-page py-12">
        <nav className="flex flex-wrap gap-2 border-b border-slate-200 pb-6" aria-label="Filter articles">
          {[undefined, ...CATEGORIES].map((c) => (
            <Link
              key={c ?? "all"}
              href={c ? `/research?category=${encodeURIComponent(c)}` : "/research"}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                active === c ? "bg-ink-900 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200",
              )}
            >
              {c ?? "All articles"}
            </Link>
          ))}
        </nav>

        {lead ? (
          <Link href={`/research/${lead.slug}`} className="group mt-10 grid overflow-hidden rounded-3xl border border-slate-200 bg-white transition-shadow hover:shadow-xl lg:grid-cols-2">
            <div className="relative aspect-[16/10] bg-ink-950 lg:aspect-auto">
              {lead.coverImage ? (
                <Image src={lead.coverImage} alt="" fill priority sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
              ) : null}
            </div>
            <div className="flex flex-col justify-center p-8 lg:p-12">
              <p className="eyebrow">{lead.featured ? "Featured · " : ""}{lead.category}</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-balance text-ink-900 group-hover:text-mint-800">{lead.title}</h2>
              <p className="mt-4 text-base leading-relaxed text-slate-600">{lead.excerpt}</p>
              <div className="mt-6 flex items-center gap-4 text-sm text-slate-500">
                <span className="inline-flex items-center gap-1.5"><Clock className="size-4" /> {lead.readingMinutes} min read</span>
                <span>{formatDate(lead.publishedAt)}</span>
              </div>
              <span className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-mint-700">
                Read article <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </span>
            </div>
          </Link>
        ) : (
          <p className="py-20 text-center text-slate-500">No articles in this category yet.</p>
        )}

        {rest.length ? (
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {rest.map((a) => (
              <Link key={a.slug} href={`/research/${a.slug}`} className="group flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white transition-shadow hover:shadow-lg">
                <div className="relative aspect-[16/9] overflow-hidden bg-ink-950">
                  {a.coverImage ? (
                    <Image src={a.coverImage} alt="" fill sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                  ) : (
                    <div className="grid-bg grid h-full place-items-center"><BookOpen className="size-8 text-mint-300" /></div>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <p className="text-xs font-semibold text-mint-700">{a.category}</p>
                  <h3 className="mt-2 text-lg font-semibold tracking-tight text-ink-900 group-hover:text-mint-800">{a.title}</h3>
                  <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-600">{a.excerpt}</p>
                  <p className="mt-auto pt-5 text-xs text-slate-500">{formatDate(a.publishedAt)} · {a.readingMinutes} min read</p>
                </div>
              </Link>
            ))}
          </div>
        ) : null}
      </section>

      {!active ? (
        <section id="timeline" className="grid-bg scroll-mt-16 bg-ink-950 py-24 text-white">
          <div className="container-page">
            <p className="eyebrow text-mint-300">Timeline</p>
            <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">Four decades of incretin science</h2>
            <p className="mt-4 max-w-2xl text-ink-200">From a hormone predicted in proglucagon to one of the most studied drug classes in history.</p>
            <ol className="relative mt-14 space-y-10 border-l border-white/15 pl-8">
              {TIMELINE.map((t) => (
                <li key={t.year + t.event} className="relative">
                  <span className="absolute top-1.5 -left-[37px] size-3 rounded-full bg-mint-400 ring-4 ring-ink-950" />
                  <p className="font-mono text-sm font-semibold text-mint-300">{t.year}</p>
                  <p className="mt-1 max-w-3xl text-base leading-relaxed text-ink-100">{t.event}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      ) : null}
    </>
  );
}
