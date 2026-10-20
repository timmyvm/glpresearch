import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Beaker,
  Brain,
  FileCheck2,
  FlaskConical,
  Microscope,
  PackageCheck,
  ShieldCheck,
  Snowflake,
  Truck,
} from "lucide-react";
import { db } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { formatMoney } from "@/lib/money";
import { formatDate } from "@/lib/utils";
import { ButtonLink } from "@/components/ui/button";
import { ProductCard } from "@/components/store/product-card";
import { ReceptorChips } from "@/components/store/receptor-chips";
import { SectionHeading } from "@/components/store/section-heading";
import { FAQS } from "./faq/faqs";

const productCardSelect = {
  slug: true,
  name: true,
  subtitle: true,
  image: true,
  accentColor: true,
  receptorTargets: true,
  regulatoryStatus: true,
  halfLife: true,
  category: true,
  variants: { where: { active: true }, select: { price: true, stock: true, label: true }, orderBy: { sortOrder: "asc" as const } },
};

export default async function HomePage() {
  const [products, articles, batchStats, settings] = await Promise.all([
    db.product.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" }, select: productCardSelect }),
    db.article.findMany({
      where: { published: true },
      orderBy: [{ featured: "desc" }, { publishedAt: "desc" }],
      take: 3,
      select: { slug: true, title: true, excerpt: true, category: true, coverImage: true, readingMinutes: true, publishedAt: true },
    }),
    db.batch.aggregate({ where: { published: true }, _avg: { purity: true }, _count: true }),
    getSettings(),
  ]);

  const featured = products.slice(0, 4);
  const avgPurity = batchStats._avg.purity ? batchStats._avg.purity.toFixed(2) : "99.5";

  return (
    <>
      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-ink-950 text-white">
        <Image
          src="/images/hero-vials.webp"
          alt="GLP Research peptide vials on a laboratory bench"
          fill
          priority
          sizes="100vw"
          className="-z-10 object-cover object-right"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-ink-950 via-ink-950/80 to-ink-950/10" />
        <div className="absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-t from-ink-950 to-transparent" />
        <div className="container-page py-24 sm:py-32 lg:py-40">
          <div className="max-w-2xl animate-fade-up">
            <p className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-xs font-medium text-mint-200 ring-1 ring-white/15 backdrop-blur">
              <span className="size-1.5 rounded-full bg-mint-400 shadow-[0_0_10px] shadow-mint-400" />
              Every batch independently verified by HPLC &amp; mass spec
            </p>
            <h1 className="mt-6 text-4xl font-semibold tracking-tight text-balance sm:text-6xl">
              Research-grade incretin peptides.{" "}
              <span className="bg-gradient-to-r from-mint-300 to-sky-300 bg-clip-text text-transparent">
                Backed by the literature.
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-pretty text-ink-200">
              GLP-1, dual and triple receptor agonists for laboratory research, with a published certificate of
              analysis for every batch and a research library that explains the science behind each compound.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <ButtonLink href="/shop" variant="accent" size="lg">
                Shop peptides <ArrowRight className="size-4" />
              </ButtonLink>
              <ButtonLink href="/research" variant="light" size="lg">
                Explore the science
              </ButtonLink>
            </div>
          </div>

          <dl className="mt-20 grid max-w-3xl grid-cols-2 gap-px overflow-hidden rounded-2xl bg-white/10 ring-1 ring-white/10 backdrop-blur sm:grid-cols-4">
            {[
              { label: "Average batch purity", value: `${avgPurity}%` },
              { label: "Published COAs", value: String(batchStats._count) },
              { label: "Receptor classes", value: "3" },
              { label: "Dispatch after payment", value: "24h" },
            ].map((s) => (
              <div key={s.label} className="bg-ink-950/60 px-5 py-4">
                <dt className="text-[11px] tracking-wide text-ink-300 uppercase">{s.label}</dt>
                <dd className="mt-1 font-mono text-2xl font-semibold text-white">{s.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Trust strip */}
      <section className="border-b border-slate-200 bg-white">
        <div className="container-page grid grid-cols-2 gap-6 py-8 md:grid-cols-4">
          {[
            { icon: Microscope, title: "Third-party tested", text: "RP-HPLC purity + ESI-MS identity" },
            { icon: FileCheck2, title: "COA for every batch", text: "Searchable by batch number" },
            { icon: Snowflake, title: "Cold-chain packed", text: "Insulated, light-protected" },
            { icon: Truck, title: "Tracked dispatch", text: settings.dispatchCutoff },
          ].map((f) => (
            <div key={f.title} className="flex items-start gap-3">
              <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-mint-50 text-mint-700">
                <f.icon className="size-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-ink-900">{f.title}</p>
                <p className="text-xs text-slate-500">{f.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured compounds */}
      <section className="container-page py-24">
        <SectionHeading
          eyebrow="The catalogue"
          title="Seven compounds. Three receptor classes."
          description="Only incretin-class peptides — nothing else. Each compound page includes a full research monograph: structure, receptor pharmacology, half-life and the landmark published studies."
          action={
            <ButtonLink href="/shop" variant="outline">
              View all peptides <ArrowRight className="size-4" />
            </ButtonLink>
          }
        />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      </section>

      {/* Receptor classes */}
      <section className="grid-bg relative overflow-hidden bg-ink-950 py-24 text-white">
        <div className="pointer-events-none absolute -top-40 right-0 size-[600px] rounded-full bg-mint-500/10 blur-3xl" />
        <div className="container-page relative">
          <SectionHeading
            dark
            eyebrow="Pharmacology primer"
            title="Single, dual and triple agonists — what's the difference?"
            description="Incretin research has moved from molecules that activate one receptor to single peptides engineered to engage two or three. Here's how the classes compare."
          />
          <div className="mt-14 grid gap-6 lg:grid-cols-3">
            {[
              {
                tag: "GLP1",
                title: "GLP-1 receptor agonists",
                receptors: "GLP-1R",
                text: "Mimic native GLP-1: glucose-dependent insulin secretion, glucagon suppression, slower gastric emptying and central satiety signalling. The most studied class.",
                examples: ["semaglutide", "liraglutide", "exenatide"],
              },
              {
                tag: "DUAL",
                title: "Dual agonists",
                receptors: "GIPR,GLP-1R",
                text: "Combine GLP-1R with a second receptor — GIP (tirzepatide) or glucagon (survodutide, mazdutide) — to probe how complementary hormone signals add up.",
                examples: ["tirzepatide", "survodutide", "mazdutide"],
              },
              {
                tag: "TRIPLE",
                title: "Triple agonists",
                receptors: "GIPR,GLP-1R,GCGR",
                text: "Engage GIP, GLP-1 and glucagon receptors from one molecule. Glucagon agonism adds hepatic and energy-expenditure effects to incretin signalling.",
                examples: ["retatrutide"],
              },
            ].map((c, i) => (
              <div key={c.tag} className="flex flex-col rounded-3xl bg-white/[0.04] p-7 ring-1 ring-white/10 backdrop-blur">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-mint-300">0{i + 1}</span>
                  <ReceptorChips targets={c.receptors} dark />
                </div>
                <h3 className="mt-6 text-xl font-semibold">{c.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-ink-200">{c.text}</p>
                <div className="mt-auto flex flex-wrap gap-2 pt-6">
                  {c.examples.map((slug) => {
                    const p = products.find((x) => x.slug === slug);
                    return p ? (
                      <Link
                        key={slug}
                        href={`/shop/${slug}`}
                        className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1.5 text-xs font-medium text-white ring-1 ring-white/10 hover:bg-white/10"
                      >
                        <span className="size-1.5 rounded-full" style={{ backgroundColor: p.accentColor }} />
                        {p.name}
                      </Link>
                    ) : null;
                  })}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link href="/research/single-dual-triple-agonists" className="inline-flex items-center gap-2 text-sm font-semibold text-mint-300 hover:text-mint-200">
              Read the full explainer <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Science */}
      <section className="container-page grid items-center gap-12 py-24 lg:grid-cols-2 lg:gap-20">
        <div className="relative aspect-[16/11] overflow-hidden rounded-3xl bg-ink-950">
          <Image src="/images/incretin-axis.webp" alt="Illustration of incretin signalling between gut, pancreas and brain" fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
        </div>
        <div>
          <p className="eyebrow">The incretin effect</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            One gut hormone, signalling across the whole body
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slate-600">
            GLP-1 is released by intestinal L-cells within minutes of a meal. Native GLP-1 lasts only about two minutes
            in circulation before DPP-4 degrades it — the engineering challenge that every compound in our catalogue
            solves in a different way.
          </p>
          <ul className="mt-8 space-y-5">
            {[
              { icon: Beaker, title: "Pancreas", text: "Glucose-dependent insulin release from β-cells; glucagon suppression from α-cells." },
              { icon: Brain, title: "Brain", text: "GLP-1 receptors in the hypothalamus and hindbrain are linked to satiety signalling." },
              { icon: FlaskConical, title: "Gut", text: "Slowed gastric emptying moderates the rate nutrients reach the small intestine." },
            ].map((item) => (
              <li key={item.title} className="flex gap-4">
                <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-ink-900 text-mint-300">
                  <item.icon className="size-5" />
                </div>
                <div>
                  <p className="font-semibold text-ink-900">{item.title}</p>
                  <p className="text-sm leading-relaxed text-slate-600">{item.text}</p>
                </div>
              </li>
            ))}
          </ul>
          <ButtonLink href="/research/what-is-glp-1" variant="outline" className="mt-8">
            Introduction to incretin biology <ArrowRight className="size-4" />
          </ButtonLink>
        </div>
      </section>

      {/* Quality */}
      <section className="bg-slate-50 py-24">
        <div className="container-page grid items-center gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
          <div>
            <p className="eyebrow">Quality you can verify</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
              Don&apos;t take our word for it. Check the batch.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-slate-600">
              Every lot is tested by an independent analytical laboratory before release. The results — purity,
              identity and test date — are published and searchable by the batch number printed on your vial.
            </p>
            <ol className="mt-8 space-y-4">
              {[
                ["Solid-phase synthesis", "Fmoc SPPS with side-chain acylation for long-acting analogues."],
                ["Preparative HPLC purification", "Target fraction isolated and pooled."],
                ["Independent purity testing", "RP-HPLC at 214 nm; release threshold ≥99%."],
                ["Identity confirmation", "ESI mass spectrometry against theoretical mass."],
                ["Lyophilization & sealing", "Sterile-filtered, freeze-dried, crimp-sealed under nitrogen."],
              ].map(([title, text], i) => (
                <li key={title} className="flex gap-4">
                  <span className="grid size-7 shrink-0 place-items-center rounded-full bg-white font-mono text-xs font-semibold text-ink-900 ring-1 ring-slate-200">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-ink-900">{title}</p>
                    <p className="text-sm text-slate-600">{text}</p>
                  </div>
                </li>
              ))}
            </ol>
            <ButtonLink href="/coa" className="mt-8">
              <BadgeCheck className="size-4" /> Look up a certificate of analysis
            </ButtonLink>
          </div>
          <div className="relative">
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl">
              <Image src="/images/hplc-analysis.webp" alt="HPLC purity analysis in a laboratory" fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
            </div>
            <div className="absolute -bottom-6 left-6 rounded-2xl bg-white p-4 shadow-xl ring-1 ring-slate-200 sm:-left-6">
              <p className="text-[11px] tracking-wide text-slate-500 uppercase">Release specification</p>
              <p className="mt-1 font-mono text-2xl font-semibold text-ink-900">≥ 99.0%</p>
              <p className="text-xs text-slate-500">HPLC purity · MS identity confirmed</p>
            </div>
          </div>
        </div>
      </section>

      {/* Compare teaser */}
      <section className="container-page py-24">
        <SectionHeading
          eyebrow="At a glance"
          title="Compare the compounds"
          description="Receptor targets, published half-life and development status side by side."
          action={
            <ButtonLink href="/compare" variant="outline">
              Full comparison <ArrowRight className="size-4" />
            </ButtonLink>
          }
        />
        <div className="mt-10 overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-slate-50 text-xs tracking-wide text-slate-500 uppercase">
              <tr>
                <th className="px-5 py-3 font-semibold">Compound</th>
                <th className="px-5 py-3 font-semibold">Receptors</th>
                <th className="px-5 py-3 font-semibold">Half-life</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 text-right font-semibold">From</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map((p) => (
                <tr key={p.slug} className="hover:bg-slate-50/60">
                  <td className="px-5 py-3.5">
                    <Link href={`/shop/${p.slug}`} className="flex items-center gap-2.5 font-semibold text-ink-900 hover:text-mint-700">
                      <span className="size-2 rounded-full" style={{ backgroundColor: p.accentColor }} />
                      {p.name}
                    </Link>
                  </td>
                  <td className="px-5 py-3.5">
                    <ReceptorChips targets={p.receptorTargets} />
                  </td>
                  <td className="px-5 py-3.5 text-slate-600">{p.halfLife ?? "—"}</td>
                  <td className="px-5 py-3.5 text-slate-600">
                    {p.regulatoryStatus?.split(/[.(—]/)[0].trim() ?? "—"}
                  </td>
                  <td className="px-5 py-3.5 text-right font-semibold">
                    {formatMoney(Math.min(...p.variants.map((v) => v.price)))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Research library */}
      {articles.length ? (
        <section className="border-y border-slate-200 bg-slate-50 py-24">
          <div className="container-page">
            <SectionHeading
              eyebrow="Research library"
              title="Understand the science, not just the SKU"
              description="Long-form explainers on incretin biology, receptor pharmacology, the clinical literature and good laboratory practice."
              action={
                <ButtonLink href="/research" variant="outline">
                  Browse the library <ArrowRight className="size-4" />
                </ButtonLink>
              }
            />
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {articles.map((a) => (
                <Link key={a.slug} href={`/research/${a.slug}`} className="group flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white transition-shadow hover:shadow-lg">
                  <div className="relative aspect-[16/9] overflow-hidden bg-ink-950">
                    {a.coverImage ? (
                      <Image src={a.coverImage} alt="" fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                    ) : null}
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <p className="text-xs font-semibold text-mint-700">{a.category}</p>
                    <h3 className="mt-2 text-lg font-semibold tracking-tight text-ink-900 group-hover:text-mint-800">{a.title}</h3>
                    <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-600">{a.excerpt}</p>
                    <p className="mt-auto pt-5 text-xs text-slate-500">
                      {formatDate(a.publishedAt)} · {a.readingMinutes} min read
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* Packaging */}
      <section className="container-page grid items-center gap-12 py-24 lg:grid-cols-2 lg:gap-20">
        <div>
          <p className="eyebrow">Delivered properly</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            Packed for stability. Shipped discreetly.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slate-600">
            Lyophilized peptides are stable at ambient temperature for transit, but we don&apos;t cut corners. Every order
            ships in a rigid insulated box with a cold pack, light-protective foam inserts and a printed batch
            reference.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {[
              { icon: PackageCheck, title: "Plain outer packaging", text: "No product names on the outside." },
              { icon: Snowflake, title: "Insulated + cold pack", text: "Protects against heat in transit." },
              { icon: Truck, title: "Tracked delivery", text: `Free standard over ${formatMoney(settings.freeShippingThreshold)}.` },
              { icon: ShieldCheck, title: "Damaged-in-transit cover", text: "Reported within 48h? We replace it." },
            ].map((f) => (
              <div key={f.title} className="rounded-2xl border border-slate-200 p-4">
                <f.icon className="size-5 text-mint-600" />
                <p className="mt-3 text-sm font-semibold text-ink-900">{f.title}</p>
                <p className="text-sm text-slate-600">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="relative aspect-[4/3] overflow-hidden rounded-3xl">
          <Image src="/images/packaging.webp" alt="Insulated shipping box with research vials, cold pack and certificate of analysis" fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
        </div>
      </section>

      {/* FAQ */}
      <section className="container-page grid gap-12 pb-8 lg:grid-cols-[1fr_1.6fr]">
        <div>
          <p className="eyebrow">Questions</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight">Frequently asked</h2>
          <p className="mt-4 text-slate-600">
            Can&apos;t find what you need?{" "}
            <Link href="/contact" className="font-semibold text-mint-700 hover:underline">
              Contact our team
            </Link>
            .
          </p>
          <ButtonLink href="/faq" variant="outline" className="mt-6">
            All FAQs
          </ButtonLink>
        </div>
        <div className="divide-y divide-slate-200 rounded-2xl border border-slate-200">
          {FAQS.flatMap((g) => g.items)
            .slice(0, 5)
            .map((f) => (
              <details key={f.q} className="group px-6 py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-ink-900">
                  {f.q}
                  <span className="grid size-6 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-500 transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">{f.a}</p>
              </details>
            ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container-page pt-16">
        <div className="grid-bg relative overflow-hidden rounded-[2rem] bg-ink-900 px-8 py-14 text-white sm:px-14">
          <div className="pointer-events-none absolute -right-20 -bottom-20 size-80 rounded-full bg-mint-400/20 blur-3xl" />
          <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-xl">
              <h2 className="text-3xl font-semibold tracking-tight">Ready to start your research?</h2>
              <p className="mt-3 text-ink-200">
                Create an account to track orders, save lab addresses and access your full order history and batch
                certificates.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <ButtonLink href="/shop" variant="accent" size="lg">
                Shop peptides
              </ButtonLink>
              <ButtonLink href="/register" variant="light" size="lg">
                Create account
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
