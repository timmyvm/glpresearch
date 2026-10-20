import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { AccountNav } from "@/components/account/account-nav";

export const metadata: Metadata = {
  title: { default: "My account", template: "%s · My account · GLP Research" },
  robots: { index: false, follow: false },
};

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser("/account");
  return (
    <div className="frame grid gap-8 pt-6 pb-24 lg:grid-cols-[224px_minmax(0,1fr)] lg:gap-12 lg:pt-12 lg:pb-32">
      <aside className="min-w-0 print:hidden lg:sticky lg:top-24 lg:self-start">
        <div className="mb-5 hidden px-3 lg:block">
          <p className="truncate text-small font-medium">
            {user.firstName} {user.lastName}
          </p>
          <p className="truncate text-small text-muted">{user.email}</p>
        </div>
        <AccountNav />
      </aside>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
