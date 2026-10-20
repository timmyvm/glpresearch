import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, Download, FileSearch, Search } from "lucide-react";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/form";
import { PageHero } from "@/components/store/page-hero";

export const metadata: Metadata = {
  title: "Lab testing & certificates of analysis",
  description: "Search independent HPLC purity and mass-spectrometry identity results for every GLP Research batch.",
};

export default async function CoaPage({ searchParams }: { searchParams: Promise<{ batch?: string; product?: string }> }) {
  const { batch, product } = await searchParams;
  const query = batch?.trim().toUpperCase();

  const [match, batches, products] = await Promise.all([
    query ? db.batch.findFirst({ where: { batchNumber: query, published: true }, include: { product: true } }) : null,
    db.batch.findMany({
      where: { published: true, product: { active: true, ...(product ? { slug: product } : {}) } },
      include: { product: { select: { name: true, slug: true, accentColor: true, molecularWeight: true } } },
      orderBy: { testedAt: "desc" },
    }),
    db.product.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" }, select: { slug: true, name: true } }),
  ]);

  return (
    <>
      <PageHero
        eyebrow="Quality control"
        title="Lab testing & certificates of analysis"
        description="Every batch is tested by an independent analytical laboratory before release. Enter the batch number printed on your vial to see its results."
        image="/images/hplc-analysis.webp"
      >
        <form className="mt-8 flex max-w-lg gap-2" action="/coa">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
            <Input name="batch" defaultValue={batch} placeholder="e.g. SEM-2609-100" className="h-12 pl-9 font-mono uppercase" aria-label="Batch number" />
          </div>
          <Button type="submit" variant="accent" size="lg">Look up</Button>
        </form>
      </PageHero>

      <section className="container-page py-12">
        {query ? (
          match ? (
            <div className="overflow-hidden rounded-3xl border border-slate-200">
              <div className="flex flex-col gap-4 border-b border-slate-200 bg-emerald-50/60 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="grid size-11 place-items-center rounded-full bg-emerald-100 text-emerald-700">
                    <BadgeCheck className="size-6" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold tracking-wide text-emerald-700 uppercase">Verified batch</p>
                    <p className="font-mono text-lg font-semibold">{match.batchNumber}</p>
                  </div>
                </div>
                {match.coaUrl ? (
                  <a href={match.coaUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-lg bg-ink-900 px-4 py-2 text-sm font-semibold text-white hover:bg-ink-800">
                    <Download className="size-4" /> Download certificate
                  </a>
                ) : null}
              </div>
              <dl className="grid gap-px bg-slate-200 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  ["Compound", <Link key="p" href={`/shop/${match.product.slug}`} className="hover:text-mint-700">{match.product.name}{match.variantLabel ? ` · ${match.variantLabel}` : ""}</Link>],
                  ["Purity (HPLC)", <span key="u" className="font-mono text-emerald-700">{match.purity.toFixed(2)}%</span>],
                  ["Tested", formatDate(match.testedAt)],
                  ["Retest date", match.expiresAt ? formatDate(match.expiresAt) : "—"],
                ].map(([label, value]) => (
                  <div key={String(label)} className="bg-white px-6 py-5">
                    <dt className="text-xs tracking-wide text-slate-500 uppercase">{label}</dt>
                    <dd className="mt-1 text-lg font-semibold text-ink-900">{value}</dd>
                  </div>
                ))}
              </dl>
              <dl className="divide-y divide-slate-100 text-sm">
                {[
                  ["Identity (mass spectrometry)", match.massSpec ?? "—"],
                  ["Test method", match.testMethod],
                  ["Testing laboratory", match.laboratory],
                  ["Theoretical molecular weight", match.product.molecularWeight ?? "—"],
                  ["Notes", match.notes ?? "—"],
                ].map(([label, value]) => (
                  <div key={label} className="grid gap-1 px-6 py-3.5 sm:grid-cols-[260px_1fr]">
                    <dt className="text-slate-500">{label}</dt>
                    <dd className="text-ink-900">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ) : (
            <Alert tone="warning" title={`No published batch found for “${query}”`}>
              Check the batch number on your vial label (letters and numbers, e.g. <span className="font-mono">TIR-2609-107</span>).
              If it still can&apos;t be found, <Link href="/contact" className="font-semibold underline">contact us</Link> and
              we&apos;ll send the certificate directly.
            </Alert>
          )
        ) : null}

        <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_340px]">
          <div>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">All published batches</h2>
                <p className="mt-1 text-sm text-slate-600">{batches.length} results</p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <Link href="/coa" className={`rounded-full px-3 py-1.5 text-xs font-medium ${!product ? "bg-ink-900 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}>All</Link>
                {products.map((p) => (
                  <Link key={p.slug} href={`/coa?product=${p.slug}`} className={`rounded-full px-3 py-1.5 text-xs font-medium ${product === p.slug ? "bg-ink-900 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}>
                    {p.name}
                  </Link>
                ))}
              </div>
            </div>
            <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="bg-slate-50 text-xs tracking-wide text-slate-500 uppercase">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Batch</th>
                    <th className="px-4 py-3 font-semibold">Compound</th>
                    <th className="px-4 py-3 font-semibold">Purity</th>
                    <th className="px-4 py-3 font-semibold">Identity</th>
                    <th className="px-4 py-3 font-semibold">Tested</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {batches.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50/60">
                      <td className="px-4 py-3">
                        <Link href={`/coa?batch=${encodeURIComponent(b.batchNumber)}`} className="font-mono text-xs font-semibold text-mint-700 hover:underline">
                          {b.batchNumber}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-2">
                          <span className="size-2 rounded-full" style={{ backgroundColor: b.product.accentColor }} />
                          {b.product.name}
                          {b.variantLabel ? <span className="text-slate-400">· {b.variantLabel}</span> : null}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono font-semibold text-emerald-700">{b.purity.toFixed(2)}%</td>
                      <td className="px-4 py-3 text-xs text-slate-600">{b.massSpec ? "MS confirmed" : "—"}</td>
                      <td className="px-4 py-3 text-slate-600">{formatDate(b.testedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl">
              <Image src="/images/lab-bench.webp" alt="Analyst preparing a sample" fill sizes="340px" className="object-cover" />
            </div>
            <div className="rounded-3xl border border-slate-200 p-6">
              <FileSearch className="size-5 text-mint-600" />
              <p className="mt-3 font-semibold text-ink-900">How to read a COA</p>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Purity is the area of the main peak as a percentage of all detected peaks on the HPLC chromatogram.
                Identity is confirmed when the observed mass matches the theoretical mass of the peptide.
              </p>
              <Link href="/research/understanding-certificates-of-analysis" className="mt-3 inline-block text-sm font-semibold text-mint-700 hover:underline">
                Full guide to certificates of analysis →
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
