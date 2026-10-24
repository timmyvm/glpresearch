import Image from "next/image";
import { LoopVideo } from "@/components/motion/loop-video";
import { Certificate, type CertCompound } from "./certificate";

const RUN = [
  { src: "/images/lab/autosampler.webp", w: 896, h: 1120, alt: "A gloved hand placing a vial into an HPLC autosampler tray", caption: "Tested by HPLC and mass spectrometry", cell: "lg:col-span-3 lg:col-start-6" },
  { src: "/images/lab/freezer-rack.webp", w: 1168, h: 880, alt: "Racks of capped vials on frosted shelves inside a laboratory freezer", caption: "Held at −20 °C until it ships", cell: "lg:col-span-4 lg:col-start-9 lg:mt-[28vh]" },
  { src: "/images/lab/sealing.webp", w: 880, h: 1168, alt: "Gloved hands crimping an aluminium seal onto a vial beside a balance", caption: "Weighed and sealed by hand", cell: "lg:col-span-3 lg:col-start-5 lg:-mt-[6vh]" },
  { src: "/images/lab/packing.webp", w: 1024, h: 1024, alt: "Three vials in foam inserts beside a cold pack and a printed packing slip", caption: "Packed cold, batch numbers on the slip", cell: "lg:col-span-4 lg:col-start-8 lg:mt-[18vh]" },
];

/**
 * First screen: the certificate stands over the lab at night. On wide screens it holds its place
 * while the lab's photographs pass, shrinking to a stub at the bottom-left (scroll-driven CSS;
 * without support, or with reduced motion, everything simply stacks).
 */
export function CertificateHero({ compounds }: { compounds: CertCompound[] }) {
  return (
    <section className="hero-run relative bg-field-black text-white" aria-label="Certificate of analysis">
      <div className="hero-stage absolute inset-x-0 top-0 h-svh overflow-clip lg:sticky lg:top-16 lg:h-[var(--stage-h)]">
        <div className="hero-backdrop absolute inset-0">
          <LoopVideo
            src="/video/lab-night.mp4"
            poster="/video/lab-night-poster.webp"
            label="A dark laboratory at night: an HPLC stack, a monitor showing one sharp peak and a lab freezer"
            className="size-full [&_video]:brightness-[0.7]"
            media="(min-width: 1024px)"
          />
        </div>
      </div>

      <div className="hero-cardwrap relative z-20 px-[var(--margin)] pt-10 pb-12 lg:pointer-events-none lg:sticky lg:top-16 lg:-mt-[var(--stage-h)] lg:grid lg:h-[var(--stage-h)] lg:place-items-center lg:p-0">
        <div className="lg:pointer-events-auto lg:w-[var(--cw)]">
          <Certificate compounds={compounds} />
        </div>
      </div>

      <div className="relative z-10 frame pt-16 pb-24 lg:grid lg:grid-cols-12 lg:gap-x-[var(--gutter)] lg:pt-[12vh] lg:pb-[8vh]">
        <p className="text-head font-semibold lg:col-span-7 lg:col-start-5" data-reveal>
          Every vial has its certificate on file.
        </p>
        <ul className="mt-12 grid grid-cols-2 gap-x-3 gap-y-10 lg:col-span-12 lg:mt-[10vh] lg:grid-cols-12 lg:gap-x-[var(--gutter)] lg:gap-y-0">
          {RUN.map((p, i) => (
            <li key={p.src} className={p.cell} data-reveal style={{ "--i": i % 2 } as React.CSSProperties}>
              <Image src={p.src} alt={p.alt} width={p.w} height={p.h} sizes="(min-width: 1024px) 30vw, 50vw" className="h-auto w-full" />
              <p className="mt-3 text-body text-on-black-muted">{p.caption}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
