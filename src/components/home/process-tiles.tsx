import Image from "next/image";

const STEPS = [
  { image: "/images/hplc-analysis.webp", tint: "bg-field-grey", title: "Tested before release", text: "Independent HPLC purity and mass-spec identity on every batch." },
  { image: "/images/freezer.webp", tint: "bg-field-mint", title: "Held at −20 °C", text: "Sealed lyophilised vials, kept frozen and out of the light." },
  { image: "/images/lab-bench.webp", tint: "bg-field-orange", title: "Packed by hand", text: "Insulated box, cold pack and a printed batch reference." },
  { image: "/images/packaging.webp", tint: "bg-field-grey", title: "Tracked to your bench", text: "Plain outer packaging, tracked delivery across Australia." },
];

/** "Team on colour tiles", turned to the subject: the four stages a batch passes, as treated photographs. */
export function ProcessTiles() {
  return (
    <section className="frame pt-32 md:pt-48" aria-labelledby="process-title">
      <h2 id="process-title" className="text-index font-medium">
        How a batch reaches you
      </h2>
      <ul className="mt-10 grid grid-cols-2 gap-2 md:grid-cols-4 md:gap-3">
        {STEPS.map((s, i) => (
          <li key={s.title} data-reveal style={{ "--i": i } as React.CSSProperties}>
            <div className={`relative aspect-[4/5] overflow-clip ${s.tint}`}>
              <Image src={s.image} alt="" fill sizes="(min-width: 768px) 25vw, 50vw" className="object-cover mix-blend-multiply grayscale contrast-[1.15]" />
            </div>
            <p className="mt-3 font-medium">{s.title}</p>
            <p className="mt-1 max-w-[32ch] text-small text-muted">{s.text}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
