import Link from "next/link";
import { getSettings } from "@/lib/settings";
import { DispatchClock } from "./dispatch-clock";
import { NewsletterForm } from "./newsletter-form";

const LINKS = [
  { href: "/shop", label: "Peptides" },
  { href: "/research", label: "Research library" },
  { href: "/compare", label: "Compare compounds" },
  { href: "/coa", label: "Lab results" },
  { href: "/faq", label: "Questions" },
  { href: "/shipping", label: "Shipping & returns" },
  { href: "/track", label: "Track an order" },
  { href: "/contact", label: "Contact" },
];

const LEGAL = [
  { href: "/disclaimer", label: "Research use policy" },
  { href: "/terms", label: "Terms of sale" },
  { href: "/privacy", label: "Privacy" },
];

// "A footer of tiles": every cell filled, 8px gaps, the name returning at full width.
export async function Footer() {
  const settings = await getSettings();
  return (
    <footer className="mt-32 px-2 pb-2 lg:mt-48" aria-labelledby="footer-title">
      <h2 id="footer-title" className="sr-only">
        About this site
      </h2>
      <div className="grid gap-2 md:grid-cols-12">
        <div className="flex min-h-56 flex-col justify-between gap-8 bg-surface p-6 md:col-span-6 lg:col-span-4">
          <p className="max-w-[28ch] text-lead text-ink">
            Seven peptides that act on the <span className="whitespace-nowrap">GLP-1</span> receptor, each batch tested before it is sold.
          </p>
          <div className="space-y-3 text-small text-muted">
            <p className="max-w-[60ch]">
              For laboratory research use only. Not for human or veterinary use, and not a medicine, food or cosmetic.
              Content summarises published literature and is not medical advice.
            </p>
            <p className="flex flex-wrap gap-x-4 gap-y-1">
              {LEGAL.map((l) => (
                <Link key={l.href} href={l.href} className="link">
                  {l.label}
                </Link>
              ))}
              <span>© {new Date().getFullYear()} {settings.storeName}</span>
            </p>
          </div>
        </div>
        <nav className="bg-field-grey p-6 md:col-span-6 lg:col-span-3" aria-label="Footer">
          <ul className="grid grid-cols-2 gap-x-4 gap-y-2 lg:grid-cols-1">
            {LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="link decoration-transparent hover:decoration-ink">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <DispatchClock className="md:col-span-6 lg:col-span-2" />
        <div className="flex min-h-56 flex-col justify-between gap-6 bg-surface p-6 md:col-span-6 lg:col-span-3">
          <div>
            <p className="text-small text-muted">Questions, batch certificates, institutional supply</p>
            <a href={`mailto:${settings.supportEmail}`} className="link mt-1 inline-block text-lead break-all">
              {settings.supportEmail}
            </a>
          </div>
          <NewsletterForm />
        </div>
        <div className="grid min-h-40 place-items-center overflow-hidden bg-ink px-4 md:col-span-8 md:min-h-80">
          <p className="text-[clamp(2.75rem,9vw,10rem)] leading-none font-medium tracking-[-0.06em] whitespace-nowrap text-on-navy" translate="no" aria-hidden="true">
            GLP Research
          </p>
        </div>
        <Link
          href="/shop"
          className="press group flex min-h-40 flex-col justify-between bg-accent p-6 text-accent-ink hover:bg-accent-strong md:col-span-4 md:min-h-80"
        >
          <span className="text-index font-medium">Shop the catalogue</span>
          <svg className="size-14 self-end transition-transform duration-300 ease-[var(--ease-out)] group-hover:translate-x-1" viewBox="0 0 56 56" fill="none" aria-hidden="true">
            <path d="M8 28h38M32 14l14 14-14 14" stroke="currentColor" strokeWidth="4" strokeLinecap="square" />
          </svg>
        </Link>
      </div>
    </footer>
  );
}
