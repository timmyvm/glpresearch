import type { Metadata } from "next";
import { LegalPage } from "@/components/store/legal-page";

export const metadata: Metadata = { title: "Terms of sale" };

export default function TermsPage() {
  return (
    <LegalPage
      path="/terms"
      title="Terms of sale"
      lead="The conditions that apply to every order placed with GLP Research, read together with the research use policy."
      updated="October 2026"
      content={`These terms apply to all orders placed with GLP Research ("we", "us"). By placing an order you agree to them. Please also read our [Research use policy](/disclaimer), which forms part of these terms.

## 1. Eligibility

You must be at least 18 years old and purchasing for legitimate laboratory research. We may ask for evidence of institutional affiliation for some orders.

## 2. Orders and acceptance

An order is an offer to purchase. A contract is formed when we confirm payment and dispatch. We may decline or cancel any order, including for suspected breach of the research use policy, pricing errors or stock unavailability; any payment received for a cancelled order will be refunded in full.

## 3. Prices and payment

Prices are listed in Australian dollars. We accept bank transfer, PayID and cryptocurrency. Payment must be received within the payment window shown at checkout, using the order number as the reference. Cryptocurrency payments must be for the exact amount quoted; under- or over-payments may delay processing.

## 4. Shipping and risk

Delivery times are estimates. Risk passes to you on delivery to the address you provide. See [Shipping & returns](/shipping) for details on damaged, lost or incorrect items.

## 5. Product information

We take care to ensure product descriptions and scientific information are accurate, but literature summaries are provided for research context only. Batch test results are published as reported by the testing laboratory.

## 6. Use of products

Products must be used only for in-vitro laboratory research, handled by qualified people in suitable facilities, and stored and disposed of in accordance with applicable regulations and their safety data.

## 7. Liability

To the extent permitted by law, our liability for any claim relating to a product is limited to replacing the product or refunding its price. We are not liable for any loss arising from use of a product contrary to these terms or the research use policy. Nothing in these terms excludes rights you have under the Australian Consumer Law that cannot lawfully be excluded.

## 8. Accounts

You are responsible for keeping your account credentials secure and for activity under your account. We may suspend accounts that breach these terms.

## 9. Changes

We may update these terms from time to time. The version in force when you place an order applies to that order.

## 10. Contact

Questions about these terms can be sent via our [contact page](/contact).`}
    />
  );
}
