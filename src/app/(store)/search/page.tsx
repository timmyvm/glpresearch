import type { Metadata } from "next";
import Form from "next/form";
import Image from "next/image";
import Link from "next/link";
import { db } from "@/lib/db";
import { formatMoney } from "@/lib/money";
import { plateInk, specimenImage } from "@/lib/plates";
import { formatDate, slugify } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { TitleLines } from "@/components/store/page-intro";
import { splitTitle } from "@/components/store/article-title";
import { FAQS } from "../faq/faqs";
import { SearchField } from "./search-field";
import { BATCH_PATTERN, escapeRegExp, hasAll, hasTerm, plain, snippet, toTerms } from "./search";

type Props = { searchParams: Promise<{ q?: string }> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const q = (await searchParams).q?.trim().slice(0, 80);
  return q
    ? { title: `Search results for “${q}”`, robots: { index: false, follow: true } }
    : { title: "Search", description: "Search GLP Research compounds, research articles, questions and batch certificates." };
}

const SUGGESTIONS = ["Tirzepatide", "Retatrutide", "Half-life", "Storage", "GIP receptor", "Certificate"];

/** Wraps each matched term in a quiet mark. */
function Highlight({ text, terms }: { text: string; terms: string[] }) {
  if (!terms.length) return <>{text}</>;
  const pattern = new RegExp(`(${terms.map(escapeRegExp).join("|")})`, "gi");
  return (
    <>
      {text.split(pattern).map((part, i) =>
        i % 2 === 1 ? (
          <mark key={i} className="bg-surface-2 text-ink">
            {part}
          </mark>
        ) : (
          part
        ),
      )}
    </>
  );
}

