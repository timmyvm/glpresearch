import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { LAB_PICTURES } from "@/content/credits";
import { db } from "@/lib/db";
import { plateInk, specimenImage } from "@/lib/plates";
import { formatMoney } from "@/lib/money";
import { categoryLabel } from "@/lib/orders";
import { NATIVE_GLP1_HOURS, parseHalfLife, timesNative } from "@/lib/half-life";
import { identityWithNative, parseSequence } from "@/lib/sequence";
import { cn, splitList } from "@/lib/utils";
import { Formula } from "@/components/store/formula";
import { PageIntro, TitleLines } from "@/components/store/page-intro";
import { Slip, SlipRow } from "@/components/store/paper";
import { ReceptorMarks } from "@/components/store/receptor-marks";
import { RECEPTORS, halfLifeText, sizePhrase } from "@/components/store/receptors";

export const metadata: Metadata = {
  title: "Compare GLP-1, dual and triple agonists",
  description:
    "Semaglutide, tirzepatide, retatrutide and four more incretin research peptides side by side: receptor targets, half-life, structure and development status.",
  alternates: { canonical: "/compare" },
};

// Log scale for the half-life figure: one minute to one month.
const MIN_H = 1 / 60;
const MAX_H = 24 * 30;
const pos = (h: number) => ((Math.log10(h) - Math.log10(MIN_H)) / (Math.log10(MAX_H) - Math.log10(MIN_H))) * 100;
const TICKS = [
  { h: 1 / 60, label: "1 minute" },
  { h: 1, label: "1 hour" },
  { h: 24, label: "1 day" },
  { h: 168, label: "1 week" },
  { h: 720, label: "1 month" },
];

/** Mazdutide's reported range ("~6 to 28 days") as [from, to] hours. */
function rangeHours(value: string | null) {
  const m = value?.match(/([\d.]+)\s*to\s*([\d.]+)\s*days/i);
  return m ? [parseFloat(m[1]) * 24, parseFloat(m[2]) * 24] : null;
}

/** The explainers behind the sheet's rows, in reading order. */
const SOURCES = ["single-dual-triple-agonists", "half-life-engineering", "landmark-clinical-trials"];

