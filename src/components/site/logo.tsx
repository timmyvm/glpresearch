import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ className, tone = "dark" }: { className?: string; tone?: "dark" | "light" }) {
  return (
    <Link href="/" className={cn("group inline-flex items-center gap-2.5", className)} aria-label="GLP Research home">
      <span
        className={cn(
          "grid size-9 place-items-center rounded-xl ring-1 transition-transform group-hover:scale-105",
          tone === "light" ? "bg-white ring-white/20" : "bg-white ring-slate-200",
        )}
      >
        <Image src="/images/logo-mark.webp" alt="" width={26} height={26} priority />
      </span>
      <span className="leading-none">
        <span
          className={cn(
            "block text-[15px] font-bold tracking-tight",
            tone === "light" ? "text-white" : "text-ink-900",
          )}
        >
          GLP Research
        </span>
        <span
          className={cn(
            "mt-0.5 block font-mono text-[9.5px] tracking-[0.2em] uppercase",
            tone === "light" ? "text-mint-300/80" : "text-mint-600",
          )}
        >
          Incretin Science
        </span>
      </span>
    </Link>
  );
}
