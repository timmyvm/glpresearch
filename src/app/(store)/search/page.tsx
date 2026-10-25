import type { Metadata } from "next";
import Form from "next/form";
import Image from "next/image";
import Link from "next/link";
import { db } from "@/lib/db";
import { formatMoney } from "@/lib/money";
import { PRODUCT_CATEGORIES, type ProductCategory } from "@/lib/orders";
import { specimenImage } from "@/lib/plates";
import { formatDate, slugify } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { TitleLines } from "@/components/store/page-intro";
import { splitTitle } from "@/components/store/article-title";
import { Chromatogram } from "@/components/store/chromatogram";
import { Slip, SlipRow } from "@/components/store/paper";
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

/** Pages every visitor may want that are not compounds, articles or questions. */
const PAGES = [
  { label: "Lab results", href: "/coa", locator: "Certificates" },
  { label: "Batch register", href: "/coa#register", locator: "Lab results" },
  { label: "Catalogue", href: "/shop", locator: "Price list" },
  { label: "Compare compounds", href: "/compare", locator: "Comparison sheet" },
  { label: "Research library", href: "/research", locator: "Articles" },
  { label: "Questions and answers", href: "/faq", locator: "Questions" },
  { label: "Shipping and returns", href: "/shipping", locator: "Policy" },
  { label: "Terms of sale", href: "/terms", locator: "Policy" },
  { label: "Privacy", href: "/privacy", locator: "Policy" },
  { label: "Research use policy", href: "/disclaimer", locator: "Policy" },
  { label: "Track an order", href: "/track", locator: "Orders" },
  { label: "Your account", href: "/account", locator: "Orders" },
  { label: "Contact", href: "/contact", locator: "Write to us" },
  { label: "About GLP Research", href: "/about", locator: "Company" },
];
const SEE = [
  { label: "Certificate of analysis", see: "Lab results", href: "/coa" },
  { label: "Half-life", see: "Compare compounds", href: "/compare" },
  { label: "Receptors", see: "Compare compounds", href: "/compare" },
];
const CLASS_LABELS: Record<ProductCategory, string> = { GLP1: "GLP-1 receptor agonists", DUAL: "Dual agonists", TRIPLE: "Triple agonists" };

type IndexEntry = { sort: string; label: string; href: string; locator?: string; swatch?: string; see?: string };

/**
 * The site's index, set like the one at the back of a reference book: every compound, research
 * code, article, question group and page, alphabetised, with cross-references.
 */
function buildIndex(products: { slug: string; name: string; aliases: string | null; accentColor: string }[], articles: { slug: string; title: string }[]) {
  const entries: IndexEntry[] = [
    ...products.map((p) => ({ sort: p.name, label: p.name, href: `/shop/${p.slug}`, locator: "Data sheet", swatch: p.accentColor })),
    ...products.flatMap((p) =>
      (p.aliases ?? "")
        .split(/,\s*/)
        .map((a) => a.replace(/\s*\(.*\)$/, "").trim())
        .filter(Boolean)
        .map((a) => ({ sort: a, label: a, href: `/shop/${p.slug}`, see: p.name })),
    ),
    ...articles.map((a) => {
      const head = splitTitle(a.title).head;
      return { sort: head, label: head, href: `/research/${a.slug}`, locator: "Article" };
    }),
    ...FAQS.map((g) => ({ sort: g.title, label: g.title.replace(" & ", " and "), href: `/faq#${slugify(g.title)}`, locator: "Questions" })),
    ...(Object.keys(PRODUCT_CATEGORIES) as ProductCategory[]).map((key) => ({ sort: CLASS_LABELS[key], label: CLASS_LABELS[key], href: `/shop?category=${key}`, locator: "Catalogue" })),
    ...PAGES.map((p) => ({ sort: p.label, ...p })),
    ...SEE.map((s) => ({ sort: s.label, ...s })),
  ];
  entries.sort((a, b) => a.sort.localeCompare(b.sort, "en", { sensitivity: "base", numeric: true }));
  const letters = new Map<string, IndexEntry[]>();
  for (const e of entries) {
    const first = e.sort.charAt(0).toUpperCase();
    const letter = /[A-Z]/.test(first) ? first : "0–9";
    letters.set(letter, [...(letters.get(letter) ?? []), e]);
  }
  return [...letters];
}

