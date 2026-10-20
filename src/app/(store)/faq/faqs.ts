export type FaqGroup = { title: string; items: { q: string; a: string }[] };

export const FAQS: FaqGroup[] = [
  {
    title: "Products & quality",
    items: [
      {
        q: "Are your products for human use?",
        a: "No. Every product we sell is intended strictly for in-vitro and laboratory research by qualified professionals. They are not medicines, are not manufactured for human or veterinary use, and must not be administered to people or animals. We will cancel orders where we have reason to believe this policy will not be followed.",
      },
      {
        q: "How is purity verified?",
        a: "Each manufacturing batch is tested by an independent analytical laboratory before release. Purity is measured by reverse-phase HPLC with UV detection at 214 nm, and identity is confirmed by electrospray mass spectrometry against the theoretical molecular mass. Our release specification is ≥99.0% purity. Results are published on our Lab Testing page and searchable by batch number.",
      },
      {
        q: "Where do I find the certificate of analysis for my vial?",
        a: "The batch number is printed on every vial label and on your packing slip. Enter it on the Lab Testing (COA) page to see the purity result, mass-spec identity confirmation, testing laboratory and test date. Each product page also lists its current published batches.",
      },
      {
        q: "What form are the peptides supplied in?",
        a: "All peptides are supplied as a sterile-filtered, lyophilized (freeze-dried) powder in a 3 mL borosilicate glass vial, sealed with a butyl rubber stopper and aluminium flip-off crimp cap under a nitrogen headspace.",
      },
      {
        q: "Why do you only sell GLP-class compounds?",
        a: "Focus. We specialise in incretin-receptor research compounds (GLP-1, GIP/GLP-1 and glucagon co-agonists), so we can go deep on sourcing, testing and documentation for one pharmacological family rather than spread thin across hundreds of unrelated peptides.",
      },
    ],
  },
  {
    title: "Storage & handling",
    items: [
      {
        q: "How should lyophilized peptides be stored?",
        a: "For long-term storage keep vials sealed at −20 °C, protected from light and moisture. Short periods at room temperature (such as during shipping) do not meaningfully degrade lyophilized peptide. Allow vials to reach room temperature before opening to avoid condensation. See our Lab Practice article on storage and handling for full guidance.",
      },
      {
        q: "Does my order need to be refrigerated on arrival?",
        a: "Yes. Move vials to a freezer (−20 °C) or at minimum a refrigerator (2–8 °C) as soon as practical after delivery. Every order ships insulated with a cold pack as an extra precaution.",
      },
      {
        q: "What is the shelf life?",
        a: "Sealed lyophilized vials stored at −20 °C are given a 24-month retest date from the batch test date, shown on the certificate of analysis.",
      },
    ],
  },
  {
    title: "Ordering & payment",
    items: [
      {
        q: "What payment methods do you accept?",
        a: "Bank transfer, PayID/Osko and cryptocurrency (BTC or USDT). After checkout you'll receive payment instructions with your order number as the reference. Orders are dispatched once payment is confirmed.",
      },
      {
        q: "How long do I have to pay?",
        a: "Unpaid orders are held for 48 hours, after which they are cancelled and the stock is released. PayID payments usually clear within minutes; standard bank transfers can take 1–2 business days.",
      },
      {
        q: "Do you offer bulk or institutional pricing?",
        a: "Yes. Discount codes are available for larger orders, and we can arrange standing orders and invoicing for institutions. Contact us with your requirements.",
      },
      {
        q: "Do I need an account to order?",
        a: "No. Guest checkout is available. An account lets you track every order, save multiple lab addresses, reorder in one click and view your history at any time.",
      },
    ],
  },
  {
    title: "Shipping",
    items: [
      {
        q: "How fast do you ship?",
        a: "Orders paid before 1pm AEST on a business day are dispatched the same day. Standard tracked delivery takes 2–6 business days and Express 1–3 business days within Australia.",
      },
      {
        q: "Is packaging discreet?",
        a: "Yes. Outer packaging is plain, with no product names. Inside, vials are packed in a rigid insulated box with protective foam and a cold pack.",
      },
      {
        q: "What if my order arrives damaged?",
        a: "Contact us within 48 hours of delivery with your order number and a photo, and we'll replace any damaged vials at no cost.",
      },
    ],
  },
];
