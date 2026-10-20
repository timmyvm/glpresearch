// Catalogue seed data. Research fields summarise published literature (verified against PubChem/KEGG,
// FDA labels, PubMed and sponsor releases, Oct 2026); see each product's references.

export type SeedVariant = { label: string; sku: string; price: number; compareAtPrice?: number; stock: number; image: string };

export type SeedProduct = {
  slug: string;
  name: string;
  subtitle: string;
  category: "GLP1" | "DUAL" | "TRIPLE";
  shortDescription: string;
  description: string;
  accentColor: string;
  aliases?: string;
  developer?: string;
  receptorTargets: string;
  molecularFormula?: string;
  molecularWeight?: string;
  casNumber?: string;
  sequence?: string;
  aminoAcidCount?: number;
  halfLife?: string;
  regulatoryStatus?: string;
  mechanism: string;
  research: string;
  references: { label: string; url: string }[];
  featured?: boolean;
  variants: SeedVariant[];
};

const img = (file: string) => `/images/products/${file}.webp`;
const doi = (id: string) => `https://doi.org/${id}`;

export const products: SeedProduct[] = [
  {
    slug: "semaglutide",
    name: "Semaglutide",
    subtitle: "Long-acting GLP-1 receptor agonist",
    category: "GLP1",
    accentColor: "#2DD4BF",
    featured: true,
    shortDescription:
      "Acylated GLP-1 analogue with 94% homology to native GLP-1 and an elimination half-life of about one week — the most extensively studied molecule in the incretin class.",
    description: `Semaglutide is a synthetic analogue of human glucagon-like peptide-1 (GLP-1) engineered for once-weekly pharmacokinetics. Two backbone substitutions — **Aib at position 8**, which protects against DPP-4 cleavage, and **Arg at position 34** — are combined with a **C18 fatty diacid** attached to **Lys26** through a γGlu–2×OEG linker, which drives strong, reversible binding to serum albumin.

The result is a molecule whose elimination half-life is measured in days rather than minutes. Semaglutide was engineered at Novo Nordisk as the once-weekly successor to liraglutide, and it is now the reference compound for the GLP-1 receptor agonist class and the comparator in most head-to-head incretin research.

Supplied as a sterile-filtered, lyophilized powder. Every batch is verified for identity by ESI-MS and for purity by RP-HPLC — find the certificate for your batch under **Lab testing** below.`,
    aliases: "NN9535, NNC 0113-0217",
    developer: "Novo Nordisk",
    receptorTargets: "GLP-1R",
    molecularFormula: "C187H291N45O59",
    molecularWeight: "4113.58 g/mol",
    casNumber: "910463-68-2",
    sequence: "H-His-Aib-Glu-Gly-Thr-Phe-Thr-Ser-Asp-Val-Ser-Ser-Tyr-Leu-Glu-Gly-Gln-Ala-Ala-Lys(AEEA-AEEA-γGlu-C18 diacid)-Glu-Phe-Ile-Ala-Trp-Leu-Val-Arg-Gly-Arg-Gly-OH",
    aminoAcidCount: 31,
    halfLife: "~1 week",
    regulatoryStatus:
      "Approved (Ozempic, Wegovy, Rybelsus and the Wegovy pill) for type 2 diabetes, chronic weight management, and cardiovascular and kidney risk reduction.",
    mechanism: `Semaglutide is a selective agonist of the **GLP-1 receptor (GLP-1R)**, a class B G-protein-coupled receptor. Receptor activation couples to Gαs, raising intracellular cAMP and activating PKA and Epac2 signalling.

- **Pancreatic β-cells:** glucose-dependent potentiation of insulin secretion.
- **Pancreatic α-cells:** glucose-dependent suppression of glucagon release.
- **Stomach:** slowing of gastric emptying.
- **Central nervous system:** activation of GLP-1R populations in the hypothalamus and hindbrain associated with reduced appetite and energy intake.

Albumin binding via the C18 diacid side chain reduces renal clearance and shields the peptide from proteolysis, while the Aib8 substitution blocks DPP-4 degradation — together giving a half-life of about one week.`,
    research: `- **SUSTAIN-6 (NEJM, 2016):** in type 2 diabetes, the primary MACE outcome occurred in 6.6% with semaglutide vs 8.9% with placebo over 104 weeks (HR 0.74).
- **STEP 1 (NEJM, 2021):** mean body-weight change of −14.9% with semaglutide 2.4 mg vs −2.4% with placebo at 68 weeks.
- **SELECT (NEJM, 2023):** in 17,604 adults with cardiovascular disease and overweight/obesity without diabetes, MACE occurred in 6.5% vs 8.0% (HR 0.80) over a mean 39.8 months.
- **FLOW (NEJM, 2024):** in type 2 diabetes with chronic kidney disease, semaglutide 1.0 mg reduced the major kidney-disease composite by 24% (HR 0.76).
- **OASIS 4 (NEJM, 2025):** oral semaglutide 25 mg daily produced a mean body-weight change of −13.6% vs −2.2% with placebo at 64 weeks.`,
    references: [
      { label: "Marso SP et al. N Engl J Med 2016;375:1834–1844 (SUSTAIN-6)", url: doi("10.1056/NEJMoa1607141") },
      { label: "Wilding JPH et al. N Engl J Med 2021;384:989–1002 (STEP 1)", url: doi("10.1056/NEJMoa2032183") },
      { label: "Lincoff AM et al. N Engl J Med 2023;389:2221–2232 (SELECT)", url: doi("10.1056/NEJMoa2307563") },
      { label: "Perkovic V et al. N Engl J Med 2024;391:109–121 (FLOW)", url: doi("10.1056/NEJMoa2403347") },
      { label: "Wharton S et al. N Engl J Med 2025;393:1077–1087 (OASIS 4)", url: doi("10.1056/NEJMoa2500969") },
      { label: "Lau J et al. J Med Chem 2015;58:7370–7380 (discovery of semaglutide)", url: doi("10.1021/acs.jmedchem.5b00726") },
    ],
    variants: [
      { label: "5 mg", sku: "GLP-SEM-05", price: 8900, stock: 64, image: img("semaglutide-5mg") },
      { label: "10 mg", sku: "GLP-SEM-10", price: 13900, compareAtPrice: 15900, stock: 82, image: img("semaglutide-10mg") },
      { label: "20 mg", sku: "GLP-SEM-20", price: 22900, stock: 31, image: img("semaglutide-20mg") },
    ],
  },
  {
    slug: "tirzepatide",
    name: "Tirzepatide",
    subtitle: "Dual GIP / GLP-1 receptor agonist",
    category: "DUAL",
    accentColor: "#8B5CF6",
    featured: true,
    shortDescription:
      "A 39-residue ‘twincretin’ built on the GIP backbone that activates both GIP and GLP-1 receptors, with a ~5-day half-life.",
    description: `Tirzepatide is a 39-residue synthetic peptide based on the native **GIP sequence**, engineered to also activate the **GLP-1 receptor**. Aib substitutions at positions 2 and 13 protect against proteolysis, and **Lys20** carries a **C20 fatty diacid** through a γGlu–2×OEG linker, giving albumin binding and once-weekly pharmacokinetics.

Pharmacologically it is an *imbalanced* dual agonist: it mimics native GIP at the GIP receptor, while at the GLP-1 receptor it is less potent and shows signalling bias towards cAMP over β-arrestin recruitment. That profile makes it a key tool compound for dissecting what GIP agonism adds to GLP-1 pharmacology. It became the first dual GIP/GLP-1 receptor agonist approved, in May 2022.

Supplied as a lyophilized powder; identity by ESI-MS and purity by RP-HPLC on every batch.`,
    aliases: "LY3298176",
    developer: "Eli Lilly and Company",
    receptorTargets: "GIPR,GLP-1R",
    molecularFormula: "C225H348N48O68",
    molecularWeight: "4813.53 g/mol",
    casNumber: "2023788-19-2",
    sequence: "Y-Aib-EGTFTSDYSI-Aib-LDKIAQ-K(AEEA-AEEA-γGlu-C20 diacid)-AFVQWLIAGGPSSGAPPPS-NH2",
    aminoAcidCount: 39,
    halfLife: "~5 days",
    regulatoryStatus:
      "Approved (Mounjaro, Zepbound) for type 2 diabetes, chronic weight management and obstructive sleep apnoea with obesity.",
    mechanism: `Tirzepatide activates two incretin receptors:

- **GIP receptor (GIPR):** agonism comparable to native GIP. GIPR is expressed in pancreatic islets, adipose tissue and the CNS.
- **GLP-1 receptor (GLP-1R):** lower-potency, cAMP-biased agonism with reduced β-arrestin recruitment, which in cell models is associated with less receptor internalisation.

At clinically studied exposures it engages GIPR to a greater degree than GLP-1R. How much each receptor contributes to the overall effect profile is still an active research question — one of the main reasons tirzepatide is studied alongside selective GLP-1R agonists such as semaglutide.`,
    research: `- **SURPASS-2 (NEJM, 2021):** HbA1c change of −2.01, −2.24 and −2.30 points with 5, 10 and 15 mg vs −1.86 with semaglutide 1 mg at 40 weeks; all doses superior.
- **SURMOUNT-1 (NEJM, 2022):** mean body-weight change of −15.0%, −19.5% and −20.9% with 5, 10 and 15 mg vs −3.1% with placebo at 72 weeks.
- **SURMOUNT-OSA (NEJM, 2024):** apnoea–hypopnoea index fell by 25.3 vs 5.3 events/h (no PAP) and 29.3 vs 5.5 events/h (on PAP) vs placebo at 52 weeks.
- **SURMOUNT-5 (NEJM, 2025):** head-to-head in obesity without diabetes, −20.2% with tirzepatide vs −13.7% with semaglutide at 72 weeks.
- **SURPASS-CVOT (NEJM, 2025):** in 13,299 people with type 2 diabetes and atherosclerotic CVD, MACE 12.2% vs 13.1% with dulaglutide (HR 0.92) — non-inferior but not superior.`,
    references: [
      { label: "Frías JP et al. N Engl J Med 2021;385:503–515 (SURPASS-2)", url: doi("10.1056/NEJMoa2107519") },
      { label: "Jastreboff AM et al. N Engl J Med 2022;387:205–216 (SURMOUNT-1)", url: doi("10.1056/NEJMoa2206038") },
      { label: "Malhotra A et al. N Engl J Med 2024;391:1193–1205 (SURMOUNT-OSA)", url: doi("10.1056/NEJMoa2404881") },
      { label: "Aronne LJ et al. N Engl J Med 2025;393:26–36 (SURMOUNT-5)", url: doi("10.1056/NEJMoa2416394") },
      { label: "Nicholls SJ et al. N Engl J Med 2025;393:2409–2420 (SURPASS-CVOT)", url: doi("10.1056/NEJMoa2505928") },
      { label: "Coskun T et al. Mol Metab 2018;18:3–14 (discovery)", url: doi("10.1016/j.molmet.2018.09.009") },
    ],
    variants: [
      { label: "10 mg", sku: "GLP-TIR-10", price: 14900, stock: 70, image: img("tirzepatide-10mg") },
      { label: "15 mg", sku: "GLP-TIR-15", price: 19900, compareAtPrice: 21900, stock: 58, image: img("tirzepatide-15mg") },
      { label: "30 mg", sku: "GLP-TIR-30", price: 32900, stock: 24, image: img("tirzepatide-30mg") },
    ],
  },
  {
    slug: "retatrutide",
    name: "Retatrutide",
    subtitle: "Triple GIP / GLP-1 / glucagon receptor agonist",
    category: "TRIPLE",
    accentColor: "#F59E0B",
    featured: true,
    shortDescription:
      "Investigational single-molecule tri-agonist of the GIP, GLP-1 and glucagon receptors, with a completed Phase 3 programme — the frontier of multi-receptor incretin research.",
    description: `Retatrutide is an investigational 39-residue peptide that activates **three receptors**: GIPR, GLP-1R and the glucagon receptor (GCGR). Like tirzepatide it is built on a GIP-derived backbone — with Aib at positions 2 and 20 and α-methyl-leucine at 13 — and carries a **C20 fatty diacid on Lys17** for albumin binding and an approximately six-day half-life.

Adding glucagon-receptor agonism is thought to increase energy expenditure and hepatic fat oxidation, complementing the appetite and insulinotropic effects of incretin agonism. All four registrational TRIUMPH trials have now read out, making retatrutide one of the most closely watched compounds in metabolic research.

Supplied as a lyophilized powder; identity by ESI-MS and purity by RP-HPLC on every batch.`,
    aliases: "LY3437943",
    developer: "Eli Lilly and Company",
    receptorTargets: "GIPR,GLP-1R,GCGR",
    molecularFormula: "C221H342N46O68",
    molecularWeight: "4731.34 g/mol",
    casNumber: "2381089-83-2",
    sequence: "Y-Aib-QGTFTSDYSI-(αMeL)-LDK-K(AEEA-γGlu-C20 diacid)-AQ-Aib-AFIEYLLEGGPSSGAPPPS-NH2",
    aminoAcidCount: 39,
    halfLife: "~6 days",
    regulatoryStatus:
      "Investigational — Phase 3 (TRIUMPH) complete; not approved anywhere. Sponsor has stated plans for a US submission in 2027.",
    mechanism: `In vitro, retatrutide is most potent at **GIPR**, with lower and roughly balanced activity at **GLP-1R** and **GCGR** relative to the native hormones (Coskun et al., *Cell Metab* 2022):

- **GIPR and GLP-1R agonism** — insulinotropic and satiety-related incretin signalling that reduces food intake.
- **GCGR agonism** — increased energy expenditure (shown in obese mice) and hepatic lipid effects. Glucagon's hyperglycaemic action is counterbalanced by concurrent incretin agonism.

Researchers use retatrutide to study how the balance of these three signals shapes metabolic outcomes compared with single and dual agonists.`,
    research: `- **Phase 2 obesity trial (NEJM, 2023):** body-weight change of −24.2% with 12 mg vs −2.1% with placebo at 48 weeks.
- **Phase 2 type 2 diabetes trial (Lancet, 2023):** HbA1c change of −2.02% with 12 mg vs −0.01% with placebo and −1.41% with dulaglutide at 24 weeks.
- **TRIUMPH-1 (NEJM, 2026):** in 2,339 adults with obesity or overweight without diabetes, body-weight change of −17.6%, −23.7% and −25.0% with 4, 9 and 12 mg vs −3.9% with placebo at 80 weeks (treatment-regimen estimand; the sponsor's efficacy-estimand figure for 12 mg was −28.3%).
- **TRIUMPH-2 (Lancet, 2026):** in 1,152 adults with obesity and type 2 diabetes, −11.9%, −16.8% and −18.8% vs −5.1% with placebo at 80 weeks.`,
    references: [
      { label: "Jastreboff AM et al. N Engl J Med 2023;389:514–526 (Phase 2, obesity)", url: doi("10.1056/NEJMoa2301972") },
      { label: "Rosenstock J et al. Lancet 2023;402:529–544 (Phase 2, T2D)", url: doi("10.1016/S0140-6736(23)01053-X") },
      { label: "Jastreboff AM et al. N Engl J Med 2026 (TRIUMPH-1, online first)", url: doi("10.1056/NEJMoa2604169") },
      { label: "Bellido V et al. Lancet 2026;408:1455–1472 (TRIUMPH-2)", url: doi("10.1016/S0140-6736(26)01861-1") },
      { label: "Coskun T et al. Cell Metab 2022;34:1234–1247 (discovery)", url: doi("10.1016/j.cmet.2022.07.013") },
    ],
    variants: [
      { label: "10 mg", sku: "GLP-RET-10", price: 18900, stock: 46, image: img("retatrutide-10mg") },
      { label: "20 mg", sku: "GLP-RET-20", price: 31900, compareAtPrice: 34900, stock: 22, image: img("retatrutide-20mg") },
    ],
  },
  {
    slug: "liraglutide",
    name: "Liraglutide",
    subtitle: "Once-daily GLP-1 receptor agonist",
    category: "GLP1",
    accentColor: "#38BDF8",
    shortDescription:
      "The first fatty-acid-acylated GLP-1 analogue — 97% homologous to native GLP-1, with a palmitoyl side chain giving a ~13-hour half-life.",
    description: `Liraglutide is a GLP-1(7-37) analogue with a single amino-acid substitution (**Lys34→Arg**) and a **C16 palmitic acid** attached to **Lys26** via a γ-glutamic acid spacer. The fatty acid promotes self-association at the injection site and reversible albumin binding in circulation, extending the half-life from minutes to about 13 hours.

As the first acylated GLP-1 analogue to reach the clinic, liraglutide established the albumin-binding strategy later refined in semaglutide. It was the first human GLP-1 analogue approved for type 2 diabetes and the first GLP-1 receptor agonist approved for chronic weight management, and it remains a widely used reference compound for once-daily GLP-1R agonism.

Supplied as a lyophilized powder; identity by ESI-MS and purity by RP-HPLC on every batch.`,
    aliases: "NN2211, NNC 90-1170",
    developer: "Novo Nordisk",
    receptorTargets: "GLP-1R",
    molecularFormula: "C172H265N43O51",
    molecularWeight: "3751.20 g/mol",
    casNumber: "204656-20-2",
    sequence: "H-His-Ala-Glu-Gly-Thr-Phe-Thr-Ser-Asp-Val-Ser-Ser-Tyr-Leu-Glu-Gly-Gln-Ala-Ala-Lys(γGlu-palmitoyl)-Glu-Phe-Ile-Ala-Trp-Leu-Val-Arg-Gly-Arg-Gly-OH",
    aminoAcidCount: 31,
    halfLife: "~13 hours",
    regulatoryStatus: "Approved (Victoza, Saxenda) for type 2 diabetes and chronic weight management; generics available in the US.",
    mechanism: `Liraglutide is a full agonist at the Gs-coupled GLP-1 receptor, raising β-cell cAMP to enhance glucose-dependent insulin secretion while lowering glucagon, delaying gastric emptying and reducing appetite.

Its protraction comes from two mechanisms: heptamer formation at the injection site slows absorption, and albumin binding in circulation protects it from DPP-4 and neutral endopeptidase. Because its half-life is roughly half a day rather than a week, it is often chosen for research designs that need faster washout than semaglutide allows.`,
    research: `- **SCALE Obesity and Prediabetes (NEJM, 2015):** liraglutide 3.0 mg produced a mean weight loss of 8.4 kg vs 2.8 kg with placebo at 56 weeks; 63.2% vs 27.1% lost at least 5% of body weight.
- **LEADER (NEJM, 2016):** in 9,340 people with type 2 diabetes at high cardiovascular risk, MACE occurred in 13.0% vs 14.9% with placebo (HR 0.87); cardiovascular death HR 0.78.
- **Ellipse (NEJM, 2019):** in children and adolescents with type 2 diabetes, HbA1c fell 0.64 points vs a 0.42-point rise with placebo at 26 weeks.
- **SCALE Teens (NEJM, 2020):** in adolescents with obesity, liraglutide 3.0 mg reduced BMI SD score vs placebo at 56 weeks.`,
    references: [
      { label: "Pi-Sunyer X et al. N Engl J Med 2015;373:11–22 (SCALE)", url: doi("10.1056/NEJMoa1411892") },
      { label: "Marso SP et al. N Engl J Med 2016;375:311–322 (LEADER)", url: doi("10.1056/NEJMoa1603827") },
      { label: "Tamborlane WV et al. N Engl J Med 2019;381:637–646 (Ellipse)", url: doi("10.1056/NEJMoa1903822") },
      { label: "Kelly AS et al. N Engl J Med 2020;382:2117–2128 (SCALE Teens)", url: doi("10.1056/NEJMoa1916038") },
      { label: "Knudsen LB et al. J Med Chem 2000;43:1664–1669 (discovery)", url: doi("10.1021/jm9909645") },
    ],
    variants: [
      { label: "5 mg", sku: "GLP-LIR-05", price: 8900, stock: 40, image: img("liraglutide-5mg") },
      { label: "10 mg", sku: "GLP-LIR-10", price: 13900, stock: 36, image: img("liraglutide-10mg") },
    ],
  },
  {
    slug: "exenatide",
    name: "Exenatide",
    subtitle: "Exendin-4 GLP-1 receptor agonist",
    category: "GLP1",
    accentColor: "#10B981",
    shortDescription:
      "Synthetic exendin-4, first isolated from Gila monster venom — the first GLP-1 receptor agonist ever approved and a classic receptor-research tool.",
    description: `Exenatide is the synthetic form of **exendin-4**, a 39-residue peptide amide discovered in the venom of the Gila monster (*Heloderma suspectum*) by John Eng and colleagues in 1992. Its sequence partially overlaps human GLP-1, and **glycine at position 2** makes it naturally resistant to DPP-4 degradation.

Exenatide carries no fatty-acid side chain. It is cleared mainly by glomerular filtration, giving a short half-life of about 2.4 hours — which, along with its high receptor affinity, makes it a staple reference ligand in receptor-binding, signalling and islet research.

Supplied as a lyophilized powder; identity by ESI-MS and purity by RP-HPLC on every batch.`,
    aliases: "Exendin-4 (synthetic), AC2993, LY2148568",
    developer: "Amylin Pharmaceuticals with Eli Lilly",
    receptorTargets: "GLP-1R",
    molecularFormula: "C184H282N50O60S",
    molecularWeight: "4186.6 g/mol",
    casNumber: "141758-74-9",
    sequence: "HGEGTFTSDLSKQMEEEAVRLFIEWLKNGGPSSGAPPPS-NH2",
    aminoAcidCount: 39,
    halfLife: "~2.4 hours",
    regulatoryStatus: "Approved in the US in 2005 (Byetta) and 2012 (Bydureon) for type 2 diabetes; US products are now listed as discontinued.",
    mechanism: `Exenatide binds and activates the human GLP-1 receptor, enhancing glucose-dependent insulin secretion, suppressing inappropriately elevated glucagon and slowing gastric emptying. Its C-terminal ‘Trp-cage’ extension stabilises the peptide's tertiary structure and contributes to high receptor affinity.

The N-terminally truncated fragment **exendin(9-39)** is a widely used GLP-1R antagonist, which makes the exendin family central to receptor pharmacology research.`,
    research: `- **First-in-class approval (2005):** exenatide (Byetta) became the first GLP-1 receptor agonist approved for type 2 diabetes.
- **DURATION-1 (Lancet, 2008):** once-weekly exenatide reduced HbA1c by 1.9% vs 1.5% with twice-daily exenatide at 30 weeks.
- **EXSCEL (NEJM, 2017):** in 14,752 people with type 2 diabetes, MACE occurred in 11.4% with weekly exenatide vs 12.2% with placebo (HR 0.91) — non-inferior but not superior.
- **Exenatide-PD3 (Lancet, 2025):** a Phase 3 trial in 194 people with Parkinson's disease found no disease-modifying benefit at 96 weeks, despite an encouraging earlier Phase 2 signal.`,
    references: [
      { label: "Eng J et al. J Biol Chem 1992;267:7402–7405 (isolation of exendin-4)", url: "https://pubmed.ncbi.nlm.nih.gov/?term=Eng+J+1992+exendin-4+Heloderma+suspectum" },
      { label: "Drucker DJ et al. Lancet 2008;372:1240–1250 (DURATION-1)", url: doi("10.1016/S0140-6736(08)61206-4") },
      { label: "Holman RR et al. N Engl J Med 2017;377:1228–1239 (EXSCEL)", url: doi("10.1056/NEJMoa1612917") },
      { label: "Vijiaratnam N et al. Lancet 2025;405:627–636 (Exenatide-PD3)", url: doi("10.1016/S0140-6736(24)02808-3") },
    ],
    variants: [{ label: "5 mg", sku: "GLP-EXE-05", price: 9900, stock: 28, image: img("exenatide-5mg") }],
  },
  {
    slug: "survodutide",
    name: "Survodutide",
    subtitle: "Dual glucagon / GLP-1 receptor agonist",
    category: "DUAL",
    accentColor: "#F43F5E",
    shortDescription:
      "Investigational glucagon/GLP-1 co-agonist with positive Phase 3 obesity data, also studied in metabolic-dysfunction-associated steatohepatitis (MASH).",
    description: `Survodutide is an investigational, acylated peptide on a **glucagon-like backbone** that co-activates the **glucagon receptor (GCGR)** and the **GLP-1 receptor**. Position 2 carries the non-natural amino acid Ac4c (1-aminocyclobutane-1-carboxylic acid), and Lys24 bears a C18 fatty diacid attached through a Gly/Ser linker for once-weekly pharmacokinetics.

It originated from the Zealand Pharma–Boehringer Ingelheim collaboration and is studied particularly for liver fat and fibrosis, where glucagon-receptor agonism is thought to act directly on hepatic lipid metabolism.

Supplied as a lyophilized powder; identity by ESI-MS and purity by RP-HPLC on every batch.`,
    aliases: "BI 456906",
    developer: "Boehringer Ingelheim / Zealand Pharma",
    receptorTargets: "GCGR,GLP-1R",
    molecularFormula: "C192H289N47O61",
    molecularWeight: "4231.63 g/mol",
    casNumber: "2805997-46-8",
    sequence: "H-Ac4c-QGTFTSDYSKYLDERAAKDFI-K(GGSGSG-γGlu-C18 diacid)-WLESA-NH2",
    aminoAcidCount: 29,
    regulatoryStatus: "Investigational — Phase 3 (SYNCHRONIZE programme). Not approved for any indication.",
    mechanism: `Survodutide pairs **GLP-1R agonism**, which reduces food intake and slows gastric emptying, with **GCGR agonism**, which acts directly on the liver — affecting hepatic lipid metabolism, FGF21 and amino-acid turnover — and increases energy expenditure.

In mice, its greater weight loss than semaglutide reflected both reduced intake and increased energy expenditure (Zimmermann et al., *Mol Metab* 2022). Its receptor balance differs from the GIP-based tri-agonist retatrutide, which makes the two useful comparators in research on the role of glucagon signalling.`,
    research: `- **Phase 2 obesity trial (Lancet Diabetes Endocrinol, 2024):** body-weight change of up to −14.9% with 4.8 mg vs −2.8% with placebo at 46 weeks.
- **Phase 2 MASH trial (NEJM, 2024):** MASH improvement without worsening of fibrosis in 47%, 62% and 43% with 2.4, 4.8 and 6.0 mg vs 14% with placebo at 48 weeks.
- **SYNCHRONIZE-1 (NEJM, 2026):** in 725 adults with obesity or overweight without diabetes, −12.2% (3.6 mg) and −13.0% (6.0 mg) vs −5.4% with placebo at 76 weeks (treatment-regimen estimand).
- **SYNCHRONIZE-2 (NEJM, 2026):** in 752 adults with obesity and type 2 diabetes, −8.2% and −9.8% vs −3.9% with placebo at 76 weeks.`,
    references: [
      { label: "le Roux CW et al. Lancet Diabetes Endocrinol 2024;12:162–173 (Phase 2, obesity)", url: doi("10.1016/S2213-8587(23)00356-X") },
      { label: "Sanyal AJ et al. N Engl J Med 2024;391:311–319 (Phase 2, MASH)", url: doi("10.1056/NEJMoa2401755") },
      { label: "le Roux CW et al. N Engl J Med 2026;395:776–787 (SYNCHRONIZE-1)", url: doi("10.1056/NEJMoa2600751") },
      { label: "Zimmermann T et al. Mol Metab 2022;66:101633 (discovery)", url: "https://pubmed.ncbi.nlm.nih.gov/?term=Zimmermann+2022+BI+456906+Mol+Metab" },
    ],
    variants: [{ label: "10 mg", sku: "GLP-SUR-10", price: 21900, stock: 18, image: img("survodutide-10mg") }],
  },
  {
    slug: "mazdutide",
    name: "Mazdutide",
    subtitle: "Dual GLP-1 / glucagon receptor agonist",
    category: "DUAL",
    accentColor: "#6366F1",
    shortDescription:
      "A lipidated oxyntomodulin analogue — the first glucagon/GLP-1 dual agonist to reach regulatory approval anywhere.",
    description: `Mazdutide is a long-acting analogue of **oxyntomodulin**, the endogenous gut hormone that naturally activates both the GLP-1 and glucagon receptors. The 34-residue backbone carries Aib at position 2 and a C-terminal amide, and **Lys20** bears a **C20 fatty diacid** through a γGlu–2×AEEA linker for once-weekly pharmacokinetics.

Discovered at Eli Lilly and developed in China by Innovent Biologics, it became the world's first approved glucagon/GLP-1 dual receptor agonist in June 2025. Its combined GLP-1R/GCGR activity makes it a valuable comparator for survodutide and retatrutide in studies of how glucagon-receptor engagement contributes to metabolic and hepatic outcomes.

Supplied as a lyophilized powder; identity by ESI-MS and purity by RP-HPLC on every batch.`,
    aliases: "LY3305677, IBI362",
    developer: "Eli Lilly and Company / Innovent Biologics",
    receptorTargets: "GLP-1R,GCGR",
    molecularFormula: "C210H322N46O67",
    molecularWeight: "4563.07 g/mol",
    casNumber: "2259884-03-0",
    sequence: "H-Aib-QGTFTSDYSKYLDEKKA-K(AEEA-AEEA-γGlu-C20 diacid)-EFVEWLLEGGPSSG-NH2",
    aminoAcidCount: 34,
    halfLife: "Variable — ~6 to 28 days in Phase 1b studies",
    regulatoryStatus: "Approved in China (Xinermei, 2025) for chronic weight management and type 2 diabetes; investigational elsewhere.",
    mechanism: `Mazdutide mimics the dual receptor profile of oxyntomodulin. **GLP-1R agonism** drives glucose-dependent insulin secretion and appetite suppression, while **GCGR agonism** is expected to raise energy expenditure and promote hepatic fat oxidation — consistent with the large liver-fat reductions reported in GLORY-1.

Phase 1b pharmacokinetic studies reported unusually wide between-subject variation in half-life, which still supports once-weekly dosing.`,
    research: `- **GLORY-1 (NEJM, 2025):** in 610 Chinese adults with obesity or overweight, body-weight change of −11.00% (4 mg) and −14.01% (6 mg) vs +0.30% with placebo at 48 weeks.
- **DREAMS-2 (Nature, 2026):** in 731 Chinese adults with type 2 diabetes, mazdutide 4 and 6 mg lowered HbA1c more than dulaglutide 1.5 mg, with additional weight loss.
- **GLORY-2 (JAMA, 2026):** mazdutide 9 mg produced −16.65% vs −1.50% body-weight change at 60 weeks in adults with obesity.
- **US Phase 2 (Lancet Diabetes Endocrinol, 2026):** −15.6% (10 mg) and −18.1% (16 mg) vs −0.9% with placebo at 32 weeks.`,
    references: [
      { label: "Ji L et al. N Engl J Med 2025;392:2215–2225 (GLORY-1)", url: doi("10.1056/NEJMoa2411528") },
      { label: "Guo L et al. Nature 2026;652:181–188 (DREAMS-2)", url: doi("10.1038/s41586-025-10031-z") },
      { label: "Gao L et al. JAMA 2026;336:377–388 (GLORY-2)", url: doi("10.1001/jama.2026.8142") },
      { label: "Hsia SH et al. Lancet Diabetes Endocrinol 2026;14:879–893 (US Phase 2)", url: doi("10.1016/S2213-8587(26)00160-9") },
    ],
    variants: [{ label: "10 mg", sku: "GLP-MAZ-10", price: 21900, stock: 16, image: img("mazdutide-10mg") }],
  },
];
