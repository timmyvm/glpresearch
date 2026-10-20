import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ className, tone = "dark" }: { className?: string; tone?: "dark" | "light" }) {
  return (
    <Link href="/" className={cn("group inline-flex items-center gap-2.5", className)} aria-label="GLP Research, home">
      <span className={cn("grid size-9 place-items-center", tone === "light" ? "bg-white" : "bg-surface")}>
        <Image src="/images/logo-mark.webp" alt="" width={24} height={24} priority />
      </span>
      <span className={cn("text-body font-medium tracking-[-0.02em]", tone === "light" ? "text-on-navy" : "text-ink")} translate="no">
        GLP Research
      </span>
    </Link>
  );
}
