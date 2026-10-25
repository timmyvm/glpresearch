import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { CartDrawer } from "@/components/site/cart-drawer";
import { getSettings } from "@/lib/settings";

// Public pages are static. Admin edits, orders and stock changes refresh them at once
// (see lib/revalidate.ts); this hourly refresh is the backstop.
export const revalidate = 3600;

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();
  return (
    <div className="flex min-h-dvh flex-col">
      <Header />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer />
      <CartDrawer freeShippingThreshold={settings.freeShippingThreshold} />
    </div>
  );
}
