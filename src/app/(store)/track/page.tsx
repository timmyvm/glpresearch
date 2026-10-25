import type { Metadata } from "next";
import Image from "next/image";
import { TrackForm } from "@/components/checkout/track-form";
import { Slip, SlipRow } from "@/components/store/paper";

export const metadata: Metadata = {
  title: "Track an order",
  description: "Check the status of your GLP Research order with your order number and email.",
  alternates: { canonical: "/track" },
};

export default function TrackPage() {
  return (
    <div className="frame grid gap-12 pt-12 pb-4 md:grid-cols-12 md:gap-x-[var(--gutter)] md:pt-20">
      <div className="md:col-span-6 lg:col-span-5">
        <h1 className="text-display font-semibold">Track an order</h1>
        <p className="mt-6 max-w-[42ch] text-lead" data-load style={{ "--d": "260ms" } as React.CSSProperties}>
          Enter the order number from your confirmation email and the email you used at checkout.
        </p>
        <TrackForm />
      </div>

      <div className="md:col-span-6 md:col-start-7 md:pt-4">
        <div className="relative">
          <figure className="relative hidden aspect-[4/5] overflow-clip bg-surface md:block" data-load style={{ "--d": "320ms" } as React.CSSProperties}>
            <Image src="/images/lab/packing.webp" alt="Vials packed in foam with a cold pack and a packing slip" fill preload sizes="45vw" className="object-cover" />
          </figure>
          <Slip as="section" className="px-6 pt-7 pb-10 md:absolute md:bottom-10 md:-left-14 md:w-[23rem] lg:px-8" aria-labelledby="track-shows" data-load style={{ "--d": "420ms" } as React.CSSProperties}>
            <h2 id="track-shows" className="text-lead font-semibold">
              What you&apos;ll see
            </h2>
            <dl className="mt-4 space-y-2 text-body">
              {[
                ["Payment", "Status and details"],
                ["Progress", "Each step, dated"],
                ["Tracking", "Carrier number"],
                ["Batch numbers", "Per vial"],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="sr-only">{label}</dt>
                  <dd>
                    <SlipRow label={label} value={value} />
                  </dd>
                </div>
              ))}
            </dl>
            <p className="mt-6 max-w-[34ch] text-small text-muted">Every order ships insulated, with a cold pack and a slip of its batch numbers.</p>
          </Slip>
        </div>
      </div>
    </div>
  );
}
