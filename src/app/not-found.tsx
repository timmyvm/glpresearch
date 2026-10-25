import type { Metadata } from "next";
import Form from "next/form";
import { getSettings } from "@/lib/settings";
import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { CartDrawer } from "@/components/site/cart-drawer";
import { Button } from "@/components/ui/button";
import { TitleLines } from "@/components/store/page-intro";
import { Browse } from "@/components/store/browse";
import { Slip, SlipRow } from "@/components/store/paper";

export const metadata: Metadata = { title: "Page not found", robots: { index: false } };

export default async function NotFound() {
  const settings = await getSettings();

  return (
    <div className="flex min-h-dvh flex-col">
      <Header />
      <main id="main" className="flex-1 pb-28 md:pb-40">
        <section className="frame grid gap-6 pt-12 md:grid-cols-12 md:items-end md:gap-x-[var(--gutter)] md:pt-20">
          <h1 className="lines text-display font-semibold md:col-span-7">
            <TitleLines lines={["This page", "isn't here"]} />
          </h1>
          <p className="max-w-[44ch] text-lead md:col-span-5" data-load style={{ "--d": "300ms" } as React.CSSProperties}>
            The address may be mistyped, or the page has moved. Search for what you need, or start from one of the compounds or articles below.
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
                className="h-14 min-w-0 bg-surface px-4 sm:flex-1 text-body placeholder:text-muted/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-ink"
              />
              <Button type="submit" variant="ink" size="lg">
                Search
              </Button>
            </div>
          </Form>
          <Slip className="w-full max-w-[24rem] px-6 pt-6 pb-9 md:col-span-4 md:col-start-9" data-load style={{ "--d": "380ms" } as React.CSSProperties}>
            <p className="text-lead font-semibold">Request slip</p>
            <dl className="mt-3 space-y-2 text-body">
              {[
                ["Status", "404"],
                ["Result", "Page not found"],
                ["Next", "Search or browse"],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="sr-only">{label}</dt>
                  <dd>
                    <SlipRow label={label} value={value} />
                  </dd>
                </div>
              ))}
            </dl>
          </Slip>
        </section>

        <Browse />
      </main>
      <Footer />
      <CartDrawer freeShippingThreshold={settings.freeShippingThreshold} />
    </div>
  );
}
