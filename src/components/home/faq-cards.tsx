"use client";

import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/utils";

export type FaqCard = { topic: string; q: string; a: string };

const FIELDS = ["bg-field-grey", "bg-field-mint", "bg-field-orange"];

/**
 * "Tabbed index cards": questions filed like cards in a drawer. Each card overlaps the one
 * above; its tab steps right. One card is open at a time; the first is open on load.
 */
export function FaqCards({ cards }: { cards: FaqCard[] }) {
  const [open, setOpen] = useState(0);

  return (
    <section className="frame pt-32 md:pt-48" aria-labelledby="faq-title">
      <div className="md:mx-auto md:w-2/3">
        <h2 id="faq-title" className="text-head">
          Questions
        </h2>
        <ol className="mt-10 [--tab-step:3rem] [--tab-w:7.5rem] md:[--tab-step:9.375rem] md:[--tab-w:12.5rem]">
          {cards.map((c, i) => {
            const isOpen = open === i;
            return (
              <li key={c.q} className={cn("relative", i > 0 && "-mt-6 md:-mt-8")} style={{ zIndex: i }}>
                <div
                  className={cn("relative", FIELDS[i % FIELDS.length])}
                  style={{
                    clipPath: `polygon(0 2.5rem, var(--tab-x) 2.5rem, var(--tab-x) 0, calc(var(--tab-x) + var(--tab-w)) 0, calc(var(--tab-x) + var(--tab-w)) 2.5rem, 100% 2.5rem, 100% 100%, 0 100%)`,
                    ["--tab-x" as string]: `min(calc(${i} * var(--tab-step)), calc(100% - var(--tab-w)))`,
                    
                  }}
                >
                  <p className="absolute top-0 flex h-10 items-center px-4 text-small font-medium" style={{ left: "var(--tab-x)" }}>
                    {c.topic}
                  </p>
                  <h3 className="pt-10">
                    <button
                      type="button"
                      onClick={() => setOpen(isOpen ? -1 : i)}
                      aria-expanded={isOpen}
                      aria-controls={`faq-a-${i}`}
                      className="block w-full px-5 pt-3 pb-8 text-left text-lead font-medium md:px-8 md:pb-10"
                    >
                      {c.q}
                    </button>
                  </h3>
                  <div id={`faq-a-${i}`} hidden={!isOpen} className="px-5 pb-12 md:px-8">
                    <p className="max-w-[50ch]">{c.a}</p>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
        <Link href="/faq" className="link mt-8 inline-block font-medium">
          Every question, by topic
        </Link>
      </div>
    </section>
  );
}
