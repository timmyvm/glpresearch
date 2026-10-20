import Image from "next/image";
import { FlaskConical, PackageCheck, ShieldCheck } from "lucide-react";

const POINTS = [
  { icon: ShieldCheck, title: "Independently verified", text: "Every batch tested by HPLC and mass spectrometry." },
  { icon: PackageCheck, title: "Order tracking", text: "Live status updates and tracking from dispatch to delivery." },
  { icon: FlaskConical, title: "Research library", text: "Monographs and literature reviews for every compound." },
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="container-page py-10 sm:py-16">
      <div className="mx-auto grid max-w-6xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-ink-900/5 lg:grid-cols-2">
        <div className="px-6 py-10 sm:px-12 sm:py-14">{children}</div>
        <aside className="relative hidden overflow-hidden bg-ink-950 lg:block">
          <Image
            src="/images/peptide-helix.webp"
            alt=""
            fill
            sizes="(min-width: 1024px) 50vw, 0px"
            className="object-cover opacity-70"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/60 to-ink-950/10" />
          <div className="relative flex h-full flex-col justify-end p-12 text-white">
            <p className="eyebrow text-mint-300">GLP Research account</p>
            <h2 className="mt-3 max-w-sm text-3xl font-semibold tracking-tight">
              Research-grade incretin peptides, verified batch by batch.
            </h2>
            <ul className="mt-8 space-y-4">
              {POINTS.map(({ icon: Icon, title, text }) => (
                <li key={title} className="flex gap-3">
                  <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-white/10 ring-1 ring-white/15">
                    <Icon className="size-4 text-mint-300" />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold">{title}</span>
                    <span className="block text-sm text-ink-200">{text}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
