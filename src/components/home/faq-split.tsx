import Image from "next/image";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";

export type FaqItem = { q: string; a: string };

const FACTS = [
  ["Dispatch", "Weekdays, for orders paid before 1 pm Sydney time"],
  ["Payment", "Bank transfer, PayID or crypto"],
  ["Storage", "Lyophilised, kept at −20 °C"],
];

/** The questions people ask before a first order, beside a tall photograph of the bench. */
export function FaqSplit({ items }: { items: FaqItem[] }) {
  return (
    <section className="flush-footer overflow-clip bg-paper" aria-labelledby="faq-title">
      <div className="frame grid gap-12 pb-28 md:grid-cols-12 md:gap-x-[var(--gutter)] md:pb-40">
        <div className="relative order-first md:order-last md:col-span-6 md:col-start-7">
          <div className="relative aspect-[4/5] md:aspect-[3/4]">
            <Image src="/images/lab/checking-vial.webp" alt="A gloved hand holding a vial up to window light to check the freeze-dried cake" fill sizes="(min-width: 768px) 48vw, 100vw" className="object-cover" />
          </div>
          <div className="absolute right-[-4%] bottom-[-8%] w-[38%] md:right-auto md:bottom-[-10%] md:left-[-40px] md:w-1/3">
            <div className="relative aspect-square border-[6px] border-paper">
              <Image src="/images/lab/notebook.webp" alt="A lab notebook beside a rack of vials and a printed chromatogram" fill sizes="(min-width: 768px) 16vw, 38vw" className="object-cover" />
            </div>
          </div>
        </div>

        <div className="pt-6 md:col-span-5 md:pt-32" data-reveal>
          <h2 id="faq-title" className="text-head font-semibold">
            Before you order
          </h2>
          <dl className="mt-8 space-y-2 text-body">
            {FACTS.map(([k, v]) => (
              <div key={k} className="flex flex-wrap gap-x-2">
                <dt className="font-semibold">{k}:</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-10 space-y-7">
            {items.map((f) => (
              <details key={f.q} className="faq group">
                <summary className="flex cursor-pointer list-none items-start justify-between gap-6 text-lead font-medium [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <span className="chevron mt-[0.45em] shrink-0" aria-hidden="true" />
                </summary>
                <p className="mt-3 max-w-[56ch] text-body text-muted">{f.a}</p>
              </details>
            ))}
          </div>

          <div className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-4">
            <ButtonLink href="/faq" variant="ink" size="lg" className="max-sm:w-full">
              All Questions
            </ButtonLink>
            <Link href="/contact" className="link text-body font-medium">
              Ask us something else
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
