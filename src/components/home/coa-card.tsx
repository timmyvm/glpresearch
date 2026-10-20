import Link from "next/link";
import { LoopVideo } from "@/components/motion/loop-video";
import { Button } from "@/components/ui/button";

export type CardBatch = { batchNumber: string; purity: number };

/**
 * "The printed guest list": the proof is a printed certificate, tipped onto the mint field
 * and cut by the section's lower edge. Its lines are the real published batches.
 */
export function CoaCard({ batches, count, average }: { batches: CardBatch[]; count: number; average: string }) {
  return (
    <section className="overflow-hidden bg-field-mint pt-24 text-ink md:pt-32" aria-labelledby="coa-title">
      <div className="frame grid gap-10 md:grid-cols-12">
        <div className="md:col-span-5" data-reveal>
          <h2 id="coa-title" className="text-head">
            Every batch, on the record
          </h2>
          <p className="mt-6 max-w-[44ch]">
            Before a batch is sold, an independent laboratory measures its purity by HPLC and confirms its identity
            by mass spectrometry. {count} certificates are published, averaging {average}% purity.
          </p>
        </div>
        <form action="/coa" className="self-end md:col-span-6 md:col-start-7" data-reveal style={{ "--i": 1 } as React.CSSProperties}>
          <label htmlFor="home-batch" className="block text-small font-medium">
            Batch number from your vial
          </label>
          <div className="mt-2 flex gap-2">
            <input
              id="home-batch"
              name="batch"
              autoComplete="off"
              spellCheck={false}
              placeholder="e.g. SEM-2609-100…"
              className="h-14 min-w-0 flex-1 bg-white px-4 text-base uppercase placeholder:normal-case placeholder:text-muted/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-ink"
            />
            <Button type="submit" variant="ink" size="lg">
              Look Up
            </Button>
          </div>
        </form>
      </div>

      <div className="frame mt-16 flex justify-center">
        <article className="-mb-24 w-[92vw] rotate-1 bg-white px-7 pt-7 pb-36 md:w-[56vw] md:-rotate-[1.5deg] md:px-14 md:pt-14" aria-label="Certificate of analysis summary">
          <h3 className="text-center text-lead font-medium">Certificate of analysis</h3>
          <LoopVideo
            className="mt-6 aspect-video overflow-clip bg-surface"
            src="/video/hplc-loop.mp4"
            poster="/video/hplc-loop-poster.webp"
            label="A slow move towards an HPLC chromatogram showing a single sharp purity peak"
          />
          <p className="mt-8 text-center text-lead leading-[1.7]">
            {batches.map((b, i) => (
              <span key={b.batchNumber}>
                <span className="tabular whitespace-nowrap">
                  <Link href={`/coa?batch=${encodeURIComponent(b.batchNumber)}`} className="link decoration-transparent hover:decoration-ink">
                    {b.batchNumber}&nbsp;{b.purity.toFixed(2)}%
                  </Link>
                  {i < batches.length - 1 ? <span aria-hidden="true">&nbsp;·</span> : null}
                </span>{" "}
              </span>
            ))}
          </p>
        </article>
      </div>
    </section>
  );
}
