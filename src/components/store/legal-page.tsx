import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Markdown, extractHeadings } from "./markdown";
import { PageIntro, TitleLines } from "./page-intro";

const RELATED: { href: string; title: string; text: string; image: string; alt: string; position?: string }[] = [
  { href: "/shipping", title: "Shipping and returns", text: "Dispatch times, cold-chain packing and what happens if a vial arrives damaged.", image: "/images/packaging.webp", alt: "An insulated shipping box with three vials, a cold pack and a certificate" },
  { href: "/terms", title: "Terms of sale", text: "The conditions that apply to every order.", image: "/images/hero-vials.webp", alt: "Five labelled GLP Research vials on a laboratory bench", position: "object-[75%_50%]" },
  { href: "/disclaimer", title: "Research use policy", text: "Who may buy, and what the compounds may and may not be used for.", image: "/images/lab-bench.webp", alt: "An analyst pipettes a sample at a laboratory bench" },
  { href: "/coa", title: "Lab results", text: "Purity and identity results for every published batch.", image: "/images/hplc-analysis.webp", alt: "An analyst holds a vial beside an HPLC chromatogram" },
  { href: "/faq", title: "Questions and answers", text: "Storage, ordering and shipping questions, answered.", image: "/images/freezer.webp", alt: "Research vials in racks inside a laboratory freezer" },
];

/** Policy pages: the title, then the text in a reading column with its contents beside it. */
export function LegalPage({ title, lead, updated, content, path }: { title: string; lead?: string; updated: string; content: string; path: string }) {
  const headings = extractHeadings(content);
  const related = RELATED.filter((r) => r.href !== path).slice(0, 4);
  return (
    <>
      <PageIntro title={<TitleLines lines={[title]} />} lead={lead ?? `Last updated ${updated}.`} />
      <div className="frame grid gap-10 pt-12 md:grid-cols-12 md:gap-x-[var(--gutter)] md:pt-16">
        <nav className="md:col-span-3" aria-label="Sections">
          {headings.length > 1 ? (
            <ul className="space-y-2 md:sticky md:top-24" data-load style={{ "--d": "400ms" } as React.CSSProperties}>
              {headings.map((h) => (
                <li key={h.id}>
                  <a href={`#${h.id}`} className="link text-small text-muted decoration-transparent hover:text-ink hover:decoration-ink">
                    {h.text}
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </nav>
        <div className="md:col-span-8 md:col-start-5">
          {lead ? <p className="mb-8 text-small text-muted">Last updated {updated}.</p> : null}
          <Markdown className="max-w-[68ch]">{content}</Markdown>
        </div>
      </div>

      <section className="frame pt-28 md:pt-40" aria-labelledby="related-title">
        <h2 id="related-title" className="text-index font-medium" data-reveal>
          Related pages
        </h2>
        <ul className="mt-8 grid gap-x-3 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {related.map((r, i) => (
            <li key={r.href} data-reveal style={{ "--i": i } as React.CSSProperties}>
              <Link href={r.href} className="group block">
                <span className="relative block aspect-[4/3] overflow-clip bg-surface">
                  <Image src={r.image} alt={r.alt} fill sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw" className={cn("object-cover transition-transform duration-700 ease-[var(--ease-out)] group-hover:scale-[1.02]", r.position)} />
                </span>
                <span className="mt-3 block text-lead font-medium group-hover:underline group-hover:decoration-[0.07em] group-hover:underline-offset-[0.2em]">{r.title}</span>
                <span className="mt-1 block text-muted">{r.text}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
