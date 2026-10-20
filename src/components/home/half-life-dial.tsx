"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/utils";

export type DialItem = {
  slug: string;
  name: string;
  plate: string;
  image: string;
  halfLife: string | null;
  hours: number | null;
  variable: boolean;
  times: number | null;
};

const nf = new Intl.NumberFormat("en-AU");

function readable(label: string) {
  return label.replace(/^~\s*/, "About ").replace(/\s*\(.*\)$/, "");
}

/**
 * The page's live thing ("Object on a disc"): pick a compound and the disc takes its label
 * colour while the fact beside it compares its half-life with native GLP-1's two minutes.
 */
export function HalfLifeDial({ items }: { items: DialItem[] }) {
  const [i, setI] = useState(0);
  const item = items[i];

  const fact = item.times
    ? `Roughly ${nf.format(item.times)} times as long as native GLP-1, which the body clears in about two minutes.`
    : item.variable
      ? "Phase 1 studies found it varies widely between people, from about six days to four weeks."
      : "No human half-life has been published in a primary source yet.";

  return (
    <section className="relative overflow-hidden py-24 md:min-h-[100svh] md:py-0" aria-labelledby="half-life-title">
      <div className="frame relative md:min-h-[100svh]">
        {/* Disc and vial */}
        <div className="relative mx-auto aspect-square w-[86vw] md:absolute md:top-1/2 md:left-[54%] md:w-[64vh] md:-translate-x-1/2 md:-translate-y-1/2">
          <div className="absolute inset-0 rounded-full transition-colors duration-300" style={{ backgroundColor: item.plate }} />
          <div className="absolute inset-x-0 -top-[14%] bottom-[8%]">
            {items.map((it, k) => (
              <Image
                key={it.slug}
                src={it.image}
                alt={k === i ? `${it.name} research vial` : ""}
                fill
                sizes="(min-width: 768px) 40vh, 60vw"
                className={cn("object-contain transition-opacity duration-300", k === i ? "opacity-100" : "opacity-0")}
              />
            ))}
          </div>
        </div>

        {/* The list is the index; its first line is the heading. */}
        <div className="relative mt-10 md:absolute md:bottom-[12vh] md:left-[var(--margin)] md:mt-0">
          <h2 id="half-life-title" className="text-index font-medium text-muted">
            Half-life
          </h2>
          <ul className="flex flex-wrap gap-x-5 md:block" aria-labelledby="half-life-title">
            {items.map((it, k) => (
              <li key={it.slug}>
                <button
                  type="button"
                  aria-pressed={k === i}
                  onClick={() => setI(k)}
                  className={cn(
                    "inline-flex items-center gap-3 text-left text-index font-medium transition-colors duration-200",
                    k === i ? "text-ink" : "text-muted hover:text-ink",
                  )}
                >
                  {it.name}
                  {k === i ? <span className="size-3 shrink-0" style={{ backgroundColor: it.plate }} aria-hidden="true" /> : null}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative mt-8 max-w-[34ch] md:max-w-[24ch] md:absolute md:top-1/2 md:left-[calc(54%+32vh+1.5rem)] md:mt-0 md:-translate-y-1/2" aria-live="polite">
          <p className="text-lead font-medium">{item.halfLife ? readable(item.halfLife) : "Not yet published"}</p>
          <p className="mt-3">{fact}</p>
          <Link href="/research/half-life-engineering" className="link mt-5 inline-block text-muted">
            How peptide chemistry stretches a half-life
          </Link>
        </div>
      </div>
    </section>
  );
}
