"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";

// Each auth screen shows one photograph from the lab, with a paper caption tipped onto it.
const PLATES: Record<string, { image: string; alt: string; title: string; note: string }> = {
  "/login": {
    image: "/images/lab/checking-vial.webp",
    alt: "A gloved hand holding a vial up to window light to check the freeze-dried cake",
    title: "Checked before it ships",
    note: "Every batch is tested by HPLC and mass spectrometry, and its certificate is on file.",
  },
  "/register": {
    image: "/images/lab/sealing.webp",
    alt: "Gloved hands crimping an aluminium seal onto a vial beside a balance",
    title: "Weighed and sealed by hand",
    note: "An account keeps your orders, payment details and addresses in one place.",
  },
  "/forgot-password": {
    image: "/images/lab/autosampler.webp",
    alt: "A gloved hand placing a vial into an HPLC autosampler tray",
    title: "Tested by HPLC",
    note: "Reset links expire after an hour and work once.",
  },
  "/reset-password": {
    image: "/images/lab/freezer-rack.webp",
    alt: "Racks of capped vials on frosted shelves inside a laboratory freezer",
    title: "Held at −20 °C",
    note: "Choose a password you do not use anywhere else.",
  },
};

export function AuthPlate() {
  const pathname = usePathname();
  const p = PLATES[pathname] ?? PLATES["/login"];
  return (
    <figure className="relative h-full min-h-[36rem] overflow-clip bg-field-black">
      <Image src={p.image} alt={p.alt} fill loading="eager" sizes="(min-width: 768px) 48vw, 0px" className="object-cover" />
      <figcaption className="absolute bottom-6 left-6 max-w-[22rem] rotate-[-1deg] bg-paper p-5 text-ink">
        <span className="block text-lead font-semibold">{p.title}</span>
        <span className="mt-1 block text-small">{p.note}</span>
      </figcaption>
    </figure>
  );
}
