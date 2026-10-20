import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getSettings } from "@/lib/settings";
import { PageIntro, TitleLines } from "@/components/store/page-intro";
import { ContactForm } from "./contact-form";

export const metadata: Metadata = {
  title: "Contact",
  description: "Questions about an order, a batch certificate or institutional supply? Send GLP Research a message.",
};

const SHORTCUTS = [
  { href: "/coa", title: "Find a certificate", text: "Purity and identity results for any batch number.", src: "/images/hplc-analysis.webp", alt: "An analyst holds a vial beside an HPLC chromatogram with one sharp peak" },
  { href: "/faq#storage-handling", title: "Storage and handling", text: "Temperatures, reconstitution and shelf life.", src: "/images/freezer.webp", alt: "Research vials in racks inside a laboratory freezer" },
  { href: "/shipping", title: "Shipping and returns", text: "Dispatch times, cold-chain packing and damaged parcels.", src: "/images/packaging.webp", alt: "An insulated shipping box with three vials, a cold pack and a certificate" },
  { href: "/research", title: "Research library", text: "Explainers on every compound and how it works.", src: "/images/lab-bench.webp", alt: "An analyst pipettes a sample at a laboratory bench" },
];

export default async function ContactPage({ searchParams }: { searchParams: Promise<{ order?: string }> }) {
  const [settings, { order }] = await Promise.all([getSettings(), searchParams]);
  return (
    <>
      <PageIntro
        title={<TitleLines lines={["Write to the", "research team"]} />}
        lead="Orders, batch certificates and institutional supply. We reply within one business day, Monday to Friday."
      />
      <section className="frame grid gap-12 pt-12 lg:grid-cols-12 lg:gap-x-[var(--gutter)] lg:pt-16" aria-labelledby="form-title">
        <div className="lg:col-span-7" data-load style={{ "--d": "380ms" } as React.CSSProperties}>
          <h2 id="form-title" className="text-index font-medium">
            Send a message
          </h2>
          <p className="mt-3 text-muted">Every field except the order number is required.</p>
          <ContactForm defaultOrder={order?.slice(0, 40)} />
        </div>
        <aside className="space-y-2 lg:col-span-4 lg:col-start-9" aria-label="Other ways to reach us">
          <div className="bg-field-mint p-6" data-reveal>
            <h2 className="font-medium">Email</h2>
            <a href={`mailto:${settings.supportEmail}`} className="link mt-1 inline-block text-lead break-all">
              {settings.supportEmail}
            </a>
          </div>
          <div className="bg-surface p-6" data-reveal style={{ "--i": 1 } as React.CSSProperties}>
            <h2 className="font-medium">Hours</h2>
            <p className="mt-1">Monday to Friday, 9 am to 5 pm Sydney time. Messages after hours are answered the next business day.</p>
          </div>
          <div className="bg-surface p-6" data-reveal style={{ "--i": 2 } as React.CSSProperties}>
            <h2 className="font-medium">Where&apos;s my order?</h2>
            <p className="mt-1">
              <Link href="/track" className="link">
                Track an order
              </Link>{" "}
              with its number and your email, or sign in to{" "}
              <Link href="/account/orders" className="link">
                your account
              </Link>
              .
            </p>
          </div>
          <div className="bg-surface p-6" data-reveal style={{ "--i": 3 } as React.CSSProperties}>
            <h2 className="font-medium">Institutional supply</h2>
            <p className="mt-1">Recurring or bulk orders for a research group: choose “Bulk or institutional pricing” as the subject.</p>
          </div>
          <p className="px-1 pt-4 text-muted" data-reveal style={{ "--i": 4 } as React.CSSProperties}>
            We can&apos;t advise on human use, dosing or medical treatment, and won&apos;t reply to questions about them.
          </p>
        </aside>
      </section>

      <section className="frame pt-28 md:pt-40" aria-labelledby="shortcuts-title">
        <h2 id="shortcuts-title" className="text-head" data-reveal>
          Quicker answers
        </h2>
        <p className="mt-4 max-w-[52ch]" data-reveal style={{ "--i": 1 } as React.CSSProperties}>
          Most questions about a batch, storage or delivery are already answered on these pages, with no wait for a reply.
        </p>
        <ul className="mt-10 grid gap-x-3 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {SHORTCUTS.map((s, i) => (
            <li key={s.href} data-reveal style={{ "--i": i } as React.CSSProperties}>
              <Link href={s.href} className="group block">
                <span className="relative block aspect-[4/3] overflow-clip bg-surface">
                  <Image src={s.src} alt={s.alt} fill sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw" className="object-cover transition-transform duration-700 ease-[var(--ease-out)] group-hover:scale-[1.02]" />
                </span>
                <span className="mt-3 block text-lead font-medium group-hover:underline group-hover:decoration-[0.07em] group-hover:underline-offset-[0.2em]">{s.title}</span>
                <span className="mt-1 block text-muted">{s.text}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
