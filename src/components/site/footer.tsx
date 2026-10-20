import Link from "next/link";
import { FlaskConical, Mail } from "lucide-react";
import { db } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { Logo } from "./logo";
import { NewsletterForm } from "./newsletter-form";

export async function Footer() {
  const [settings, products] = await Promise.all([
    getSettings(),
    db.product.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
      select: { slug: true, name: true },
    }),
  ]);

  const columns = [
    {
      title: "Peptides",
      links: [...products.map((p) => ({ href: `/shop/${p.slug}`, label: p.name })), { href: "/shop", label: "All peptides" }],
    },
    {
      title: "Science",
      links: [
        { href: "/research", label: "Research library" },
        { href: "/compare", label: "Compound comparison" },
        { href: "/research/glossary", label: "Glossary" },
        { href: "/coa", label: "Certificates of analysis" },
      ],
    },
    {
      title: "Support",
      links: [
        { href: "/account", label: "My account" },
        { href: "/track", label: "Track an order" },
        { href: "/shipping", label: "Shipping & returns" },
        { href: "/faq", label: "FAQ" },
        { href: "/contact", label: "Contact us" },
      ],
    },
    {
      title: "Company",
      links: [
        { href: "/about", label: "About" },
        { href: "/disclaimer", label: "Research use policy" },
        { href: "/terms", label: "Terms of sale" },
        { href: "/privacy", label: "Privacy policy" },
      ],
    },
  ];

  return (
    <footer className="mt-24 bg-ink-950 text-ink-200">
      <div className="container-page grid gap-12 py-16 lg:grid-cols-[1.2fr_2fr]">
        <div className="space-y-6">
          <Logo tone="light" />
          <p className="max-w-sm text-sm leading-relaxed text-ink-300">
            Research-grade incretin receptor agonists, independently verified by HPLC and mass spectrometry — and a
            library that explains the science behind them.
          </p>
          <div>
            <p className="mb-2 text-sm font-semibold text-white">Research updates</p>
            <p className="mb-3 text-xs text-ink-300">New compounds, batch releases and literature reviews. No spam.</p>
            <NewsletterForm />
          </div>
          <a href={`mailto:${settings.supportEmail}`} className="inline-flex items-center gap-2 text-sm text-ink-200 hover:text-white">
            <Mail className="size-4 text-mint-300" /> {settings.supportEmail}
          </a>
        </div>
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          {columns.map((col) => (
            <div key={col.title}>
              <p className="text-xs font-semibold tracking-[0.16em] text-white uppercase">{col.title}</p>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-ink-300 transition-colors hover:text-mint-300">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-page py-6">
          <div className="flex gap-3 rounded-2xl bg-white/5 p-4 text-xs leading-relaxed text-ink-300 ring-1 ring-white/10">
            <FlaskConical className="mt-0.5 size-4 shrink-0 text-mint-300" />
            <p>
              <strong className="text-ink-100">Research use only.</strong> All products sold by {settings.storeName} are
              intended solely for in-vitro laboratory research by qualified professionals. They are not medicines, are
              not intended for human or veterinary use, and must not be used to diagnose, treat, cure or prevent any
              disease. Information on this website summarises published scientific literature for educational purposes
              and is not medical advice. Statements have not been evaluated by the TGA, FDA or any regulatory body.
            </p>
          </div>
          <div className="mt-6 flex flex-col gap-2 text-xs text-ink-400 sm:flex-row sm:items-center sm:justify-between">
            <p>
              © {new Date().getFullYear()} {settings.storeName}. All rights reserved.
            </p>
            <p>Prices in AUD · Payments by bank transfer, PayID or crypto</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
