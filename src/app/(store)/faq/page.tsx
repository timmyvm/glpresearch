import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/json-ld";
import Image from "next/image";
import Link from "next/link";
import { cn, slugify } from "@/lib/utils";
import { PageIntro, TitleLines } from "@/components/store/page-intro";
import { FAQS } from "./faqs";

export const metadata: Metadata = {
  title: "Frequently asked questions",
  description: "Answers about product quality, batch testing, storage, payment and shipping for GLP Research peptides.",
  alternates: { canonical: "/faq" },
};

const PICTURES: Record<string, { src: string; alt: string; position?: string }> = {
  "Products & quality": { src: "/images/hplc-analysis.webp", alt: "An analyst holds a vial beside an HPLC chromatogram with one sharp peak" },
  "Storage & handling": { src: "/images/freezer.webp", alt: "Research vials in racks inside a laboratory freezer" },
  "Ordering & payment": { src: "/images/hero-vials.webp", alt: "Five labelled GLP Research vials on a laboratory bench", position: "object-[75%_50%]" },
  Shipping: { src: "/images/packaging.webp", alt: "An insulated shipping box with three vials, a cold pack and a certificate" },
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

      <div className="space-y-20 pt-16 md:space-y-28 md:pt-24">
        {FAQS.map((g, gi) => (
          <section key={g.title} id={slugify(g.title)} className="frame grid gap-6 lg:grid-cols-12 lg:gap-x-[var(--gutter)]" aria-labelledby={`${slugify(g.title)}-title`}>
            <div className="lg:col-span-4">
              <div className="lg:sticky lg:top-24">
                <h2 id={`${slugify(g.title)}-title`} className="text-index font-medium" data-reveal>
                  {g.title}
                </h2>
                {PICTURES[g.title] ? (
                  <div className="relative mt-6 aspect-[16/9] overflow-clip bg-surface lg:aspect-[4/3]" data-reveal style={{ "--i": 1 } as React.CSSProperties}>
                    <Image
                      src={PICTURES[g.title].src}
                      alt={PICTURES[g.title].alt}
                      fill
                      sizes="(min-width: 1024px) 30vw, 100vw"
                      className={cn("object-cover", gi % 2 === 0 && "drift", PICTURES[g.title].position)}
                    />
                  </div>
                ) : null}
              </div>
            </div>
            <div className="space-y-2 lg:col-span-8">
              {g.items.map((f, i) => (
                <details key={f.q} className="group bg-surface open:bg-field-grey" open={gi === 0 && i === 0} data-reveal style={{ "--i": i % 4 } as React.CSSProperties}>
                  <summary className="flex cursor-pointer list-none items-start justify-between gap-6 p-5 text-lead font-medium md:px-6 [&::-webkit-details-marker]:hidden">
                    <span>{f.q}</span>
                    <span className="mt-1 shrink-0 text-body font-normal text-muted group-open:hidden" aria-hidden="true">
                      Open
                    </span>
                    <span className="mt-1 hidden shrink-0 text-body font-normal group-open:inline" aria-hidden="true">
                      Close
                    </span>
                  </summary>
                  <p className="max-w-[62ch] px-5 pb-6 md:px-6">{f.a}</p>
                </details>
              ))}
            </div>
          </section>
        ))}
      </div>

      <section className="frame pt-28 md:pt-40" aria-labelledby="ask-title">
        <div className="grid gap-6 bg-field-navy p-8 text-on-navy md:grid-cols-12 md:gap-x-[var(--gutter)] md:p-12">
          <h2 id="ask-title" className="text-index font-medium md:col-span-6">
            Still have a question?
          </h2>
          <div className="md:col-span-6">
            <p className="max-w-[44ch] text-on-navy-muted">
              Ask about a batch, an order or institutional supply. We don&apos;t answer questions about human use or dosing.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-6">
              <Link href="/contact" className="press inline-flex h-14 items-center bg-accent px-7 font-medium text-accent-ink hover:bg-accent-strong">
                Contact Us
              </Link>
              <Link href="/research" className="link">
                Browse the research library
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
