import Image from "next/image";
import Link from "next/link";
import { Markdown, extractHeadings } from "./markdown";

const RELATED: { href: string; title: string; text: string; image: string; alt: string }[] = [
  { href: "/shipping", title: "Shipping and returns", text: "Dispatch times, cold-chain packing and what happens if a vial arrives damaged.", image: "/images/lab/packing.webp", alt: "Vials packed in foam with a cold pack and a packing slip" },
  { href: "/terms", title: "Terms of sale", text: "The conditions that apply to every order.", image: "/images/lab/sealing.webp", alt: "Gloved hands crimping an aluminium seal onto a vial" },
  { href: "/disclaimer", title: "Research use policy", text: "Who may buy, and what the compounds may and may not be used for.", image: "/images/lab/checking-vial.webp", alt: "A gloved hand holding a vial up to window light" },
  { href: "/coa", title: "Lab results", text: "Purity and identity results for every published batch.", image: "/images/lab/coa-report.webp", alt: "A gloved hand pointing a pen at the peak on a printed HPLC report" },
  { href: "/privacy", title: "Privacy policy", text: "What we collect, why, and the choices you have.", image: "/images/lab/notebook.webp", alt: "A lab notebook beside a rack of vials and a printed chromatogram" },
];

/**
 * Policy pages, printed as a policy document: a paper title block with the date it took effect,
 * then the text in a reading column with its sections beside it, and the other policies after.
 */
export function LegalPage({ title, lead, updated, content, path }: { title: string; lead?: string; updated: string; content: string; path: string }) {
  const headings = extractHeadings(content);
  const related = RELATED.filter((r) => r.href !== path).slice(0, 4);
  return (
    <>
      <header className="bg-paper">
        <div className="frame grid gap-6 pt-12 pb-14 md:grid-cols-12 md:items-end md:gap-x-[var(--gutter)] md:pt-20 md:pb-20">
          <h1 className="text-display font-semibold md:col-span-7">{title}</h1>
          <div className="md:col-span-5" data-load style={{ "--d": "260ms" } as React.CSSProperties}>
            {lead ? <p className="max-w-[44ch] text-lead">{lead}</p> : null}
            <p className="mt-4 text-body text-muted">Last updated {updated}.</p>
          </div>
        </div>
      </header>

      <div className="frame grid gap-10 pt-14 md:grid-cols-12 md:gap-x-[var(--gutter)] md:pt-20">
        <nav className="md:col-span-3" aria-label="Sections">
          {headings.length > 1 ? (
            <div className="md:sticky md:top-24">
              <p className="text-body font-semibold">Sections</p>
              <ul className="mt-4 space-y-2.5">
                {headings.map((h) => (
                  <li key={h.id}>
                    <a href={`#${h.id}`} className="link text-body text-muted decoration-transparent hover:text-ink hover:decoration-ink">
                      {h.text}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </nav>
        <div className="md:col-span-8 md:col-start-5">
          <Markdown className="max-w-[68ch]">{content}</Markdown>
          <p className="mt-14 max-w-[62ch] bg-paper p-6 text-body">
            Questions about this policy?{" "}
            <Link href="/contact" className="link font-medium">
              Write to us
            </Link>{" "}
            and we&apos;ll reply within one business day.
          </p>
        </div>
      </div>

      <section className="frame pt-28 md:pt-40" aria-labelledby="related-title">
        <h2 id="related-title" className="text-head font-semibold" data-reveal>
          The other policies
        </h2>
        <ul className="mt-10 grid gap-x-3 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {related.map((r, i) => (
            <li key={r.href} data-reveal style={{ "--i": i } as React.CSSProperties}>
              <Link href={r.href} className="group block">
                <span className="relative block aspect-[4/3] overflow-clip bg-surface">
                  <Image src={r.image} alt={r.alt} fill sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw" className="object-cover transition-transform duration-700 ease-[var(--ease-out)] group-hover:scale-[1.02]" />
                </span>
                <span className="mt-3 block text-lead font-medium group-hover:underline group-hover:decoration-[0.07em] group-hover:underline-offset-[0.2em]">{r.title}</span>
                <span className="mt-1 block text-body text-muted">{r.text}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
