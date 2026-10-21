import type { Metadata } from "next";
import { LegalPage } from "@/components/store/legal-page";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: "What personal information GLP Research collects, why, who it is shared with and the choices you have.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <LegalPage
      path="/privacy"
      title="Privacy policy"
      lead="What personal information we collect, why we collect it, who we share it with and the choices you have."
      updated="October 2026"
      content={`We respect your privacy and handle personal information in line with the Australian Privacy Principles.

## What we collect

- **Account and order details:** name, email, phone, institution, shipping addresses and order history.
- **Payment references:** we record that a payment was received and its reference. We do not collect or store card numbers; bank transfers and crypto payments are made outside our website.
- **Communications:** messages you send us through the contact form or by email.
- **Technical data:** basic server logs and a session cookie that keeps you signed in. Your cart is stored in your own browser.

## How we use it

To process and ship orders, provide customer support, maintain your account, send transactional emails (order confirmations, payment and shipping updates, password resets), prevent fraud and misuse, and, only if you opt in, send research and product updates.

## Sharing

We share the minimum necessary information with service providers who help us operate: shipping carriers (name, address, phone), email delivery and hosting providers. We do not sell personal information.

## Retention

Order records are kept for as long as required for tax and legal purposes. You can ask us to close your account and delete personal information that we are not required to retain.

## Your choices

You can update your details and marketing preferences in your account at any time, unsubscribe from marketing emails, and request access to or correction of the personal information we hold.

## Security

Passwords are stored as salted hashes, sessions use signed HTTP-only cookies, and access to customer data is restricted to authorised staff.

## Contact

For privacy questions or requests, use our [contact page](/contact).`}
    />
  );
}
