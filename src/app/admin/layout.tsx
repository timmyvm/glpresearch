import type { Metadata } from "next";
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
  const [claimedPayments, unreadMessages, stockAlerts] = await Promise.all([
    db.order.count({ where: { status: "PENDING_PAYMENT", paymentClaimedAt: { not: null } } }),
    db.contactMessage.count({ where: { status: "NEW" } }),
    db.stockAlert.count({ where: { notifiedAt: null } }),
  ]);

  return (
    <div className="min-h-dvh bg-surface text-sm text-ink print:bg-white">
      <a
        href="#admin-main"
        className="sr-only z-[100] bg-ink px-4 py-3 text-small font-medium text-on-navy focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>
      <AdminSidebar
        counts={{ claimedPayments, unreadMessages, stockAlerts }}
        name={`${admin.firstName} ${admin.lastName}`}
        email={admin.email}
        signOut={signOut}
      />
      <div className="lg:pl-60">
        {/* Canvas: 32px gutters, content capped at 1280px so tables never stretch past use. */}
        <main id="admin-main" className="mx-auto max-w-[1344px] px-4 py-6 sm:px-8 lg:py-8 print:max-w-none print:p-0">
          {children}
        </main>
      </div>
    </div>
  );
}
