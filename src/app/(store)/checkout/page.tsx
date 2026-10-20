import type { Metadata } from "next";
import Link from "next/link";
import { Lock } from "lucide-react";
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
    <div className="bg-slate-50/60">
      <div className="container-page py-10 sm:py-14">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">
              <Lock className="size-3.5" /> Secure checkout
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink-900">Checkout</h1>
          </div>
          {!user ? (
            <p className="text-sm text-slate-600">
              Returning customer?{" "}
              <Link href="/login?next=/checkout" className="font-semibold text-mint-700 hover:underline">
                Sign in
              </Link>
            </p>
          ) : null}
        </div>
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
    </div>
  );
}
