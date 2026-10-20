import type { Metadata } from "next";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { CheckoutForm } from "@/components/checkout/checkout-form";

export const metadata: Metadata = { title: "Checkout", robots: { index: false } };

export default async function CheckoutPage() {
  const [user, settings] = await Promise.all([getCurrentUser(), getSettings()]);
  const addresses = user
    ? await db.address.findMany({ where: { userId: user.id }, orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }] })
    : [];

  return (
    <div className="frame pt-10 pb-24 md:pt-16 md:pb-32">
      <h1 className="mb-10 text-head md:mb-14">Checkout</h1>
      <CheckoutForm
        user={user ? { email: user.email, firstName: user.firstName, lastName: user.lastName, phone: user.phone, institution: user.institution } : null}
        addresses={addresses}
        settings={{
          shippingStandard: settings.shippingStandard,
          shippingExpress: settings.shippingExpress,
          freeShippingThreshold: settings.freeShippingThreshold,
          paymentWindowHours: settings.paymentWindowHours,
          dispatchCutoff: settings.dispatchCutoff,
        }}
      />
    </div>
  );
}
