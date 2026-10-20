import Link from "next/link";
import { FlaskConical } from "lucide-react";
import { buttonClass } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="grid-bg grid min-h-dvh place-items-center bg-ink-950 px-4 text-center text-white">
      <div className="max-w-md">
        <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-mint-400/15 ring-1 ring-mint-300/30">
          <FlaskConical className="size-7 text-mint-300" />
        </div>
        <p className="mt-6 font-mono text-sm text-mint-300">404</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">This page didn&apos;t make it through purification</h1>
        <p className="mt-3 text-ink-200">The page you&apos;re looking for doesn&apos;t exist or has moved.</p>
        <div className="mt-8 flex justify-center gap-3">
          <Link href="/" className={buttonClass("accent")}>Back home</Link>
          <Link href="/shop" className={buttonClass("light")}>Browse peptides</Link>
        </div>
      </div>
    </div>
  );
}
