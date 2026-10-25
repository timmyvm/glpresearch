"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Bell,
  Boxes,
  ClipboardList,
  CreditCard,
  ExternalLink,
  FileText,
  FlaskConical,
  LayoutGrid,
  LogOut,
  Mail,
  MailCheck,
  Package,
  Settings,
  Tag,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = { href: string; label: string; icon: React.ComponentType<{ className?: string }>; count?: number };

export type SidebarCounts = { claimedPayments: number; unreadMessages: number; stockAlerts: number };

function groups(c: SidebarCounts): { title: string; items: NavItem[] }[] {
  return [
    { title: "", items: [{ href: "/admin", label: "Overview", icon: LayoutGrid }] },
    {
      title: "Sales",
      items: [
        { href: "/admin/orders", label: "Orders", icon: ClipboardList },
        { href: "/admin/orders?claimed=1", label: "Payments to check", icon: CreditCard, count: c.claimedPayments },
        { href: "/admin/customers", label: "Customers", icon: Users },
        { href: "/admin/coupons", label: "Coupons", icon: Tag },
      ],
    },
    {
      title: "Catalogue",
      items: [
        { href: "/admin/products", label: "Products", icon: Package },
        { href: "/admin/inventory", label: "Inventory", icon: Boxes },
        { href: "/admin/stock-alerts", label: "Stock alerts", icon: Bell, count: c.stockAlerts },
        { href: "/admin/batches", label: "Batch certificates", icon: FlaskConical },
      ],
    },
    {
      title: "Content",
      items: [
        { href: "/admin/articles", label: "Articles", icon: FileText },
        { href: "/admin/messages", label: "Inbox", icon: Mail, count: c.unreadMessages },
        { href: "/admin/emails", label: "Email log", icon: MailCheck },
      ],
    },
    { title: "Store", items: [{ href: "/admin/settings", label: "Settings", icon: Settings }] },
  ];
}

function useIsActive(hrefs: string[]) {
  const pathname = usePathname();
  const params = useSearchParams();
  // A query view (Payments to check) is active when its params all match; its list is active otherwise.
  const matchesQuery = (href: string) => {
    const [path, query] = href.split("?");
    return pathname === path && [...new URLSearchParams(query)].every(([k, v]) => params.get(k) === v);
  };
  const queryHit = hrefs.some((h) => h.includes("?") && matchesQuery(h));
  return (href: string) => {
    if (href.includes("?")) return matchesQuery(href);
    if (href === "/admin") return pathname === "/admin";
    const onPath = pathname === href || pathname.startsWith(`${href}/`);
    return onPath && !(queryHit && pathname === href);
  };
}

function NavList({ counts, onNavigate }: { counts: SidebarCounts; onNavigate?: () => void }) {
  const isActive = useIsActive(groups(counts).flatMap((g) => g.items.map((i) => i.href)));
  return (
    <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4" aria-label="Admin">
      {groups(counts).map((group, gi) => (
        <div key={gi}>
          {group.title ? <p className="px-2 pb-1.5 text-small text-muted">{group.title}</p> : null}
          <ul>
            {group.items.map((item) => {
              const active = isActive(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex h-9 items-center gap-2.5 px-2 text-sm transition-colors duration-150",
                      active ? "bg-surface text-ink" : "text-muted hover:bg-surface/60 hover:text-ink",
                    )}
                  >
                    <item.icon className="size-4 shrink-0" aria-hidden="true" />
                    <span className="flex-1 truncate">{item.label}</span>
                    {item.count ? (
                      <span className="tabular min-w-5 bg-ink px-1.5 text-center text-small leading-5 text-on-navy" aria-label={`${item.count} waiting`}>
                        {item.count}
                      </span>
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

function Brand() {
  return (
    <Link href="/admin" className="flex items-center gap-2.5" aria-label="GLP Research admin, overview">
      <span className="grid size-8 place-items-center bg-surface">
        <Image src="/images/logo-peak.webp" alt="" width={20} height={20} />
      </span>
      <span className="leading-tight">
        <span className="block text-sm font-medium text-ink" translate="no">
          GLP Research
        </span>
        <span className="block text-small text-muted">Admin</span>
      </span>
    </Link>
  );
}

function Footer({ name, email, signOut }: { name: string; email: string; signOut: () => Promise<void> }) {
  return (
    <div className="space-y-1 border-t border-surface-2 px-3 py-3">
      <Link href="/" className="flex h-9 items-center gap-2.5 px-2 text-sm text-muted hover:bg-surface/60 hover:text-ink">
        <ExternalLink className="size-4" aria-hidden="true" /> View store
      </Link>
      <div className="flex items-center justify-between gap-2 px-2 pt-1">
        <div className="min-w-0 leading-tight">
          <p className="truncate text-sm text-ink">{name}</p>
          <p className="truncate text-small text-muted">{email}</p>
        </div>
        <form action={signOut}>
          <button type="submit" className="press grid size-9 place-items-center text-muted hover:bg-surface hover:text-ink" aria-label="Sign out">
            <LogOut className="size-4" aria-hidden="true" />
          </button>
        </form>
      </div>
    </div>
  );
}

export function AdminSidebar({
  counts,
  name,
  email,
  signOut,
}: {
  counts: SidebarCounts;
  name: string;
  email: string;
  signOut: () => Promise<void>;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
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

  return (
    <>
      {/* Desktop: labelled sidebar on the page ground, separated by one rule */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-surface-2 bg-white lg:flex print:hidden">
        <div className="flex h-16 items-center px-5">
          <Brand />
        </div>
        <NavList counts={counts} />
        <Footer name={name} email={email} signOut={signOut} />
      </aside>

      {/* Phone and tablet: a 48px top bar and a full-screen sheet */}
      <div className="sticky top-0 z-30 flex h-12 items-center justify-between border-b border-ink/10 bg-white px-4 lg:hidden print:hidden">
        <Brand />
        <button type="button" onClick={() => setOpen(true)} className="press h-10 px-2 text-sm font-medium text-ink" aria-expanded={open} aria-controls="admin-menu">
          Menu
        </button>
      </div>
      {open ? (
        <div id="admin-menu" className="fixed inset-0 z-50 flex flex-col overscroll-contain bg-white lg:hidden" role="dialog" aria-modal="true" aria-label="Admin menu">
          <div className="flex h-12 items-center justify-between border-b border-surface-2 px-4">
            <Brand />
            <button type="button" onClick={() => setOpen(false)} className="press h-10 px-2 text-sm font-medium text-ink">
              Close
            </button>
          </div>
          <NavList counts={counts} onNavigate={() => setOpen(false)} />
          <Footer name={name} email={email} signOut={signOut} />
        </div>
      ) : null}
    </>
  );
}
