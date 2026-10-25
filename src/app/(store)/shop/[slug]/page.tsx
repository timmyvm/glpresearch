import type { Metadata } from "next";
import Link from "next/link";
import { cache } from "react";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { formatMoney } from "@/lib/money";
import { categoryLabel } from "@/lib/orders";
import { parseHalfLife, timesNative } from "@/lib/half-life";
import { ORG_ID, breadcrumbLd, organizationLd } from "@/lib/seo";
import { getSettings } from "@/lib/settings";
import { plateInk } from "@/lib/plates";
import { NATIVE_GLP1, identityWithNative, parseSequence } from "@/lib/sequence";
import { formatDate, siteUrl } from "@/lib/utils";
import { JsonLd } from "@/components/seo/json-ld";
import Image from "next/image";
import { Chromatogram } from "@/components/store/chromatogram";
import { Formula } from "@/components/store/formula";
import { Markdown } from "@/components/store/markdown";
import { ProductPurchase } from "@/components/store/product-purchase";
import { halfLifeText, receptorLongNames, receptorPhrase, sizePhrase } from "@/components/store/receptors";
import { SpecimenTile } from "@/components/store/specimen-tile";
import { Slip, SlipRow } from "@/components/store/paper";
import { ReceptorMarks } from "@/components/store/receptor-marks";
import { SequenceStrip } from "@/components/store/sequence-strip";

type Params = { params: Promise<{ slug: string }> };

// Shared by generateMetadata and the page, so each render queries once.
const getProduct = cache(async (slug: string) =>
  db.product.findFirst({
    where: { slug, active: true },
    include: {
      variants: { where: { active: true }, orderBy: { sortOrder: "asc" } },
      batches: { where: { published: true }, orderBy: { testedAt: "desc" } },
    },
  }),
);

// Every active compound is built ahead of time; new ones are built on their first visit.
export async function generateStaticParams() {
  const products = await db.product.findMany({ where: { active: true }, select: { slug: true } });
  return products.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const product = await getProduct((await params).slug);
  if (!product) return {};
  return {
    title: `${product.name}: ${product.subtitle}`,
    description: product.shortDescription,
    alternates: { canonical: `/shop/${product.slug}` },
  };
}

const nf = new Intl.NumberFormat("en-AU");

/** One monograph section, set like a journal page: heading in the left third, text in the rest. */
function Row({ id, title, children, className }: { id: string; title: string; children: React.ReactNode; className?: string }) {
  return (
    <section id={id} className={className} aria-labelledby={`${id}-title`}>
      <div className="frame grid gap-6 lg:grid-cols-12 lg:gap-x-[var(--gutter)]">
        <h2 id={`${id}-title`} className="text-index font-semibold lg:col-span-4" data-reveal>
          {title}
        </h2>
        <div className="lg:col-span-8" data-reveal style={{ "--i": 1 } as React.CSSProperties}>
          {children}
        </div>
      </div>
    </section>
  );
}

