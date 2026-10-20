import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BadgeCheck, ChevronRight, ExternalLink, FileCheck2, FlaskConical, Snowflake, Truck } from "lucide-react";
import { db } from "@/lib/db";
import { categoryLabel } from "@/lib/orders";
import { formatDate, splitList } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Formula } from "@/components/store/formula";
import { Markdown } from "@/components/store/markdown";
import { ProductCard } from "@/components/store/product-card";
import { ProductPurchase } from "@/components/store/product-purchase";
import { ReceptorChips } from "@/components/store/receptor-chips";

type Params = { params: Promise<{ slug: string }> };

async function getProduct(slug: string) {
  return db.product.findFirst({
    where: { slug, active: true },
    include: {
      variants: { where: { active: true }, orderBy: { sortOrder: "asc" } },
      batches: { where: { published: true }, orderBy: { testedAt: "desc" } },
    },
  });
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const product = await getProduct((await params).slug);
  if (!product) return {};
  return {
    title: `${product.name} — ${product.subtitle}`,
    description: product.shortDescription,
    openGraph: { images: [{ url: product.image }] },
  };
}

const RECEPTOR_NAMES: Record<string, string> = {
  "GLP-1R": "Glucagon-like peptide-1 receptor",
  GIPR: "Glucose-dependent insulinotropic polypeptide receptor",
  GCGR: "Glucagon receptor",
};

