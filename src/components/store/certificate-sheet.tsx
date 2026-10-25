import Link from "next/link";
import type { Residue } from "@/lib/sequence";
import { formatDate, siteUrl } from "@/lib/utils";
import { Chromatogram } from "./chromatogram";
import { Formula } from "./formula";
import { SequenceStrip } from "./sequence-strip";

export type SheetBatch = {
  batchNumber: string;
  variantLabel: string | null;
  purity: number;
  massSpec: string | null;
  testMethod: string;
  laboratory: string;
  testedAt: Date;
  expiresAt: Date | null;
  notes: string | null;
  coaUrl: string | null;
};

export type SheetProduct = {
  slug: string;
  name: string;
  plate: string;
  plateInk: string;
  molecularWeight: string | null;
  molecularFormula: string | null;
  residues: Residue[];
  identity: number;
};

const SPEC = 99;

/**
 * A batch's certificate of analysis printed in full: what was tested, how, against what
 * specification, and the result, with the trace and the sequence. The same paperwork the
 * homepage certificate summarises.
 */
export function CertificateSheet({ batch, product, actions }: { batch: SheetBatch; product: SheetProduct; actions?: React.ReactNode }) {
  const [hplc, ms] = batch.testMethod.split(/\s*\/\s*/);
  const mw = product.molecularWeight ? Number.parseFloat(product.molecularWeight) : NaN;
  const daltons = Number.isFinite(mw) ? mw.toFixed(2) : null;
  const passes = batch.purity >= SPEC;

  return (
    <article className="bg-paper px-5 pt-6 pb-8 text-ink md:px-12 md:pt-10 md:pb-12" aria-labelledby="certificate-title">
      <header className="flex flex-col gap-4 bg-ink px-5 py-4 text-white md:-mx-12 md:-mt-10 md:flex-row md:items-baseline md:justify-between md:px-12 md:py-5 -mx-5 -mt-6">
        <p className="text-lead font-semibold">GLP Research, certificate of analysis</p>
        <p className="text-lead text-on-navy-muted">
          Issued {formatDate(batch.testedAt, { day: "numeric", month: "long", year: "numeric" })}
        </p>
      </header>

      <div className="mt-8 grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <h2 id="certificate-title" className="tabular text-head font-semibold" translate="no">
            <span className="sr-only">Certificate of analysis for </span>
            <span className="block text-small font-normal text-muted">Batch</span>
            {batch.batchNumber}
          </h2>
          <p className="mt-3 flex items-center gap-3 text-lead">
            <span className="size-4 shrink-0" style={{ backgroundColor: product.plate }} aria-hidden="true" />
            <span>
              <Link href={`/shop/${product.slug}`} className="link">
                {product.name}
              </Link>
              {batch.variantLabel ? `, ${batch.variantLabel} vial` : null}
            </span>
          </p>
        </div>
        <p className="md:text-right">
          <span className="tabular block text-display font-semibold">{batch.purity.toFixed(2)}%</span>
          <span className="text-body">purity by HPLC, {passes ? "meets specification" : "see notes"}</span>
        </p>
      </div>

      {/* On a phone each test stacks under its name, with the result beside it, instead of scrolling sideways. */}
      <table className="mt-10 block w-full text-left text-body md:table">
        <caption className="sr-only">Tests, methods, specifications and results for batch {batch.batchNumber}</caption>
        <thead className="hidden text-small text-muted md:table-header-group">
          <tr>
            <th scope="col" className="pb-2 pr-4 font-medium">Test</th>
            <th scope="col" className="pb-2 pr-4 font-medium">Method</th>
            <th scope="col" className="pb-2 pr-4 font-medium">Specification</th>
            <th scope="col" className="pb-2 text-right font-medium">Result</th>
          </tr>
        </thead>
        <tbody className="tabular block align-top md:table-row-group">
          {[
            { test: "Purity", method: hplc ?? batch.testMethod, spec: <>≥{SPEC.toFixed(1)}% main peak</>, result: `${batch.purity.toFixed(2)}%` },
            { test: "Identity", method: ms ?? "Mass spectrometry", spec: daltons ? `Mass consistent with ${daltons} Da` : "Mass consistent with theory", result: batch.massSpec ? "Confirmed" : "Not recorded" },
            {
              test: "Sequence",
              method: "From the reference structure",
              spec: (
                <>
                  {product.residues.length} residues
                  {product.molecularFormula ? (
                    <>
                      , <Formula value={product.molecularFormula} />
                    </>
                  ) : null}
                </>
              ),
              result: `${product.identity}% native GLP-1`,
            },
          ].map((row) => (
            <tr key={row.test} className="grid grid-cols-[1fr_auto] gap-x-4 border-t-2 border-ink/15 py-3 md:table-row md:py-0">{/* taste-skill-ignore: real table rows */}
              <th scope="row" className="font-medium md:py-3 md:pr-4">{row.test}</th>
              <td className="col-start-1 text-small text-muted md:py-3 md:pr-4 md:text-body md:text-ink">
                <span className="md:hidden">Method: </span>
                {row.method}
              </td>
              <td className="col-start-1 text-small text-muted md:py-3 md:pr-4 md:text-body md:text-ink">
                <span className="md:hidden">Specification: </span>
                {row.spec}
              </td>
              <td className="col-start-2 row-start-1 text-right font-medium md:py-3">{row.result}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-10 grid gap-10 lg:grid-cols-12 lg:gap-x-10">
        <div className="lg:col-span-7">
          <p className="text-small text-muted">RP-HPLC trace, UV 214 nm, 20-minute run</p>
          <Chromatogram purity={batch.purity} seed={batch.batchNumber} className="mt-3 aspect-[16/7]" label={`HPLC trace for batch ${batch.batchNumber}: main peak ${batch.purity.toFixed(2)}% of total area`} />
        </div>
        <dl className="space-y-4 text-body lg:col-span-5">
          {[
            ["Laboratory", batch.laboratory],
            ["Tested", formatDate(batch.testedAt, { day: "numeric", month: "long", year: "numeric" })],
            ["Retest date", batch.expiresAt ? formatDate(batch.expiresAt, { day: "numeric", month: "long", year: "numeric" }) : "Not set"],
            ["Identity detail", batch.massSpec ?? "Not recorded"],
            ["Notes", batch.notes ?? "None"],
          ].map(([label, value]) => (
            <div key={label}>
              <dt className="text-small text-muted">{label}</dt>
              <dd className="mt-0.5">{value}</dd>
            </div>
          ))}
        </dl>
      </div>

      {product.residues.length ? (
        <div className="mt-10">
          <p className="text-body">Sequence. Marked residues differ from native GLP-1; underlined residues carry a side chain.</p>
          <SequenceStrip residues={product.residues} plate={product.plate} ink={product.plateInk} className="mt-2" />
        </div>
      ) : null}

      <footer className="mt-10 flex flex-col gap-4 border-t-4 border-dotted border-ink/20 pt-6 md:flex-row md:items-center md:justify-between">
        <p className="max-w-[60ch] text-body">
          Verify this certificate at <span className="tabular break-all font-medium">{siteUrl(`/coa?batch=${batch.batchNumber}`).replace(/^https?:\/\//, "")}</span>. Purity is the main peak&apos;s share of the HPLC trace; the trace shown is drawn from that figure.
        </p>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          {batch.coaUrl ? (
            <a href={batch.coaUrl} target="_blank" rel="noopener noreferrer" className="link text-body font-medium">
              The laboratory&apos;s PDF
            </a>
          ) : null}
          {actions}
        </div>
      </footer>
    </article>
  );
}
