import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/json-ld";
import Image from "next/image";
import Link from "next/link";
import { slugify } from "@/lib/utils";
import { ButtonLink } from "@/components/ui/button";
import { PageIntro, TitleLines } from "@/components/store/page-intro";
import { Slip, SlipRow } from "@/components/store/paper";
import { FAQS } from "./faqs";

export const metadata: Metadata = {
  title: "Frequently asked questions",
  description: "Answers about product quality, batch testing, storage, payment and shipping for GLP Research peptides.",
  alternates: { canonical: "/faq" },
};

const PICTURES: Record<string, { src: string; alt: string }> = {
  "Products & quality": { src: "/images/lab/coa-report.webp", alt: "A gloved hand pointing a pen at the peak on a printed HPLC report" },
  "Storage & handling": { src: "/images/lab/cryo-box.webp", alt: "Gloved hands lifting a box of vials out of a frosted freezer" },
  "Ordering & payment": { src: "/images/lab/notebook.webp", alt: "A lab notebook beside a rack of vials and a printed chromatogram" },
  Shipping: { src: "/images/lab/packing.webp", alt: "Vials packed in foam with a cold pack and a packing slip" },
};

export default function FaqPage() {
  const jsonLd = {
    "@type": "FAQPage",
    mainEntity: FAQS.flatMap((g) => g.items).map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <PageIntro
        title={<TitleLines lines={["Questions and", "answers"]} />}
        lead="Quality, testing, storage, ordering and shipping. If yours isn't here, our team replies within one business day."
      >
        <nav aria-label="Topics" className="mt-8 flex flex-wrap gap-x-6 gap-y-2">
          {FAQS.map((g) => (
            <a key={g.title} href={`#${slugify(g.title)}`} className="link text-muted decoration-transparent hover:text-ink hover:decoration-ink">
              {g.title}
            </a>
          ))}
        </nav>
      </PageIntro>

      <div className="space-y-24 pt-16 md:space-y-36 md:pt-24">
        {FAQS.map((g, gi) => (
          <section key={g.title} id={slugify(g.title)} className="frame grid gap-8 lg:grid-cols-12 lg:gap-x-[var(--gutter)]" aria-labelledby={`${slugify(g.title)}-title`}>
            <div className="lg:col-span-4">
              <div className="lg:sticky lg:top-24">
                <h2 id={`${slugify(g.title)}-title`} className="text-head font-semibold" data-reveal>
                  {g.title}
                </h2>
                <p className="mt-3 text-body text-muted" data-reveal style={{ "--i": 1 } as React.CSSProperties}>
                  {g.items.length} questions
                </p>
                {PICTURES[g.title] ? (
                  <div className="relative mt-6 aspect-[16/9] overflow-clip bg-surface lg:aspect-[4/3]" data-reveal style={{ "--i": 2 } as React.CSSProperties}>
                    <Image src={PICTURES[g.title].src} alt={PICTURES[g.title].alt} fill sizes="(min-width: 1024px) 30vw, 100vw" className="object-cover" />
                  </div>
                ) : null}
              </div>
            </div>
            <div className="space-y-1.5 lg:col-span-7 lg:col-start-6">
              {g.items.map((f, i) => (
                <details key={f.q} className="group bg-surface transition-colors duration-200 open:bg-paper" open={gi === 0 && i === 0} data-reveal style={{ "--i": i % 4 } as React.CSSProperties}>
                  <summary className="flex cursor-pointer list-none items-start justify-between gap-6 p-5 text-lead font-medium md:px-7 md:py-6 [&::-webkit-details-marker]:hidden">
                    <span>{f.q}</span>
                    <span className="chevron mt-[0.45em] shrink-0" aria-hidden="true" />
                  </summary>
                  <p className="max-w-[62ch] px-5 pb-6 text-body md:px-7 md:pb-7">{f.a}</p>
                </details>
              ))}
            </div>
          </section>
        ))}
      </div>

      <section className="flush-footer mt-28 bg-field-black py-24 text-white md:mt-40 md:py-32" aria-labelledby="ask-title">
        <div className="frame grid gap-12 md:grid-cols-12 md:gap-x-[var(--gutter)]">
          <div className="md:col-span-6">
            <h2 id="ask-title" className="text-head font-semibold">
              Still have a question?
            </h2>
            <p className="mt-6 max-w-[40ch] text-lead text-on-black-muted">
              Ask about a batch, an order or institutional supply. We don&apos;t answer questions about human use or dosing.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
              <ButtonLink href="/contact" variant="accent" size="lg">
                Contact Us
              </ButtonLink>
              <Link href="/research" className="link text-body font-medium">
                Browse the research library
              </Link>
            </div>
          </div>
          <Slip className="w-full max-w-[28rem] px-6 pt-7 md:col-span-5 md:col-start-8 md:px-8">
            <h3 className="text-body font-semibold">When you write to us</h3>
            <div className="mt-3 space-y-1.5 text-body">
              <SlipRow label="Reply" value="1 business day" />
              <SlipRow label="Hours" value="9 am to 5 pm" />
              <SlipRow label="Time zone" value="Sydney" />
              <SlipRow label="Order questions" value="quote the number" />
            </div>
          </Slip>
        </div>
      </section>
    </>
  );
}
