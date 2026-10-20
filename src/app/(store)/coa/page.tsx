import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { db } from "@/lib/db";
import { plateInk, specimenImage } from "@/lib/plates";
import { cn, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { TitleLines } from "@/components/store/page-intro";

export const metadata: Metadata = {
  title: "Lab results and certificates of analysis",
  description: "Look up the independent HPLC purity and mass-spectrometry identity results for any GLP Research batch.",
};

export default async function CoaPage({ searchParams }: { searchParams: Promise<{ batch?: string; product?: string }> }) {
  const { batch, product } = await searchParams;
  const query = batch?.trim().toUpperCase().slice(0, 40);

  const [match, batches, products] = await Promise.all([
    query ? db.batch.findFirst({ where: { batchNumber: query, published: true }, include: { product: true } }) : null,
    db.batch.findMany({
      where: { published: true, product: { active: true, ...(product ? { slug: product } : {}) } },
      include: { product: { select: { name: true, slug: true, accentColor: true } } },
      orderBy: { testedAt: "desc" },
    }),
    db.product.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
      select: { slug: true, name: true, image: true, accentColor: true, _count: { select: { batches: { where: { published: true } } } } },
    }),
  ]);

  return (
    <>
      <section className="bg-field-mint text-ink" aria-labelledby="coa-title">
        <div className="frame grid gap-6 pt-12 pb-14 md:grid-cols-12 md:items-end md:gap-x-[var(--gutter)] md:pt-20 md:pb-20">
          <h1 id="coa-title" className="lines text-display md:col-span-7">
            <TitleLines lines={["Lab results for", "every batch"]} />
          </h1>
          <div className="md:col-span-5" data-load style={{ "--d": "300ms" } as React.CSSProperties}>
            <p className="max-w-[40ch] text-lead">
              An independent laboratory tests every batch before it is sold. Enter the number printed on your vial.
            </p>
          </div>
          <form action="/coa" className="md:col-span-7" role="search" aria-label="Find a batch">
            <label htmlFor="batch" className="block text-small font-medium">
              Batch number
            </label>
            <div className="mt-2 flex flex-col gap-2 sm:flex-row">
              <input
                id="batch"
                name="batch"
                defaultValue={batch}
                autoComplete="off"
                spellCheck={false}
                placeholder="e.g. SEM-2609-100…"
                className="h-14 min-w-0 sm:flex-1 bg-white px-4 text-body uppercase placeholder:normal-case placeholder:text-muted/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-ink"
              />
              <Button type="submit" variant="ink" size="lg">
                Find Certificate
              </Button>
            </div>
          </form>
        </div>

        {query ? (
          <div className="frame pb-16 md:pb-24" aria-live="polite">
            {match ? (
              <article className="bg-white p-6 md:-rotate-[0.6deg] md:p-12" aria-labelledby="certificate-title">
                <div className="grid gap-8 md:grid-cols-12 md:gap-x-[var(--gutter)]">
                  <div className="md:col-span-7">
                    <h2 id="certificate-title" className="tabular text-head" translate="no">
                      <span className="sr-only">Certificate of analysis for </span>
                      {match.batchNumber}
                    </h2>
                    <p className="mt-4 flex items-center gap-3 text-lead">
                      <span className="size-4 shrink-0" style={{ backgroundColor: match.product.accentColor }} aria-hidden="true" />
                      <Link href={`/shop/${match.product.slug}`} className="link">
                        {match.product.name}
                        {match.variantLabel ? `, ${match.variantLabel}` : ""}
                      </Link>
                    </p>
                  </div>
                  <div className="md:col-span-5 md:text-right">
                    <p className="tabular text-display">{match.purity.toFixed(2)}%</p>
                    <p className="mt-1 text-body text-muted">purity by HPLC</p>
                  </div>
                </div>
                <dl className="mt-10 grid gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
                  {[
                    ["Identity by mass spectrometry", match.massSpec ?? "Not recorded"],
                    ["Method", match.testMethod],
                    ["Laboratory", match.laboratory],
                    ["Tested", formatDate(match.testedAt)],
                    ["Retest date", match.expiresAt ? formatDate(match.expiresAt) : "Not set"],
                    ["Notes", match.notes ?? "None"],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <dt className="text-small text-muted">{label}</dt>
                      <dd className="mt-1">{value}</dd>
                    </div>
                  ))}
                </dl>
                {match.coaUrl ? (
                  <a href={match.coaUrl} target="_blank" rel="noopener noreferrer" className="link mt-8 inline-block font-medium">
                    Download the full certificate
                  </a>
                ) : null}
              </article>
            ) : (
              <div className="bg-white p-6 md:p-8">
                <h2 className="text-lead font-medium">
                  No published batch matches “<span className="tabular">{query}</span>”
                </h2>
                <p className="mt-3 max-w-[60ch]">
                  Check the number on the vial label: three letters, the year and month, then a number, for example{" "}
                  <span className="tabular">TIR-2609-107</span>. If it still doesn&apos;t appear,{" "}
                  <Link href="/contact" className="link font-medium">
                    contact us
                  </Link>{" "}
                  and we&apos;ll send the certificate directly.
                </p>
              </div>
            )}
          </div>
        ) : null}
      </section>

      <section className="frame pt-20 md:pt-28" aria-labelledby="all-title">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <h2 id="all-title" className="text-head" data-reveal>
            All published batches
          </h2>
          <p className="tabular text-muted" aria-live="polite">
            {batches.length} {batches.length === 1 ? "batch" : "batches"}
            {product ? `, ${products.find((p) => p.slug === product)?.name ?? ""}` : ""}
          </p>
        </div>
        <p className="mt-4 max-w-[62ch]" data-reveal>
          Purity is reported to two decimal places from the HPLC trace, and identity is confirmed by mass spectrometry
          against the peptide&apos;s theoretical mass. Choose a compound to see only its batches.
        </p>
        <nav aria-label="Filter by compound" className="mt-8 grid grid-cols-4 gap-1.5 sm:grid-cols-8">
          <Link href="/coa" aria-current={!product ? "page" : undefined} className="group block">
            <span className={cn("flex aspect-[4/5] items-end p-3 text-lead font-medium", !product ? "bg-ink text-on-navy" : "bg-surface text-ink group-hover:bg-surface-2")}>All</span>
            <span className="tabular mt-1.5 block truncate text-small text-muted">{products.reduce((n, p) => n + p._count.batches, 0)} batches</span>
          </Link>
          {products.map((p) => {
            const active = product === p.slug;
            return (
              <Link key={p.slug} href={`/coa?product=${p.slug}`} aria-current={active ? "page" : undefined} className="group block">
                <span
                  className={cn("relative block aspect-[4/5] overflow-clip transition-[outline-color] duration-200", active ? "outline-4 -outline-offset-4 outline-ink" : "")}
                  style={{ backgroundColor: p.accentColor, color: plateInk(p.accentColor) }}
                >
                  <Image src={specimenImage(p.image) ?? p.image} alt="" fill sizes="(min-width: 640px) 12vw, 25vw" className="object-contain px-[14%] pt-[12%] pb-[6%] transition-transform duration-500 ease-[var(--ease-out)] group-hover:-translate-y-1" />
                </span>
                <span className={cn("mt-1.5 block truncate text-small", active ? "font-medium text-ink" : "text-muted group-hover:text-ink")}>{p.name}</span>
              </Link>
            );
          })}
        </nav>
        <div className="mt-8 overflow-x-auto" data-reveal style={{ "--i": 1 } as React.CSSProperties}>
          <table className="tabular w-full text-left">
            <caption className="sr-only">Published batch results</caption>
            <thead className="text-small text-muted">
              <tr>
                <th scope="col" className="pr-4 pb-3 font-medium">Batch</th>
                <th scope="col" className="px-3 pb-3 font-medium">Compound</th>
                <th scope="col" className="hidden px-3 pb-3 font-medium md:table-cell">Size</th>
                <th scope="col" className="px-3 pb-3 text-right font-medium">Purity</th>
                <th scope="col" className="hidden px-3 pb-3 font-medium sm:table-cell">Identity</th>
                <th scope="col" className="hidden px-3 pb-3 font-medium md:table-cell">Tested</th>
              </tr>
            </thead>
            <tbody>
              {batches.map((b) => (
                <tr key={b.id} className="border-t border-ink/10" data-reveal>{/* taste-skill-ignore: real table rows */}
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
                  <td className="hidden px-3 py-3.5 md:table-cell">{b.variantLabel ?? "All sizes"}</td>
                  <td className="px-3 py-3.5 text-right">{b.purity.toFixed(2)}%</td>
                  <td className="hidden px-3 py-3.5 sm:table-cell">{b.massSpec ? "Confirmed" : "Not recorded"}</td>
                  <td className="hidden px-3 py-3.5 md:table-cell">{formatDate(b.testedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="frame grid items-center gap-10 pt-28 md:grid-cols-12 md:gap-x-[var(--gutter)] md:pt-40" aria-labelledby="reading-title">
        <div className="grid grid-cols-2 gap-1.5 md:col-span-6" data-reveal>
          <div className="relative aspect-[3/4] overflow-clip">
            <Image src="/images/hplc-analysis.webp" alt="An analyst holds a sample vial beside an HPLC chromatogram with one sharp peak" fill sizes="(min-width: 768px) 25vw, 50vw" className="drift object-cover" />
          </div>
          <div className="relative aspect-[3/4] overflow-clip">
            <Image src="/images/lab-bench.webp" alt="An analyst pipettes a sample into a vial at a laboratory bench" fill sizes="(min-width: 768px) 25vw, 50vw" className="object-cover" />
          </div>
        </div>
        <div className="md:col-span-5 md:col-start-8" data-reveal style={{ "--i": 1 } as React.CSSProperties}>
          <h2 id="reading-title" className="text-index font-medium">
            Reading a certificate
          </h2>
          <p className="mt-5 max-w-[46ch]">
            Purity is the main peak&apos;s share of everything the HPLC detects at 214 nm. Identity is confirmed when the
            mass spectrometer finds the peptide&apos;s theoretical mass. Neither tells you the peptide content by weight,
            which also counts water and counter-ions.
          </p>
          <Link href="/research/understanding-certificates-of-analysis" className="link mt-6 inline-block font-medium">
            The full guide to certificates of analysis
          </Link>
        </div>
      </section>
    </>
  );
}
