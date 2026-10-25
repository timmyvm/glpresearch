import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

/** The mark is a single sharp chromatography peak: one compound, nothing else in the vial. */
export function Logo({ className, tone = "dark" }: { className?: string; tone?: "dark" | "light" }) {
  return (
    <Link href="/" className={cn("group inline-flex items-center gap-2", className)} aria-label="GLP Research, home">
      <span className={cn("grid size-9 place-items-center", tone === "light" && "bg-white")}>
        <Image src="/images/logo-peak.webp" alt="" width={34} height={34} />
      </span>
      <span className={cn("whitespace-nowrap text-lead font-semibold tracking-[-0.03em]", tone === "light" ? "text-on-navy" : "text-ink")} translate="no">
        GLP Research
      </span>
    </Link>
  );
}