const NUMBER_WORDS = ["No", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten"];

/** The footnotes printed under the sheet; rows carry their number. */
const NOTES = [
  "A filled square means the compound activates that receptor in published assays. It does not say how strongly: tirzepatide, for one, favours the GIP receptor over GLP-1.",
  "Elimination half-life reported in human studies. Native GLP-1 is cleared in about two minutes, cut by the enzyme DPP-4 and filtered by the kidneys.",
  "The share of native GLP-1's 31 positions where the compound carries the same residue. Exenatide comes from Gila monster venom, which is why it shares the least.",
  "Development status as given in the regulatory documents each data sheet cites, in full under the table. It changes as trials report.",
  "From the newest certificate we have published for the compound; every batch is in the register.",
];

/** "Approved (Ozempic, …) for …" → "Approved"; "Investigational, Phase 3 (TRIUMPH) …" → "Investigational, Phase 3". */
function shortStatus(status: string | null) {
  return status?.split(/\s\(|;|\.\s|\sfor\s/)[0].replace(/\.$/, "") ?? "Not published";
}

function Note({ n }: { n: number }) {
  return (
    <sup className="tabular ml-0.5 text-muted">
      <span className="sr-only">, note </span>
      {n}
    </sup>
  );
}

export default async function ComparePage() {
  const rows = await db.product.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
    include: {
      variants: { where: { active: true }, orderBy: { sortOrder: "asc" }, select: { price: true, label: true } },
      batches: { where: { published: true }, orderBy: { testedAt: "desc" }, take: 1, select: { batchNumber: true, purity: true } },
    },
  });
  const found = await db.article.findMany({
    where: { slug: { in: SOURCES }, published: true },
    select: { slug: true, title: true, excerpt: true, readingMinutes: true },
  });
  const articles = SOURCES.flatMap((slug) => found.filter((a) => a.slug === slug));
  const products = rows.map((p) => ({ ...p, hl: parseHalfLife(p.halfLife), identity: identityWithNative(parseSequence(p.sequence)), targets: splitList(p.receptorTargets) }));
  type P = (typeof products)[number];
  const count = NUMBER_WORDS[products.length] ?? String(products.length);

  const latest = (p: P) => {
    const b = p.batches[0];
    return b ? (
      <>
        <Link href={`/coa?batch=${b.batchNumber}`} className="link">
          {b.purity.toFixed(2)}%
        </Link>
        <span className="block text-small text-muted" translate="no">
          {b.batchNumber}
        </span>
      </>
    ) : (
      "Not yet published"
    );
  };
  const against = (p: P) => (p.hl.hours ? `${timesNative(p.hl.hours).toLocaleString("en-AU")} times` : p.hl.variable ? "Varies widely" : "Not published");

  const groups: { title: string; rows: { label: React.ReactNode; key: string; small?: boolean; render: (p: P) => React.ReactNode }[] }[] = [
    {
      title: "Receptors",
      rows: RECEPTORS.map((r, i) => ({
        key: r.key,
        label: (
          <>
            {r.name}
            {i === 0 ? <Note n={1} /> : null}
          </>
        ),
        render: (p: P) => {
          const on = p.targets.includes(r.key);
          return (
            <>
              <span className={cn("inline-block size-4 align-middle", on ? "bg-ink" : "bg-ink/15")} aria-hidden="true" />
              <span className="sr-only">{on ? "Yes" : "No"}</span>
            </>
          );
        },
      })),
    },
    {
      title: "Duration",
      rows: [
        {
          key: "half-life",
          label: (
            <>
              Reported half-life
              <Note n={2} />
            </>
          ),
          render: (p) => halfLifeText(p.halfLife)?.replace(/ in Phase 1b studies$/, "") ?? "Not published",
        },
        { key: "against", label: "Longer than native GLP-1", render: against },
      ],
    },
    {
      title: "Structure",
      rows: [
        { key: "length", label: "Length", render: (p) => (p.aminoAcidCount ? `${p.aminoAcidCount} amino acids` : "Not published") },
        {
          key: "identity",
          label: (
            <>
              Shared with native GLP-1
              <Note n={3} />
            </>
          ),
          render: (p) => (p.identity ? `${p.identity}%` : "Not published"),
        },
        { key: "formula", label: "Molecular formula", small: true, render: (p) => (p.molecularFormula ? <Formula value={p.molecularFormula} /> : "See certificate") },
        { key: "weight", label: "Molecular weight", render: (p) => p.molecularWeight?.replace(/\s*g\/mol$/, " Da") ?? "See certificate" },
        { key: "cas", label: "CAS number", small: true, render: (p) => p.casNumber ?? "Not assigned" },
      ],
    },
    {
      title: "Development",
      rows: [
        { key: "class", label: "Class", render: (p) => categoryLabel(p.category) },
        { key: "codes", label: "Research codes", small: true, render: (p) => p.aliases ?? "Not assigned" },
        { key: "originator", label: "Originator", small: true, render: (p) => p.developer ?? "Not published" },
        {
          key: "status",
          label: (
            <>
              Status
              <Note n={4} />
            </>
          ),
          render: (p) => shortStatus(p.regulatoryStatus),
        },
      ],
    },
    {
      title: "Supply",
      rows: [
        { key: "sizes", label: "Vial sizes", render: (p) => sizePhrase(p.variants.map((v) => v.label)) },
        { key: "from", label: "From", render: (p) => formatMoney(Math.min(...p.variants.map((v) => v.price))) },
        {
          key: "purity",
          label: (
            <>
              Latest purity
              <Note n={5} />
            </>
          ),
          render: latest,
        },
      ],
    },
  ];

  const chart = [
    { key: "native", name: "Native GLP-1", color: "var(--color-ink)", hours: NATIVE_GLP1_HOURS, text: "About 2 minutes", range: null as number[] | null },
    ...products.map((p) => ({
      key: p.slug,
      name: p.name,
      color: p.accentColor,
      hours: p.hl.hours,
      text: halfLifeText(p.halfLife),
      range: p.hl.variable ? rangeHours(p.halfLife) : null,
    })),
  ];

  const notes = (
    <ol className="grid gap-x-10 gap-y-3 text-small text-muted md:grid-cols-2">
      {NOTES.map((note, i) => (
        <li key={i} className="grid grid-cols-[1.25rem_1fr]">
          <span className="tabular text-ink">{i + 1}</span>
          <span className="max-w-[62ch]">{note}</span>
        </li>
      ))}
    </ol>
  );

  return (
    <>
      <PageIntro
        title={<TitleLines lines={[`${count},`, "side by side"]} />}
        lead="Which receptors each compound acts on, how long it lasts, its structure and where it stands in development, compiled from the published literature."
      />

      <section className="frame pt-12 md:pt-16" aria-labelledby="sheet-title">
        <h2 id="sheet-title" className="sr-only">
          The comparison sheet
        </h2>

        {/* Wide screens: the sheet itself, compounds across. */}
        <div className="hidden bg-paper text-ink lg:block" data-reveal>
          <div className="flex items-baseline justify-between gap-6 bg-ink px-10 py-5 text-white">
            <p className="text-lead font-semibold">GLP Research, comparison sheet</p>
            <p className="text-small text-on-navy-muted">{count} compounds, from the literature each data sheet cites</p>
          </div>
          <div className="overflow-x-auto px-10 pt-8 pb-10">
            <table className="w-full min-w-[68rem] table-fixed text-left text-body">
              <caption className="sr-only">Receptors, duration, structure, development and supply for every compound</caption>
              <thead>
                <tr>
                  <th scope="col" className="sticky left-0 w-48 bg-paper pr-4 pb-2 align-bottom text-small font-medium text-muted">
                    Compound
                  </th>
                  {products.map((p) => (
                    <th key={p.id} scope="col" className="px-2 pb-2 align-bottom font-normal">
                      <Link href={`/shop/${p.slug}`} className="group block">
                        <span className="relative block aspect-[4/5] w-full overflow-clip" style={{ backgroundColor: p.accentColor, color: plateInk(p.accentColor) }}>
                          <Image
                            src={specimenImage(p.image) ?? p.image}
                            alt=""
                            fill
                            sizes="10rem"
                            className="object-contain px-[14%] pt-[12%] pb-[5%] transition-transform duration-500 ease-[var(--ease-out)] group-hover:-translate-y-1"
                          />
                        </span>
                        <span className="mt-3 block text-body font-semibold group-hover:underline group-hover:decoration-[0.06em] group-hover:underline-offset-[0.14em]">{p.name}</span>
                      </Link>
                    </th>
                  ))}
                </tr>
              </thead>
              {groups.map((g) => (
                <tbody key={g.title} className="align-top">
                  <tr>
                    <th scope="colgroup" colSpan={products.length + 1} className="pt-9 pb-2 text-left text-lead font-semibold">
                      {g.title}
                    </th>
                  </tr>
                  {g.rows.map((row) => (
                    <tr key={row.key} className="border-t-2 border-ink/10">{/* taste-skill-ignore: real table rows */}
                      <th scope="row" className="sticky left-0 bg-paper py-3 pr-4 text-small font-medium text-muted">
                        {row.label}
                      </th>
                      {products.map((p) => (
                        <td key={p.id} className={cn("tabular px-2 py-3", row.small && "text-small")}>
                          {row.render(p)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              ))}
            </table>
            <div className="mt-12 grid grid-cols-[12rem_1fr] gap-x-4">
              <h3 className="text-lead font-semibold">Where each stands</h3>
              <dl className="grid grid-cols-2 gap-x-10 gap-y-5 text-body">
                {products.map((p) => (
                  <div key={p.id}>
                    <dt className="flex items-center gap-2 font-semibold">
                      <span className="size-2.5 shrink-0" style={{ backgroundColor: p.accentColor }} aria-hidden="true" />
                      {p.name}
                    </dt>
                    <dd className="mt-1 max-w-[56ch]">{p.regulatoryStatus ?? "Not published"}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="mt-12 border-t-4 border-dotted border-ink/20 pt-6">{notes}</div>
          </div>
        </div>

        {/* Narrower screens: one slip per compound, the notes after. */}
        <div className="grid gap-12 md:grid-cols-2 md:gap-x-6 lg:hidden">
          {products.map((p) => (
            <Slip key={p.id} as="section" aria-labelledby={`sheet-${p.slug}`} className="pb-10" data-reveal>
              <Link href={`/shop/${p.slug}`} className="group relative flex aspect-[16/7] items-end p-5" style={{ backgroundColor: p.accentColor, color: plateInk(p.accentColor) }}>
                <Image src={specimenImage(p.image) ?? p.image} alt="" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-contain object-right px-[8%] pt-[6%]" />
                <h3 id={`sheet-${p.slug}`} className="relative text-index font-semibold group-hover:underline group-hover:decoration-[0.06em] group-hover:underline-offset-[0.14em]">
                  {p.name}
                </h3>
              </Link>
              <div className="px-5 pt-5">
                <ReceptorMarks targets={p.receptorTargets} />
                <div className="mt-5 space-y-1.5 text-body">
                  <SlipRow label="Half-life" value={halfLifeText(p.halfLife)?.replace(/^Variable, /, "").replace(/ in Phase 1b studies$/, "") ?? "Not published"} />
                  <SlipRow label="Longer than native" value={p.hl.hours ? `${timesNative(p.hl.hours).toLocaleString("en-AU")} times` : "Varies"} />
                  <SlipRow label="Length" value={p.aminoAcidCount ? `${p.aminoAcidCount} residues` : "Not published"} />
                  <SlipRow label="Shared with GLP-1" value={p.identity ? `${p.identity}%` : "Not published"} />
                  <SlipRow label="Formula" value={p.molecularFormula ? <Formula value={p.molecularFormula} /> : "See certificate"} />
                  <SlipRow label="Weight" value={p.molecularWeight?.replace(/\s*g\/mol$/, " Da") ?? "See certificate"} />
                  <SlipRow label="CAS" value={p.casNumber ?? "Not assigned"} />
                  <SlipRow label="Vial sizes" value={sizePhrase(p.variants.map((v) => v.label))} />
                  <SlipRow label="From" value={formatMoney(Math.min(...p.variants.map((v) => v.price)))} />
                  {p.batches[0] ? (
                    <SlipRow
                      label="Latest purity"
                      value={
                        <Link href={`/coa?batch=${p.batches[0].batchNumber}`} className="link">
                          {p.batches[0].purity.toFixed(2)}%
                        </Link>
                      }
                    />
                  ) : null}
                </div>
                <dl className="mt-6 space-y-3 text-small">
                  {[
                    ["Class", categoryLabel(p.category)],
                    ["Originator", p.developer ?? "Not published"],
                    ["Research codes", p.aliases ?? "Not assigned"],
                    ["Status", p.regulatoryStatus ?? "Not published"],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <dt className="text-muted">{label}</dt>
                      <dd className="mt-0.5 text-body">{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </Slip>
          ))}
          <div className="bg-paper p-5 md:col-span-2">
            <p className="mb-4 text-body font-semibold">Notes on the sheet</p>
            {notes}
          </div>
        </div>
      </section>

      <section className="mt-28 overflow-clip bg-field-black py-24 text-white md:mt-40 md:py-32" aria-labelledby="half-life-title">
        <div className="frame grid gap-12 lg:grid-cols-12 lg:gap-x-[var(--gutter)]">
          <div className="lg:col-span-4" data-reveal>
            <h2 id="half-life-title" className="lines text-head font-semibold">
              Two minutes to weeks
            </h2>
            <p className="mt-5 max-w-[40ch] text-on-black-muted">
              Native GLP-1 is gone in about two minutes. Swap the residue the enzyme cuts and hang a fatty-acid chain on a
              lysine so the peptide rides on albumin, and the same signal lasts days.
            </p>
            <Link href="/research/half-life-engineering" className="link mt-5 inline-block font-medium">
              How the half-life is extended
            </Link>
            <figure className="mt-12 hidden lg:block">
              <div className="relative aspect-[4/3] overflow-clip">
                <Image src="/images/lab/stopwatch.webp" alt={LAB_PICTURES["/images/lab/stopwatch.webp"]} fill sizes="30vw" className="object-cover" />
              </div>
              <figcaption className="mt-3 text-small text-on-black-muted">{LAB_PICTURES["/images/lab/stopwatch.webp"]}.</figcaption>
            </figure>
          </div>

          <figure className="bg-paper px-5 pt-6 pb-8 text-ink md:-rotate-1 md:px-10 md:pt-9 md:pb-10 lg:col-span-8 lg:self-start" data-reveal style={{ "--i": 1 } as React.CSSProperties}>
            <figcaption className="text-small text-muted">
              <span className="font-semibold text-ink">Figure 1.</span> Reported human elimination half-life, on a logarithmic scale. Each step on the axis is roughly a
              factor of thirty.
            </figcaption>
            <ul className="mt-8 space-y-5">
              {chart.map((row) => (
                <li key={row.key} className="grid grid-cols-[6.5rem_1fr] items-start gap-x-4 sm:grid-cols-[9rem_1fr] sm:gap-x-5">
                  <span className={cn("text-body", row.key === "native" ? "font-semibold" : "font-medium")}>{row.name}</span>
                  <div>
                    <div className="relative mt-1.5 h-3.5 bg-ink/10">
                      {row.range ? (
                        <div className="absolute inset-y-0" style={{ left: `${pos(row.range[0])}%`, width: `${pos(row.range[1]) - pos(row.range[0])}%`, backgroundColor: row.color }} />
                      ) : row.hours ? (
                        <div className="absolute inset-y-0 left-0" style={{ width: `${pos(row.hours)}%`, backgroundColor: row.color }} />
                      ) : null}
                    </div>
                    <p className="mt-1.5 text-small text-muted">{row.text ?? "Not yet published in a primary source"}</p>
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-6 grid grid-cols-[6.5rem_1fr] gap-x-4 sm:grid-cols-[9rem_1fr] sm:gap-x-5" aria-hidden="true">
              <div className="relative col-start-2 h-10 border-t-4 border-dotted border-ink/20 text-small text-muted">
                {TICKS.map((t, i) => (
                  <span
                    key={t.label}
                    className="absolute top-2 whitespace-nowrap max-sm:[&:nth-child(even)]:hidden"
                    style={{ left: `${pos(t.h)}%`, transform: i === 0 ? "none" : i === TICKS.length - 1 ? "translateX(-100%)" : "translateX(-50%)" }}
                  >
                    {t.label}
                  </span>
                ))}
              </div>
            </div>
          </figure>
        </div>
      </section>

      <section className="frame grid gap-10 pt-24 md:grid-cols-12 md:items-start md:gap-x-[var(--gutter)] md:pt-32" aria-labelledby="sources-title">
        <figure className="md:col-span-5" data-reveal>
          <div className="relative aspect-[4/3] overflow-clip bg-field-black">
            <Image src="/images/lab/journals.webp" alt={LAB_PICTURES["/images/lab/journals.webp"]} fill sizes="(min-width: 768px) 40vw, 100vw" className="object-cover" />
          </div>
          <figcaption className="mt-3 text-small text-muted">{LAB_PICTURES["/images/lab/journals.webp"]}.</figcaption>
        </figure>
        <div className="md:col-span-6 md:col-start-7" data-reveal style={{ "--i": 1 } as React.CSSProperties}>
          <h2 id="sources-title" className="text-index font-semibold">
            Where the figures come from
          </h2>
          <p className="mt-4 max-w-[52ch]">
            Every value on the sheet is taken from a peer-reviewed paper, a trial report or a regulator&apos;s document, and
            each compound&apos;s data sheet lists its references. These explainers put the numbers in context.
          </p>
          <ol className="mt-8 [&>li+li]:border-t-4 [&>li+li]:border-dotted [&>li+li]:border-ink/20">
            {articles.map((a) => (
              <li key={a.slug} className="group relative py-5">
                <h3 className="text-lead font-semibold">
                  <Link href={`/research/${a.slug}`} className="after:absolute after:inset-0 group-hover:underline group-hover:decoration-[0.06em] group-hover:underline-offset-[0.14em]">
                    {a.title}
                  </Link>
                </h3>
                <p className="mt-1 max-w-[56ch] text-body text-muted">{a.excerpt}</p>
                <p className="mt-2 text-small text-muted">{a.readingMinutes} minute read</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </>
  );
}
