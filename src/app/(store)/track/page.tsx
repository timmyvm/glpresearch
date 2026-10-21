import type { Metadata } from "next";
import Image from "next/image";
import { TrackForm } from "@/components/checkout/track-form";

export const metadata: Metadata = {
  title: "Track an order",
  description: "Check the status of your GLP Research order with your order number and email.",
  alternates: { canonical: "/track" },
};

export default function TrackPage() {
  return (
    <div className="frame grid gap-10 py-12 md:grid-cols-12 md:gap-6 md:py-16">
      <div className="md:col-span-6 lg:col-span-5">
        <h1 className="text-head">Track an order</h1>
        <p className="mt-4 max-w-[42ch] text-muted">
          Enter the order number from your confirmation email and the email you used at checkout. You&apos;ll see the
          payment details, progress and tracking number.
        </p>
        <TrackForm />
      </div>
      <figure className="relative hidden min-h-[30rem] overflow-clip bg-field-grey md:col-span-6 md:col-start-7 md:block">
        <Image src="/images/packaging.webp" alt="An insulated shipping box with three vials, a cold pack and a certificate" fill sizes="45vw" className="object-cover mix-blend-multiply grayscale contrast-[1.1]" />
        <figcaption className="absolute bottom-0 left-0 bg-white px-4 py-2.5 text-small text-ink">
          Each order ships insulated, with a cold pack and its batch references.
        </figcaption>
      </figure>
    </div>
  );
}
