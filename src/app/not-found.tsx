import type { Metadata } from "next";
import Form from "next/form";
import Image from "next/image";
import Link from "next/link";
import { db } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { plateInk, specimenImage } from "@/lib/plates";
import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { CartDrawer } from "@/components/site/cart-drawer";
import { Button } from "@/components/ui/button";
import { TitleLines } from "@/components/store/page-intro";

export const metadata: Metadata = { title: "Page not found", robots: { index: false } };

export default async function NotFound() {
  const [settings, products] = await Promise.all([
    getSettings(),
    db.product.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" }, select: { slug: true, name: true, image: true, accentColor: true } }),
  ]);

  return (
    <div className="flex min-h-dvh flex-col">
      <Header />
      <main id="main" className="flex-1 pb-28 md:pb-40">
        <section className="frame grid gap-6 pt-12 md:grid-cols-12 md:items-end md:gap-x-[var(--gutter)] md:pt-20">
          <h1 className="lines text-display md:col-span-7">
            <TitleLines lines={["This page", "isn't here"]} />
          </h1>
          <p className="max-w-[44ch] text-lead md:col-span-5" data-load style={{ "--d": "300ms" } as React.CSSProperties}>
            The address may be mistyped, or the page has moved. Search for what you need, or start from a compound below.
          </p>
          <Form action="/search" className="md:col-span-7" role="search" aria-label="Site search">
            <label htmlFor="nf-q" className="block text-small font-medium">
              Search for
            </label>
            <div className="mt-2 flex flex-col gap-2 sm:flex-row">
              <input
                id="nf-q"
                name="q"
                type="search"
                autoComplete="off"
                spellCheck={false}
                enterKeyHint="search"
                placeholder="A compound, a topic or a batch number…"
                className="h-14 min-w-0 flex-1 bg-surface px-4 text-body placeholder:text-muted/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-ink"
              />
              <Button type="submit" variant="ink" size="lg">
                Search
              </Button>
            </div>
          </Form>
        </section>

        <section className="frame pt-20 md:pt-28" aria-labelledby="nf-compounds">
          <h2 id="nf-compounds" className="text-index font-medium" data-reveal>
            The seven compounds
          </h2>
          <ul className="mt-8 grid grid-cols-3 gap-1.5 sm:grid-cols-4 lg:grid-cols-7">
            {products.map((p, i) => (
              <li key={p.slug} data-reveal style={{ "--i": i % 4 } as React.CSSProperties}>
                <Link href={`/shop/${p.slug}`} className="group relative block aspect-[4/5] overflow-clip" style={{ backgroundColor: p.accentColor, color: plateInk(p.accentColor) }}>
                  <Image src={specimenImage(p.image) ?? p.image} alt="" fill sizes="(min-width: 1024px) 14vw, (min-width: 640px) 25vw, 33vw" className="object-contain px-[16%] pt-[12%] pb-[20%] transition-transform duration-500 ease-[var(--ease-out)] group-hover:-translate-y-1" />
                  <span className="absolute inset-x-3 bottom-2 text-small font-medium group-hover:underline">{p.name}</span>
                </Link>
              </li>
            ))}
          </ul>
          <ul className="mt-12 flex flex-wrap gap-x-8 gap-y-3 text-lead" data-reveal>
            <li>
              <Link href="/shop" className="link">
                The catalogue
              </Link>
            </li>
            <li>
              <Link href="/research" className="link">
                The research library
              </Link>
            </li>
            <li>
              <Link href="/coa" className="link">
                Lab results
              </Link>
            </li>
            <li>
              <Link href="/contact" className="link">
                Contact us
              </Link>
            </li>
          </ul>
        </section>
      </main>
      <Footer />
      <CartDrawer freeShippingThreshold={settings.freeShippingThreshold} />
    </div>
  );
}
