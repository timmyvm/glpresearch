"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { formatMoney } from "@/lib/money";
import { cn } from "@/lib/utils";

export type ShowcaseClass = {
  key: string;
  label: string;
  text: string;
  compounds: { slug: string; name: string; sizes: string; from: number; plate: string; image: string }[];
};

/**
 * The catalogue as one data sheet with three tabs, one per receptor class. The plate on the left
 * stands that class's vials side by side; the rows give every compound with its sizes and price.
 */
export function ClassShowcase({ classes }: { classes: ShowcaseClass[] }) {
  const [active, setActive] = useState(0);
  const c = classes[active];

  return (
    <section className="frame grid gap-8 py-28 md:min-h-[88svh] md:grid-cols-2 md:items-center md:gap-x-[var(--gutter)] md:py-40" aria-labelledby="classes-title">
      <div className="relative aspect-square overflow-clip bg-field-paper" data-reveal>
        <div key={c.key} className="reprint absolute inset-0 flex items-end justify-center gap-[2%] px-[8%] pb-[9%]">
          {c.compounds.map((x) => (
            <div key={x.slug} className="relative h-[82%] w-[31%] max-w-[15rem]">
              <Image src={x.image} alt={`${x.name} research vial`} fill sizes="(min-width: 768px) 16vw, 30vw" className="object-contain object-bottom" />
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-10 md:h-full md:justify-between md:py-[4%]" data-reveal style={{ "--i": 1 } as React.CSSProperties}>
        <div>
          <h2 id="classes-title" className="text-index font-semibold">
            Seven compounds, three classes
          </h2>
          <div role="tablist" aria-label="Receptor class" className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
            {classes.map((x, i) => (
              <button
                key={x.key}
                type="button"
                role="tab"
                id={`class-tab-${x.key}`}
                aria-selected={i === active}
                aria-controls="class-panel"
                onClick={() => setActive(i)}
                className={cn(
                  "link text-lead font-medium",
                  i === active ? "text-ink decoration-ink" : "text-muted decoration-transparent hover:text-ink",
                )}
              >
                {x.label}
              </button>
            ))}
          </div>
        </div>

        <div id="class-panel" role="tabpanel" aria-labelledby={`class-tab-${c.key}`} key={c.key} className="reprint">
          <p className="max-w-[34ch] text-lead">{c.text}</p>
          <ul className="mt-8 space-y-3">
            {c.compounds.map((x) => (
              <li key={x.slug}>
                <Link href={`/shop/${x.slug}`} className="group flex items-baseline gap-3 text-body">
                  <span className="size-3 shrink-0 translate-y-0.5" style={{ backgroundColor: x.plate }} aria-hidden="true" />
                  <span className="font-medium group-hover:underline">{x.name}</span>
                  <span className="leader min-w-6 flex-1" aria-hidden="true" />
                  <span className="text-muted">{x.sizes}</span>
                  <span className="tabular w-28 text-right">from {formatMoney(x.from)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Link href={`/shop?category=${c.key}`} className="press flex h-[72px] items-center bg-ink px-5 text-body font-medium text-white hover:bg-ink-800 max-sm:h-[60px] max-sm:px-4">
            {c.compounds.length === 1 ? `Shop ${c.compounds[0].name}` : `Shop These ${c.compounds.length === 3 ? "Three" : c.compounds.length}`}
          </Link>
          <Link href="/compare" className="press flex h-[72px] items-center bg-surface-2 px-5 text-body font-medium text-ink hover:bg-field-paper max-sm:h-[60px] max-sm:px-4">
            Compare All Seven
          </Link>
        </div>
      </div>
    </section>
  );
}
