"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import type { Residue } from "@/lib/sequence";
import { cn } from "@/lib/utils";
import { ButtonLink } from "@/components/ui/button";
import { Chromatogram } from "@/components/store/chromatogram";
import { SequenceStrip } from "@/components/store/sequence-strip";

export type CertCompound = {
  slug: string;
  name: string;
  plate: string;
  plateInk: string;
  image: string;
  halfLife: string | null;
  daltons: string | null;
  residues: Residue[];
  identity: number;
  batch: { number: string; purity: number; tested: string; size: string | null } | null;
};

/**
 * The homepage's certificate of analysis. Pick a compound and the sheet reprints from that
 * compound's latest published batch: purity, identity, a trace drawn from the purity, and the
 * sequence marked against native GLP-1. Without script it shows the first compound in full.
 */
export function Certificate({ compounds }: { compounds: CertCompound[] }) {
  const [index, setIndex] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const c = compounds[index];

  const select = (i: number) => {
    const next = (i + compounds.length) % compounds.length;
    setIndex(next);
    tabs.current[next]?.focus();
  };

  return (
    <article className="hero-card flex flex-col bg-paper p-5 text-ink sm:p-7 lg:h-[var(--ch)] lg:p-8" aria-labelledby="hero-title">
      <h1 id="hero-title" className="cert-title flex flex-wrap gap-x-[0.28em] font-semibold sm:gap-x-6 lg:justify-between">
        <span>GLP-1</span> <span>research</span> <span>peptides</span>
      </h1>
      <p className="mt-4 max-w-[48ch] text-lead lg:mt-5">
        Seven research compounds that act on the GLP-1 receptor, each batch tested before it ships.
      </p>

      <div role="tablist" aria-label="Show the certificate for" className="mt-6 flex flex-wrap gap-1.5">
        {compounds.map((x, i) => (
          <button
            key={x.slug}
            ref={(el) => {
              tabs.current[i] = el;
            }}
            type="button"
            role="tab"
            id={`cert-tab-${x.slug}`}
            aria-selected={i === index}
            aria-controls="cert-sheet"
            tabIndex={i === index ? 0 : -1}
            onClick={() => setIndex(i)}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight") select(i + 1);
              if (e.key === "ArrowLeft") select(i - 1);
            }}
            className={cn(
              "press inline-flex h-9 items-center gap-2 px-3 text-small font-medium",
              i === index ? "bg-ink text-white" : "bg-surface-2 text-ink hover:bg-field-paper",
            )}
          >
            <span className="size-2.5 shrink-0" style={{ backgroundColor: x.plate }} aria-hidden="true" />
            {x.name}
          </button>
        ))}
      </div>

      <div id="cert-sheet" role="tabpanel" aria-labelledby={`cert-tab-${c.slug}`} key={c.slug} className="reprint mt-6 flex min-h-0 flex-1 flex-col">
        <div className="grid min-h-0 flex-1 gap-6 sm:grid-cols-12 sm:gap-x-6">
          <div className="sm:col-span-7 sm:flex sm:flex-col lg:col-span-4 lg:block">
            <p className="text-lead font-medium" aria-live="polite">
              {c.name}
              {c.batch ? (
                <>
                  , batch <span className="tabular whitespace-nowrap">{c.batch.number}</span>
                </>
              ) : null}
            </p>
            <dl className="mt-1 text-lead">
              <div className="flex gap-2">
                <dt className="sr-only">Purity</dt>
                <dd>
                  Purity <span className="tabular">{c.batch ? `${c.batch.purity.toFixed(2)}%` : "on file"}</span> by HPLC
                </dd>
              </div>
              {c.daltons ? (
                <div>
                  <dt className="sr-only">Identity</dt>
                  <dd>
                    Identity confirmed at <span className="tabular whitespace-nowrap">{c.daltons} Da</span>
                  </dd>
                </div>
              ) : null}
            </dl>
            <Chromatogram purity={c.batch?.purity ?? 99.5} seed={c.batch?.number ?? c.slug} className="mt-6 hidden min-h-32 flex-1 sm:flex lg:hidden" />
          </div>

          <Chromatogram
            purity={c.batch?.purity ?? 99.5}
            seed={c.batch?.number ?? c.slug}
            className="hidden lg:col-span-5 lg:flex lg:min-h-36"
            label={`HPLC trace for ${c.name}: main peak ${c.batch?.purity.toFixed(2) ?? ""}% of total area`}
          />

          <figure className="relative hidden aspect-[4/5] sm:col-span-5 sm:block lg:col-span-3 lg:aspect-auto lg:min-h-44" style={{ backgroundColor: c.plate }}>
            <Image src={c.image} alt={`${c.name} research vial`} fill sizes="(min-width: 1024px) 220px, 40vw" className="object-contain p-[10%]" />
            {c.batch?.size ? (
              <figcaption className="absolute top-2 left-2.5 text-small font-medium" style={{ color: c.plateInk }}>
                {c.batch.size}
              </figcaption>
            ) : null}
          </figure>
        </div>

        <Chromatogram purity={c.batch?.purity ?? 99.5} seed={c.batch?.number ?? c.slug} className="mt-6 aspect-[16/7] sm:hidden" />

        <div className="mt-6">
          <p className="text-small text-muted">
            Sequence, {c.identity}% identical to native GLP-1{c.halfLife ? `, half-life ${c.halfLife.replace(/^~/, "about ")}` : ""}. Changed residues are marked.
          </p>
          <SequenceStrip residues={c.residues} plate={c.plate} ink={c.plateInk} className="mt-2" />
        </div>
      </div>

      <footer className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between lg:mt-6">
        <p className="text-small text-muted sm:max-w-[30ch]">
          {c.batch ? `Tested ${c.batch.tested} by an accredited independent laboratory` : "Tested by an accredited independent laboratory"}
        </p>
        <ButtonLink href={`/shop/${c.slug}`} variant="accent" size="lg" className="w-full sm:w-auto">
          Shop {c.name}
        </ButtonLink>
        <Link href="/coa" className="link text-body font-medium sm:text-right">
          Find your batch
        </Link>
      </footer>
    </article>
  );
}
