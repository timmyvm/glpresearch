import type { Metadata } from "next";
import { PackageSearch } from "lucide-react";
import { TrackForm } from "@/components/checkout/track-form";

export const metadata: Metadata = {
  title: "Track an order",
  description: "Check the status of your GLP Research order with your order number and email.",
};

export default function TrackPage() {
  return (
    <div className="container-page py-12 sm:py-20">
      <div className="mx-auto max-w-lg">
        <div className="mb-8 text-center">
          <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-ink-900 text-mint-300">
            <PackageSearch className="size-6" />
          </span>
          <h1 className="mt-5 text-3xl font-semibold tracking-tight text-ink-900">Track your order</h1>
          <p className="mt-2 text-sm text-slate-600">
            Enter the order number from your confirmation email (e.g. <span className="font-mono">GLP-10245</span>) and the
            email you used at checkout.
          </p>
        </div>
        <TrackForm />
      </div>
    </div>
  );
}
