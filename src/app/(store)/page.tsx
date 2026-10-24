import type { Metadata } from "next";
import { db } from "@/lib/db";
import { PRODUCT_CATEGORIES, type ProductCategory } from "@/lib/orders";
import { plateInk, specimenImage } from "@/lib/plates";
import { organizationLd, websiteLd } from "@/lib/seo";
import { identityWithNative, parseSequence } from "@/lib/sequence";
import { getSettings } from "@/lib/settings";
import { formatDate } from "@/lib/utils";
import { JsonLd } from "@/components/seo/json-ld";
import { splitTitle } from "@/components/store/article-title";
import { CertificateHero } from "@/components/home/certificate-hero";
import type { CertCompound } from "@/components/home/certificate";
import { ClassShowcase, type ShowcaseClass } from "@/components/home/class-showcase";
import { ScienceSheets } from "@/components/home/science-sheets";
import { BatchRegister } from "@/components/home/batch-register";
import { ResearchShelf, type Spine } from "@/components/home/research-shelf";
import { DispatchSlip } from "@/components/home/dispatch-slip";
import { FaqSplit } from "@/components/home/faq-split";
import { FAQS } from "./faq/faqs";

export const metadata: Metadata = { alternates: { canonical: "/" } };

const CLASS_TEXT: Record<ProductCategory, string> = {
  GLP1: "Act on the GLP-1 receptor alone. Semaglutide, liraglutide and exenatide are the reference points for every newer compound.",
  DUAL: "Add a second receptor to GLP-1: GIP for tirzepatide, glucagon for survodutide and mazdutide.",
  TRIPLE: "One peptide that acts on the GIP, GLP-1 and glucagon receptors. Retatrutide is the furthest along in trials.",
};

const HOME_FAQS = [
  "Are your products for human use?",
  "How is purity verified?",
  "Where do I find the certificate of analysis for my vial?",
  "How should lyophilized peptides be stored?",
  "What payment methods do you accept?",
  "Do you offer bulk or institutional pricing?",
];

function listSizes(labels: string[]) {
  const mg = labels.map((l) => l.replace(/\s*mg$/i, ""));
  return mg.length > 1 ? `${mg.slice(0, -1).join(", ")} and ${mg.at(-1)} mg` : (labels[0] ?? "");
}

/** "(STEP 1)" from a reference label, with its year; discovery papers are left to the monographs. */
function trialSpine(label: string, url: string, product: string): Spine | null {
  const name = label.match(/\(([^)]+)\)\s*$/)?.[1];
  const year = label.match(/\b(19|20)\d{2}\b/)?.[0];
  if (!name || /discovery|isolation/i.test(name)) return null;
  const title = /^phase/i.test(name) ? `${product} ${name.replace(/^Phase/, "phase")}` : name;
  return { title: year ? `${title}, ${year}` : title, kind: "Trial", href: url, external: true };
}

export default async function HomePage() {
  const [products, batches, batchStats, articles, settings] = await Promise.all([
    db.product.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
      select: {
        slug: true,
        name: true,
        category: true,
        image: true,
        accentColor: true,
        halfLife: true,
        molecularWeight: true,
        sequence: true,
        references: true,
        variants: { where: { active: true }, orderBy: { sortOrder: "asc" }, select: { label: true, price: true } },
        batches: { where: { published: true }, orderBy: { testedAt: "desc" }, take: 1, select: { batchNumber: true, purity: true, testedAt: true, variantLabel: true } },
      },
    }),
    db.batch.findMany({
      where: { published: true, product: { active: true } },
      orderBy: { testedAt: "desc" },
      select: { batchNumber: true, purity: true },
    }),
    db.batch.aggregate({ where: { published: true }, _avg: { purity: true }, _count: true }),
    db.article.findMany({
      where: { published: true },
      orderBy: [{ featured: "desc" }, { publishedAt: "desc" }],
      select: { slug: true, title: true, category: true },
    }),
    getSettings(),
  ]);

  const fromPrice = (p: (typeof products)[number]) => Math.min(...p.variants.map((v) => v.price));

  const compounds: CertCompound[] = products.map((p) => {
    const residues = parseSequence(p.sequence);
    const batch = p.batches[0];
    const mw = p.molecularWeight ? Number.parseFloat(p.molecularWeight) : NaN;
    return {
      slug: p.slug,
      name: p.name,
      plate: p.accentColor,
      plateInk: plateInk(p.accentColor),
      image: specimenImage(p.image) ?? p.image,
      halfLife: p.halfLife,
      daltons: Number.isFinite(mw) ? mw.toFixed(1) : null,
      residues,
      identity: identityWithNative(residues),
      batch: batch
        ? { number: batch.batchNumber, purity: batch.purity, tested: formatDate(batch.testedAt, { day: "numeric", month: "short", year: "numeric" }), size: batch.variantLabel }
        : null,
    };
  });

  const classes: ShowcaseClass[] = (Object.keys(PRODUCT_CATEGORIES) as ProductCategory[]).map((key) => ({
    key,
    label: PRODUCT_CATEGORIES[key].label,
    text: CLASS_TEXT[key],
    compounds: products
      .filter((p) => p.category === key)
      .map((p) => ({
        slug: p.slug,
        name: p.name,
        sizes: listSizes(p.variants.map((v) => v.label)),
        from: fromPrice(p),
        plate: p.accentColor,
        image: specimenImage(p.image) ?? p.image,
      })),
  }));

  const spines: Spine[] = [
    ...articles.map((a) => ({ title: splitTitle(a.title).head, kind: a.category === "Reference" ? "Reference" : "Article", href: `/research/${a.slug}` })),
    ...products.map((p) => ({ title: p.name, kind: "Monograph", href: `/shop/${p.slug}`, plate: p.accentColor, plateInk: plateInk(p.accentColor) })),
    ...products.flatMap((p) => {
      let refs: { label: string; url: string }[] = [];
      try {
        refs = p.references ? JSON.parse(p.references) : [];
      } catch {}
      return refs
        .map((r) => trialSpine(r.label, r.url, p.name))
        .filter((s): s is Spine => !!s)
        .slice(0, 2);
    }),
  ];

  const faqs = HOME_FAQS.flatMap((q) => FAQS.flatMap((g) => g.items).filter((f) => f.q === q));

  return (
    <>
      <JsonLd data={[organizationLd({ name: settings.storeName, email: settings.supportEmail }), websiteLd(settings.storeName)]} />
      <CertificateHero compounds={compounds} />
      <ClassShowcase classes={classes} />
      <ScienceSheets />
      <BatchRegister
        batches={batches}
        count={batchStats._count}
        average={batchStats._avg.purity ? batchStats._avg.purity.toFixed(2) : "99.5"}
      />
      <ResearchShelf spines={spines} articleCount={articles.length} />
      <DispatchSlip />
      <FaqSplit items={faqs} />
    </>
  );
}