/** Wraps each matched term in a pencil mark. */
function Highlight({ text, terms }: { text: string; terms: string[] }) {
  if (!terms.length) return <>{text}</>;
  const pattern = new RegExp(`(${terms.map(escapeRegExp).join("|")})`, "gi");
  return (
    <>
      {text.split(pattern).map((part, i) =>
        i % 2 === 1 ? (
          <mark key={i} className="bg-ink/10 text-ink [box-decoration-break:clone]">
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
  // Compounds and articles feed both the search and the index shown when there is nothing to search.
  const [products, articles, batches] = await Promise.all([
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
    searching && batchLike
      ? db.batch.findMany({
          where: { published: true, batchNumber: { contains: q.toUpperCase().replace(/\s+/g, "") } },
          include: { product: { select: { name: true, accentColor: true } } },
          orderBy: { testedAt: "desc" },
          take: 8,
        })
      : Promise.resolve([]),
  ]);

  // Compounds: every term somewhere in the record, ranked by where it was found.
  const productHits = (searching ? products : [])
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
  const articleHits = (searching ? articles : [])
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

  const index = !searching || !total ? buildIndex(products, articles) : null;
  // The exact batch is printed as its certificate; the table lists the other matches.
  const listed = batches.filter((b) => b !== exact);

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
            <Button type="submit" variant="accent" size="lg">
              Search
            </Button>
          </div>
        </Form>
      </section>

      <div className="frame pt-8 md:pt-10" aria-live="polite">
        {!searching ? (
          <div className="flex flex-col gap-3 md:flex-row md:items-baseline md:gap-8">
            <p className="text-body text-muted">{q ? "Type at least two letters to search." : "Popular searches"}</p>
            <ul className="flex flex-wrap gap-x-6 gap-y-2">
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
          <div className="flex flex-col gap-3 md:flex-row md:items-baseline md:justify-between" data-load style={{ "--d": "380ms" } as React.CSSProperties}>
            <p className="text-lead">
              <span className="tabular">{total}</span> {total === 1 ? "entry" : "entries"} for “{q}”
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
          <div className="bg-paper px-5 py-6 md:px-12 md:py-10">
            <h2 className="text-index font-semibold">Nothing matches “{q}”</h2>
            <p className="mt-4 max-w-[60ch]">
              Check the spelling, try fewer words, or search by research code (for example LY3298176) or by a batch
              number exactly as it appears on the vial label. Everything on the site is in the index below.
            </p>
          </div>
        )}
      </div>

      {exact ? (
        <section id={listed.length ? undefined : "batches"} className="frame scroll-mt-24 pt-10" aria-label="Batch found">
          <Slip as="article" className="pb-10">
            <div className="flex flex-col gap-1 bg-ink px-5 py-3.5 text-white sm:flex-row sm:items-baseline sm:justify-between md:px-10">
              <p className="font-semibold">Certificate of analysis</p>
              <p className="text-small text-on-navy-muted">Tested {formatDate(exact.testedAt, { day: "numeric", month: "long", year: "numeric" })}</p>
            </div>
            <div className="grid gap-8 px-5 pt-6 md:grid-cols-2 md:items-end md:gap-x-12 md:px-10 md:pt-8">
              <div>
                <p className="text-small text-muted">Batch</p>
                <p className="tabular text-head font-semibold" translate="no">
                  {exact.batchNumber}
                </p>
                <p className="mt-2 flex items-center gap-3 text-lead">
                  <span className="size-4 shrink-0" style={{ backgroundColor: exact.product.accentColor }} aria-hidden="true" />
                  <span>
                    {exact.product.name}
                    {exact.variantLabel ? `, ${exact.variantLabel} vial` : ""}
                  </span>
                </p>
                <p className="mt-6">
                  <span className="tabular block text-index font-semibold">{exact.purity.toFixed(2)}%</span>
                  <span className="text-body">purity by HPLC</span>
                </p>
              </div>
              <Chromatogram purity={exact.purity} seed={exact.batchNumber} className="aspect-[16/7]" label={`HPLC trace for batch ${exact.batchNumber}: main peak ${exact.purity.toFixed(2)}% of total area`} />
            </div>
            <p className="px-5 pt-6 md:px-10">
              <Link href={`/coa?batch=${encodeURIComponent(exact.batchNumber)}`} className="link font-medium">
                The full certificate
              </Link>
            </p>
          </Slip>
        </section>
      ) : null}

      {searching && total - (exact && !listed.length ? 1 : 0) ? (
        <div className="frame pt-10">
          <div className="bg-paper px-5 pt-2 pb-10 md:px-12 md:pb-14">
            {productHits.length ? (
              <ResultGroup id="compounds" title="Compounds" count={productHits.length}>
                {productHits.map((p) => (
                  <li key={p.slug} className="group relative grid grid-cols-[3.5rem_1fr] gap-4 py-5 sm:grid-cols-[4.5rem_1fr] sm:gap-5">
                    <span className="relative block aspect-[4/5] self-start" style={{ backgroundColor: p.accentColor }}>
                      <Image src={specimenImage(p.image) ?? p.image} alt="" fill sizes="4.5rem" className="object-contain px-[12%] pt-[10%] pb-[4%]" />
                    </span>
                    <span className="min-w-0">
                      <SlipRow
                        className="text-lead"
                        label={
                          <Link href={`/shop/${p.slug}`} className="font-semibold after:absolute after:inset-0 group-hover:underline group-hover:decoration-[0.06em] group-hover:underline-offset-[0.14em]">
                            <Highlight text={p.name} terms={terms} />
                          </Link>
                        }
                        value={<span className="text-body">{p.from != null ? `From ${formatMoney(p.from)}` : "Data sheet"}</span>}
                      />
                      <span className="mt-1 block text-small text-muted">
                        <Highlight text={p.subtitle} terms={terms} />
                        {p.aliases ? (
                          <>
                            , <Highlight text={p.aliases} terms={terms} />
                          </>
                        ) : null}
                      </span>
                      <span className="mt-2 block max-w-[64ch] text-body">
                        <Highlight text={p.text} terms={terms} />
                      </span>
                    </span>
                  </li>
                ))}
              </ResultGroup>
            ) : null}

            {articleHits.length ? (
              <ResultGroup id="articles" title="Articles" count={articleHits.length}>
                {articleHits.map((a) => {
                  const t = splitTitle(a.title);
                  return (
                    <li key={a.slug} className="group relative py-5">
                      <SlipRow
                        className="text-lead"
                        label={
                          <Link href={`/research/${a.slug}`} className="font-semibold after:absolute after:inset-0 group-hover:underline group-hover:decoration-[0.06em] group-hover:underline-offset-[0.14em]">
                            <Highlight text={t.head} terms={terms} />
                          </Link>
                        }
                        value={<span className="text-body">{a.readingMinutes} min</span>}
                      />
                      {t.rest ? (
                        <span className="mt-1 block text-body text-muted">
                          <Highlight text={t.rest} terms={terms} />
                        </span>
                      ) : null}
                      <span className="mt-2 block max-w-[64ch] text-body">
                        <Highlight text={a.text} terms={terms} />
                      </span>
                      <span className="mt-2 block text-small text-muted">
                        {a.category}, {formatDate(a.publishedAt, { day: "numeric", month: "long", year: "numeric" })}
                      </span>
                    </li>
                  );
                })}
              </ResultGroup>
            ) : null}

            {questionHits.length ? (
              <ResultGroup id="questions" title="Questions" count={questionHits.length}>
                {questionHits.map((f) => (
                  <li key={f.q} className="group relative py-5">
                    <SlipRow
                      className="text-lead"
                      label={
                        <Link href={`/faq#${slugify(f.group)}`} className="font-semibold after:absolute after:inset-0 group-hover:underline group-hover:decoration-[0.06em] group-hover:underline-offset-[0.14em]">
                          <Highlight text={f.q} terms={terms} />
                        </Link>
                      }
                      value={<span className="text-body max-sm:hidden">{f.group.replace(" & ", " and ")}</span>}
                    />
                    <span className="mt-2 block max-w-[64ch] text-body">
                      <Highlight text={snippet(f.a, terms)} terms={terms} />
                    </span>
                  </li>
                ))}
              </ResultGroup>
            ) : null}

            {listed.length ? (
              <section id="batches" className="grid scroll-mt-24 gap-4 pt-10 lg:grid-cols-12 lg:gap-x-[var(--gutter)]" aria-labelledby="batches-title">
                <h2 id="batches-title" className="text-index font-semibold lg:col-span-3">
                  Batches <span className="tabular text-muted">{listed.length}</span>
                </h2>
                <div className="overflow-x-auto lg:col-span-9">
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
                      {listed.map((b) => (
                        <tr key={b.id} className="border-t-2 border-ink/10">{/* taste-skill-ignore: real table rows */}
                          <td className="py-3.5 pr-4">
                            <Link href={`/coa?batch=${encodeURIComponent(b.batchNumber)}`} className="link font-medium whitespace-nowrap" translate="no">
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
              </section>
            ) : null}
          </div>
        </div>
      ) : null}

      {index ? (
        <section className="frame pt-10 md:pt-14" aria-labelledby="index-title">
          <div className="bg-paper px-5 pt-6 pb-10 md:px-12 md:pt-10 md:pb-14">
            <div className="flex flex-col gap-2 md:flex-row md:items-baseline md:justify-between">
              <h2 id="index-title" className="text-head font-semibold">
                Index
              </h2>
              <p className="text-small text-muted">Every compound, research code, article and page, A to Z</p>
            </div>
            <nav aria-label="Index letters" className="mt-6 flex flex-wrap gap-1">
              {index.map(([letter]) => (
                <a key={letter} href={`#index-${letter}`} className="press inline-flex size-10 items-center justify-center bg-surface-2 font-semibold hover:bg-field-paper">
                  {letter}
                </a>
              ))}
            </nav>
            <div className="mt-10 gap-x-12 md:columns-2 lg:columns-3">
              {index.map(([letter, entries]) => (
                <section key={letter} id={`index-${letter}`} className="scroll-mt-24 break-inside-avoid pb-8" aria-labelledby={`index-${letter}-title`}>
                  <h3 id={`index-${letter}-title`} className="text-index font-semibold">
                    {letter}
                  </h3>
                  <ul className="mt-2 space-y-1.5 text-body">
                    {entries.map((e) => (
                      <li key={`${e.label}-${e.href}`}>
                        {e.see ? (
                          <p>
                            <span translate="no">{e.label}</span>, <span className="text-muted">see</span>{" "}
                            <Link href={e.href} className="link">
                              {e.see}
                            </Link>
                          </p>
                        ) : (
                          // Last-baseline alignment keeps the leader and locator on the entry's final line when it wraps.
                          <Link href={e.href} className="group/entry flex items-baseline-last gap-2">
                            <span className="min-w-0 group-hover/entry:underline group-hover/entry:decoration-[0.06em] group-hover/entry:underline-offset-[0.14em]">
                              {e.swatch ? <span className="mr-2 inline-block size-2.5" style={{ backgroundColor: e.swatch }} aria-hidden="true" /> : null}
                              {e.label}
                            </span>
                            <span className="min-w-4 flex-1 -translate-y-[0.2em] border-b-4 border-dotted border-ink/25" aria-hidden="true" />
                            <span className="shrink-0 text-small text-muted">{e.locator}</span>
                          </Link>
                        )}
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}

function normalisedStart(name: string, q: string) {
  return name.toLowerCase().startsWith(q.toLowerCase());
}

function ResultGroup({ id, title, count, children }: { id: string; title: string; count: number; children: React.ReactNode }) {
  return (
    <section id={id} className="grid scroll-mt-24 gap-2 pt-10 lg:grid-cols-12 lg:gap-x-[var(--gutter)]" aria-labelledby={`${id}-title`}>
      <h2 id={`${id}-title`} className="text-index font-semibold lg:col-span-3 lg:pt-4">
        {title} <span className="tabular text-muted">{count}</span>
      </h2>
      <ul className="lg:col-span-9 [&>li+li]:border-t-4 [&>li+li]:border-dotted [&>li+li]:border-ink/20">{children}</ul>
    </section>
  );
}
