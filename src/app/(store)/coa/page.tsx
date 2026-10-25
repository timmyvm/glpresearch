import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { LAB_PICTURES } from "@/content/credits";
import { db } from "@/lib/db";
import { plateInk, specimenImage } from "@/lib/plates";
import { identityWithNative, parseSequence } from "@/lib/sequence";
import { cn, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { TitleLines } from "@/components/store/page-intro";
import { CertificateSheet } from "@/components/store/certificate-sheet";
import { PrintButton } from "./print-button";

export const metadata: Metadata = {
  title: "Lab results and certificates of analysis",
  description: "Look up the independent HPLC purity and mass-spectrometry identity results for any GLP Research batch.",
  alternates: { canonical: "/coa" },
};

const certificateProduct = {
  slug: true,
  name: true,
  accentColor: true,
  molecularWeight: true,
  molecularFormula: true,
  sequence: true,
} as const;

export default async function CoaPage({ searchParams }: { searchParams: Promise<{ batch?: string; product?: string }> }) {
  const { batch, product } = await searchParams;
  const query = batch?.trim().toUpperCase().slice(0, 40);

  const [match, latest, batches, products] = await Promise.all([
    query ? db.batch.findFirst({ where: { batchNumber: query, published: true }, include: { product: { select: certificateProduct } } }) : null,
    // With nothing looked up, the page still prints a certificate: the newest one.
    query
      ? null
      : db.batch.findFirst({ where: { published: true, product: { active: true } }, orderBy: { testedAt: "desc" }, include: { product: { select: certificateProduct } } }),
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

  const shown = match ?? latest;
  const residues = shown ? parseSequence(shown.product.sequence) : [];
  const sheetProduct = shown
    ? {
        slug: shown.product.slug,
        name: shown.product.name,
        plate: shown.product.accentColor,
        plateInk: plateInk(shown.product.accentColor),
        molecularWeight: shown.product.molecularWeight,
        molecularFormula: shown.product.molecularFormula,
        residues,
        identity: identityWithNative(residues),
      }
    : null;
  const average = batches.length ? batches.reduce((s, b) => s + b.purity, 0) / batches.length : 0;

  return (
    <>
      <section className="bg-field-paper text-ink print:bg-transparent" aria-labelledby="coa-title">
        <div className="frame grid gap-8 pt-12 pb-14 md:grid-cols-12 md:items-end md:gap-x-[var(--gutter)] md:pt-20 md:pb-16 print:hidden">
          <h1 id="coa-title" className="lines text-display md:col-span-7">
            <TitleLines lines={["Lab results for", "every batch"]} />
          </h1>
          <div className="md:col-span-5" data-load style={{ "--d": "300ms" } as React.CSSProperties}>
            <p className="max-w-[40ch] text-lead">
              An independent laboratory tests every batch before it is sold. Type the number printed on your vial to print its certificate.
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
                className="h-14 min-w-0 bg-white px-4 text-body uppercase placeholder:normal-case placeholder:text-muted/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-ink sm:flex-1"
              />
              <Button type="submit" variant="accent" size="lg">
                Find Certificate
              </Button>
            </div>
          </form>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 md:col-span-5 md:col-start-8 lg:col-span-4 lg:col-start-9">
            <div className="flex flex-col-reverse">
              <dt className="text-body">published batches</dt>
              <dd className="tabular text-index font-semibold">{batches.length}</dd>
            </div>
            <div className="flex flex-col-reverse">
              <dt className="text-body">average purity</dt>
              <dd className="tabular text-index font-semibold">{average ? `${average.toFixed(2)}%` : "None yet"}</dd>
            </div>
          </dl>
        </div>

        <div className="frame pb-20 md:pb-28" aria-live="polite">
          {query && !match ? (
            <div className="bg-paper p-6 md:p-10">
              <h2 className="text-index font-semibold">
                No published batch matches “<span className="tabular">{query}</span>”
              </h2>
              <p className="mt-4 max-w-[60ch] text-body">
                Check the number on the vial label: three letters, the year and month, then a number, for example{" "}
                <span className="tabular">TIR-2609-107</span>. If it still doesn&apos;t appear,{" "}
                <Link href="/contact" className="link font-medium">
                  contact us
                </Link>{" "}
                and we&apos;ll send the certificate directly.
              </p>
            </div>
          ) : shown && sheetProduct ? (
            <>
              {!match ? (
                <p className="mb-4 text-body print:hidden">
                  The newest certificate, for batch <span className="tabular font-medium">{shown.batchNumber}</span>. Look up yours above.
                </p>
              ) : null}
              <CertificateSheet batch={shown} product={sheetProduct} actions={<PrintButton />} />
            </>
          ) : null}
        </div>
      </section>

      <section className="frame pt-20 md:pt-28 print:hidden" aria-labelledby="path-title">
        <h2 id="path-title" className="text-head font-semibold" data-reveal>
          From vial to certificate
        </h2>
        <ol className="mt-10 grid gap-x-[var(--gutter)] gap-y-10 md:grid-cols-3">
          {[
            { src: "/images/lab/sealing.webp", text: "A batch is sealed under one number. That number is printed on every vial and on your packing slip." },
            { src: "/images/lab/autosampler.webp", text: "Vials from the batch go to an independent laboratory for HPLC purity and mass spectrometry." },
            { src: "/images/lab/coa-report.webp", text: "The laboratory's result is published here, in full, before the batch is sold." },
          ].map((step, i) => (
            <li key={step.src} data-reveal style={{ "--i": i } as React.CSSProperties}>
              <figure>
                <div className={cn("relative aspect-[4/5] overflow-clip bg-field-black", i === 1 && "md:mt-12")}>
                  <Image src={step.src} alt={LAB_PICTURES[step.src] ?? ""} fill sizes="(min-width: 768px) 30vw, 100vw" className="object-cover" />
                </div>
                <figcaption className="mt-4 grid grid-cols-[1.75rem_1fr] text-body">
                  <span className="tabular font-semibold">{i + 1}</span>
                  <span className="max-w-[36ch]">{step.text}</span>
                </figcaption>
              </figure>
            </li>
          ))}
        </ol>
      </section>

      <section id="register" className="frame scroll-mt-24 pt-20 md:pt-28 print:hidden" aria-labelledby="all-title">
        <div className="grid gap-6 md:grid-cols-12 md:gap-x-[var(--gutter)]">
          <div className="md:col-span-5" data-reveal>
            <h2 id="all-title" className="text-head font-semibold">
              The batch register
            </h2>
            <p className="mt-6 max-w-[42ch] text-lead">
              Every batch we have released, with its purity and identity result. Choose a compound to see only its batches.
            </p>
          </div>
          <nav aria-label="Filter by compound" className="grid grid-cols-4 gap-1.5 self-end sm:grid-cols-8 md:col-span-7" data-reveal style={{ "--i": 1 } as React.CSSProperties}>
            <Link href="/coa" aria-current={!product ? "page" : undefined} scroll={false} className="group block">
              <span className={cn("flex aspect-[4/5] items-end p-2.5 text-lead font-semibold", !product ? "bg-ink text-white" : "bg-surface text-ink group-hover:bg-surface-2")}>All</span>
              <span className="tabular mt-1.5 block truncate text-small text-muted">{products.reduce((n, p) => n + p._count.batches, 0)} batches</span>
            </Link>
            {products.map((p) => {
              const active = product === p.slug;
              return (
                <Link key={p.slug} href={`/coa?product=${p.slug}`} aria-current={active ? "page" : undefined} scroll={false} className="group block">
                  <span
                    className={cn("relative block aspect-[4/5] overflow-clip", active ? "outline-4 -outline-offset-4 outline-ink" : "")}
                    style={{ backgroundColor: p.accentColor, color: plateInk(p.accentColor) }}
                  >
                    <Image src={specimenImage(p.image) ?? p.image} alt="" fill sizes="(min-width: 640px) 8vw, 25vw" className="object-contain px-[14%] pt-[12%] pb-[6%] transition-transform duration-500 ease-[var(--ease-out)] group-hover:-translate-y-1" />
                  </span>
                  <span className={cn("mt-1.5 block truncate text-small", active ? "font-medium text-ink" : "text-muted group-hover:text-ink")}>{p.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-10 bg-paper px-5 pt-6 pb-8 md:px-10 md:pt-8" data-reveal>
          <p className="tabular text-small text-muted" aria-live="polite">
            {batches.length} {batches.length === 1 ? "batch" : "batches"}
            {product ? `, ${products.find((p) => p.slug === product)?.name ?? ""}` : ", newest first"}
          </p>
          <div className="mt-3 overflow-x-auto">
            <table className="tabular w-full text-left text-body">
              <caption className="sr-only">Published batch results</caption>
              <thead className="text-small text-muted">
                <tr>
                  <th scope="col" className="pr-4 pb-3 font-medium">Batch</th>
                  <th scope="col" className="hidden px-3 pb-3 font-medium sm:table-cell">Compound</th>
                  <th scope="col" className="hidden px-3 pb-3 font-medium md:table-cell">Size</th>
                  <th scope="col" className="px-3 pb-3 text-right font-medium">Purity</th>
                  <th scope="col" className="hidden px-3 pb-3 font-medium sm:table-cell">Identity</th>
                  <th scope="col" className="hidden px-3 pb-3 font-medium md:table-cell">Tested</th>
                </tr>
              </thead>
              <tbody>
                {batches.map((b) => (
                  <tr key={b.id} className={cn("border-t-2 border-ink/10", shown?.batchNumber === b.batchNumber && "bg-white")}>{/* taste-skill-ignore: real table rows */}
                    <td className="py-3.5 pr-4">
                      <Link href={`/coa?batch=${encodeURIComponent(b.batchNumber)}`} className="link font-medium whitespace-nowrap" translate="no">
                        {b.batchNumber}
                      </Link>
                      <span className="mt-0.5 flex items-center gap-2 text-small text-muted sm:hidden">
                        <span className="size-2.5 shrink-0" style={{ backgroundColor: b.product.accentColor }} aria-hidden="true" />
                        {b.product.name}
                      </span>
                    </td>
                    <td className="hidden px-3 py-3.5 sm:table-cell">
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
        </div>
      </section>

      <section className="frame grid items-center gap-10 pt-28 md:grid-cols-12 md:gap-x-[var(--gutter)] md:pt-40 print:hidden" aria-labelledby="reading-title">
        <div className="grid grid-cols-2 gap-1.5 md:col-span-6" data-reveal>
          <div className="relative aspect-[3/4] overflow-clip">
            <Image src="/images/lab/checking-vial.webp" alt={LAB_PICTURES["/images/lab/checking-vial.webp"]} fill sizes="(min-width: 768px) 25vw, 50vw" className="object-cover" />
          </div>
          <div className="relative mt-16 aspect-[3/4] overflow-clip">
            <Image src="/images/lab/notebook.webp" alt="A lab notebook beside a rack of vials and a printed chromatogram with one sharp peak" fill sizes="(min-width: 768px) 25vw, 50vw" className="object-cover" />
          </div>
        </div>
        <div className="md:col-span-5 md:col-start-8" data-reveal style={{ "--i": 1 } as React.CSSProperties}>
          <h2 id="reading-title" className="text-head font-semibold">
            Reading a certificate
          </h2>
          <dl className="mt-8 space-y-6 text-body">
            <div>
              <dt className="font-semibold">Purity</dt>
              <dd className="mt-1 max-w-[46ch]">The main peak&apos;s share of everything the HPLC detects at 214 nm. Our release specification is 99.0% or higher.</dd>
            </div>
            <div>
              <dt className="font-semibold">Identity</dt>
              <dd className="mt-1 max-w-[46ch]">Confirmed when the mass spectrometer finds the peptide&apos;s theoretical mass.</dd>
            </div>
            <div>
              <dt className="font-semibold">What neither tells you</dt>
              <dd className="mt-1 max-w-[46ch]">The peptide content by weight, which also counts water and counter-ions left from synthesis.</dd>
            </div>
          </dl>
          <Link href="/research/understanding-certificates-of-analysis" className="link mt-8 inline-block font-medium">
            The full guide to certificates of analysis
          </Link>
        </div>
      </section>
    </>
  );
}