export default async function ProductPage({ params }: Params) {
  const product = await getProduct((await params).slug);
  if (!product) notFound();

  const [related, settings] = await Promise.all([
    db.product.findMany({
      where: { active: true, id: { not: product.id } },
      orderBy: { sortOrder: "asc" },
      select: {
        slug: true,
        name: true,
        subtitle: true,
        image: true,
        accentColor: true,
        regulatoryStatus: true,
        category: true,
        variants: { where: { active: true }, select: { price: true, stock: true, label: true } },
      },
    }),
    getSettings(),
  ]);
  const relatedPicks = [...related.filter((p) => p.category === product.category), ...related.filter((p) => p.category !== product.category)].slice(0, 3);

  let references: { label: string; url: string }[] = [];
  try {
    references = product.references ? JSON.parse(product.references) : [];
  } catch {}

  const ink = plateInk(product.accentColor);
  const residues = parseSequence(product.sequence);
  const identity = identityWithNative(residues);
  const native = parseSequence(NATIVE_GLP1);
  const changed = residues.filter((r) => r.status === "changed").length;
  const sideChains = residues.map((r, i) => ({ ...r, at: i + 1 })).filter((r) => r.mod);
  const mw = product.molecularWeight ? Number.parseFloat(product.molecularWeight) : NaN;
  const daltons = Number.isFinite(mw) ? mw.toFixed(1) : null;
  const [latest, ...earlier] = product.batches;

  const hl = parseHalfLife(product.halfLife);
  const times = hl.hours ? timesNative(hl.hours) : null;
  const halfLifeLine = hl.hours
    ? `${halfLifeText(product.halfLife)}, roughly ${nf.format(times!)} times as long as native GLP-1.`
    : (halfLifeText(product.halfLife) ?? "Not established in published sources.");

  const specs: [string, React.ReactNode][] = [
    ["Research codes", product.aliases],
    ["Class", categoryLabel(product.category)],
    ["Receptor targets", receptorLongNames(product.receptorTargets)],
    ["Molecular formula", product.molecularFormula ? <Formula value={product.molecularFormula} /> : null],
    ["Molecular weight", product.molecularWeight],
    ["CAS number", product.casNumber ? <span className="tabular">{product.casNumber}</span> : null],
    ["Length", product.aminoAcidCount ? `${product.aminoAcidCount} amino acids` : null],
    ["Reported half-life", halfLifeLine],
    ["Originator", product.developer],
    ["Development status", product.regulatoryStatus],
    ["Form", product.form],
    ["Purity specification", product.purity],
    ["Container", "3 mL borosilicate glass vial, butyl stopper, flip-off crimp seal"],
  ];

  const url = siteUrl(`/shop/${product.slug}`);
  const productLd = {
    "@type": "Product",
    "@id": `${url}#product`,
    name: `${product.name} (research use only)`,
    description: product.shortDescription,
    url,
    image: siteUrl(product.image),
    sku: product.variants[0]?.sku,
    category: categoryLabel(product.category),
    brand: { "@type": "Brand", name: "GLP Research" },
    offers: product.variants.map((v) => ({
      "@type": "Offer",
      name: `${product.name} ${v.label}`,
      sku: v.sku,
      url,
      price: (v.price / 100).toFixed(2),
      priceCurrency: "AUD",
      itemCondition: "https://schema.org/NewCondition",
      availability: v.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      seller: { "@id": ORG_ID },
    })),
  };
  const crumbs = breadcrumbLd([
    { name: "Home", path: "/" },
    { name: "Catalogue", path: "/shop" },
    { name: product.name, path: `/shop/${product.slug}` },
  ]);

  return (
    <>
      <JsonLd data={[productLd, crumbs, organizationLd({ name: settings.storeName, email: settings.supportEmail })]} />

      <div className="frame pt-6 pb-20 md:pb-28">
        <nav aria-label="Breadcrumb" className="mb-6 text-small text-muted">
          <Link href="/shop" className="link">
            Catalogue
          </Link>{" "}
          <span aria-hidden="true">/</span> <span className="text-ink">{product.name}</span>
        </nav>
        <ProductPurchase
          product={{ slug: product.slug, name: product.name, image: product.image, accentColor: product.accentColor }}
          variants={product.variants.map((v) => ({
            id: v.id,
            label: v.label,
            sku: v.sku,
            price: v.price,
            compareAtPrice: v.compareAtPrice,
            stock: v.stock,
            image: v.image,
          }))}
          header={
            <div>
              <span className="block h-2.5 w-24" style={{ backgroundColor: product.accentColor }} aria-hidden="true" />
              <h1 className="lines mt-5 text-[clamp(2.75rem,6.3vw,5.75rem)] leading-[0.9] tracking-[-0.045em]" translate="no">
                <span className="line">
                  <span data-line>{product.name}</span>
                </span>
              </h1>
              <p className="mt-4 text-lead font-medium" data-load style={{ "--d": "260ms" } as React.CSSProperties}>
                {product.subtitle}
              </p>
              <ReceptorMarks targets={product.receptorTargets} className="mt-4" />
              {/* Phones get the facts that decide a purchase first; the summary moves below the order slip. */}
              {product.variants.length ? (
                <p className="tabular mt-4 max-w-[40ch] text-body text-muted lg:hidden">
                  {`Lyophilised powder in ${sizePhrase(product.variants.map((v) => v.label))} vials, from ${formatMoney(Math.min(...product.variants.map((v) => v.price)))}.`}
                </p>
              ) : null}
              <p className="mt-5 hidden max-w-[56ch] text-body lg:block">{product.shortDescription}</p>
            </div>
          }
          footer={
            <div className="mt-8 space-y-6">
              <p className="max-w-[48ch] text-lead lg:hidden">{product.shortDescription}</p>
              <dl className="grid grid-cols-2 gap-x-6 gap-y-5">
                {[
                  ["Acts on", receptorPhrase(product.receptorTargets)],
                  ["Half-life", halfLifeText(product.halfLife) ?? "Not published"],
                  ["Molecular weight", product.molecularWeight ?? "See certificate"],
                  ["Latest purity", latest ? `${latest.purity.toFixed(2)}% by HPLC` : "Before release"],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-small text-muted">{label}</dt>
                    <dd className="tabular mt-0.5 font-medium">{value}</dd>
                  </div>
                ))}
              </dl>
              <p className="text-small text-muted">
                For laboratory research use only. Not for human or veterinary use, and not a medicine. Information here
                summarises published literature.
              </p>
            </div>
          }
        />
      </div>

      <section id="testing" className="relative overflow-clip bg-field-paper pt-20 pb-24 md:pt-28 md:pb-32" aria-labelledby="testing-title">
        <div className="frame grid gap-12 lg:grid-cols-12 lg:gap-x-[var(--gutter)]">
          <div className="lg:col-span-4" data-reveal>
            <h2 id="testing-title" className="text-head font-semibold">
              Tested, batch by batch
            </h2>
            <p className="mt-6 max-w-[38ch] text-lead">
              An independent laboratory tests every batch of {product.name} before it is sold. Match the number on your vial to its certificate.
            </p>
            {earlier.length ? (
              <Slip className="mt-10 px-5 pt-5 md:px-6" aria-label={`Earlier ${product.name} batches`}>
                <h3 className="text-body font-semibold">Earlier batches</h3>
                <ul className="mt-2 space-y-1.5 text-body">
                  {earlier.map((b) => (
                    <li key={b.id}>
                      <Link href={`/coa?batch=${encodeURIComponent(b.batchNumber)}`} className="block hover:underline">
                        <SlipRow label={<span className="tabular" translate="no">{b.batchNumber}</span>} value={`${b.purity.toFixed(2)}%, ${formatDate(b.testedAt, { month: "short", year: "numeric" })}`} />
                      </Link>
                    </li>
                  ))}
                </ul>
              </Slip>
            ) : null}
            <Link href="/coa" className="link mt-8 inline-block text-body font-medium">
              Every published batch
            </Link>
          </div>

          {latest ? (
            <article className="bg-white p-6 md:rotate-[0.8deg] md:p-10 lg:col-span-7 lg:col-start-6" aria-labelledby="latest-title" data-reveal style={{ "--i": 1 } as React.CSSProperties}>
              <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
                <p className="text-small text-muted">GLP Research, certificate of analysis</p>
                <p className="text-small text-muted">Current batch</p>
              </div>
              <div className="mt-5 grid gap-6 sm:grid-cols-[1fr_auto] sm:items-end">
                <div>
                  <h3 id="latest-title" className="tabular text-index font-semibold" translate="no">
                    {latest.batchNumber}
                  </h3>
                  <p className="mt-2 flex items-center gap-2.5 text-lead">
                    <span className="size-3.5 shrink-0" style={{ backgroundColor: product.accentColor }} aria-hidden="true" />
                    {product.name}
                    {latest.variantLabel ? `, ${latest.variantLabel}` : ""}
                  </p>
                </div>
                <p className="sm:text-right">
                  <span className="tabular block text-display font-semibold">{latest.purity.toFixed(2)}%</span>
                  <span className="text-body text-muted">purity by HPLC</span>
                </p>
              </div>
              <Chromatogram purity={latest.purity} seed={latest.batchNumber} className="mt-8 aspect-[16/6]" label={`HPLC trace for batch ${latest.batchNumber}`} />
              <div className="mt-8 space-y-1.5 text-body">
                <SlipRow label="Identity by ESI-MS" value={daltons ? `Confirmed, ${daltons} Da` : latest.massSpec ? "Confirmed" : "Not recorded"} />
                <SlipRow label="Method" value={latest.testMethod} />
                <SlipRow label="Tested" value={formatDate(latest.testedAt, { day: "numeric", month: "long", year: "numeric" })} />
                <SlipRow label="Specification" value={latest.purity >= 99 ? "Meets ≥99.0%" : "See notes"} />
              </div>
              <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
                <p className="max-w-[40ch] text-small text-muted">{latest.laboratory}</p>
                <Link href={`/coa?batch=${encodeURIComponent(latest.batchNumber)}`} className="link text-body font-medium">
                  The full certificate
                </Link>
              </div>
            </article>
          ) : (
            <p className="bg-white p-6 text-lead lg:col-span-7 lg:col-start-6">Batch results are published here before a batch is released.</p>
          )}
        </div>
      </section>

      {residues.length ? (
        <section id="sequence" className="frame pt-24 md:pt-36" aria-labelledby="sequence-title">
          <div className="grid gap-8 lg:grid-cols-12 lg:gap-x-[var(--gutter)]">
            <div className="lg:col-span-4" data-reveal>
              <h2 id="sequence-title" className="text-head font-semibold">
                <span className="tabular">{identity}%</span> native GLP-1
              </h2>
              <p className="mt-6 max-w-[38ch] text-lead">
                {product.name} is written from the same hormone. {changed ? `${changed} of its ${residues.length} residues differ from native GLP-1 at the same position` : "Its residues match native GLP-1"}
                {sideChains.length ? ", and a side chain lets it bind albumin in the blood." : "."}
              </p>
              {times ? (
                <p className="mt-6 text-body">
                  Half-life {halfLifeText(product.halfLife)?.toLowerCase()}, about <span className="tabular font-medium">{nf.format(times)}</span> times native GLP-1&apos;s two minutes.
                </p>
              ) : null}
            </div>
            <div className="space-y-8 lg:col-span-8" data-reveal style={{ "--i": 1 } as React.CSSProperties}>
              <div>
                <p className="text-small text-muted">Native GLP-1 (7–37), {native.length} residues</p>
                <SequenceStrip residues={native} plate={product.accentColor} ink={ink} className="mt-2 [&_li]:bg-surface" />
              </div>
              <div>
                <p className="text-small text-muted">
                  {product.name}, {residues.length} residues. Marked: changed. Underlined: carries a side chain. Grey: beyond native GLP-1.
                </p>
                <SequenceStrip residues={residues} plate={product.accentColor} ink={ink} className="mt-2 [&_li.bg-white]:bg-surface" />
              </div>
              {sideChains.length ? (
                <ul className="space-y-1 text-body">
                  {sideChains.map((r) => (
                    <li key={r.at}>
                      {/* GLP-1 numbering starts at His 7, so the strip's residue 20 is the literature's lysine 26. */}
                      {r.code === "K" ? "Lysine" : r.code} <span className="tabular">{r.at + 6}</span> carries {r.mod?.replace(/(C\d+)(diacid)/i, "$1 $2")}
                    </li>
                  ))}
                </ul>
              ) : null}
              {product.sequence ? (
                <p className="tabular max-w-[80ch] text-small text-muted break-words" translate="no">
                  {product.sequence}
                </p>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}

      <div className="space-y-24 pt-24 md:space-y-36 md:pt-36">
        <Row id="overview" title={`About ${product.name}`}>
          <Markdown className="max-w-[68ch]">{product.description}</Markdown>
        </Row>

        {product.mechanism ? (
          <Row id="mechanism" title="Mechanism of action">
            <Markdown className="max-w-[68ch]">{product.mechanism}</Markdown>
          </Row>
        ) : null}

        {product.research ? (
          <Row id="research" title="Key published research">
            <p className="mb-6 max-w-[62ch] text-muted">
              Peer-reviewed studies of regulated pharmaceutical products under trial conditions, summarised for research
              context.
            </p>
            <Markdown className="max-w-[68ch]">{product.research}</Markdown>
          </Row>
        ) : null}

        <section id="specifications" className="frame" aria-labelledby="specifications-title">
          <div className="bg-paper px-5 pt-8 pb-10 md:px-12 md:pt-12 md:pb-14">
            <div className="flex flex-col gap-2 md:flex-row md:items-baseline md:justify-between" data-reveal>
              <h2 id="specifications-title" className="text-index font-semibold">
                Data sheet
              </h2>
              <p className="text-small text-muted">
                {product.name}, compiled from published sources and the batch certificates
              </p>
            </div>
            <dl className="mt-6 grid md:grid-cols-2 md:gap-x-12 [&>div]:border-t-4 [&>div]:border-dotted [&>div]:border-ink/20">
              {specs
                .filter(([, v]) => v)
                .map(([label, value]) => (
                  <div key={label} className="grid gap-1 py-3.5 sm:grid-cols-[11rem_1fr] sm:gap-5">
                    <dt className="text-small text-muted sm:pt-0.5">{label}</dt>
                    <dd className="text-body">{value}</dd>
                  </div>
                ))}
            </dl>
          </div>
        </section>

        <section id="storage" className="frame grid gap-10 md:grid-cols-12 md:gap-x-[var(--gutter)]" aria-labelledby="storage-title">
          <div className="relative aspect-[4/3] md:col-span-6" data-reveal>
            <Image src="/images/lab/freezer-rack.webp" alt="Racks of capped vials on frosted shelves inside a laboratory freezer" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
          </div>
          <div className="md:col-span-5 md:col-start-8" data-reveal style={{ "--i": 1 } as React.CSSProperties}>
            <h2 id="storage-title" className="text-index font-semibold">
              Storage and handling
            </h2>
            <dl className="mt-6 space-y-5">
              {[
                ["Lyophilised", product.storage],
                ["On arrival", "Move to −20 °C, or 2–8 °C short term, as soon as practical. Keep in the carton, out of the light."],
                ["Before opening", "Let the sealed vial reach room temperature so no condensation forms on the powder."],
              ].map(([title, text]) => (
                <div key={title}>
                  <dt className="text-body font-semibold">{title}</dt>
                  <dd className="mt-1 text-body">{text}</dd>
                </div>
              ))}
            </dl>
            <Link href="/research/storing-lyophilized-peptides" className="link mt-8 inline-block font-medium">
              The full storage and handling guide
            </Link>
          </div>
        </section>

        {references.length ? (
          <Row id="references" title="References">
            <ol className="tabular max-w-[68ch] list-decimal space-y-3 pl-6 marker:text-muted">
              {references.map((r, i) => (
                <li key={r.url + i} className="pl-1">
                  <a href={r.url} target="_blank" rel="noopener noreferrer" className="link">
                    {r.label}
                  </a>
                </li>
              ))}
            </ol>
          </Row>
        ) : null}

        <section className="frame" aria-labelledby="related-title">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 id="related-title" className="text-index font-semibold">
              Related compounds
            </h2>
            <Link href="/compare" className="link">
              Compare all seven side by side
            </Link>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-x-2 gap-y-10 md:grid-cols-4 md:gap-x-3">
            {relatedPicks.map((p, i) => (
              <SpecimenTile key={p.slug} product={p} wide={i === 0} />
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
