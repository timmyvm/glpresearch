import { cookies } from "next/headers";
import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { CartDrawer } from "@/components/site/cart-drawer";
import { AgeGate } from "@/components/site/age-gate";
import { getSettings } from "@/lib/settings";

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const [settings, jar] = await Promise.all([getSettings(), cookies()]);
  const acknowledged = jar.get("glp_ack")?.value === "1";
  return (
    <div className="flex min-h-dvh flex-col">
      {acknowledged ? null : <AgeGate />}
      <Header />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer />
      <CartDrawer freeShippingThreshold={settings.freeShippingThreshold} />
    </div>
  );
}
