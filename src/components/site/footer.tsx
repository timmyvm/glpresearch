import Image from "next/image";
import Link from "next/link";
import { ARCHIVE } from "@/content/credits";
import { getSettings } from "@/lib/settings";
import { Scallops } from "@/components/store/paper";
import { NewsletterForm } from "./newsletter-form";

const LINKS = [
  { href: "/shop", label: "Peptides" },
  { href: "/coa", label: "Lab results" },
  { href: "/research", label: "Research library" },
  { href: "/compare", label: "Compare compounds" },
  { href: "/faq", label: "Questions" },
  { href: "/shipping", label: "Shipping & returns" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

const LEGAL = [
  { href: "/disclaimer", label: "Research use policy" },
  { href: "/terms", label: "Terms of sale" },
  { href: "/privacy", label: "Privacy" },
];

/**
 * The back of the certificate: a paper card with a scalloped top edge, a short sign-off, the
 * address block and a stamp, with the printer's imprint along the bottom. The name returns
 * full width below it.
 */
export async function Footer() {
  const settings = await getSettings();
  const credits = Object.values(ARCHIVE);

  return (
    <footer className="mt-28 overflow-clip bg-field-paper pt-24 md:mt-40 md:pt-32" aria-labelledby="footer-title">
      <div className="frame md:grid md:grid-cols-12 md:gap-x-[var(--gutter)]">
        <div className="relative bg-paper md:col-span-10 md:col-start-2">
          <Scallops />

          <div className="grid gap-12 px-6 pt-8 pb-10 md:grid-cols-2 md:gap-x-16 md:px-14 md:pt-12 md:pb-12">
            <div>
              <h2 id="footer-title" className="text-index font-semibold">
                For the bench
              </h2>
              <p className="mt-4 max-w-[38ch] text-body">
                Seven peptides, one class, every batch tested and its certificate on file. For laboratory research only,
                never for human or veterinary use.
              </p>
              <nav aria-label="Footer" className="mt-8">
                <ul className="grid grid-cols-2 gap-x-6 gap-y-2 text-body">
                  {LINKS.map((l) => (
                    <li key={l.href}>
                      <Link href={l.href} className="link decoration-transparent hover:decoration-ink">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>

            <div className="flex flex-col">
              <div className="flex items-start justify-between gap-6">
                <ul className="space-y-3 text-body sm:text-lead">
                  <li>
                    <a href={`mailto:${settings.supportEmail}`} className="link break-all">
                      {settings.supportEmail}
                    </a>
                  </li>
                  <li>
                    <Link href="/track" className="link">
                      Track an order
                    </Link>
                  </li>
                  <li>
                    <Link href="/coa" className="link">
                      Find a batch certificate
                    </Link>
                  </li>
                  <li>Shipping from Sydney, Australia</li>
                </ul>
                <div className="w-16 shrink-0 bg-white p-1.5 md:w-[88px]">
                  <div className="relative aspect-[3/4] bg-field-paper">
                    <Image src="/images/specimens/semaglutide-10mg.webp" alt="" fill sizes="88px" className="object-contain p-1.5" />
                  </div>
                </div>
              </div>
              <div className="mt-10 md:mt-auto">
                <NewsletterForm />
              </div>
            </div>
          </div>

          <div className="space-y-2 px-6 pb-6 text-center text-small text-muted md:px-14">
            <p className="flex flex-wrap justify-center gap-x-4 gap-y-1">
              <span>
                © {new Date().getFullYear()} {settings.storeName}
              </span>
              {LEGAL.map((l) => (
                <Link key={l.href} href={l.href} className="link">
                  {l.label}
                </Link>
              ))}
            </p>
            <p>
              Archival pictures:{" "}
              {credits.map((c, i) => (
                <span key={c.src}>
                  <a href={c.page} className="link" target="_blank" rel="noopener noreferrer">
                    {c.title}
                  </a>
                  , {c.by}, {c.licence}
                  {i < credits.length - 1 ? "; " : "."}
                </span>
              ))}
            </p>
          </div>
        </div>
      </div>

      <p className="mt-10 text-center text-[16.5vw] leading-[0.78] font-semibold tracking-[-0.06em] whitespace-nowrap text-ink" translate="no" aria-hidden="true">
        GLP Research
      </p>
    </footer>
  );
}
