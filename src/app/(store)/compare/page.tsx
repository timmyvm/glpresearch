import type { Metadata } from "next";
import Link from "next/link";
import { Check, Minus } from "lucide-react";
import { db } from "@/lib/db";
import { formatMoney } from "@/lib/money";
import { categoryLabel } from "@/lib/orders";
import { splitList } from "@/lib/utils";
import { PageHero } from "@/components/store/page-hero";
import { Formula } from "@/components/store/formula";

export const metadata: Metadata = {
  title: "Compare GLP-1, dual and triple agonists",
  description: "Side-by-side comparison of semaglutide, tirzepatide, retatrutide and other incretin research peptides: receptor targets, half-life, structure and status.",
};

const RECEPTORS = [
  { key: "GLP-1R", name: "GLP-1 receptor" },
  { key: "GIPR", name: "GIP receptor" },
  { key: "GCGR", name: "Glucagon receptor" },
];

/** Converts strings like "~7 days (~165 h)" or "~13 hours" to hours for the chart. */
function halfLifeHours(value: string | null) {
  if (!value) return null;
  const h = value.match(/([\d.]+)\s*h\b/);
  if (h) return parseFloat(h[1]);
  const hours = value.match(/([\d.]+)\s*hours?/);
  if (hours) return parseFloat(hours[1]);
  const days = value.match(/([\d.]+)\s*days?/);
  if (days) return parseFloat(days[1]) * 24;
  return null;
}

export default async function ComparePage() {
  const products = await db.product.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
    include: { variants: { where: { active: true }, select: { price: true, label: true } } },
  });

  const withHalfLife = products
    .map((p) => ({ ...p, hours: halfLifeHours(p.halfLife) }))
    .filter((p) => p.hours !== null)
    .sort((a, b) => (b.hours ?? 0) - (a.hours ?? 0));
  const maxLog = Math.log10(Math.max(...withHalfLife.map((p) => p.hours ?? 1)) + 1);

  const rows: { label: string; render: (p: (typeof products)[number]) => React.ReactNode }[] = [
    { label: "Class", render: (p) => categoryLabel(p.category) },
    { label: "Research codes", render: (p) => p.aliases ?? "—" },
    { label: "Originator", render: (p) => p.developer ?? "—" },
    { label: "Molecular formula", render: (p) => (p.molecularFormula ? <Formula value={p.molecularFormula} /> : "—") },
    { label: "Molecular weight", render: (p) => p.molecularWeight ?? "—" },
    { label: "Length", render: (p) => (p.aminoAcidCount ? `${p.aminoAcidCount} aa` : "—") },
    { label: "CAS number", render: (p) => (p.casNumber ? <span className="font-mono text-xs">{p.casNumber}</span> : "—") },
    { label: "Reported half-life", render: (p) => p.halfLife ?? "—" },
    { label: "Status", render: (p) => <span className="text-xs leading-relaxed">{p.regulatoryStatus ?? "—"}</span> },
    { label: "Vial sizes", render: (p) => p.variants.map((v) => v.label).join(", ") },
    { label: "From", render: (p) => <span className="font-semibold">{formatMoney(Math.min(...p.variants.map((v) => v.price)))}</span> },
  ];

  return (
    <>
      <PageHero
        eyebrow="Compound comparison"
        title="Every compound, side by side"
        description="Receptor pharmacology, structure, pharmacokinetics and development status for each peptide in the catalogue — compiled from the published literature."
        image="/images/receptor.webp"
      />

      <section className="container-page py-16">
        <h2 className="text-2xl font-semibold tracking-tight">Receptor activity</h2>
        <p className="mt-2 max-w-2xl text-sm text-slate-600">
          Which incretin-family receptors each compound is designed to activate. Relative potency at each receptor
          differs between molecules — see individual monographs for detail.
        </p>
        <div className="mt-8 overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-slate-50 text-xs tracking-wide text-slate-500 uppercase">
              <tr>
                <th className="px-5 py-3 font-semibold">Compound</th>
                {RECEPTORS.map((r) => (
                  <th key={r.key} className="px-5 py-3 text-center font-semibold">
                    <span className="font-mono">{r.key}</span>
                    <span className="block text-[10px] font-normal normal-case">{r.name}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map((p) => {
                const targets = splitList(p.receptorTargets);
                return (
                  <tr key={p.id}>
                    <td className="px-5 py-3.5">
                      <Link href={`/shop/${p.slug}`} className="flex items-center gap-2.5 font-semibold hover:text-mint-700">
                        <span className="size-2 rounded-full" style={{ backgroundColor: p.accentColor }} />
                        {p.name}
                      </Link>
                    </td>
                    {RECEPTORS.map((r) => (
                      <td key={r.key} className="px-5 py-3.5 text-center">
                        {targets.includes(r.key) ? (
                          <span className="inline-grid size-7 place-items-center rounded-full bg-mint-100 text-mint-700">
                            <Check className="size-4" />
                          </span>
                        ) : (
                          <Minus className="mx-auto size-4 text-slate-300" />
                        )}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {withHalfLife.length ? (
        <section className="bg-slate-50 py-16">
          <div className="container-page">
            <h2 className="text-2xl font-semibold tracking-tight">Reported elimination half-life</h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Human pharmacokinetic half-lives from published studies, on a logarithmic scale. Albumin-binding fatty-acid
              side chains are the main reason modern analogues last days rather than minutes (native GLP-1: ~2 minutes).
            </p>
            <div className="mt-8 space-y-4 rounded-2xl border border-slate-200 bg-white p-6">
              {withHalfLife.map((p) => (
                <div key={p.id} className="grid items-center gap-3 sm:grid-cols-[140px_1fr_140px]">
                  <Link href={`/shop/${p.slug}`} className="text-sm font-semibold hover:text-mint-700">{p.name}</Link>
                  <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${(Math.log10((p.hours ?? 0) + 1) / maxLog) * 100}%`, backgroundColor: p.accentColor }}
                    />
                  </div>
                  <p className="text-sm text-slate-600 sm:text-right">{p.halfLife}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="container-page py-16">
        <h2 className="text-2xl font-semibold tracking-tight">Full data sheet comparison</h2>
        <div className="mt-8 overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full min-w-[1100px] text-left text-sm">
            <thead>
              <tr className="bg-ink-950 text-white">
                <th className="sticky left-0 z-10 w-44 bg-ink-950 px-4 py-4 text-xs font-semibold tracking-wide uppercase">Attribute</th>
                {products.map((p) => (
                  <th key={p.id} className="px-4 py-4 align-top">
                    <Link href={`/shop/${p.slug}`} className="block hover:text-mint-200">
                      <span className="mb-2 block h-0.5 w-6 rounded-full" style={{ backgroundColor: p.accentColor }} />
                      <span className="block text-base font-semibold">{p.name}</span>
                      <span className="block text-xs font-normal text-ink-300">{p.subtitle}</span>
                    </Link>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((row) => (
                <tr key={row.label} className="align-top">
                  <th className="sticky left-0 z-10 bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-600">{row.label}</th>
                  {products.map((p) => (
                    <td key={p.id} className="px-4 py-3 text-slate-700">{row.render(p)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-xs text-slate-500">
          Data compiled from published literature and regulatory documents; see each compound&apos;s references. Values may
          be updated as new data are published.
        </p>
      </section>
    </>
  );
}
