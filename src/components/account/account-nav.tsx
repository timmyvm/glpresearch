"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, LogOut, MapPin, Package, UserCog } from "lucide-react";
import { logout } from "@/app/(store)/(auth)/actions";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/account", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/account/orders", label: "Orders", icon: Package },
  { href: "/account/addresses", label: "Addresses", icon: MapPin },
  { href: "/account/settings", label: "Profile & security", icon: UserCog },
];

export function AccountNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Account" className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
      {LINKS.map(({ href, label, icon: Icon, exact }) => {
        const active = exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "inline-flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              active ? "bg-ink-900 text-white" : "text-slate-600 hover:bg-ink-50 hover:text-ink-900",
            )}
            aria-current={active ? "page" : undefined}
          >
            <Icon className={cn("size-4", active ? "text-mint-300" : "text-slate-400")} />
            {label}
          </Link>
        );
      })}
      <form action={logout} className="lg:mt-2 lg:border-t lg:border-slate-200 lg:pt-2">
        <button
          type="submit"
          className="inline-flex w-full shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-rose-50 hover:text-rose-700"
        >
          <LogOut className="size-4 text-slate-400" />
          Sign out
        </button>
      </form>
    </nav>
  );
}
