"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";
import { cartCount, useCart } from "@/lib/cart";
import { HINT_COOKIE, parseHint } from "@/lib/session-hint";
import { useCookie } from "@/lib/use-cookie";
import { cn } from "@/lib/utils";
import { Logo } from "./logo";

const NAV = [
  { href: "/shop", label: "Peptides" },
  { href: "/research", label: "Research" },
  { href: "/coa", label: "Lab Results" },
  { href: "/about", label: "About" },
];

const subscribe = () => () => {};
const useHydrated = () => useSyncExternalStore(subscribe, () => true, () => false);

export function HeaderClient() {
  const pathname = usePathname();
  // Read in the browser so every public page can be served as static HTML.
  const user = parseHint(useCookie(HINT_COOKIE));
  const hydrated = useHydrated();
  const [open, setOpen] = useState(false);
  const count = useCart((s) => cartCount(s.items));
  const setCartOpen = useCart((s) => s.setOpen);
  const shown = hydrated ? count : 0;

  // Close the sheet when the route changes (state adjusted during render).
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  const account = user ? (user.admin ? { href: "/admin", label: "Admin" } : { href: "/account", label: "Account" }) : { href: "/login", label: "Sign In" };

  return (
    <header className="sticky top-0 z-40 bg-bg">
      <div className="frame flex h-16 items-center gap-8">
        <Logo />
        <nav className="hidden items-center gap-7 md:flex" aria-label="Main">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={cn(
                "link text-small decoration-transparent",
                isActive(item.href) ? "text-ink decoration-ink" : "text-muted hover:text-ink",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-5">
          <Link href="/search" className="link hidden text-small text-muted decoration-transparent hover:text-ink sm:inline" aria-current={isActive("/search") ? "page" : undefined}>
            Search
          </Link>
          <Link href={account.href} className="link hidden text-small text-muted decoration-transparent hover:text-ink sm:inline">
            {user && !user.admin && user.name ? user.name : account.label}
          </Link>
          <button
            type="button"
            onClick={() => setCartOpen(true)}
            className="press inline-flex h-10 items-center gap-2 bg-ink px-4 text-small font-medium text-on-navy hover:bg-ink-800"
            aria-label={`Cart, ${shown} ${shown === 1 ? "item" : "items"}`}
          >
            Cart <span className="tabular min-w-4 text-center text-accent">{shown}</span>
          </button>
          <button
            type="button"
            className="press -mr-2 h-10 px-2 text-small font-medium text-ink md:hidden"
            onClick={() => setOpen(true)}
            aria-expanded={open}
            aria-controls="site-menu"
          >
            Menu
          </button>
        </div>
      </div>

      {open ? (
        <div id="site-menu" className="fixed inset-0 z-50 flex flex-col overscroll-contain bg-ink text-on-navy md:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <div className="frame flex h-16 items-center justify-between">
            <Logo tone="light" />
            <button type="button" className="press h-10 px-2 text-small font-medium" onClick={() => setOpen(false)}>
              Close
            </button>
          </div>
          <nav className="frame mt-6 flex flex-col gap-1" aria-label="Mobile">
            {[{ href: "/", label: "Home" }, ...NAV, { href: "/compare", label: "Compare" }, { href: "/search", label: "Search" }, { href: "/faq", label: "Questions" }, { href: "/contact", label: "Contact" }].map((item) => (
              <Link key={item.href} href={item.href} className="py-2 text-head">
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="frame mt-auto flex gap-6 pb-[max(2rem,env(safe-area-inset-bottom))] text-lead">
            <Link href={account.href} className="link">{account.label}</Link>
            <Link href="/track" className="link">Track an Order</Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}