export default async function SearchPage({ searchParams }: Props) {
  const q = (await searchParams).q?.trim().slice(0, 80) ?? "";
  const terms = toTerms(q);
  const searching = terms.length > 0;

  const batchLike = BATCH_PATTERN.test(q);
  const [products, articles, batches] = searching
    ? await Promise.all([
        db.product.findMany({
          where: { active: true },
          orderBy: { sortOrder: "asc" },
          select: {
            slug: true,
            name: true,
            subtitle: true,
            aliases: true,
            image: true,
            accentColor: true,
            developer: true,
            receptorTargets: true,
            shortDescription: true,
            description: true,
            mechanism: true,
            variants: { where: { active: true }, select: { price: true } },
          },
        }),
        db.article.findMany({
          where: { published: true },
          orderBy: { publishedAt: "desc" },
          select: { slug: true, title: true, excerpt: true, content: true, category: true, coverImage: true, readingMinutes: true, publishedAt: true },
        }),
        batchLike
          ? db.batch.findMany({
              where: { published: true, batchNumber: { contains: q.toUpperCase().replace(/\s+/g, "") } },
              include: { product: { select: { name: true, accentColor: true } } },
              orderBy: { testedAt: "desc" },
              take: 8,
            })
          : Promise.resolve([]),
      ])
    : [[], [], []];

  // Compounds: every term somewhere in the record, ranked by where it was found.
  const productHits = products
    .map((p) => {
      const body = plain([p.description, p.mechanism ?? ""].join(" "));
      const record = [p.name, p.aliases, p.subtitle, p.developer, p.receptorTargets, p.shortDescription, body].join(" ");
      if (!hasAll(record, terms)) return null;
      const score =
        (normalisedStart(p.name, q) ? 100 : 0) +
        terms.reduce(
          (s, t) =>
            s +
            (hasTerm(p.name, t) ? 50 : 0) +
            (hasTerm(p.aliases, t) ? 30 : 0) +
            (hasTerm(p.subtitle, t) ? 20 : 0) +
            (hasTerm(p.shortDescription, t) ? 10 : 0),
          0,
        );
      const inShort = terms.some((t) => hasTerm(p.shortDescription, t));
      const from = p.variants.length ? Math.min(...p.variants.map((v) => v.price)) : null;
      return { ...p, score, from, text: inShort || !body ? p.shortDescription : snippet(body, terms) };
    })
    .filter((p) => p !== null)
    .sort((a, b) => b.score - a.score);

  // Articles: title matches first, then summary, then body.
  const articleHits = articles
    .map((a) => {
      const body = plain(a.content);
      if (!hasAll([a.title, a.excerpt, a.category, body].join(" "), terms)) return null;
      const score = terms.reduce((s, t) => s + (hasTerm(a.title, t) ? 50 : 0) + (hasTerm(a.excerpt, t) ? 20 : 0) + (hasTerm(a.category, t) ? 10 : 0), 0);
      const inExcerpt = terms.some((t) => hasTerm(a.excerpt, t));
      return { ...a, score, text: inExcerpt ? a.excerpt : snippet(body, terms) };
    })
    .filter((a) => a !== null)
    .sort((a, b) => b.score - a.score);

  // Questions from the FAQ page.
  const questionHits = searching
    ? FAQS.flatMap((g) => g.items.map((f) => ({ ...f, group: g.title }))).filter((f) => hasAll(`${f.q} ${f.a}`, terms))
    : [];

  const exact = batches.find((b) => b.batchNumber === q.toUpperCase());
  const total = productHits.length + articleHits.length + questionHits.length + batches.length;
  const groups = [
    { key: "compounds", label: "Compounds", count: productHits.length },
    { key: "articles", label: "Articles", count: articleHits.length },
    { key: "questions", label: "Questions", count: questionHits.length },
    { key: "batches", label: "Batches", count: batches.length },
  ].filter((g) => g.count > 0);

  return (
    <>
      <section className="frame grid gap-6 pt-12 md:grid-cols-12 md:items-end md:gap-x-[var(--gutter)] md:pt-20">
        <h1 className="lines text-display md:col-span-7">
          <TitleLines lines={searching ? ["Search results"] : ["Search the site"]} />
        </h1>
        <p className="max-w-[44ch] text-lead md:col-span-5" data-load style={{ "--d": "300ms" } as React.CSSProperties}>
          Find a compound by name or research code, an article by topic, or a batch by the number printed on its vial.
        </p>
        <Form action="/search" className="md:col-span-12" role="search" aria-label="Site search">
          <label htmlFor="q" className="block text-small font-medium">
            Search for
          </label>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row">
            <SearchField key={q} defaultValue={q} />
            <Button type="submit" variant="ink" size="lg">
              Search
            </Button>
          </div>
        </Form>
      </section>

      <div className="frame pt-10 md:pt-14" aria-live="polite">
        {!searching ? (
          <div className="grid gap-6 md:grid-cols-12 md:gap-x-[var(--gutter)]">
            <p className="text-lead md:col-span-4">{q ? "Type at least two letters to search." : "Popular searches"}</p>
            <ul className="flex flex-wrap gap-x-6 gap-y-3 md:col-span-8">
              {SUGGESTIONS.map((s) => (
                <li key={s}>
                  <Link href={`/search?q=${encodeURIComponent(s.toLowerCase())}`} className="link text-lead">
                    {s}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : total ? (
          <div className="flex flex-col gap-3 md:flex-row md:items-baseline md:justify-between">
            <p className="text-lead">
              <span className="tabular">{total}</span> {total === 1 ? "result" : "results"} for “{q}”
            </p>
            {groups.length > 1 ? (
              <nav aria-label="Jump to results" className="flex flex-wrap gap-x-5 gap-y-1">
                {groups.map((g) => (
                  <a key={g.key} href={`#${g.key}`} className="link text-muted decoration-transparent hover:text-ink hover:decoration-ink">
                    {g.label} <span className="tabular">{g.count}</span>
                  </a>
                ))}
              </nav>
            ) : null}
          </div>
        ) : (
          <div className="bg-surface p-6 md:p-10">
            <h2 className="text-index font-medium">Nothing matches “{q}”</h2>
            <p className="mt-4 max-w-[60ch]">
              Check the spelling, try fewer words, or search by research code (for example LY3298176) or by a batch
              number exactly as it appears on the vial label.
            </p>
            <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-3">
              <li>
                <Link href="/shop" className="link font-medium">
                  Browse the catalogue
                </Link>
              </li>
              <li>
                <Link href="/research" className="link font-medium">
                  Browse the research library
                </Link>
              </li>
              <li>
                <Link href="/coa" className="link font-medium">
                  Look up a batch
                </Link>
              </li>
            </ul>
          </div>
        )}
      </div>

      {exact ? (
        <section className="frame pt-10" aria-label="Batch found">
          <Link href={`/coa?batch=${encodeURIComponent(exact.batchNumber)}`} className="group grid gap-4 bg-field-mint p-6 sm:grid-cols-[1fr_auto] sm:items-end md:p-10">
            <span>
              <span className="tabular block text-head" translate="no">
                {exact.batchNumber}
              </span>
              <span className="mt-2 block text-lead">
                {exact.product.name}
                {exact.variantLabel ? `, ${exact.variantLabel}` : ""}, <span className="tabular">{exact.purity.toFixed(2)}%</span> purity by HPLC
              </span>
            </span>
            <span className="font-medium underline decoration-transparent underline-offset-4 group-hover:decoration-ink">View the certificate</span>
          </Link>
        </section>
      ) : null}

      {productHits.length ? (
        <ResultGroup id="compounds" title="Compounds" count={productHits.length}>
          <ul className="space-y-2">
            {productHits.map((p, i) => (
              <li key={p.slug} data-reveal style={{ "--i": i % 4 } as React.CSSProperties}>
                <Link href={`/shop/${p.slug}`} className="group grid grid-cols-[5.5rem_1fr] gap-5 bg-surface p-3 pr-5 hover:bg-surface-2 sm:grid-cols-[7rem_1fr]">
                  <span className="relative block aspect-[4/5]" style={{ backgroundColor: p.accentColor, color: plateInk(p.accentColor) }}>
                    <Image src={specimenImage(p.image) ?? p.image} alt="" fill sizes="7rem" className="object-contain px-[12%] pt-[10%] pb-[4%]" />
                  </span>
                  <span className="min-w-0 self-center py-2">
                    <span className="block text-lead font-medium group-hover:underline">
                      <Highlight text={p.name} terms={terms} />
                    </span>
                    <span className="block text-muted">
                      <Highlight text={p.subtitle} terms={terms} />
                      {p.aliases ? (
                        <>
                          , <Highlight text={p.aliases} terms={terms} />
                        </>
                      ) : null}
                    </span>
                    <span className="mt-2 block max-w-[64ch]">
                      <Highlight text={p.text} terms={terms} />
                    </span>
                    {p.from != null ? <span className="tabular mt-2 block text-muted">From {formatMoney(p.from)}</span> : null}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </ResultGroup>
      ) : null}

      {articleHits.length ? (
        <ResultGroup id="articles" title="Articles" count={articleHits.length}>
          <ul className="space-y-10">
            {articleHits.map((a, i) => {
              const t = splitTitle(a.title);
              return (
                <li key={a.slug} data-reveal style={{ "--i": i % 4 } as React.CSSProperties}>
                  <Link href={`/research/${a.slug}`} className="group grid gap-5 sm:grid-cols-[12rem_1fr]">
                    <span className="relative block aspect-[3/2] overflow-clip bg-ink">
                      {a.coverImage ? <Image src={a.coverImage} alt="" fill sizes="(min-width: 640px) 12rem, 100vw" className="object-cover transition-transform duration-700 ease-[var(--ease-out)] group-hover:scale-[1.03]" /> : null}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-lead font-medium group-hover:underline">
                        <Highlight text={t.head} terms={terms} />
                      </span>
                      {t.rest ? (
                        <span className="block text-muted">
                          <Highlight text={t.rest} terms={terms} />
                        </span>
                      ) : null}
                      <span className="mt-2 block max-w-[64ch]">
                        <Highlight text={a.text} terms={terms} />
                      </span>
                      <span className="mt-2 block text-small text-muted">
                        {a.category}, {formatDate(a.publishedAt, { day: "numeric", month: "long", year: "numeric" })}, {a.readingMinutes} minute read
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </ResultGroup>
      ) : null}

      {questionHits.length ? (
        <ResultGroup id="questions" title="Questions" count={questionHits.length}>
          <ul className="space-y-2">
            {questionHits.map((f, i) => (
              <li key={f.q} data-reveal style={{ "--i": i % 4 } as React.CSSProperties}>
                <Link href={`/faq#${slugify(f.group)}`} className="group block bg-surface p-5 hover:bg-surface-2 md:px-6">
                  <span className="block text-lead font-medium group-hover:underline">
                    <Highlight text={f.q} terms={terms} />
                  </span>
                  <span className="mt-2 block max-w-[64ch]">
                    <Highlight text={snippet(f.a, terms)} terms={terms} />
                  </span>
                  <span className="mt-2 block text-small text-muted">{f.group}</span>
                </Link>
              </li>
            ))}
          </ul>
        </ResultGroup>
      ) : null}

      {batches.length ? (
        <ResultGroup id="batches" title="Batches" count={batches.length}>
          <div className="overflow-x-auto">
            <table className="tabular w-full text-left">
              <caption className="sr-only">Batches matching your search</caption>
              <thead className="text-small text-muted">
                <tr>
                  <th scope="col" className="pr-4 pb-3 font-medium">Batch</th>
                  <th scope="col" className="px-3 pb-3 font-medium">Compound</th>
                  <th scope="col" className="px-3 pb-3 text-right font-medium">Purity</th>
                  <th scope="col" className="hidden px-3 pb-3 font-medium sm:table-cell">Tested</th>
                </tr>
              </thead>
              <tbody>
                {batches.map((b) => (
                  <tr key={b.id} className="border-t border-ink/10">{/* taste-skill-ignore: real table rows */}
                    <td className="py-3.5 pr-4">
                      <Link href={`/coa?batch=${encodeURIComponent(b.batchNumber)}`} className="link font-medium" translate="no">
                        {b.batchNumber}
                      </Link>
                    </td>
                    <td className="px-3 py-3.5">
                      <span className="inline-flex items-center gap-2.5">
                        <span className="size-3 shrink-0" style={{ backgroundColor: b.product.accentColor }} aria-hidden="true" />
                        {b.product.name}
                      </span>
                    </td>
                    <td className="px-3 py-3.5 text-right">{b.purity.toFixed(2)}%</td>
                    <td className="hidden px-3 py-3.5 sm:table-cell">{formatDate(b.testedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ResultGroup>
      ) : null}
    </>
  );
}

function normalisedStart(name: string, q: string) {
  return name.toLowerCase().startsWith(q.toLowerCase());
}

function ResultGroup({ id, title, count, children }: { id: string; title: string; count: number; children: React.ReactNode }) {
  return (
    <section id={id} className="frame grid scroll-mt-24 gap-6 pt-16 md:pt-24 lg:grid-cols-12 lg:gap-x-[var(--gutter)]" aria-labelledby={`${id}-title`}>
      <h2 id={`${id}-title`} className="text-index font-medium lg:col-span-4" data-reveal>
        {title} <span className="tabular text-muted">{count}</span>
      </h2>
      <div className="lg:col-span-8">{children}</div>
    </section>
  );
}
