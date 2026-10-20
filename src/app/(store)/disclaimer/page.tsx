import type { Metadata } from "next";
import { LegalPage } from "@/components/store/legal-page";

export const metadata: Metadata = { title: "Research use policy" };

export default function DisclaimerPage() {
  return (
    <LegalPage
      eyebrow="Policy"
      title="Research use policy"
      description="The conditions under which GLP Research supplies its products."
      updated="October 2026"
      content={`## For laboratory research use only

All products sold by GLP Research are supplied **strictly for in-vitro laboratory research** by qualified professionals. They are:

- **not medicines** and have not been approved by the TGA, FDA or any other regulator for any use;
- **not for human or veterinary use** of any kind, including injection, ingestion or topical application;
- **not food, dietary supplements or cosmetics**; and
- **not intended to diagnose, treat, cure, mitigate or prevent any disease**.

## Buyer responsibilities

By placing an order you confirm that:

1. you are at least 18 years of age;
2. you are purchasing for legitimate laboratory research purposes;
3. you or your institution have the training, facilities and approvals needed to handle research chemicals safely; and
4. you are responsible for complying with all laws, regulations and institutional policies that apply to the purchase, possession, handling and disposal of these products where you are located.

## Our right to refuse

We may cancel any order, without explanation, where we have reason to believe products are intended for human or animal use or would otherwise breach this policy. We do not respond to questions about human use, dosing or medical treatment.

## Information on this website

Scientific content on this website summarises published, peer-reviewed literature and regulatory documents for educational and research context. Clinical trial results describe regulated pharmaceutical products studied under controlled conditions; they do not imply that our research materials are suitable for any clinical purpose. Nothing on this site is medical advice.

## Trademarks

Brand names of approved medicines (for example Ozempic®, Wegovy®, Mounjaro® and Zepbound®) are trademarks of their respective owners and are mentioned only to identify the subject of published research. GLP Research is not affiliated with, endorsed by or sponsored by any of these companies.`}
    />
  );
}
