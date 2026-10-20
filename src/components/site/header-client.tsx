"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronDown, FlaskConical, Menu, ShieldCheck, ShoppingBag, User, X } from "lucide-react";
import { cartCount, useCart } from "@/lib/cart";
import { cn } from "@/lib/utils";
import { Logo } from "./logo";

type NavProduct = { slug: string; name: string; subtitle: string; accentColor: string };

const NAV = [
  { href: "/research", label: "Research Library" },
  { href: "/compare", label: "Compare" },
  { href: "/coa", label: "Lab Testing" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function HeaderClient({
  products,
  user,
}: {
  products: NavProduct[];
  user: { firstName: string; role: string } | null;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const items = useCart((s) => s.items);
  const setCartOpen = useCart((s) => s.setOpen);
  const count = mounted ? cartCount(items) : 0;

  // eslint-disable-next-line react-hooks/set-state-in-effect -- cart lives in localStorage, so only count after hydration
  useEffect(() => setMounted(true), []);
  // Close menus when the route changes (adjusting state during render, per React docs).
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setMobileOpen(false);
    setShopOpen(false);
  }

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl">
      <div className="container-page flex h-16 items-center gap-6">
        <Logo />

        <nav className="hidden flex-1 items-center gap-1 lg:flex" aria-label="Main">
          <div className="relative" onMouseEnter={() => setShopOpen(true)} onMouseLeave={() => setShopOpen(false)}>
            <Link
              href="/shop"
              className={cn(
                "inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive("/shop") ? "text-ink-900" : "text-slate-600 hover:text-ink-900",
              )}
              aria-expanded={shopOpen}
            >
              Peptides <ChevronDown className="size-3.5 opacity-60" />
            </Link>
            {shopOpen ? (
              <div className="absolute top-full left-0 w-[560px] pt-2">
                <div className="grid grid-cols-2 gap-1 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl shadow-ink-900/10">
                  {products.map((p) => (
                    <Link
                      key={p.slug}
                      href={`/shop/${p.slug}`}
                      className="flex items-start gap-3 rounded-xl p-3 transition-colors hover:bg-ink-50"
                    >
                      <span className="mt-1.5 size-2 shrink-0 rounded-full" style={{ backgroundColor: p.accentColor }} />
                      <span>
                        <span className="block text-sm font-semibold text-ink-900">{p.name}</span>
                        <span className="block text-xs text-slate-500">{p.subtitle}</span>
                      </span>
                    </Link>
                  ))}
                  <Link
                    href="/shop"
                    className="col-span-2 mt-1 flex items-center justify-between rounded-xl bg-ink-900 px-4 py-3 text-sm font-semibold text-white hover:bg-ink-800"
                  >
                    <span className="inline-flex items-center gap-2">
                      <FlaskConical className="size-4 text-mint-300" /> View full catalogue
                    </span>
                    <span className="text-xs font-normal text-ink-200">Every batch HPLC + MS verified</span>
                  </Link>
                </div>
              </div>
            ) : null}
          </div>
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive(item.href) ? "text-ink-900" : "text-slate-600 hover:text-ink-900",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1">
          {user?.role === "ADMIN" ? (
            <Link
              href="/admin"
              className="hidden items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-mint-700 hover:bg-mint-50 sm:inline-flex"
            >
              <ShieldCheck className="size-4" /> Admin
            </Link>
          ) : null}
          <Link
            href={user ? "/account" : "/login"}
            className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-ink-50 hover:text-ink-900"
          >
            <User className="size-4" />
            <span className="hidden sm:inline">{user ? user.firstName : "Sign in"}</span>
          </Link>
          <button
            type="button"
            onClick={() => setCartOpen(true)}
            className="relative inline-flex items-center gap-2 rounded-lg bg-ink-900 px-3 py-2 text-sm font-semibold text-white hover:bg-ink-800"
            aria-label={`Open cart (${count} items)`}
          >
            <ShoppingBag className="size-4" />
            <span className="hidden sm:inline">Cart</span>
            <span className="grid min-w-5 place-items-center rounded-full bg-mint-400 px-1 text-[11px] font-bold text-ink-950">
              {count}
            </span>
          </button>
          <button
            type="button"
            className="ml-1 inline-flex size-10 items-center justify-center rounded-lg text-ink-900 hover:bg-ink-50 lg:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {mobileOpen ? (
        <div className="border-t border-slate-200 bg-white lg:hidden">
          <nav className="container-page max-h-[calc(100dvh-4rem)] space-y-6 overflow-y-auto py-6" aria-label="Mobile">
            <div>
              <p className="eyebrow mb-3">Peptides</p>
              <div className="grid gap-1 sm:grid-cols-2">
                {products.map((p) => (
                  <Link key={p.slug} href={`/shop/${p.slug}`} className="flex items-center gap-3 rounded-lg p-2 hover:bg-ink-50">
                    <span className="size-2 rounded-full" style={{ backgroundColor: p.accentColor }} />
                    <span className="text-sm font-semibold">{p.name}</span>
                    <span className="truncate text-xs text-slate-500">{p.subtitle}</span>
                  </Link>
                ))}
              </div>
              <Link href="/shop" className="mt-2 inline-block text-sm font-semibold text-mint-700">
                View all peptides →
              </Link>
            </div>
            <div className="grid gap-1 border-t border-slate-100 pt-4">
              {NAV.map((item) => (
                <Link key={item.href} href={item.href} className="rounded-lg px-2 py-2.5 text-base font-medium hover:bg-ink-50">
                  {item.label}
                </Link>
              ))}
              <Link href="/faq" className="rounded-lg px-2 py-2.5 text-base font-medium hover:bg-ink-50">
                FAQ
              </Link>
              <Link href="/track" className="rounded-lg px-2 py-2.5 text-base font-medium hover:bg-ink-50">
                Track an order
              </Link>
              {user?.role === "ADMIN" ? (
                <Link href="/admin" className="rounded-lg px-2 py-2.5 text-base font-medium text-mint-700 hover:bg-mint-50">
                  Admin panel
                </Link>
              ) : null}
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
