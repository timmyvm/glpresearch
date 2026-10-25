"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, LogOut, MapPin, Package, UserRound } from "lucide-react";
import { logout } from "@/app/(store)/(auth)/actions";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/account", label: "Overview", icon: LayoutGrid, exact: true },
  { href: "/account/orders", label: "Orders", icon: Package },
  { href: "/account/addresses", label: "Addresses", icon: MapPin },
  { href: "/account/settings", label: "Profile and Security", icon: UserRound },
];

const item = "flex h-10 shrink-0 items-center gap-2.5 px-3 text-small whitespace-nowrap transition-colors duration-150";

/** Account sections: a labelled list on the page ground, the current one on a grey step. Scrolls sideways on a phone. */
export function AccountNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Account" className="-mx-[var(--margin)] overflow-x-auto px-[var(--margin)] lg:mx-0 lg:overflow-visible lg:px-0">
      <ul className="flex gap-1 lg:flex-col">
        {LINKS.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(item, active ? "bg-paper font-medium text-ink" : "text-muted hover:bg-surface hover:text-ink")}
              >
                <Icon className="size-4" strokeWidth={1.75} aria-hidden="true" />
                {label}
              </Link>
            </li>
          );
        })}
        <li className="lg:mt-4">
          <form action={logout}>
            <button type="submit" className={cn(item, "w-full text-muted hover:bg-surface hover:text-ink")}>
              <LogOut className="size-4" strokeWidth={1.75} aria-hidden="true" />
              Sign Out
            </button>
          </form>
        </li>
      </ul>
    </nav>
  );
}
