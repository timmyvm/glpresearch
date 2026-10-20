"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Boxes,
  ClipboardList,
  FileText,
  FlaskConical,
  LayoutDashboard,
  Mail,
  MailCheck,
  Menu,
  Package,
  Settings,
  Tag,
  Users,
  X,
} from "lucide-react";
import { Logo } from "@/components/site/logo";
import { cn } from "@/lib/utils";

type NavItem = { href: string; label: string; icon: React.ComponentType<{ className?: string }>; badge?: number };

export function AdminSidebar({ pendingOrders, unreadMessages }: { pendingOrders: number; unreadMessages: number }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const groups: { title: string; items: NavItem[] }[] = [
    {
      title: "Overview",
      items: [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard }],
    },
    {
      title: "Sales",
      items: [
        { href: "/admin/orders", label: "Orders", icon: ClipboardList, badge: pendingOrders },
        { href: "/admin/customers", label: "Customers", icon: Users },
        { href: "/admin/coupons", label: "Coupons", icon: Tag },
      ],
    },
    {
      title: "Catalogue",
      items: [
        { href: "/admin/products", label: "Products", icon: Package },
        { href: "/admin/inventory", label: "Inventory", icon: Boxes },
        { href: "/admin/batches", label: "Batches & COAs", icon: FlaskConical },
      ],
    },
    {
      title: "Content & comms",
      items: [
        { href: "/admin/articles", label: "Articles", icon: FileText },
        { href: "/admin/messages", label: "Inbox", icon: Mail, badge: unreadMessages },
        { href: "/admin/emails", label: "Email log", icon: MailCheck },
      ],
    },
    {
      title: "Store",
      items: [{ href: "/admin/settings", label: "Settings", icon: Settings }],
    },
  ];

  const isActive = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));

  const nav = (
    <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5" aria-label="Admin">
      {groups.map((group) => (
        <div key={group.title}>
          <p className="px-3 pb-2 text-[10px] font-semibold tracking-[0.18em] text-ink-400 uppercase">{group.title}</p>
          <ul className="space-y-0.5">
            {group.items.map((item) => {
              const active = isActive(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      active ? "bg-white/10 text-white" : "text-ink-300 hover:bg-white/5 hover:text-white",
                    )}
                  >
                    <item.icon className={cn("size-4", active ? "text-mint-300" : "text-ink-400")} />
                    <span className="flex-1">{item.label}</span>
                    {item.badge ? (
                      <span className="grid min-w-5 place-items-center rounded-full bg-mint-400 px-1.5 text-[10px] font-bold text-ink-950">
                        {item.badge}
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

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed top-3 left-3 z-40 inline-flex size-10 items-center justify-center rounded-lg bg-ink-950 text-white shadow-lg lg:hidden print:hidden"
        aria-label="Open admin menu"
      >
        <Menu className="size-5" />
      </button>

      {open ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-ink-950/60 backdrop-blur-sm lg:hidden"
          onClick={() => setOpen(false)}
          aria-label="Close admin menu"
        />
      ) : null}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-ink-950 transition-transform lg:translate-x-0 print:hidden",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-white/10 px-5">
          <Logo tone="light" />
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-lg p-1.5 text-ink-300 hover:bg-white/10 hover:text-white lg:hidden"
            aria-label="Close admin menu"
          >
            <X className="size-5" />
          </button>
        </div>
        {nav}
        <div className="border-t border-white/10 px-5 py-4">
          <p className="text-[11px] leading-relaxed text-ink-400">GLP Research admin · research use only catalogue</p>
        </div>
      </aside>
    </>
  );
}
