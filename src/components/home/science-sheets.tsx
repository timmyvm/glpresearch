import Image from "next/image";
import Link from "next/link";
import { ARCHIVE } from "@/content/credits";
import { cn } from "@/lib/utils";

const SHEETS = [
  {
    name: "Made in the gut",
    figure: "2 minutes",
    text: "Native GLP-1 is a 30-residue hormone released by L-cells in the intestine after a meal. The enzyme DPP-4 cuts it within about two minutes, which is why the hormone itself is no use as a research tool.",
    link: { href: "/research/what-is-glp-1", label: "What GLP-1 does" },
    picture: { src: ARCHIVE.intestines.src, w: 1100, h: 1793, alt: "An engraving of the intestines from 1686, showing sections of the gut wall", fit: "object-contain p-[6%]" },
    ground: "bg-field-black text-white",
  },
  {
    name: "Copied from a lizard",
    figure: "2.4 hours",
    text: "In 1992 John Eng isolated exendin-4 from the saliva of the Gila monster. It shares about half of GLP-1's sequence but resists DPP-4, and became exenatide, the first compound of the class.",
    link: { href: "/shop/exenatide", label: "Exenatide" },
    picture: { src: ARCHIVE.gila.src, w: 1920, h: 1556, alt: "A reticulate Gila monster with its forked tongue out, on dry ground", fit: "object-cover" },
    ground: "bg-field-paper text-ink",
  },
  {
    name: "Tied to albumin",
    figure: "1 week",
    text: "A fatty acid on lysine 26 lets the peptide ride on albumin in the blood. Liraglutide lasts about 13 hours. Semaglutide, with a longer chain and an Aib swap at position 8, lasts about a week.",
    link: { href: "/research/half-life-engineering", label: "How the half-life was stretched" },
    picture: { src: "/images/lab/vial-cake.webp", w: 896, h: 1120, alt: "A small glass vial with a navy cap and a white freeze-dried peptide cake", fit: "object-cover" },
    ground: "bg-ink text-white",
  },
  {
    name: "Two receptors, then three",
    figure: "3 receptors",
    text: "Tirzepatide adds the GIP receptor; survodutide and mazdutide add glucagon's. Retatrutide acts on all three at once. All of them still act on the GLP-1 receptors of the pancreas's islet cells.",
    link: { href: "/research/single-dual-triple-agonists", label: "Single, dual and triple agonists" },
    picture: { src: ARCHIVE.islets.src, w: 1920, h: 1082, alt: "A stained micrograph of human pancreas with pale islets of Langerhans among the tissue", fit: "object-cover" },
    ground: "bg-surface text-ink",
  },
];

/**
 * "From two minutes to a week": the class's history as stacked sheets. Each sheet sticks a band
 * lower than the last, so the titles stay readable like tabbed folders in a drawer.
 */
export function ScienceSheets() {
  return (
    <section className="pt-8 pb-28 md:pb-40" aria-labelledby="science-title">
      <div className="frame">
        <h2 id="science-title" className="max-w-[16ch] text-head font-semibold" data-reveal>
          From two minutes to a week
        </h2>
        <p className="mt-5 max-w-[52ch] text-lead" data-reveal style={{ "--i": 1 } as React.CSSProperties}>
          Every compound here is a rewrite of the same short hormone. Four changes took it from minutes in the blood to a week.
        </p>
      </div>

      <ol className="mt-12 md:mt-16">
        {SHEETS.map((s, i) => (
          <li
            key={s.name}
            className={cn("sheet sticky", s.ground)}
            style={{ "--n": i } as React.CSSProperties}
          >
            <div className="frame grid min-h-[70svh] gap-6 pb-8 md:min-h-[calc(86svh-4rem)] md:grid-cols-12 md:gap-x-[var(--gutter)] md:pb-0">
              <div className="flex flex-col md:col-span-6 md:pb-12">
                <h3 className="flex h-[52px] items-center text-lead font-semibold md:h-[72px] md:text-index">{s.name}</h3>
                <p className="mt-6 text-display font-semibold md:mt-auto">
                  <span className="tabular">{s.figure.split(" ")[0]}</span> {s.figure.split(" ").slice(1).join(" ")}
                </p>
                <p className="mt-6 max-w-[40ch] text-body md:text-lead">{s.text}</p>
                <Link href={s.link.href} className="link mt-5 self-start text-body font-medium">
                  {s.link.label}
                </Link>
              </div>
              <div className="relative order-first aspect-[4/3] md:order-none md:col-span-6 md:mt-[72px] md:aspect-auto">
                <Image src={s.picture.src} alt={s.picture.alt} fill sizes="(min-width: 768px) 50vw, 100vw" className={s.picture.fit} />
              </div>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
