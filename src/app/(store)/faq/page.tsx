import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/store/page-hero";
import { ButtonLink } from "@/components/ui/button";
import { slugify } from "@/lib/utils";
import { FAQS } from "./faqs";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Answers about product quality, testing, storage, payment and shipping for GLP Research peptides.",
};

export default function FaqPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.flatMap((g) => g.items).map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <PageHero eyebrow="Help centre" title="Frequently asked questions" description="Everything about quality, testing, storage, ordering and shipping." />
      <div className="container-page grid gap-12 py-16 lg:grid-cols-[220px_1fr]">
        <nav className="hidden lg:block" aria-label="FAQ sections">
          <ul className="sticky top-24 space-y-1">
            {FAQS.map((g) => (
              <li key={g.title}>
                <a href={`#${slugify(g.title)}`} className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-ink-50 hover:text-ink-900">
                  {g.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="space-y-14">
          {FAQS.map((g) => (
            <section key={g.title} id={slugify(g.title)} className="scroll-mt-24">
              <h2 className="text-xl font-semibold tracking-tight">{g.title}</h2>
              <div className="mt-5 divide-y divide-slate-200 rounded-2xl border border-slate-200">
                {g.items.map((f) => (
                  <details key={f.q} className="group px-6 py-5">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-ink-900">
                      {f.q}
                      <span className="grid size-6 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-500 transition-transform group-open:rotate-45">+</span>
                    </summary>
                    <p className="mt-3 text-sm leading-relaxed text-slate-600">{f.a}</p>
                  </details>
                ))}
              </div>
            </section>
          ))}
          <div className="rounded-3xl bg-ink-950 p-8 text-white">
            <h2 className="text-xl font-semibold">Still have a question?</h2>
            <p className="mt-2 text-sm text-ink-200">Our team replies within one business day.</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <ButtonLink href="/contact" variant="accent">Contact us</ButtonLink>
              <Link href="/research" className="inline-flex items-center px-2 text-sm font-semibold text-mint-300 hover:text-mint-200">
                Browse the research library →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
