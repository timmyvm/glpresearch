import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { db } from "@/lib/db";
import { plateInk, specimenImage } from "@/lib/plates";
import { ButtonLink } from "@/components/ui/button";
import { PageIntro, TitleLines } from "@/components/store/page-intro";

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
  { title: "Careful handling", text: "Stock is held frozen and shipped insulated, with a cold pack and a printed batch reference." },
  { title: "Your obligations", text: "Customers are expected to follow the laws and institutional rules that apply to their research." },
];

export default async function AboutPage() {
  const [products, batchCount, articleCount, avg] = await Promise.all([
    db.product.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" }, select: { slug: true, name: true, image: true, accentColor: true } }),
    db.batch.count({ where: { published: true } }),
    db.article.count({ where: { published: true } }),
    db.batch.aggregate({ where: { published: true }, _avg: { purity: true } }),
  ]);

  return (
    <>
      <PageIntro
        title={<TitleLines lines={["One family of", "peptides, done well"]} />}
        lead="GLP Research supplies only incretin-receptor agonists, so every compound gets the same sourcing, independent testing and documentation."
      />

      <section className="frame grid gap-10 pt-16 lg:grid-cols-12 lg:gap-x-[var(--gutter)] lg:pt-24" aria-labelledby="why-title">
        <h2 id="why-title" className="text-index font-medium lg:col-span-4" data-reveal>
          Why only one family
        </h2>
        <div className="lg:col-span-8">
          <div className="max-w-[62ch] space-y-4" data-reveal style={{ "--i": 1 } as React.CSSProperties}>
            <p>
              Most peptide suppliers list hundreds of unrelated compounds. We carry only incretin-receptor agonists: GLP-1,
              GIP and GLP-1, and glucagon co-agonists. That focus lets each one get the same depth of sourcing, testing and
              documentation.
            </p>
            <p>
              Each compound has a full monograph with its structure, receptor pharmacology, reported half-life and a
              referenced summary of the published studies. The research library goes further, explaining the biology and
              the clinical science in plain, accurate language.
            </p>
          </div>
          <dl className="mt-12 grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-4">
            {[
              [String(products.length), "compounds"],
              [String(batchCount), "published certificates"],
              [avg._avg.purity ? `${avg._avg.purity.toFixed(2)}%` : "≥99%", "average batch purity"],
              [String(articleCount), "library articles"],
            ].map(([value, label], i) => (
              <div key={label} data-reveal style={{ "--i": i } as React.CSSProperties}>
                <dt className="sr-only">{label}</dt>
                <dd className="tabular text-head">{value}</dd>
                <dd className="mt-2 text-muted">{label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="pt-24 md:pt-32" aria-labelledby="seven-title">
        <h2 id="seven-title" className="frame text-index font-medium" data-reveal>
          The seven compounds
        </h2>
        <ul className="frame mt-8 grid grid-cols-3 gap-1.5 sm:grid-cols-4 lg:grid-cols-7">
          {products.map((p, i) => (
            <li key={p.slug} data-reveal style={{ "--i": i % 4 } as React.CSSProperties}>
              <Link href={`/shop/${p.slug}`} className="group block">
                <div className="relative aspect-[3/4] overflow-clip" style={{ backgroundColor: p.accentColor, color: plateInk(p.accentColor) }}>
                  <Image src={specimenImage(p.image) ?? p.image} alt={`${p.name} research vial`} fill sizes="(min-width: 1024px) 14vw, 33vw" className="object-contain px-[14%] pt-[12%] pb-[5%] transition-transform duration-500 ease-[var(--ease-out)] group-hover:-translate-y-1" />
                </div>
                <p className="mt-2 font-medium group-hover:underline">{p.name}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-24 bg-field-grey py-20 md:mt-32 md:py-28" aria-labelledby="principles-title">
        <div className="frame grid gap-10 lg:grid-cols-12 lg:gap-x-[var(--gutter)]">
          <h2 id="principles-title" className="text-head lg:col-span-4" data-reveal>
            What we hold to
          </h2>
          <ul className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:col-span-8">
            {PRINCIPLES.map((p, i) => (
              <li key={p.title} data-reveal style={{ "--i": i % 2 } as React.CSSProperties}>
                <h3 className="text-lead font-medium">{p.title}</h3>
                <p className="mt-2 max-w-[40ch]">{p.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="frame grid items-center gap-10 pt-24 md:grid-cols-12 md:gap-x-[var(--gutter)] md:pt-32" aria-labelledby="stored-title">
        <div className="relative aspect-[4/3] overflow-clip md:col-span-7" data-reveal>
          <Image src="/images/freezer.webp" alt="Research vials in racks inside a laboratory freezer" fill sizes="(min-width: 768px) 58vw, 100vw" className="drift object-cover" />
        </div>
        <div className="md:col-span-5" data-reveal style={{ "--i": 1 } as React.CSSProperties}>
          <h2 id="stored-title" className="text-index font-medium">
            Kept frozen until it ships
          </h2>
          <p className="mt-5 max-w-[44ch]">
            Released stock is held sealed at −20 °C and out of the light until it is packed. Orders ship insulated with a
            cold pack and a printed batch reference, so the vial in your hand matches its published certificate.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-6">
            <ButtonLink href="/shop" variant="ink" size="lg">
              Browse Peptides
            </ButtonLink>
            <Link href="/coa" className="link">
              See the lab results
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
