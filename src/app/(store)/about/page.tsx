import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { db } from "@/lib/db";
import { ARCHIVE } from "@/content/credits";
import { plateInk, specimenImage } from "@/lib/plates";
import { ButtonLink } from "@/components/ui/button";
import { PageIntro, TitleLines } from "@/components/store/page-intro";
import { Slip, SlipRow } from "@/components/store/paper";

export const metadata: Metadata = {
  title: "About us",
  description: "GLP Research supplies only incretin-class research peptides, each batch independently tested and documented.",
  alternates: { canonical: "/about" },
};

const PRINCIPLES = [
  { title: "Independent testing", text: "Batches are tested by third-party analytical laboratories, never only by the manufacturer." },
  { title: "Published results", text: "Every released batch is searchable by its number. A batch that misses specification is not sold." },
  { title: "Referenced science", text: "Product pages and articles cite peer-reviewed literature and are updated as new data appear." },
  { title: "Research use only", text: "We supply laboratories. We make no therapeutic claims and refuse orders that suggest human use." },
  { title: "Careful handling", text: "Stock is held frozen and shipped insulated, with a cold pack and a slip of batch numbers." },
  { title: "Your obligations", text: "Customers are expected to follow the laws and institutional rules that apply to their research." },
];

export default async function AboutPage() {
  const [products, batchCount, articleCount, avg] = await Promise.all([
    db.product.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" }, select: { slug: true, name: true, image: true, accentColor: true } }),
    db.batch.count({ where: { published: true } }),
    db.article.count({ where: { published: true } }),
    db.batch.aggregate({ where: { published: true }, _avg: { purity: true } }),
  ]);
  const credits = Object.values(ARCHIVE);

  return (
    <>
      <PageIntro
        title={<TitleLines lines={["One family,", "done well"]} />}
        lead="GLP Research supplies only incretin-receptor agonists, so every compound gets the same sourcing, independent testing and documentation."
      />

      <section className="frame grid gap-12 pt-16 lg:grid-cols-12 lg:gap-x-[var(--gutter)] lg:pt-24" aria-labelledby="why-title">
        <div className="lg:col-span-6">
          <h2 id="why-title" className="text-head font-semibold" data-reveal>
            Why only one family
          </h2>
          <div className="mt-8 max-w-[60ch] space-y-4 text-body md:text-lead" data-reveal style={{ "--i": 1 } as React.CSSProperties}>
            <p>
              Most peptide suppliers list hundreds of unrelated compounds. We carry only incretin-receptor agonists: GLP-1,
              dual GIP and GLP-1, and glucagon co-agonists. That focus lets each one get the same depth of sourcing,
              testing and documentation.
            </p>
            <p>
              Each compound has a full monograph with its structure, receptor pharmacology, reported half-life and a
              referenced summary of the published studies. The research library goes further, explaining the biology and
              the clinical science in plain, accurate language.
            </p>
          </div>
        </div>
        <Slip className="w-full max-w-[30rem] self-start px-6 pt-7 lg:col-span-5 lg:col-start-8 lg:px-8 lg:pt-8" data-reveal style={{ "--i": 2 } as React.CSSProperties}>
          <h3 className="text-lead font-semibold">The register, today</h3>
          <dl className="mt-4 space-y-2 text-body">
            {[
              ["Compounds", String(products.length)],
              ["Published certificates", String(batchCount)],
              ["Average batch purity", avg._avg.purity ? `${avg._avg.purity.toFixed(2)}%` : "≥99%"],
              ["Library articles", String(articleCount)],
              ["Release specification", "≥99.0% by HPLC"],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="sr-only">{label}</dt>
                <dd>
                  <SlipRow label={label} value={value} />
                </dd>
              </div>
            ))}
          </dl>
          <p className="-mx-6 mt-7 flex h-11 items-center justify-between gap-3 bg-ink px-6 text-body font-medium text-white lg:-mx-8 lg:px-8">
            <span>Every batch tested before sale</span>
            <Link href="/coa" className="link whitespace-nowrap">
              Lab results
            </Link>
          </p>
        </Slip>
      </section>

      <section className="pt-28 md:pt-40" aria-labelledby="seven-title">
        <div className="frame flex flex-col gap-3 md:flex-row md:items-baseline md:justify-between" data-reveal>
          <h2 id="seven-title" className="text-head font-semibold">
            The seven compounds
          </h2>
          <p className="max-w-[44ch] text-body">Each vial carries its compound&apos;s colour on the label, and so does everything about it on this site.</p>
        </div>
        <ul className="frame mt-10 grid grid-cols-3 gap-1.5 sm:grid-cols-4 lg:grid-cols-7">
          {products.map((p, i) => (
            <li key={p.slug} data-reveal style={{ "--i": i % 4 } as React.CSSProperties}>
              <Link href={`/shop/${p.slug}`} className="group block">
                <span className="relative block aspect-[3/4] overflow-clip" style={{ backgroundColor: p.accentColor, color: plateInk(p.accentColor) }}>
                  <Image src={specimenImage(p.image) ?? p.image} alt={`${p.name} research vial`} fill sizes="(min-width: 1024px) 14vw, 33vw" className="object-contain px-[14%] pt-[12%] pb-[5%] transition-transform duration-500 ease-[var(--ease-out)] group-hover:-translate-y-1" />
                </span>
                <span className="mt-2 block font-medium group-hover:underline">{p.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-28 bg-field-paper py-24 md:mt-40 md:py-32" aria-labelledby="principles-title">
        <div className="frame grid gap-12 lg:grid-cols-12 lg:gap-x-[var(--gutter)]">
          <h2 id="principles-title" className="text-head font-semibold lg:col-span-4" data-reveal>
            What we hold to
          </h2>
          <ul className="grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:col-span-8">
            {PRINCIPLES.map((p, i) => (
              <li key={p.title} data-reveal style={{ "--i": i % 2 } as React.CSSProperties}>
                <h3 className="text-lead font-semibold">{p.title}</h3>
                <p className="mt-2 max-w-[40ch] text-body">{p.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="frame grid items-center gap-10 pt-28 md:grid-cols-12 md:gap-x-[var(--gutter)] md:pt-40" aria-labelledby="stored-title">
        <figure className="md:col-span-7" data-reveal>
          <div className="relative aspect-[4/3] overflow-clip bg-surface">
            <Image src="/images/lab/freezer-rack.webp" alt="Racks of capped vials on frosted shelves inside a laboratory freezer" fill sizes="(min-width: 768px) 58vw, 100vw" className="object-cover" />
          </div>
        </figure>
        <div className="md:col-span-5" data-reveal style={{ "--i": 1 } as React.CSSProperties}>
          <h2 id="stored-title" className="text-head font-semibold">
            Kept frozen until it ships
          </h2>
          <p className="mt-6 max-w-[44ch] text-body md:text-lead">
            Released stock is held sealed at −20 °C and out of the light until it is packed. Orders ship insulated with a cold
            pack and a slip listing each vial&apos;s batch number, so the vial in your hand matches its published certificate.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
            <ButtonLink href="/shop" variant="accent" size="lg">
              Browse Peptides
            </ButtonLink>
            <Link href="/coa" className="link text-body font-medium">
              See the lab results
            </Link>
          </div>
        </div>
      </section>

      <section className="frame pt-28 md:pt-40" aria-labelledby="pictures-title">
        <div className="grid gap-8 md:grid-cols-12 md:gap-x-[var(--gutter)]">
          <div className="md:col-span-4" data-reveal>
            <h2 id="pictures-title" className="text-head font-semibold">
              Pictures
            </h2>
            <p className="mt-5 max-w-[36ch] text-body">
              The lab photography and the product vials on this site were generated for GLP Research. The archival plates
              come from open collections, credited here.
            </p>
          </div>
          <ul className="grid gap-x-3 gap-y-8 sm:grid-cols-2 md:col-span-8 lg:grid-cols-3">
            {credits.map((c, i) => (
              <li key={c.src} data-reveal style={{ "--i": i % 3 } as React.CSSProperties}>
                <a href={c.page} target="_blank" rel="noopener noreferrer" className="group block">
                  <span className="relative block aspect-[4/3] overflow-clip bg-surface-2">
                    <Image src={c.src} alt={c.title} fill sizes="(min-width: 1024px) 20vw, (min-width: 640px) 33vw, 100vw" className="object-cover" />
                  </span>
                  <span className="mt-3 block text-body font-medium group-hover:underline">{c.title}</span>
                  <span className="mt-0.5 block text-small text-muted">
                    {c.by}, {c.licence}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
