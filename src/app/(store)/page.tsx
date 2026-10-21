import type { Metadata } from "next";
import { db } from "@/lib/db";
import { formatMoney } from "@/lib/money";
import { organizationLd, websiteLd } from "@/lib/seo";
import { getSettings } from "@/lib/settings";
import { JsonLd } from "@/components/seo/json-ld";
import { parseHalfLife, timesNative } from "@/lib/half-life";
import { specimenImage } from "@/lib/plates";
import { splitList } from "@/lib/utils";
import { ButtonLink } from "@/components/ui/button";
import { HeroLineup, type LineupItem } from "@/components/home/hero-lineup";
import { PriceList } from "@/components/home/price-list";
import { HalfLifeDial } from "@/components/home/half-life-dial";
import { CoaCard } from "@/components/home/coa-card";
import { LibraryTiles } from "@/components/home/library-tiles";
import { ProcessTiles } from "@/components/home/process-tiles";
import { FaqCards } from "@/components/home/faq-cards";
import { FAQS } from "./faq/faqs";

export const metadata: Metadata = { alternates: { canonical: "/" } };

const RECEPTOR_WORDS: Record<string, string> = { "GLP-1R": "GLP-1", GIPR: "GIP", GCGR: "glucagon" };

function receptorPhrase(targets: string) {
  const words = splitList(targets).map((t) => RECEPTOR_WORDS[t] ?? t);
  if (words.length === 1) return `${words[0]} receptor agonist`;
  return `${words.slice(0, -1).join(", ")} and ${words.at(-1)} receptor agonist`;
}

function listSizes(labels: string[]) {
  const mg = labels.map((l) => l.replace(/\s*mg$/i, ""));
  return mg.length > 1 ? `${mg.slice(0, -1).join(", ")} and ${mg.at(-1)} mg` : labels[0] ?? "";
}

const FAQ_TOPICS: { topic: string; q: string }[] = [
  { topic: "Research use", q: "Are your products for human use?" },
  { topic: "Testing", q: "How is purity verified?" },
  { topic: "Storage", q: "How should lyophilized peptides be stored?" },
  { topic: "Payment", q: "What payment methods do you accept?" },
  { topic: "Shipping", q: "How fast do you ship?" },
  { topic: "Bulk orders", q: "Do you offer bulk or institutional pricing?" },
];

export default async function HomePage() {
  const [products, batches, batchStats, articles, settings] = await Promise.all([
    db.product.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
      select: {
        slug: true,
        name: true,
        subtitle: true,
        image: true,
        accentColor: true,
        receptorTargets: true,
        halfLife: true,
        variants: { where: { active: true }, orderBy: { sortOrder: "asc" }, select: { label: true, price: true } },
        batches: { where: { published: true }, orderBy: { testedAt: "desc" }, take: 1, select: { testedAt: true } },
      },
    }),
    db.batch.findMany({
      where: { published: true, product: { active: true } },
      orderBy: { testedAt: "desc" },
      select: { batchNumber: true, purity: true },
    }),
    db.batch.aggregate({ where: { published: true }, _avg: { purity: true }, _count: true }),
    db.article.findMany({
      where: { published: true, NOT: { slug: "glossary" } },
      orderBy: [{ featured: "desc" }, { publishedAt: "desc" }],
      take: 6,
      select: { slug: true, title: true, category: true, readingMinutes: true, coverImage: true },
    }),
    getSettings(),
  ]);

  const fromPrice = (p: (typeof products)[number]) => Math.min(...p.variants.map((v) => v.price));

  const lineup: LineupItem[] = products.map((p) => ({
    slug: p.slug,
    name: p.name,
    plate: p.accentColor,
    image: specimenImage(p.image) ?? p.image,
    fact: `${p.subtitle}, from ${formatMoney(fromPrice(p))}`,
  }));

  const faqCards = FAQ_TOPICS.flatMap(({ topic, q }) => {
    const match = FAQS.flatMap((g) => g.items).find((f) => f.q === q);
    return match ? [{ topic, q: match.q, a: match.a }] : [];
  });

  return (
    <>
      <JsonLd data={[organizationLd({ name: settings.storeName, email: settings.supportEmail }), websiteLd(settings.storeName)]} />
      <HeroLineup
        items={lineup}
        title={
          <h1 id="hero-title" className="lines text-display">
            <span className="line">
              <span data-line style={{ "--i": 0 } as React.CSSProperties}>
                GLP-1 peptides,
              </span>
            </span>
            <span className="line">
              <span data-line style={{ "--i": 1 } as React.CSSProperties}>
                batch tested
              </span>
            </span>
          </h1>
        }
        aside={
          <>
            <p className="max-w-[40ch] text-body md:text-lead" data-load style={{ "--d": "380ms" } as React.CSSProperties}>
              Seven research compounds that act on the <span className="whitespace-nowrap">GLP-1</span> receptor, from
              semaglutide to retatrutide, each batch verified by HPLC and mass spec.
            </p>
            <div className="mt-6" data-load style={{ "--d": "460ms" } as React.CSSProperties}>
              <ButtonLink href="/shop" variant="ink" size="lg" className="w-full md:w-auto">
                Shop Peptides
              </ButtonLink>
            </div>
          </>
        }
      />

      <PriceList
        vial={specimenImage(products[0]?.image) ?? "/images/specimens/semaglutide-10mg.webp"}
        rows={products.map((p) => ({
          slug: p.slug,
          name: p.name,
          note: receptorPhrase(p.receptorTargets),
          sizes: listSizes(p.variants.map((v) => v.label)),
          from: fromPrice(p),
          latestBatch: p.batches[0]?.testedAt ?? null,
        }))}
      />

      <HalfLifeDial
        items={products.map((p) => {
          const hl = parseHalfLife(p.halfLife);
          return {
            slug: p.slug,
            name: p.name,
            plate: p.accentColor,
            image: specimenImage(p.image) ?? p.image,
            halfLife: p.halfLife,
            hours: hl.hours,
            variable: hl.variable,
            times: hl.hours ? timesNative(hl.hours) : null,
          };
        })}
      />

      <CoaCard
        batches={batches}
        count={batchStats._count}
        average={batchStats._avg.purity ? batchStats._avg.purity.toFixed(2) : "99.5"}
      />

      <LibraryTiles tiles={articles} />

      <ProcessTiles />

      <FaqCards cards={faqCards} />
    </>
  );
}
