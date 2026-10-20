import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, LogOut } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { AdminSidebar } from "@/components/admin/sidebar";
import { signOut } from "./actions";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Admin · GLP Research" },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  const [pendingOrders, unreadMessages] = await Promise.all([
    db.order.count({ where: { status: "PENDING_PAYMENT" } }),
    db.contactMessage.count({ where: { status: "NEW" } }),
  ]);

  return (
    <div className="min-h-dvh bg-slate-50">
      <AdminSidebar pendingOrders={pendingOrders} unreadMessages={unreadMessages} />
      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-end gap-2 border-b border-slate-200 bg-white/90 px-4 backdrop-blur sm:px-6 print:hidden">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-ink-900"
          >
            <ExternalLink className="size-4" /> <span className="hidden sm:inline">View store</span>
          </Link>
          <div className="mx-1 hidden h-6 w-px bg-slate-200 sm:block" />
          <div className="flex items-center gap-2.5 px-2">
            <span className="grid size-8 place-items-center rounded-full bg-ink-900 text-xs font-semibold text-white">
              {admin.firstName[0]}
              {admin.lastName[0]}
            </span>
            <div className="hidden leading-tight sm:block">
              <p className="text-sm font-semibold text-ink-900">
                {admin.firstName} {admin.lastName}
              </p>
              <p className="text-xs text-slate-500">{admin.email}</p>
            </div>
          </div>
          <form action={signOut}>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-rose-50 hover:text-rose-700"
            >
              <LogOut className="size-4" /> <span className="hidden sm:inline">Sign out</span>
            </button>
          </form>
        </header>
        <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8 print:p-0">{children}</main>
      </div>
    </div>
  );
}
