import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getSettings } from "@/lib/settings";
import { PageIntro, TitleLines } from "@/components/store/page-intro";
import { Slip, SlipRow } from "@/components/store/paper";
import { ContactForm } from "./contact-form";

export const metadata: Metadata = {
  title: "Contact",
  description: "Questions about an order, a batch certificate or institutional supply? Send GLP Research a message.",
  alternates: { canonical: "/contact" },
};

const SHORTCUTS = [
  { href: "/coa", title: "Find a certificate", text: "Purity and identity results for any batch number.", src: "/images/lab/coa-report.webp", alt: "A gloved hand pointing a pen at the peak on a printed HPLC report" },
  { href: "/faq#storage-handling", title: "Storage and handling", text: "Temperatures, reconstitution and shelf life.", src: "/images/lab/cryo-box.webp", alt: "Gloved hands lifting a box of vials out of a frosted freezer" },
  { href: "/shipping", title: "Shipping and returns", text: "Dispatch times, cold-chain packing and damaged parcels.", src: "/images/lab/packing.webp", alt: "Vials packed in foam with a cold pack and a packing slip" },
  { href: "/research", title: "Research library", text: "Explainers on every compound and how it works.", src: "/images/lab/journals.webp", alt: "Bound journals and printed papers on a desk under a lamp" },
];

export default async function ContactPage({ searchParams }: { searchParams: Promise<{ order?: string }> }) {
  const [settings, { order }] = await Promise.all([getSettings(), searchParams]);
  return (
    <>
      <PageIntro
        title={<TitleLines lines={["Write to the", "research team"]} />}
        lead="Orders, batch certificates and institutional supply. We reply within one business day, Monday to Friday."
      />

      <section className="frame grid gap-10 pt-12 lg:grid-cols-12 lg:gap-x-[var(--gutter)] lg:pt-16" aria-labelledby="form-title">
        <div className="bg-paper px-5 pt-7 pb-9 sm:px-8 md:px-10 md:pt-10 md:pb-12 lg:col-span-7" data-load style={{ "--d": "380ms" } as React.CSSProperties}>
          <h2 id="form-title" className="text-index font-semibold">
            Send a message
          </h2>
          <p className="mt-3 text-body text-muted">Every field except the order number is required.</p>
          <ContactForm defaultOrder={order?.slice(0, 40)} />
        </div>

        <aside className="lg:col-span-4 lg:col-start-9" aria-label="Other ways to reach us">
          <Slip className="px-6 pt-7 pb-10 lg:px-8" data-reveal>
            <h2 className="text-lead font-semibold">The reply desk</h2>
            <a href={`mailto:${settings.supportEmail}`} className="link mt-3 inline-block text-lead break-all">
              {settings.supportEmail}
            </a>
            <dl className="mt-6 space-y-2 text-body">
              {[
                ["Reply", "Within one business day"],
                ["Hours", "Mon to Fri, 9 am to 5 pm"],
                ["Time zone", "Sydney"],
                ["After hours", "Next business day"],
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

          <div className="mt-10 space-y-8 px-1 text-body" data-reveal style={{ "--i": 1 } as React.CSSProperties}>
            <div>
              <h2 className="font-semibold">Where&apos;s my order?</h2>
              <p className="mt-1 max-w-[44ch]">
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
            <div>
              <h2 className="font-semibold">Institutional supply</h2>
              <p className="mt-1 max-w-[44ch]">Recurring or bulk orders for a research group: choose “Bulk or institutional pricing” as the subject.</p>
            </div>
            <p className="max-w-[44ch] text-muted">We can&apos;t advise on human use, dosing or medical treatment, and won&apos;t reply to questions about them.</p>
          </div>
        </aside>
      </section>

      <section className="frame pt-28 md:pt-40" aria-labelledby="shortcuts-title">
        <div className="flex flex-col gap-3 md:flex-row md:items-baseline md:justify-between" data-reveal>
          <h2 id="shortcuts-title" className="text-head font-semibold">
            Quicker answers
          </h2>
          <p className="max-w-[46ch] text-body">Most questions about a batch, storage or delivery are already answered here, with no wait for a reply.</p>
        </div>
        <ul className="mt-10 grid gap-x-3 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {SHORTCUTS.map((s, i) => (
            <li key={s.href} data-reveal style={{ "--i": i } as React.CSSProperties}>
              <Link href={s.href} className="group block">
                <span className="relative block aspect-[4/3] overflow-clip bg-surface">
                  <Image src={s.src} alt={s.alt} fill sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw" className="object-cover transition-transform duration-700 ease-[var(--ease-out)] group-hover:scale-[1.02]" />
                </span>
                <span className="mt-3 block text-lead font-medium group-hover:underline group-hover:decoration-[0.07em] group-hover:underline-offset-[0.2em]">{s.title}</span>
                <span className="mt-1 block text-body text-muted">{s.text}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
