import type { Metadata } from "next";
import { Clock, Mail, MessageSquare, PackageSearch } from "lucide-react";
import Link from "next/link";
import { getSettings } from "@/lib/settings";
import { PageHero } from "@/components/store/page-hero";
import { ContactForm } from "./contact-form";

export const metadata: Metadata = {
  title: "Contact",
  description: "Questions about an order, a batch certificate or institutional supply? Get in touch with GLP Research.",
};

export default async function ContactPage({ searchParams }: { searchParams: Promise<{ order?: string }> }) {
  const [settings, { order }] = await Promise.all([getSettings(), searchParams]);
  return (
    <>
      <PageHero eyebrow="Contact" title="Talk to our team" description="Order questions, batch certificates, institutional supply — we reply within one business day." />
      <section className="container-page grid gap-12 py-16 lg:grid-cols-[1fr_380px]">
        <div className="rounded-3xl border border-slate-200 p-6 sm:p-8">
          <h2 className="text-xl font-semibold">Send a message</h2>
          <p className="mt-1 text-sm text-slate-500">All fields except order number are required.</p>
          <ContactForm defaultOrder={order?.slice(0, 40)} />
        </div>
        <aside className="space-y-4">
          {[
            { icon: Mail, title: "Email", body: <a href={`mailto:${settings.supportEmail}`} className="font-medium text-mint-700 hover:underline">{settings.supportEmail}</a> },
            { icon: Clock, title: "Hours", body: "Monday–Friday, 9am–5pm AEST. Messages received after hours are answered next business day." },
            { icon: PackageSearch, title: "Where's my order?", body: <>Use <Link href="/track" className="font-medium text-mint-700 hover:underline">order tracking</Link> or sign in to <Link href="/account/orders" className="font-medium text-mint-700 hover:underline">your account</Link> for live status.</> },
            { icon: MessageSquare, title: "Institutional supply", body: "Recurring or bulk orders for research groups — choose “Bulk / institutional pricing” as the subject." },
          ].map((c) => (
            <div key={c.title} className="flex gap-4 rounded-2xl border border-slate-200 p-5">
              <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-mint-50 text-mint-700">
                <c.icon className="size-5" />
              </div>
              <div className="text-sm">
                <p className="font-semibold text-ink-900">{c.title}</p>
                <div className="mt-1 leading-relaxed text-slate-600">{c.body}</div>
              </div>
            </div>
          ))}
          <p className="rounded-2xl bg-amber-50 p-4 text-xs leading-relaxed text-amber-900 ring-1 ring-amber-200">
            We can&apos;t provide advice on human use, dosing or medical treatment. Questions of that kind will not be
            answered.
          </p>
        </aside>
      </section>
    </>
  );
}
