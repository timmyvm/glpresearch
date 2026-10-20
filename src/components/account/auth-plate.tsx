"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { plateInk } from "@/lib/plates";

// Each auth screen shows one specimen on its own label colour, like a plate in a field guide.
const PLATES: Record<string, { name: string; image: string; plate: string; note: string }> = {
  "/login": { name: "Semaglutide", image: "/images/specimens/semaglutide-10mg.webp", plate: "#2DD4BF", note: "Long-acting GLP-1 receptor agonist, 10 mg" },
  "/register": { name: "Tirzepatide", image: "/images/specimens/tirzepatide-15mg.webp", plate: "#FF6831", note: "Dual GIP and GLP-1 receptor agonist, 15 mg" },
  "/forgot-password": { name: "Liraglutide", image: "/images/specimens/liraglutide-10mg.webp", plate: "#38BDF8", note: "Once-daily GLP-1 receptor agonist, 10 mg" },
  "/reset-password": { name: "Retatrutide", image: "/images/specimens/retatrutide-10mg.webp", plate: "#F59E0B", note: "Triple GIP, GLP-1 and glucagon receptor agonist, 10 mg" },
};

export function AuthPlate() {
  const pathname = usePathname();
  const p = PLATES[pathname] ?? PLATES["/login"];
  const ink = plateInk(p.plate);
  return (
    <figure className="relative flex h-full min-h-[34rem] flex-col justify-end p-8" style={{ backgroundColor: p.plate, color: ink }}>
      <div className="absolute inset-x-8 top-10 bottom-28">
        <Image src={p.image} alt={`${p.name} research vial`} fill priority sizes="(min-width: 768px) 40vw, 0px" className="object-contain" />
      </div>
      <figcaption className="relative">
        <span className="block text-lead font-medium">{p.name}</span>
        <span className="block text-small">{p.note}. Every batch tested by HPLC and mass spectrometry.</span>
      </figcaption>
    </figure>
  );
}
