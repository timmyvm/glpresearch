import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { db } from "@/lib/db";
import { plateInk, specimenImage } from "@/lib/plates";
import { formatMoney } from "@/lib/money";
import { categoryLabel } from "@/lib/orders";
import { NATIVE_GLP1_HOURS, parseHalfLife } from "@/lib/half-life";
import { splitList } from "@/lib/utils";
import { Formula } from "@/components/store/formula";
import { PageIntro, TitleLines } from "@/components/store/page-intro";
import { RECEPTORS, halfLifeText, sizePhrase } from "@/components/store/receptors";

export const metadata: Metadata = {
  title: "Compare GLP-1, dual and triple agonists",
  description:
    "Semaglutide, tirzepatide, retatrutide and four more incretin research peptides side by side: receptor targets, half-life, structure and development status.",
  alternates: { canonical: "/compare" },
};

// Log scale for the half-life chart: one minute to one month.
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

export default async function ComparePage() {
  const products = await db.product.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
    include: { variants: { where: { active: true }, orderBy: { sortOrder: "asc" }, select: { price: true, label: true } } },
  });

  const rows: { label: string; render: (p: (typeof products)[number]) => React.ReactNode }[] = [
    { label: "Class", render: (p) => categoryLabel(p.category) },
    { label: "Research codes", render: (p) => p.aliases ?? "Not assigned" },
    { label: "Originator", render: (p) => p.developer ?? "Not published" },
    { label: "Molecular formula", render: (p) => (p.molecularFormula ? <Formula value={p.molecularFormula} /> : "See certificate") },
    { label: "Molecular weight", render: (p) => p.molecularWeight ?? "See certificate" },
    { label: "Length", render: (p) => (p.aminoAcidCount ? `${p.aminoAcidCount} amino acids` : "Not published") },
    { label: "CAS number", render: (p) => p.casNumber ?? "Not assigned" },
    { label: "Reported half-life", render: (p) => halfLifeText(p.halfLife) ?? "Not published" },
    { label: "Status", render: (p) => p.regulatoryStatus ?? "Not published" },
    { label: "Vial sizes", render: (p) => sizePhrase(p.variants.map((v) => v.label)) },
    { label: "From", render: (p) => formatMoney(Math.min(...p.variants.map((v) => v.price))) },
  ];

  return (
    <>
      <PageIntro
        title={<TitleLines lines={["Seven compounds,", "side by side"]} />}
        lead="Which receptors each compound acts on, how long it lasts, its structure and where it stands in development, compiled from the published literature."
      />

      <section className="frame grid gap-8 pt-16 lg:grid-cols-12 lg:gap-x-[var(--gutter)] lg:pt-24" aria-labelledby="receptors-title">
        <div className="lg:col-span-4" data-reveal>
          <h2 id="receptors-title" className="text-index font-medium">
            Receptor activity
          </h2>
          <p className="mt-4 max-w-[38ch]">
            Every compound here acts on the GLP-1 receptor. The newer ones add GIP, glucagon or both. How strongly each
            one engages each receptor differs; the monographs give the detail.
          </p>
        </div>
        <div className="overflow-x-auto lg:col-span-8" data-reveal style={{ "--i": 1 } as React.CSSProperties}>
          <table className="w-full text-left">
            <caption className="sr-only">Receptors each compound activates</caption>
            <thead className="text-small text-muted">
              <tr>
                <th scope="col" className="pr-4 pb-3 font-medium">Compound</th>
                {RECEPTORS.map((r) => (
                  <th key={r.key} scope="col" className="px-3 pb-3 text-center font-medium">
                    {r.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const targets = splitList(p.receptorTargets);
                return (
                  <tr key={p.id} className="border-t border-ink/10">{/* taste-skill-ignore: real table rows */}
                    <th scope="row" className="py-3.5 pr-4 text-left font-medium">
                      <Link href={`/shop/${p.slug}`} className="link inline-flex items-center gap-3 decoration-transparent hover:decoration-ink">
                        <span className="size-3 shrink-0" style={{ backgroundColor: p.accentColor }} aria-hidden="true" />
                        {p.name}
                      </Link>
                    </th>
                    {RECEPTORS.map((r) => {
                      const on = targets.includes(r.key);
                      return (
                        <td key={r.key} className="px-3 py-3.5 text-center">
                          {on ? (
                            <span className="inline-block size-4 bg-ink align-middle" role="img" aria-label="Yes" />
                          ) : (
                            <span className="text-muted" aria-label="No">
                              No
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-28 bg-field-navy py-20 text-on-navy md:mt-40 md:py-28" aria-labelledby="half-life-title">
        <div className="frame grid gap-10 lg:grid-cols-12 lg:gap-x-[var(--gutter)]">
          <div className="lg:col-span-4" data-reveal>
            <h2 id="half-life-title" className="text-index font-medium">
              Half-life
            </h2>
            <p className="mt-4 max-w-[38ch] text-on-navy-muted">
              Reported human elimination half-life on a logarithmic scale. Native GLP-1 lasts about two minutes;
              albumin-binding side chains are why most analogues last days.
            </p>
            <Link href="/research/half-life-engineering" className="link mt-4 inline-block">
              How the half-life is extended
            </Link>
          </div>
          <div className="lg:col-span-8" data-reveal style={{ "--i": 1 } as React.CSSProperties}>
            <ul className="space-y-5">
              {[
                { key: "native", name: "Native GLP-1", color: "#c9ced6", hours: NATIVE_GLP1_HOURS, text: "About 2 minutes", range: null as number[] | null },
                ...products.map((p) => {
                  const hl = parseHalfLife(p.halfLife);
                  return { key: p.slug, name: p.name, color: p.accentColor, hours: hl.hours, text: halfLifeText(p.halfLife), range: hl.variable ? rangeHours(p.halfLife) : null };
                }),
              ].map((row) => (
                <li key={row.key} className="grid gap-2 sm:grid-cols-[9rem_1fr] sm:items-center sm:gap-5" data-reveal>
                  <span className="font-medium">{row.name}</span>
                  <div>
                    <div className="relative h-4 bg-white/10">
                      {row.range ? (
                        <div
                          className="absolute inset-y-0"
                          style={{ left: `${pos(row.range[0])}%`, width: `${pos(row.range[1]) - pos(row.range[0])}%`, backgroundColor: row.color }}
                        />
                      ) : row.hours ? (
                        <div className="absolute inset-y-0 left-0" style={{ width: `${pos(row.hours)}%`, backgroundColor: row.color }} />
                      ) : null}
                    </div>
                    <p className="mt-1 text-on-navy-muted">{row.text ?? "Not yet published in a primary source"}</p>
                  </div>
                </li>
              ))}
            </ul>
            <div className="relative mt-6 h-5 text-small text-on-navy-muted sm:ml-[10.25rem]" aria-hidden="true">
              {TICKS.map((t, i) => (
                <span
                  key={t.label}
                  className="absolute top-0 whitespace-nowrap"
                  style={{ left: `${pos(t.h)}%`, transform: i === 0 ? "none" : i === TICKS.length - 1 ? "translateX(-100%)" : "translateX(-50%)" }}
                >
                  {t.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="frame pt-28 md:pt-40" aria-labelledby="sheet-title">
        <h2 id="sheet-title" className="text-head" data-reveal>
          The full data sheet
        </h2>

        {/* Wide screens: one table, compounds across. */}
        <div className="mt-10 hidden overflow-x-auto lg:block" data-reveal style={{ "--i": 1 } as React.CSSProperties}>
          <table className="w-full min-w-[72rem] table-fixed text-left">
            <caption className="sr-only">Data sheet for every compound</caption>
            <thead>
              <tr>
                <th scope="col" className="sticky left-0 w-44 bg-bg pr-4 pb-4 align-bottom text-small font-medium text-muted">
                  Attribute
                </th>
                {products.map((p) => (
                  <th key={p.id} scope="col" className="px-3 pb-4 align-bottom">
                    <Link href={`/shop/${p.slug}`} className="group block text-body font-medium">
                      <span className="relative mb-3 block aspect-[4/5] w-full overflow-clip" style={{ backgroundColor: p.accentColor, color: plateInk(p.accentColor) }}>
                        <Image src={specimenImage(p.image) ?? p.image} alt={`${p.name} research vial`} fill sizes="10rem" className="object-contain px-[14%] pt-[12%] pb-[5%] transition-transform duration-500 ease-[var(--ease-out)] group-hover:-translate-y-1" />
                      </span>
                      <span className="group-hover:underline">{p.name}</span>
                    </Link>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.label} className="border-t border-ink/10 align-top">{/* taste-skill-ignore: real table rows */}
                  <th scope="row" className="sticky left-0 bg-bg py-3 pr-4 text-small font-medium text-muted">
                    {row.label}
                  </th>
                  {products.map((p) => (
                    <td key={p.id} className="tabular px-3 py-3">
                      {row.render(p)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Narrower screens: one block per compound. */}
        <div className="mt-10 space-y-3 lg:hidden">
          {products.map((p) => (
            <section key={p.id} className="bg-surface" aria-labelledby={`sheet-${p.slug}`} data-reveal>
              <Link
                href={`/shop/${p.slug}`}
                className="group relative flex aspect-[16/7] items-end p-5"
                style={{ backgroundColor: p.accentColor, color: plateInk(p.accentColor) }}
              >
                <Image src={specimenImage(p.image) ?? p.image} alt={`${p.name} research vial`} fill sizes="100vw" className="object-contain object-right px-[8%] pt-[6%] transition-transform duration-500 ease-[var(--ease-out)] group-hover:-translate-y-1" />
                <h3 id={`sheet-${p.slug}`} className="relative text-lead font-medium group-hover:underline">
                  {p.name}
                </h3>
              </Link>
              <dl className="grid gap-x-6 gap-y-3 p-5 sm:grid-cols-2">
                {rows.map((row) => (
                  <div key={row.label}>
                    <dt className="text-small text-muted">{row.label}</dt>
                    <dd className="tabular">{row.render(p)}</dd>
                  </div>
                ))}
              </dl>
            </section>
          ))}
        </div>

        <p className="mt-8 max-w-[62ch] text-muted">
          Compiled from published literature and regulatory documents; see each compound&apos;s references. Values change as
          new data are published.
        </p>
      </section>
    </>
  );
}
