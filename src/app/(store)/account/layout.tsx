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
    <div className="bg-slate-50/60">
      <div className="container-page py-8 sm:py-12">
        <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="mb-4 hidden lg:block">
              <p className="text-xs font-semibold tracking-[0.16em] text-slate-400 uppercase">Signed in as</p>
              <p className="mt-1 truncate text-sm font-semibold text-ink-900">
                {user.firstName} {user.lastName}
              </p>
              <p className="truncate text-xs text-slate-500">{user.email}</p>
            </div>
            <AccountNav />
          </aside>
          <div className="min-w-0">{children}</div>
        </div>
      </div>
    </div>
  );
}
