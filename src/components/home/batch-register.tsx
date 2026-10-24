import { LoopVideo } from "@/components/motion/loop-video";
import { Button } from "@/components/ui/button";

export type RegisterBatch = { batchNumber: string; purity: number };

/**
 * "Every batch on file": the register printed on one tilted sheet, cut off by the section's
 * bottom edge as if it runs on. Every published batch is listed with its purity.
 */
export function BatchRegister({ batches, count, average }: { batches: RegisterBatch[]; count: number; average: string }) {
  return (
    <section className="relative max-h-[120svh] overflow-clip bg-field-paper pt-24 md:max-h-[112svh] md:pt-32" aria-labelledby="register-title">
      <div className="frame grid gap-10 md:grid-cols-12 md:gap-x-[var(--gutter)]">
        <div className="md:col-span-3 md:pt-6" data-reveal>
          <p className="text-display font-semibold">
            <span className="tabular">{count}</span>
          </p>
          <p className="mt-3 max-w-[22ch] text-lead">batches published, averaging {average}% purity by HPLC.</p>
        </div>

        <article className="mx-auto w-[92%] rotate-[1deg] bg-white px-7 pt-8 pb-24 md:col-span-7 md:col-start-5 md:w-full md:rotate-[1.4deg] md:px-14 md:pt-14" data-reveal style={{ "--i": 1 } as React.CSSProperties}>
          <h2 id="register-title" className="text-center text-index font-semibold">
            Every batch on file
          </h2>
          <form action="/coa" className="mx-auto mt-6 flex max-w-md gap-2" role="search" aria-label="Find a batch certificate">
            <label htmlFor="register-batch" className="sr-only">
              Batch number from your vial
            </label>
            <input
              id="register-batch"
              name="batch"
              autoComplete="off"
              spellCheck={false}
              placeholder="Batch number, e.g. SEM-2609-100…"
              className="h-12 min-w-0 flex-1 bg-surface px-4 text-body uppercase placeholder:normal-case placeholder:text-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ink"
            />
            <Button type="submit" variant="ink" size="lg">
              Find
            </Button>
          </form>

          <LoopVideo
            src="/video/hplc-loop-960.mp4"
            poster="/video/hplc-loop-poster.webp"
            label="An analyst holds a vial beside an HPLC screen showing one sharp peak"
            className="mt-8 aspect-video overflow-clip bg-surface"
          />

          <p className="mt-8 text-center text-body leading-[1.8] md:text-lead md:leading-[1.75]">
            {batches.map((b, i) => (
              <span key={b.batchNumber} className="whitespace-nowrap">
                <a href={`/coa?batch=${encodeURIComponent(b.batchNumber)}`} className="tabular hover:underline">
                  {b.batchNumber} {b.purity.toFixed(2)}%
                </a>
                {i < batches.length - 1 ? <span aria-hidden="true">{" · "}</span> : null}{" "}
              </span>
            ))}
          </p>
        </article>
      </div>
    </section>
  );
}
