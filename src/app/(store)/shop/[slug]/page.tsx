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
import { formatDate, siteUrl } from "@/lib/utils";
import { JsonLd } from "@/components/seo/json-ld";
import { Formula } from "@/components/store/formula";
import { Markdown } from "@/components/store/markdown";
import { ProductPurchase } from "@/components/store/product-purchase";
import { halfLifeText, receptorLongNames, receptorPhrase, sizePhrase } from "@/components/store/receptors";
import { SpecimenTile } from "@/components/store/specimen-tile";

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

/** One monograph section: heading in the left third, content in the right two-thirds. */
function Row({ id, title, children, className }: { id: string; title: string; children: React.ReactNode; className?: string }) {
  return (
    <section id={id} className={className} aria-labelledby={`${id}-title`}>
      <div className="frame grid gap-6 lg:grid-cols-12 lg:gap-x-[var(--gutter)]">
        <h2 id={`${id}-title`} className="text-index font-medium lg:col-span-4" data-reveal>
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

  const hl = parseHalfLife(product.halfLife);
  const halfLifeLine = hl.hours
    ? `${halfLifeText(product.halfLife)}, roughly ${nf.format(timesNative(hl.hours))} times as long as native GLP-1.`
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

      <div className="frame pt-6 pb-16 md:pb-24">
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
              <h1 className="lines text-head break-words" translate="no">
                <span className="line">
                  <span data-line>{product.name}</span>
                </span>
              </h1>
              <p className="mt-3 text-lead" data-load style={{ "--d": "260ms" } as React.CSSProperties}>
                {product.subtitle}
              </p>
              {/* Phones get the facts that decide a purchase first; the summary moves below the buy panel. */}
              {product.variants.length ? (
                <p className="tabular mt-3 max-w-[40ch] text-lead text-muted lg:hidden">
                  {`Lyophilised powder in ${sizePhrase(product.variants.map((v) => v.label))} vials, from ${formatMoney(Math.min(...product.variants.map((v) => v.price)))}.`}
                </p>
              ) : null}
              <p className="mt-5 hidden max-w-[56ch] lg:block">{product.shortDescription}</p>
            </div>
          }
          footer={
            <div className="mt-6 space-y-6">
              <p className="max-w-[48ch] text-lead lg:hidden">{product.shortDescription}</p>
              <dl className="grid grid-cols-2 gap-x-6 gap-y-4">
                {[
                  ["Acts on", receptorPhrase(product.receptorTargets)],
                  ["Half-life", halfLifeText(product.halfLife) ?? "Not published"],
                  ["Molecular weight", product.molecularWeight ?? "See certificate"],
                  ["Published batches", String(product.batches.length)],
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

      <div className="space-y-24 md:space-y-36">
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

        <Row id="specifications" title="Specifications">
          <dl>
            {specs
              .filter(([, v]) => v)
              .map(([label, value], i) => (
                <div key={label} className={`grid gap-1 px-4 py-3 sm:grid-cols-[14rem_1fr] sm:gap-6 ${i % 2 ? "" : "bg-surface"}`}>
                  <dt className="text-muted">{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
          </dl>
          {product.sequence ? (
            <div className="mt-8 bg-ink p-6 text-on-navy md:p-8">
              <h3 className="text-small text-on-navy-muted">Sequence</h3>
              <p className="tabular mt-3 text-lead break-all" translate="no">
                {product.sequence}
              </p>
            </div>
          ) : null}
        </Row>

        <section id="testing" className="bg-field-mint py-20 md:py-28" aria-labelledby="testing-title">
          <div className="frame grid gap-6 lg:grid-cols-12 lg:gap-x-[var(--gutter)]">
            <div className="lg:col-span-4" data-reveal>
              <h2 id="testing-title" className="text-index font-medium">
                Lab testing
              </h2>
              <p className="mt-4 max-w-[36ch]">
                Match the batch number on your vial to its result, or search every batch on the{" "}
                <Link href="/coa" className="link font-medium">
                  lab results page
                </Link>
                .
              </p>
            </div>
            <div className="lg:col-span-8" data-reveal style={{ "--i": 1 } as React.CSSProperties}>
              {product.batches.length ? (
                <div className="overflow-x-auto bg-white">
                  <table className="tabular w-full text-left text-small sm:text-body">
                    <caption className="sr-only">Published batch results for {product.name}</caption>
                    <thead className="text-small text-muted">
                      <tr>
                        <th scope="col" className="px-3 pt-4 pb-3 sm:px-5 font-medium">Batch</th>
                        <th scope="col" className="hidden px-3 pt-4 pb-3 sm:px-5 font-medium sm:table-cell">Size</th>
                        <th scope="col" className="px-3 pt-4 pb-3 sm:px-5 text-right font-medium">Purity</th>
                        <th scope="col" className="px-3 pt-4 pb-3 sm:px-5 font-medium">Tested</th>
                        <th scope="col" className="px-3 pt-4 pb-3 sm:px-5"><span className="sr-only">Certificate</span></th>
                      </tr>
                    </thead>
                    <tbody>
                      {product.batches.map((b) => (
                        <tr key={b.id} className="border-t border-ink/10">{/* taste-skill-ignore: real table rows */}
                          <td className="px-3 py-3.5 sm:px-5 font-medium" translate="no">{b.batchNumber}</td>
                          <td className="hidden px-3 py-3.5 sm:px-5 sm:table-cell">{b.variantLabel ?? "All sizes"}</td>
                          <td className="px-3 py-3.5 sm:px-5 text-right">{b.purity.toFixed(2)}%</td>
                          <td className="px-3 py-3.5 sm:px-5">{formatDate(b.testedAt)}</td>
                          <td className="px-3 py-3.5 sm:px-5 text-right">
                            <Link href={`/coa?batch=${encodeURIComponent(b.batchNumber)}`} className="link">
                              View<span className="sr-only"> certificate for {b.batchNumber}</span>
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="bg-white p-5">Batch results are published here before a batch is released.</p>
              )}
            </div>
          </div>
        </section>

        <Row id="storage" title="Storage and handling">
          <dl className="grid gap-5 sm:grid-cols-3">
            {[
              ["Lyophilised", product.storage],
              ["On arrival", "Move to −20 °C, or 2–8 °C short term, as soon as practical. Keep in the carton, out of the light."],
              ["Before opening", "Let the sealed vial reach room temperature so no condensation forms on the powder."],
            ].map(([title, text]) => (
              <div key={title}>
                <dt className="font-medium">{title}</dt>
                <dd className="mt-2 text-muted">{text}</dd>
              </div>
            ))}
          </dl>
          <Link href="/research/storing-lyophilized-peptides" className="link mt-8 inline-block font-medium">
            The full storage and handling guide
          </Link>
        </Row>

        {references.length ? (
          <Row id="references" title="References">
            <ol className="max-w-[68ch] list-decimal space-y-3 pl-5 marker:text-muted">
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
            <h2 id="related-title" className="text-index font-medium">
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