export default async function ProductPage({ params }: Params) {
  const product = await getProduct((await params).slug);
  if (!product) notFound();

  const related = await db.product.findMany({
    where: { active: true, id: { not: product.id } },
    orderBy: [{ sortOrder: "asc" }],
    take: 3,
    select: {
      slug: true,
      name: true,
      subtitle: true,
      image: true,
      accentColor: true,
      receptorTargets: true,
      regulatoryStatus: true,
      category: true,
      variants: { where: { active: true }, select: { price: true, stock: true, label: true } },
    },
  });
  related.sort((a, b) => Number(b.category === product.category) - Number(a.category === product.category));

  let references: { label: string; url: string }[] = [];
  try {
    references = product.references ? JSON.parse(product.references) : [];
  } catch {}

  const specs: [string, React.ReactNode][] = [
    ["Compound", product.name],
    ["Research codes", product.aliases],
    ["Class", categoryLabel(product.category)],
    ["Receptor targets", splitList(product.receptorTargets).map((r) => RECEPTOR_NAMES[r] ?? r).join("; ")],
    ["Molecular formula", product.molecularFormula ? <Formula value={product.molecularFormula} /> : null],
    ["Molecular weight", product.molecularWeight],
    ["CAS number", product.casNumber ? <span className="font-mono">{product.casNumber}</span> : null],
    ["Length", product.aminoAcidCount ? `${product.aminoAcidCount} amino acids` : null],
    ["Reported half-life", product.halfLife],
    ["Originator", product.developer],
    ["Development status", product.regulatoryStatus],
    ["Form", product.form],
    ["Purity specification", product.purity],
    ["Container", "3 mL borosilicate glass vial, butyl stopper, flip-off crimp seal"],
  ];
  const specRows = specs.filter(([, v]) => v);

  const sections = [
    { id: "overview", label: "Overview" },
    product.mechanism ? { id: "mechanism", label: "Mechanism" } : null,
    product.research ? { id: "research", label: "Published research" } : null,
    { id: "specifications", label: "Specifications" },
    { id: "testing", label: "Lab testing" },
    { id: "storage", label: "Storage" },
    references.length ? { id: "references", label: "References" } : null,
  ].filter(Boolean) as { id: string; label: string }[];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${product.name} (research use only)`,
    description: product.shortDescription,
    image: product.image,
    sku: product.variants[0]?.sku,
    brand: { "@type": "Brand", name: "GLP Research" },
    offers: product.variants.map((v) => ({
      "@type": "Offer",
      sku: v.sku,
      price: (v.price / 100).toFixed(2),
      priceCurrency: "AUD",
      availability: v.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="border-b border-slate-200 bg-slate-50/60">
        <nav className="container-page flex items-center gap-1.5 py-3 text-xs text-slate-500" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-ink-900">Home</Link>
          <ChevronRight className="size-3" />
          <Link href="/shop" className="hover:text-ink-900">Peptides</Link>
          <ChevronRight className="size-3" />
          <span className="font-medium text-ink-900">{product.name}</span>
        </nav>
      </div>

      <section className="container-page py-10 lg:py-14">
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
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="bg-ink-900 text-white ring-0">{categoryLabel(product.category)}</Badge>
                {product.regulatoryStatus?.toLowerCase().startsWith("investigational") ? (
                  <Badge className="bg-amber-50 text-amber-800 ring-amber-600/20">Investigational compound</Badge>
                ) : null}
                <Badge className="bg-mint-50 text-mint-800 ring-mint-600/20">
                  <BadgeCheck className="size-3" /> {product.purity}
                </Badge>
              </div>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight text-ink-900 sm:text-5xl">{product.name}</h1>
              <p className="mt-2 text-lg text-slate-600">{product.subtitle}</p>
              <ReceptorChips targets={product.receptorTargets} className="mt-4" />
              <p className="mt-6 text-base leading-relaxed text-slate-700">{product.shortDescription}</p>

              <dl className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-slate-200 bg-slate-200 sm:grid-cols-4">
                {[
                  ["Mol. weight", product.molecularWeight?.replace(" g/mol", "") ?? "—", product.molecularWeight ? "g/mol" : ""],
                  ["Half-life", product.halfLife?.split("(")[0].trim() ?? "—", "reported"],
                  ["Length", product.aminoAcidCount ? String(product.aminoAcidCount) : "—", product.aminoAcidCount ? "residues" : ""],
                  ["Batches", String(product.batches.length), "published"],
                ].map(([label, value, unit]) => (
                  <div key={label} className="bg-white px-4 py-3">
                    <dt className="text-[10.5px] tracking-wide text-slate-500 uppercase">{label}</dt>
                    <dd className="mt-0.5 font-mono text-base font-semibold text-ink-900">{value}</dd>
                    <dd className="text-[10.5px] text-slate-400">{unit}</dd>
                  </div>
                ))}
              </dl>
            </div>
          }
          footer={
            <div className="mt-6 space-y-4">
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  { icon: FileCheck2, text: "COA published for every batch" },
                  { icon: Snowflake, text: "Insulated cold-pack shipping" },
                  { icon: Truck, text: "Tracked, discreet delivery" },
                ].map((f) => (
                  <div key={f.text} className="flex items-center gap-2.5 rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-medium text-slate-700">
                    <f.icon className="size-4 shrink-0 text-mint-600" />
                    {f.text}
                  </div>
                ))}
              </div>
              <div className="flex gap-3 rounded-xl bg-amber-50 p-4 text-xs leading-relaxed text-amber-900 ring-1 ring-amber-200">
                <FlaskConical className="mt-0.5 size-4 shrink-0 text-amber-600" />
                <p>
                  <strong>For laboratory research use only.</strong> Not for human or veterinary use. This product is
                  not a medicine and is not intended to diagnose, treat, cure or prevent any disease. Information on
                  this page summarises published literature for research context only.
                </p>
              </div>
            </div>
          }
        />
      </section>

      {/* Section nav */}
      <div className="sticky top-16 z-30 border-y border-slate-200 bg-white/90 backdrop-blur-xl">
        <nav className="container-page flex gap-1 overflow-x-auto py-2" aria-label="Product sections">
          {sections.map((s) => (
            <a key={s.id} href={`#${s.id}`} className="shrink-0 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-ink-50 hover:text-ink-900">
              {s.label}
            </a>
          ))}
        </nav>
      </div>

      <div className="container-page grid gap-16 py-16 lg:grid-cols-[1fr_320px]">
        <div className="min-w-0 space-y-16">
          <section id="overview" className="scroll-mt-32">
            <p className="eyebrow">Overview</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">About {product.name}</h2>
            <Markdown className="mt-6">{product.description}</Markdown>
          </section>

          {product.mechanism ? (
            <section id="mechanism" className="scroll-mt-32">
              <p className="eyebrow">Pharmacology</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight">Mechanism of action</h2>
              <Markdown className="mt-6">{product.mechanism}</Markdown>
            </section>
          ) : null}

          {product.research ? (
            <section id="research" className="scroll-mt-32">
              <p className="eyebrow">Literature</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight">Key published research</h2>
              <p className="mt-2 text-sm text-slate-500">
                Summaries of peer-reviewed studies for research context. Clinical results relate to regulated
                pharmaceutical products studied under trial conditions.
              </p>
              <Markdown className="mt-6">{product.research}</Markdown>
            </section>
          ) : null}

          <section id="specifications" className="scroll-mt-32">
            <p className="eyebrow">Data sheet</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">Specifications</h2>
            <dl className="mt-6 divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200">
              {specRows.map(([label, value]) => (
                <div key={label} className="grid gap-1 px-5 py-3.5 text-sm sm:grid-cols-[200px_1fr] sm:gap-4">
                  <dt className="font-medium text-slate-500">{label}</dt>
                  <dd className="text-ink-900">{value}</dd>
                </div>
              ))}
            </dl>
            {product.sequence ? (
              <div className="mt-6 rounded-2xl bg-ink-950 p-5">
                <p className="text-xs font-semibold tracking-wide text-mint-300 uppercase">Sequence</p>
                <p className="mt-2 font-mono text-sm leading-relaxed break-all text-ink-100">{product.sequence}</p>
              </div>
            ) : null}
          </section>

          <section id="testing" className="scroll-mt-32">
            <p className="eyebrow">Quality control</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">Lab testing &amp; certificates</h2>
            <p className="mt-2 text-sm text-slate-600">
              Every batch is independently tested before release. Match the batch number on your vial to the results
              below, or search all batches on the <Link href="/coa" className="font-semibold text-mint-700 hover:underline">Lab Testing</Link> page.
            </p>
            {product.batches.length ? (
              <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full min-w-[560px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs tracking-wide text-slate-500 uppercase">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Batch</th>
                      <th className="px-4 py-3 font-semibold">Purity (HPLC)</th>
                      <th className="px-4 py-3 font-semibold">Identity (MS)</th>
                      <th className="px-4 py-3 font-semibold">Tested</th>
                      <th className="px-4 py-3 font-semibold" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {product.batches.map((b) => (
                      <tr key={b.id}>
                        <td className="px-4 py-3 font-mono text-xs font-semibold">{b.batchNumber}</td>
                        <td className="px-4 py-3">
                          <span className="font-mono font-semibold text-emerald-700">{b.purity.toFixed(2)}%</span>
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-600">{b.massSpec ? "Confirmed" : "—"}</td>
                        <td className="px-4 py-3 text-slate-600">{formatDate(b.testedAt)}</td>
                        <td className="px-4 py-3 text-right">
                          <Link href={`/coa?batch=${encodeURIComponent(b.batchNumber)}`} className="text-xs font-semibold text-mint-700 hover:underline">
                            View COA
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="mt-6 rounded-xl bg-slate-50 p-4 text-sm text-slate-500">Batch results will be published here before release.</p>
            )}
          </section>

          <section id="storage" className="scroll-mt-32">
            <p className="eyebrow">Handling</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">Storage &amp; handling</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {[
                ["Lyophilized", product.storage],
                ["On arrival", "Transfer to −20 °C (or 2–8 °C short term) as soon as practical. Keep in the outer carton to protect from light."],
                ["Before opening", "Equilibrate the sealed vial to room temperature to prevent condensation forming on the powder."],
              ].map(([title, text]) => (
                <div key={title} className="rounded-2xl border border-slate-200 p-5">
                  <p className="text-sm font-semibold text-ink-900">{title}</p>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{text}</p>
                </div>
              ))}
            </div>
            <Link href="/research/storing-lyophilized-peptides" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-mint-700 hover:underline">
              Read the full storage &amp; handling guide <ChevronRight className="size-4" />
            </Link>
          </section>

          {references.length ? (
            <section id="references" className="scroll-mt-32">
              <p className="eyebrow">Sources</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight">References</h2>
              <ol className="mt-6 space-y-3">
                {references.map((r, i) => (
                  <li key={r.url + i} className="flex gap-3 text-sm">
                    <span className="font-mono text-xs text-slate-400">[{i + 1}]</span>
                    <a href={r.url} target="_blank" rel="noopener noreferrer" className="group text-slate-700 hover:text-mint-700">
                      {r.label} <ExternalLink className="inline size-3 opacity-50 group-hover:opacity-100" />
                    </a>
                  </li>
                ))}
              </ol>
            </section>
          ) : null}
        </div>

        <aside className="space-y-6 lg:sticky lg:top-36 lg:self-start">
          <div className="rounded-3xl bg-ink-950 p-6 text-white">
            <p className="text-xs font-semibold tracking-wide text-mint-300 uppercase">Research library</p>
            <p className="mt-2 text-lg font-semibold">New to incretin pharmacology?</p>
            <p className="mt-2 text-sm text-ink-200">Start with our primer on how single, dual and triple agonists differ.</p>
            <Link href="/research/single-dual-triple-agonists" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-mint-300 hover:text-mint-200">
              Read the explainer <ChevronRight className="size-4" />
            </Link>
          </div>
          <div className="rounded-3xl border border-slate-200 p-6">
            <p className="text-sm font-semibold text-ink-900">Compare with other compounds</p>
            <p className="mt-1 text-sm text-slate-600">Receptor targets, half-life and status side by side.</p>
            <Link href="/compare" className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-mint-700 hover:underline">
              Open comparison <ChevronRight className="size-4" />
            </Link>
          </div>
        </aside>
      </div>

      <section className="container-page">
        <h2 className="text-2xl font-semibold tracking-tight">Related compounds</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {related.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      </section>
    </>
  );
}
