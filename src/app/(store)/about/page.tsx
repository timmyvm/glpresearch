import type { Metadata } from "next";
import Image from "next/image";
import { BadgeCheck, BookOpen, FlaskConical, Microscope, Scale, ShieldCheck } from "lucide-react";
import { db } from "@/lib/db";
import { ButtonLink } from "@/components/ui/button";
import { PageHero } from "@/components/store/page-hero";

export const metadata: Metadata = {
  title: "About",
  description: "GLP Research is a specialist supplier of incretin-class research peptides with transparent, independently verified quality.",
};

export default async function AboutPage() {
  const [productCount, batchCount, articleCount] = await Promise.all([
    db.product.count({ where: { active: true } }),
    db.batch.count({ where: { published: true } }),
    db.article.count({ where: { published: true } }),
  ]);

  return (
    <>
      <PageHero
        eyebrow="About GLP Research"
        title="One pharmacological family. Done properly."
        description="We started GLP Research because researchers working on incretin biology deserved a supplier that treats documentation and transparency as seriously as purity."
        image="/images/lab-bench.webp"
      />

      <section className="container-page grid gap-12 py-20 lg:grid-cols-2 lg:gap-20">
        <div>
          <p className="eyebrow">Our approach</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight">Specialists, not a catalogue of everything</h2>
          <div className="mt-6 space-y-4 text-base leading-relaxed text-slate-600">
            <p>
              Most peptide suppliers list hundreds of unrelated compounds. We deliberately carry only incretin-receptor
              agonists — GLP-1, GIP/GLP-1 and glucagon co-agonists — so every product gets the same depth of sourcing,
              independent testing and documentation.
            </p>
            <p>
              Each compound comes with a full research monograph: structure, receptor pharmacology, reported
              pharmacokinetics and a referenced summary of the published literature. Our research library goes further,
              explaining the biology and the clinical science in plain, accurate language.
            </p>
            <p>
              And every batch is independently tested by HPLC and mass spectrometry before release, with results you can
              look up yourself using the batch number on your vial.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 self-start">
          {[
            { value: String(productCount), label: "Incretin compounds" },
            { value: String(batchCount), label: "Published batch certificates" },
            { value: "≥99%", label: "HPLC release specification" },
            { value: String(articleCount), label: "Research library articles" },
          ].map((s) => (
            <div key={s.label} className="rounded-3xl border border-slate-200 p-6">
              <p className="font-mono text-4xl font-semibold text-ink-900">{s.value}</p>
              <p className="mt-2 text-sm text-slate-600">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-slate-50 py-20">
        <div className="container-page">
          <p className="eyebrow">What we stand for</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight">Our principles</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: Microscope, title: "Independent verification", text: "Batches are tested by third-party analytical laboratories, never just the manufacturer." },
              { icon: BadgeCheck, title: "Radical transparency", text: "Every published batch result is searchable. If a batch fails specification, it isn't sold." },
              { icon: BookOpen, title: "Accurate science", text: "Our content is referenced to peer-reviewed literature and kept up to date as new data are published." },
              { icon: FlaskConical, title: "Research use only", text: "We supply laboratories and researchers. We don't make therapeutic claims, and we refuse orders that suggest human use." },
              { icon: ShieldCheck, title: "Careful handling", text: "Cold-chain packing, light-protective inserts and tracked delivery for every order." },
              { icon: Scale, title: "Compliance first", text: "We expect customers to follow the laws and institutional rules that apply to their research." },
            ].map((p) => (
              <div key={p.title} className="rounded-3xl bg-white p-6 ring-1 ring-slate-200">
                <div className="grid size-11 place-items-center rounded-2xl bg-ink-900 text-mint-300">
                  <p.icon className="size-5" />
                </div>
                <p className="mt-5 font-semibold text-ink-900">{p.title}</p>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{p.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page grid items-center gap-12 py-20 lg:grid-cols-2">
        <div className="relative aspect-[4/3] overflow-hidden rounded-3xl">
          <Image src="/images/freezer.webp" alt="Research vials in laboratory freezer storage" fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
        </div>
        <div>
          <h2 className="text-3xl font-semibold tracking-tight">Stored right, from release to your bench</h2>
          <p className="mt-4 text-base leading-relaxed text-slate-600">
            Released stock is held sealed at −20 °C and protected from light until it is packed. Orders ship in insulated
            packaging with a cold pack and a printed batch reference, so you can match the vial in your hand to its
            published certificate.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/shop">Browse peptides</ButtonLink>
            <ButtonLink href="/coa" variant="outline">See lab results</ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}
