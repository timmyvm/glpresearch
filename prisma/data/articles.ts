// Research library seed content. Figures are taken from the verified research brief (Oct 2026);
// cite primary sources in each article and keep claims to what the literature reports.

export type SeedArticle = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  coverImage: string;
  readingMinutes: number;
  featured?: boolean;
  content: string;
};

export const articles: SeedArticle[] = [
  {
    slug: "what-is-glp-1",
    title: "What is GLP-1? An introduction to incretin biology",
    excerpt:
      "How a 30-amino-acid gut hormone that survives barely two minutes in the bloodstream became the most important target in metabolic research.",
    category: "Fundamentals",
    coverImage: "/images/incretin-axis.webp",
    readingMinutes: 9,
    featured: true,
    content: `Glucagon-like peptide-1 (GLP-1) is a peptide hormone released from the gut in response to food. It is the best-known member of a small family of hormones called **incretins**, and in the last two decades it has become the single most studied target in metabolic science. This article explains where GLP-1 comes from, what it does, and why its short life in circulation shaped every compound that followed.

## The incretin effect

In 1964, researchers noticed something odd: glucose taken by mouth produced a much larger insulin response than the same amount of glucose infused directly into a vein, even when blood glucose levels were matched. Something released by the gut during digestion was amplifying insulin secretion.

That amplification became known as the **incretin effect**. In healthy people it accounts for a large share of the insulin released after an oral glucose load. Two hormones are now known to carry most of it:

- **GIP** (glucose-dependent insulinotropic polypeptide), secreted by K-cells in the upper small intestine.
- **GLP-1**, secreted by L-cells further down the small intestine and in the colon.

A striking feature of type 2 diabetes is that the incretin effect is substantially reduced — one of the early clues that boosting incretin signalling might be useful.

## Where GLP-1 comes from

GLP-1 is cut from a larger precursor protein called **proglucagon**. In 1983, cloning of the proglucagon gene revealed that, alongside glucagon, it encodes two related sequences — later named GLP-1 and GLP-2.

What proglucagon becomes depends on the tissue:

| Tissue | Processing enzyme | Main products |
|---|---|---|
| Pancreatic α-cells | Prohormone convertase 2 | Glucagon |
| Intestinal L-cells | Prohormone convertase 1/3 | GLP-1, GLP-2, oxyntomodulin, glicentin |
| Brainstem (nucleus tractus solitarius) | Prohormone convertase 1/3 | GLP-1, GLP-2 |

The biologically active forms of GLP-1 are **GLP-1(7-36)amide** and **GLP-1(7-37)**. In 1987, three groups — Mojsov, Weir and Habener; Holst and colleagues; and Drucker and colleagues — showed that these truncated forms are potent, glucose-dependent stimulators of insulin release.

## A hormone that lasts two minutes

Native GLP-1 is remarkably short-lived. The enzyme **dipeptidyl peptidase-4 (DPP-4)**, found on blood vessel walls and in plasma, removes the first two amino acids (His-Ala) within minutes, leaving GLP-1(9-36)amide, which barely activates the receptor. What escapes DPP-4 is cleared rapidly by the kidneys. The result: intact GLP-1 has a half-life of roughly **two minutes**.

That brevity makes native GLP-1 a poor research tool for anything longer than an acute experiment — and it is the problem every compound in our catalogue solves in a different way. See [From two minutes to one week](/research/half-life-engineering) for how.

## What GLP-1 does

GLP-1 acts through the **GLP-1 receptor (GLP-1R)**, a G-protein-coupled receptor expressed in a surprising range of tissues.

| Site | Main effect of GLP-1R activation |
|---|---|
| Pancreatic β-cells | Glucose-dependent increase in insulin secretion |
| Pancreatic α-cells | Glucose-dependent suppression of glucagon (largely indirect) |
| Stomach | Slower gastric emptying |
| Hypothalamus and hindbrain | Signals associated with satiety and reduced food intake |
| Heart (sinoatrial node) | Modest increase in heart rate |

The word **glucose-dependent** matters. GLP-1 amplifies insulin secretion only when glucose is elevated, because the receptor's cAMP signal potentiates — rather than triggers — the glucose-driven secretion machinery of the β-cell. This is why GLP-1 receptor agonists on their own carry a low intrinsic risk of hypoglycaemia in clinical studies.

## GIP: the other incretin

GIP was the first incretin identified. It is a 42-residue peptide that acts on the **GIP receptor (GIPR)**, expressed in pancreatic islets, adipose tissue and parts of the brain. For years GIP was considered a poor drug target because its insulin-releasing effect is blunted in type 2 diabetes. The success of tirzepatide, a combined GIP/GLP-1 agonist, has reopened the question of what GIPR signalling contributes — see [Single, dual and triple agonists](/research/single-dual-triple-agonists).

## Why it matters for research

GLP-1 sits at the intersection of several systems — endocrine pancreas, gut motility, the central regulation of appetite and, increasingly, the cardiovascular system, kidney and liver. Long-acting analogues let researchers probe those systems with sustained, well-characterised receptor activation, and multi-receptor agonists let them ask how incretin and glucagon signals interact.

## Key takeaways

- GLP-1 is a gut hormone processed from proglucagon in intestinal L-cells and brainstem neurons.
- It enhances insulin secretion **only when glucose is elevated**, suppresses glucagon, slows gastric emptying and engages satiety pathways in the brain.
- Native GLP-1 is degraded by DPP-4 and cleared by the kidney within about two minutes.
- Every modern GLP-1 receptor agonist is, at heart, a solution to that two-minute problem.

### Further reading

- [How GLP-1 receptor agonists work](/research/how-glp-1-receptor-agonists-work)
- [A short history of GLP-1](/research/history-of-glp-1)`,
  },
  {
    slug: "how-glp-1-receptor-agonists-work",
    title: "How GLP-1 receptor agonists work: from receptor to physiology",
    excerpt:
      "A tour of the GLP-1 receptor — its structure, how peptides bind it, the signalling pathways it switches on, and the assays researchers use to measure all of it.",
    category: "Fundamentals",
    coverImage: "/images/receptor.webp",
    readingMinutes: 10,
    content: `GLP-1 receptor agonists share one molecular target, but what happens after a peptide binds that target is surprisingly nuanced. Understanding the receptor is the key to understanding why compounds with similar targets can behave differently.

## The GLP-1 receptor

The GLP-1 receptor (GLP-1R) is a **class B1 G-protein-coupled receptor** — the same family as the receptors for glucagon, GIP, secretin and calcitonin. The human receptor is 463 amino acids long and has two functionally distinct parts:

- A large **extracellular domain (ECD)** at the N-terminus that captures the peptide.
- A **seven-transmembrane (7TM) core** that changes shape to activate intracellular G proteins.

Class B1 receptors use a "two-domain" binding mechanism. The C-terminal, helical half of the peptide docks onto the ECD first, positioning the peptide's N-terminus to insert into the 7TM core — and it is this N-terminal contact that switches the receptor on. That is why the first few residues of every GLP-1 analogue are so tightly conserved, and why removing them (as DPP-4 does) or truncating them (as in the antagonist exendin(9-39)) abolishes activity.

## Signalling: more than one pathway

When an agonist binds, GLP-1R primarily couples to **Gαs**, activating adenylyl cyclase and raising intracellular **cyclic AMP (cAMP)**. In β-cells, cAMP acts through two effectors:

- **Protein kinase A (PKA)**
- **Epac2** (exchange protein directly activated by cAMP)

Both increase the readiness of insulin granules for exocytosis. Crucially, this signal *amplifies* the glucose-triggered secretory process — it does not trigger secretion on its own. That is the molecular basis of glucose dependence.

After activation, the receptor also recruits **β-arrestins**, which promote receptor internalisation and can initiate their own signalling. The balance between G-protein and β-arrestin pathways is not fixed: different ligands can favour one over the other, a property called **biased agonism**. Tirzepatide, for example, shows bias towards cAMP over β-arrestin recruitment at GLP-1R, which in cell models is associated with less receptor internalisation.

## Effects across tissues

**Pancreas.** Glucose-dependent insulin secretion from β-cells, and suppression of glucagon from α-cells — the latter thought to be mainly indirect, via insulin and somatostatin from neighbouring cells.

**Stomach.** Slower gastric emptying, which moderates how quickly nutrients reach the intestine. With long-acting agonists this effect partly diminishes over time (tachyphylaxis), whereas short-acting agonists such as exenatide maintain it more strongly.

**Brain.** GLP-1 receptors in the hypothalamus and hindbrain are linked to satiety and food intake. How peripherally administered, albumin-bound peptides reach these sites — through circumventricular organs that lack a full blood–brain barrier, and via vagal afferents — is an active research area.

**Cardiovascular system.** In humans GLP-1R is found in the sinoatrial node, consistent with the modest rise in heart rate seen across the class. Large outcome trials have also shown reductions in major cardiovascular events for several agonists; see [Beyond weight loss](/research/beyond-weight-outcome-trials).

## How researchers measure activity

| Assay | What it measures |
|---|---|
| cAMP accumulation (HTRF, luciferase reporter) | Potency (EC₅₀) and efficacy at the Gαs pathway |
| β-arrestin recruitment (BRET, enzyme complementation) | Arrestin coupling; used to quantify bias |
| Receptor internalisation (imaging, surface ELISA) | Trafficking after activation |
| Radioligand or fluorescent binding | Affinity at the receptor |
| Islet perifusion | Glucose-dependent insulin secretion ex vivo |

Two practical points matter for long-acting analogues. First, **albumin in the assay buffer shifts apparent potency** for acylated peptides, because albumin binding reduces the free fraction — so always report the buffer composition. Second, **receptor expression level** in engineered cell lines can amplify weak partial agonism into apparently full responses, which complicates cross-study comparisons of efficacy.

## Antagonists and controls

**Exendin(9-39)** — exendin-4 lacking its first eight residues — binds GLP-1R without activating it and is the standard antagonist for confirming that an effect is receptor-mediated. Parental cell lines without GLP-1R make a useful negative control.

## Key takeaways

- GLP-1R is a class B1 GPCR with a peptide-capturing extracellular domain and a 7TM activation core.
- Signalling runs mainly through Gαs and cAMP, with β-arrestin recruitment and internalisation shaping the response.
- Different agonists can bias signalling between these pathways.
- Assay design — especially albumin content and receptor expression — strongly affects measured potency of acylated analogues.`,
  },
  {
    slug: "single-dual-triple-agonists",
    title: "Single, dual and triple agonists: GLP-1, GIP and glucagon receptor pharmacology",
    excerpt:
      "Why researchers moved from molecules that activate one receptor to single peptides that engage two or three — and what each added receptor is thought to contribute.",
    category: "Compounds",
    coverImage: "/images/peptide-helix.webp",
    readingMinutes: 11,
    featured: true,
    content: `The first generation of incretin-based compounds did one thing: activate the GLP-1 receptor. The newest generation engineers a single peptide to activate two or even three related receptors at once. This article explains the three receptors involved, why combining them is interesting, and how to compare compounds sensibly.

## Three receptors, one family

GLP-1, GIP and glucagon receptors are all **class B1 GPCRs** that signal mainly through Gαs and cAMP. Their native hormones share enough sequence similarity that one engineered peptide can be tuned to activate more than one of them.

| Receptor | Native ligand | Main sites | Main research interest |
|---|---|---|---|
| GLP-1R | GLP-1 | Pancreatic β-cells, stomach, brain, heart | Insulin secretion, satiety, gastric emptying |
| GIPR | GIP | Pancreatic islets, adipose tissue, brain | Insulin secretion, adipose biology, possible effects on nausea and appetite |
| GCGR | Glucagon | Liver (predominantly), kidney | Hepatic glucose output, hepatic fat oxidation, energy expenditure |

## Why combine receptors?

Each receptor brings something the others lack. GLP-1R agonism reduces food intake but has limited direct effect on energy expenditure. Glucagon receptor agonism increases energy expenditure and hepatic lipid oxidation, but on its own raises blood glucose. GIP receptor signalling is involved in insulin secretion and adipose tissue function. Combining them in a single molecule tests whether complementary signals add up — and whether the downsides of one can be offset by another.

## Class 1: selective GLP-1 receptor agonists

[Semaglutide](/shop/semaglutide), [liraglutide](/shop/liraglutide) and [exenatide](/shop/exenatide) activate GLP-1R alone. They are the reference compounds for the class, with decades of data, and they are the natural comparators in any study of multi-receptor agonists.

## Class 2a: GIP + GLP-1 — tirzepatide

[Tirzepatide](/shop/tirzepatide) is built on the **GIP backbone** with GLP-1R activity engineered in. It is described as *imbalanced*: it mimics native GIP at GIPR, but at GLP-1R it is less potent and shows cAMP-biased signalling. At clinically studied exposures it engages GIPR to a greater extent than GLP-1R.

GIP biology contains a genuine puzzle. In preclinical models, both GIPR **agonists** and GIPR **antagonists** have been reported to reduce body weight when combined with GLP-1R agonism — sometimes called the "GIP paradox". One proposed explanation is that sustained agonism desensitises the receptor, functionally resembling antagonism. Resolving this is one of the most interesting open questions in the field.

## Class 2b: glucagon + GLP-1 — survodutide and mazdutide

The gut hormone **oxyntomodulin** naturally activates both GLP-1R and GCGR. [Mazdutide](/shop/mazdutide) is a lipidated oxyntomodulin analogue; [survodutide](/shop/survodutide) is built on a glucagon-like backbone. Both pair GLP-1R agonism with glucagon-receptor activity that acts predominantly on the liver.

That hepatic focus is why these compounds are studied in **MASH** (metabolic-dysfunction-associated steatohepatitis). In a Phase 2 MASH trial, survodutide produced histological improvement without worsening of fibrosis in up to 62% of participants versus 14% with placebo (Sanyal et al., *NEJM* 2024). Mazdutide became the first approved glucagon/GLP-1 dual agonist, in China in 2025.

## Class 3: all three — retatrutide

[Retatrutide](/shop/retatrutide) activates GIPR, GLP-1R and GCGR from a single GIP-derived peptide. In vitro it is most potent at GIPR, with lower, roughly balanced activity at GLP-1R and GCGR. In the Phase 3 TRIUMPH-1 trial, the 12 mg dose produced a mean body-weight change of −25.0% versus −3.9% with placebo at 80 weeks (treatment-regimen estimand).

## Comparing compounds fairly

It is tempting to line up headline numbers from different trials, but cross-trial comparisons are unreliable:

- **Populations differ** — with or without diabetes, baseline weight, region.
- **Durations differ** — 48, 68, 72 or 80 weeks.
- **Estimands differ** — sponsors often headline the *efficacy estimand* (as if everyone stayed on treatment), while journals lead with the *treatment-regimen estimand* (regardless of discontinuation). For TRIUMPH-1, these were −28.3% and −25.0% respectively.

The only reliable comparison is a head-to-head trial. In **SURMOUNT-5**, tirzepatide produced −20.2% versus −13.7% with semaglutide at 72 weeks in adults with obesity without diabetes.

## Summary

| Compound | Receptors | Backbone | Reported half-life |
|---|---|---|---|
| Exenatide | GLP-1R | Exendin-4 | ~2.4 hours |
| Liraglutide | GLP-1R | GLP-1 | ~13 hours |
| Semaglutide | GLP-1R | GLP-1 | ~1 week |
| Tirzepatide | GIPR, GLP-1R | GIP | ~5 days |
| Survodutide | GCGR, GLP-1R | Glucagon-like | Not established in published sources |
| Mazdutide | GLP-1R, GCGR | Oxyntomodulin | Variable (~6–28 days) |
| Retatrutide | GIPR, GLP-1R, GCGR | GIP | ~6 days |

Use the [comparison tool](/compare) for full structural and regulatory details.`,
  },
  {
    slug: "half-life-engineering",
    title: "From two minutes to one week: how peptide engineering extended GLP-1's half-life",
    excerpt:
      "DPP-4-resistant residues, fatty-acid side chains and albumin binding — the three chemical tricks that turned a fleeting hormone into once-weekly molecules.",
    category: "Compounds",
    coverImage: "/images/albumin-binding.webp",
    readingMinutes: 9,
    content: `Native GLP-1 survives roughly two minutes in circulation. Semaglutide, built on almost the same sequence, lasts about a week. The difference comes down to a handful of precise chemical changes. Understanding them explains a great deal about how each compound in the class behaves.

## Two ways GLP-1 disappears

1. **Enzymatic cleavage.** DPP-4 removes the N-terminal His-Ala dipeptide, leaving an inactive fragment. Neutral endopeptidase (NEP 24.11) cleaves at other sites.
2. **Renal clearance.** At about 3.3 kDa, GLP-1 is small enough to be filtered rapidly by the kidney.

Any long-acting analogue must solve both problems.

## Trick 1: block DPP-4 at position 2

DPP-4 recognises an alanine (or proline) at position 2. Replacing that residue makes the peptide resistant:

- **Glycine** — found naturally in exendin-4, the basis of [exenatide](/shop/exenatide).
- **Aib (α-aminoisobutyric acid)** — a non-natural amino acid used in [semaglutide](/shop/semaglutide), [tirzepatide](/shop/tirzepatide), [retatrutide](/shop/retatrutide) and [mazdutide](/shop/mazdutide).
- **Ac4c (1-aminocyclobutane-1-carboxylic acid)** — used in [survodutide](/shop/survodutide).

On its own, DPP-4 resistance is not enough. Exenatide is fully DPP-4 resistant but is still cleared by the kidney with a half-life of about 2.4 hours.

## Trick 2: attach a fatty acid

The breakthrough came from attaching a fatty-acid chain to a lysine side chain. Serum albumin naturally carries fatty acids, so a lipidated peptide binds reversibly to albumin — a 66 kDa protein far too large for renal filtration. Bound peptide is also shielded from proteases.

**[Liraglutide](/shop/liraglutide)** (2010) uses a **C16 palmitic acid** attached to Lys26 through a γ-glutamic acid spacer. It also self-associates into heptamers at the injection site, slowing absorption. Result: a half-life of about **13 hours** — once daily.

## Trick 3: optimise the fatty acid and the linker

Semaglutide refined the approach (Lau et al., *J Med Chem* 2015):

- An **18-carbon fatty *di*acid** — the free terminal carboxylic acid strengthens albumin binding compared with a simple fatty acid.
- A longer, hydrophilic **linker** — γGlu plus two OEG (8-amino-3,6-dioxaoctanoic acid) units — that positions the lipid for albumin binding while preserving receptor potency.
- **Aib8** for DPP-4 resistance and **Arg34** so that Lys26 is the only acylation site.

Result: a half-life of about **one week**. Later compounds — tirzepatide, retatrutide and mazdutide — use a **C20** fatty diacid on a similar linker.

## Other strategies

| Strategy | Example | Principle |
|---|---|---|
| Fc fusion | Dulaglutide | GLP-1 analogue fused to an antibody Fc fragment; large size and FcRn recycling |
| Albumin fusion | Albiglutide | Genetic fusion to albumin (withdrawn commercially in 2018) |
| Extended-release microspheres | Exenatide once weekly | Polymer microspheres release peptide slowly |
| Absorption enhancer (oral) | Oral semaglutide | Co-formulated with SNAC to allow absorption in the stomach |
| Non-peptide small molecule | Orforglipron | Orally available agonist, approved in the US in 2026 |

## Why half-life matters in research

Half-life determines how quickly steady-state exposure is reached, how long washout takes, and how closely exposure tracks dosing. A compound with a one-week half-life takes several weeks to reach steady state and to wash out — which shapes study design, crossover feasibility and how acute and chronic effects can be separated. Short-acting compounds such as exenatide remain useful precisely because they allow acute, reversible receptor activation.

## Summary

| Compound | Position 2 | Half-life extension | Reported half-life |
|---|---|---|---|
| Native GLP-1 | Ala | None | ~2 minutes |
| Exenatide | Gly | None (DPP-4 resistant only) | ~2.4 hours |
| Liraglutide | Ala | C16 fatty acid + γGlu | ~13 hours |
| Semaglutide | Aib | C18 diacid + γGlu-2×OEG | ~1 week |
| Tirzepatide | Aib | C20 diacid + γGlu-2×OEG | ~5 days |
| Retatrutide | Aib | C20 diacid + γGlu-OEG | ~6 days |
| Mazdutide | Aib | C20 diacid + γGlu-2×OEG | Variable |`,
  },
  {
    slug: "landmark-clinical-trials",
    title: "Landmark trials in the incretin class: STEP, SURMOUNT, TRIUMPH and more",
    excerpt:
      "The key published studies behind each compound — what they measured, what they found, and how to read the headline numbers without being misled.",
    category: "Clinical Research",
    coverImage: "/images/hero-vials.webp",
    readingMinutes: 12,
    content: `Most of what is known about incretin-class compounds comes from large, randomised clinical trials of regulated pharmaceutical products. This article summarises the landmark body-weight and glycaemic studies for each compound in our catalogue. For cardiovascular, kidney, liver and neurological outcomes, see [Beyond weight loss](/research/beyond-weight-outcome-trials).

> These summaries are for research context. They describe pharmaceutical products studied under controlled trial conditions and are not a basis for any non-research use.

## How to read the numbers

Before comparing results, three things matter:

1. **Estimand.** The *treatment-regimen* estimand includes everyone randomised regardless of whether they stopped treatment; the *efficacy* estimand estimates the effect had everyone stayed on treatment. Sponsor press releases often lead with the efficacy estimand, which gives larger numbers.
2. **Duration.** Trials run from 24 to 80 weeks. Weight curves often have not plateaued by the end.
3. **Population.** Results in people with type 2 diabetes are consistently smaller than in people without diabetes.

## Semaglutide

**STEP 1** (Wilding et al., *NEJM* 2021) — adults with overweight or obesity without diabetes. Mean body-weight change was **−14.9%** with semaglutide 2.4 mg versus **−2.4%** with placebo at 68 weeks.

**OASIS 4** (Wharton et al., *NEJM* 2025) — once-daily oral semaglutide 25 mg produced **−13.6%** versus **−2.2%** at 64 weeks, supporting the first oral GLP-1 product approved for weight management in December 2025.

## Tirzepatide

**SURPASS-2** (Frías et al., *NEJM* 2021) — in type 2 diabetes, tirzepatide 5, 10 and 15 mg lowered HbA1c by 2.01, 2.24 and 2.30 points versus 1.86 with semaglutide 1 mg at 40 weeks; all doses were superior.

**SURMOUNT-1** (Jastreboff et al., *NEJM* 2022) — adults with obesity without diabetes. Body-weight change was **−15.0%, −19.5% and −20.9%** with 5, 10 and 15 mg versus **−3.1%** with placebo at 72 weeks.

**SURMOUNT-5** (Aronne et al., *NEJM* 2025) — the first head-to-head obesity trial in the class. Tirzepatide produced **−20.2%** versus **−13.7%** with semaglutide at 72 weeks.

## Retatrutide

**Phase 2 obesity** (Jastreboff et al., *NEJM* 2023) — **−24.2%** with 12 mg versus −2.1% with placebo at 48 weeks.

**TRIUMPH-1** (Jastreboff et al., *NEJM* 2026) — 2,339 adults with obesity or overweight without diabetes. Body-weight change was **−17.6%, −23.7% and −25.0%** with 4, 9 and 12 mg versus **−3.9%** with placebo at 80 weeks (treatment-regimen estimand). The sponsor's efficacy-estimand figure for 12 mg was −28.3%.

**TRIUMPH-2** (Bellido et al., *Lancet* 2026) — 1,152 adults with obesity and type 2 diabetes: −11.9%, −16.8% and −18.8% versus −5.1% at 80 weeks.

The sponsor has also reported topline results from TRIUMPH-3 and TRIUMPH-4; these had not been peer-reviewed at the time of writing.

## Survodutide

**SYNCHRONIZE-1** (le Roux et al., *NEJM* 2026) — 725 adults with obesity or overweight without diabetes: **−12.2%** (3.6 mg) and **−13.0%** (6.0 mg) versus −5.4% with placebo at 76 weeks (treatment-regimen estimand).

## Mazdutide

**GLORY-1** (Ji et al., *NEJM* 2025) — 610 Chinese adults with obesity or overweight: **−11.0%** (4 mg) and **−14.0%** (6 mg) versus +0.3% with placebo at 48 weeks.

**GLORY-2** (Gao et al., *JAMA* 2026) — mazdutide 9 mg produced **−16.65%** versus −1.50% at 60 weeks.

## Liraglutide and exenatide

**SCALE** (Pi-Sunyer et al., *NEJM* 2015) — liraglutide 3.0 mg produced a mean loss of 8.4 kg versus 2.8 kg with placebo at 56 weeks. **DURATION-1** (Drucker et al., *Lancet* 2008) — once-weekly exenatide lowered HbA1c by 1.9% versus 1.5% with twice-daily dosing at 30 weeks.

## Summary table

| Trial | Compound | Population | Duration | Result vs placebo / comparator |
|---|---|---|---|---|
| STEP 1 | Semaglutide 2.4 mg | Obesity, no T2D | 68 wk | −14.9% vs −2.4% |
| SURMOUNT-1 | Tirzepatide 15 mg | Obesity, no T2D | 72 wk | −20.9% vs −3.1% |
| SURMOUNT-5 | Tirzepatide vs semaglutide | Obesity, no T2D | 72 wk | −20.2% vs −13.7% |
| TRIUMPH-1 | Retatrutide 12 mg | Obesity, no T2D | 80 wk | −25.0% vs −3.9% |
| SYNCHRONIZE-1 | Survodutide 6.0 mg | Obesity, no T2D | 76 wk | −13.0% vs −5.4% |
| GLORY-1 | Mazdutide 6 mg | Obesity (China) | 48 wk | −14.0% vs +0.3% |

Remember: rows in this table come from different trials and cannot be ranked against each other directly.`,
  },
  {
    slug: "beyond-weight-outcome-trials",
    title: "Beyond weight loss: cardiovascular, kidney, liver and brain outcome trials",
    excerpt:
      "SELECT, FLOW, SUMMIT, ESSENCE and the negative evoke trials — what large outcome studies have and haven't shown for the incretin class.",
    category: "Clinical Research",
    coverImage: "/images/organs.webp",
    readingMinutes: 10,
    content: `Body weight and HbA1c are surrogate measures. The questions that matter most in clinical science are about **hard outcomes** — heart attacks, kidney failure, liver disease, death. Over the past decade, a series of large trials has tested incretin-class products against exactly these endpoints. Some succeeded, some did not, and the failures are as informative as the successes.

> Summaries of published trials of regulated pharmaceutical products, provided for research context only.

## Cardiovascular outcomes

**LEADER** (liraglutide, *NEJM* 2016) — 9,340 people with type 2 diabetes at high cardiovascular risk. Major adverse cardiovascular events (MACE: cardiovascular death, non-fatal myocardial infarction or stroke) occurred in **13.0% vs 14.9%** with placebo (HR 0.87). This was among the first demonstrations of cardiovascular benefit for a glucose-lowering drug.

**SUSTAIN-6** (semaglutide, *NEJM* 2016) — MACE **6.6% vs 8.9%** (HR 0.74) in type 2 diabetes.

**SELECT** (semaglutide 2.4 mg, *NEJM* 2023) — the landmark: 17,604 adults with established cardiovascular disease and overweight or obesity **without diabetes**. MACE occurred in **6.5% vs 8.0%** (HR 0.80) over a mean of 39.8 months — a 20% relative reduction in a population chosen for weight, not glucose.

**SURPASS-CVOT** (tirzepatide vs dulaglutide, *NEJM* 2025) — 13,299 people with type 2 diabetes and atherosclerotic disease. MACE **12.2% vs 13.1%** (HR 0.92): non-inferior to an active GLP-1 comparator, but not superior.

**EXSCEL** (exenatide once weekly, *NEJM* 2017) — MACE 11.4% vs 12.2% (HR 0.91): non-inferior to placebo, not superior.

## Heart failure

**STEP-HFpEF** (semaglutide 2.4 mg, *NEJM* 2023) — 529 adults with heart failure with preserved ejection fraction and obesity. Symptom scores (KCCQ) improved by 16.6 vs 8.7 points, and 6-minute walk distance by 21.5 vs 1.2 m, at 52 weeks.

**SUMMIT** (tirzepatide, *NEJM* 2025) — 731 adults with HFpEF and obesity. Cardiovascular death or worsening heart failure occurred in **9.9% vs 15.3%** (HR 0.62) over a median of 104 weeks.

## Kidney

**FLOW** (semaglutide 1.0 mg, *NEJM* 2024) — 3,533 people with type 2 diabetes and chronic kidney disease. The composite of kidney failure, ≥50% eGFR decline, or kidney or cardiovascular death was reduced by **24%** (HR 0.76). The trial was stopped early for efficacy.

## Sleep apnoea

**SURMOUNT-OSA** (tirzepatide, *NEJM* 2024) — in adults with moderate-to-severe obstructive sleep apnoea and obesity, the apnoea–hypopnoea index fell by **25.3 vs 5.3** events per hour (without PAP therapy) and **29.3 vs 5.5** (with PAP) at 52 weeks.

## Liver

**ESSENCE** (semaglutide 2.4 mg, *NEJM* 2025) — 800 adults with biopsy-proven MASH and moderate-to-advanced fibrosis. At 72 weeks, steatohepatitis resolved without fibrosis worsening in **62.9% vs 34.3%**, and fibrosis improved without steatohepatitis worsening in **36.8% vs 22.4%**.

Glucagon-receptor co-agonists are being studied specifically for the liver; in a Phase 2 trial survodutide improved MASH without worsening fibrosis in up to **62%** of participants vs 14% with placebo (*NEJM* 2024).

## Brain: two important negatives

**evoke and evoke+** (oral semaglutide, *Lancet* 2026) — 3,808 adults with early, amyloid-confirmed Alzheimer's disease. Cognitive decline (CDR-SB) was **no different** from placebo at 104 weeks, and the programme was discontinued for lack of efficacy.

**Exenatide-PD3** (*Lancet* 2025) — 194 people with Parkinson's disease. Despite an encouraging Phase 2 signal in 2017, there was **no disease-modifying benefit** at 96 weeks.

These results are a reminder that strong mechanistic rationale and promising early data do not guarantee benefit in large, rigorous trials.

## Summary

| Trial | Compound | Area | Outcome |
|---|---|---|---|
| LEADER | Liraglutide | CV (T2D) | MACE HR 0.87 ✓ |
| SELECT | Semaglutide | CV (no T2D) | MACE HR 0.80 ✓ |
| SURPASS-CVOT | Tirzepatide vs dulaglutide | CV (T2D) | Non-inferior, not superior |
| SUMMIT | Tirzepatide | HFpEF | HR 0.62 ✓ |
| FLOW | Semaglutide | Kidney | HR 0.76 ✓ |
| ESSENCE | Semaglutide | MASH | 62.9% vs 34.3% resolution ✓ |
| evoke/evoke+ | Oral semaglutide | Alzheimer's | No benefit ✗ |
| Exenatide-PD3 | Exenatide | Parkinson's | No benefit ✗ |`,
  },
  {
    slug: "understanding-certificates-of-analysis",
    title: "How to read a certificate of analysis: HPLC, mass spectrometry and purity",
    excerpt:
      "What RP-HPLC purity actually measures, how mass spectrometry confirms identity, why ‘purity’ isn't the same as ‘peptide content’, and a checklist for evaluating any COA.",
    category: "Lab Practice",
    coverImage: "/images/hplc-analysis.webp",
    readingMinutes: 9,
    content: `A certificate of analysis (COA) is the documentary link between the vial on your bench and the analytical data that justify its use. Knowing what each test does — and doesn't — tell you is essential for interpreting experiments and for comparing suppliers.

## What a COA should contain

At minimum, a peptide COA should state:

- **Compound name and batch (lot) number** that matches the vial label.
- **Purity** by HPLC, with the method summarised.
- **Identity** by mass spectrometry, with observed versus theoretical mass.
- **Test date** and a **retest or expiry date**.
- **Who performed the testing** — ideally an independent laboratory.

Every GLP Research batch is published with these fields. [Look up your batch here](/coa).

## Purity by RP-HPLC

**Reverse-phase high-performance liquid chromatography (RP-HPLC)** separates molecules by hydrophobicity. The sample is injected onto a column packed with hydrophobic C18 (or C8/C4) material and eluted with a gradient of water to acetonitrile, typically containing 0.1% trifluoroacetic acid. Peptides elute in order of increasing hydrophobicity.

Detection is usually by UV absorbance at **214–220 nm**, where the peptide bond absorbs strongly. The result is a chromatogram: a main peak for the target peptide and smaller peaks for impurities.

**Purity = area of the main peak ÷ total area of all peaks × 100.**

What HPLC purity does *not* tell you:

- Whether an impurity **co-elutes** under the main peak.
- How much **water, salt or counter-ion** is present — these are invisible at 214 nm.
- The **identity** of the main peak — that requires mass spectrometry.

## Identity by mass spectrometry

**Electrospray ionisation mass spectrometry (ESI-MS)** gives peptides multiple positive charges, producing a series of ions [M+nH]ⁿ⁺. Software deconvolutes this series to the neutral molecular mass, which is compared with the theoretical value calculated from the formula.

For example, semaglutide (C₁₈₇H₂₉₁N₄₅O₅₉) has a molecular weight of 4113.58 g/mol. A matching observed mass confirms identity; a mass difference can point to a specific problem:

| Mass shift | Likely cause |
|---|---|
| +16 Da | Oxidation (methionine, tryptophan) |
| +1 Da | Deamidation (Asn → Asp, Gln → Glu) |
| −(residue mass) | Deletion sequence from incomplete coupling |
| +56 Da or similar | Incomplete removal of a protecting group (e.g. tBu) |

## Purity is not peptide content

A peptide that is **99% pure by HPLC** may contain only **70–90% peptide by weight**. The rest is mostly counter-ions (trifluoroacetate or acetate bound to basic residues) and residual water. **Net peptide content** is measured separately by amino acid analysis or elemental nitrogen analysis.

This matters for quantitative work: if you prepare a solution by weight and assume 100% peptide, your actual concentration will be lower. For precise dose–response studies, determine concentration analytically or apply a content correction.

## Common peptide impurities

- **Deletion and truncated sequences** — from incomplete coupling during synthesis.
- **Diastereomers** — from racemisation of individual amino acids.
- **Oxidation products** — Met and Trp are most susceptible.
- **Deamidation products** — especially at Asn-Gly motifs.
- **Aggregates** — GLP-1 analogues can form fibrils under some conditions.

## Other tests you may see

| Test | Purpose |
|---|---|
| Net peptide content | Peptide as % of total weight |
| Water content (Karl Fischer) | Residual moisture |
| Counter-ion content (TFA/acetate) | Salt form and contribution to weight |
| Endotoxin (LAL) | Relevant for cell-based and in-vivo research models |
| Residual solvents | Synthesis solvents remaining |

## A checklist for any COA

1. Does the **batch number** match your vial?
2. Is the **test date** recent, and the retest date in the future?
3. Was testing done by an **independent** laboratory?
4. Is **purity** reported with a method (column, wavelength)?
5. Is **identity** confirmed with observed vs theoretical mass?
6. For quantitative work, is **net peptide content** available?`,
  },
  {
    slug: "storing-lyophilized-peptides",
    title: "Storage and handling of lyophilized peptides in the laboratory",
    excerpt:
      "Temperature, moisture, light and freeze–thaw: practical guidance for keeping research peptides stable from delivery to assay.",
    category: "Lab Practice",
    coverImage: "/images/freezer.webp",
    readingMinutes: 8,
    content: `Peptides are robust when dry and fragile in solution. Most loss of activity in the laboratory comes not from the original material but from how it is stored, opened and dissolved. This guide covers good practice for in-vitro research use.

## Why peptides are supplied lyophilized

**Lyophilization** (freeze-drying) removes water by sublimation under vacuum, leaving a dry, porous cake. Without water, the chemical reactions that degrade peptides — hydrolysis, deamidation, and much oxidation — slow dramatically. A sealed lyophilized vial is stable at ambient temperature for the days involved in shipping, which is why cold-chain transport is a precaution rather than a necessity.

## On arrival

- Transfer vials to **−20 °C** (or **−80 °C** for long-term archive) as soon as practical.
- Keep vials in their **outer carton** to protect from light.
- Record the **batch number** and date received in your lab inventory.

## Opening a vial

Lyophilized peptides are **hygroscopic** — they absorb moisture from the air. Opening a cold vial causes condensation to form on the powder.

1. Remove the vial from the freezer and let it equilibrate to **room temperature** (ideally in a desiccator) before opening — typically 20–30 minutes.
2. Work quickly, minimising time open to the atmosphere.
3. If weighing out portions, use an anti-static device; lyophilized cakes are light and prone to static.
4. Re-seal promptly, purge with dry nitrogen or argon if available, and return to the freezer.

## Preparing stock solutions for in-vitro work

The right solvent depends on the sequence:

- Most incretin analogues dissolve in **aqueous buffers**. Basic or near-neutral buffers often work well for acidic peptides.
- **Lipidated analogues** (semaglutide, tirzepatide and similar) can be slower to dissolve and may self-associate. A small proportion of an organic co-solvent such as DMSO in the stock, diluted into assay buffer, is common practice — confirm compatibility with your assay.
- Avoid vigorous vortexing, which can promote aggregation; gentle swirling or inversion is preferred.

Other good practices:

- Use **low-protein-binding tubes and tips** — peptides adsorb to plastic and glass at low concentrations.
- Add a carrier protein such as **0.1% BSA** to dilute working solutions where the assay allows, remembering that albumin binds acylated peptides and will shift apparent potency.
- Prepare **single-use aliquots** of stock solution and freeze them; avoid repeated freeze–thaw cycles.
- Label every aliquot with compound, concentration, solvent, batch number and date.

## Stability hazards in solution

| Hazard | Susceptible features | Mitigation |
|---|---|---|
| Oxidation | Met, Trp, Cys | Degassed buffers, minimal headspace, store frozen |
| Deamidation | Asn (especially Asn-Gly), Gln | Avoid prolonged storage at basic pH and room temperature |
| Hydrolysis | Asp-Pro bonds | Avoid strongly acidic conditions |
| Aggregation / fibrillation | Amphipathic helices, lipidated analogues | Gentle mixing, appropriate concentration, avoid agitation |
| Adsorption | All peptides at low concentration | Low-binding plastics, carrier protein |

## How long do solutions last?

There is no universal answer — it depends on sequence, concentration, solvent and temperature. As a conservative default for research use: store aliquots at −20 °C or below, thaw once, and validate stability for your own conditions if experiments run over long periods (for example by HPLC re-analysis).

## Safety and compliance

- Handle all research peptides with standard laboratory PPE and follow the safety data sheet.
- Store and dispose of materials according to your institution's chemical-safety rules.
- Products sold by GLP Research are for in-vitro laboratory research only and are not for human or veterinary use.`,
  },
  {
    slug: "history-of-glp-1",
    title: "From Gila monster venom to the Lasker Award: a short history of GLP-1",
    excerpt:
      "Six decades of incretin science — the observations, the unexpected discoveries and the people behind one of the most consequential drug classes in modern medicine.",
    category: "Fundamentals",
    coverImage: "/images/gila-monster.webp",
    readingMinutes: 8,
    content: `The story of GLP-1 is a story of patient basic science paying off decades later — with a detour through the venom of a desert lizard.

## 1964: something in the gut

Researchers comparing oral and intravenous glucose noticed that swallowing glucose released far more insulin than infusing it, even at the same blood glucose level. The gut was sending a signal. The phenomenon was named the **incretin effect**, and the hunt for the responsible hormones began.

## The 1970s: GIP comes first

The first incretin identified was **GIP**, originally named gastric inhibitory polypeptide for its effect on stomach acid, and later renamed glucose-dependent insulinotropic polypeptide. GIP clearly stimulated insulin secretion — but it could not account for the whole incretin effect, and its activity was blunted in type 2 diabetes.

## 1983: a gene with hidden passengers

When Bell and colleagues cloned the gene for proglucagon, the precursor of glucagon, they found it encoded more than glucagon: two additional glucagon-like sequences. They were named **GLP-1** and **GLP-2**.

## 1987: the active form is found

The full-length GLP-1 predicted by the gene turned out to be weakly active. The breakthrough came when three groups — **Svetlana Mojsov, Gordon Weir and Joel Habener**; **Jens Juul Holst** and colleagues; and **Daniel Drucker** and colleagues — showed that a **truncated** form, GLP-1(7-37) or (7-36)amide, was a remarkably potent, glucose-dependent stimulator of insulin release.

By 1993, Michael Nauck and colleagues had shown that infusing GLP-1 could normalise fasting blood glucose in people with type 2 diabetes. The therapeutic potential was obvious — but so was the problem: GLP-1 was destroyed by DPP-4 within minutes.

## 1992: an answer from the desert

At the Bronx Veterans Affairs Medical Center, endocrinologist **John Eng** was screening reptile venoms for novel hormones. In the venom of the **Gila monster** (*Heloderma suspectum*) he found **exendin-4**, a 39-amino-acid peptide that activated the GLP-1 receptor — and, thanks to a glycine at position 2, resisted DPP-4.

Synthetic exendin-4 became **exenatide**. In **2005** it was approved in the US as the first GLP-1 receptor agonist for type 2 diabetes.

## 2000s–2010s: engineering longer life

At Novo Nordisk, a team including **Lotte Bjerre Knudsen** took a different route: attach a fatty acid so the peptide would bind albumin. The result, **liraglutide**, was approved in 2010 for diabetes and in 2014 as the first GLP-1 agonist for weight management. Further optimisation of the fatty acid and linker produced **semaglutide**, approved as a once-weekly injection in 2017 and as the first oral GLP-1 agonist in 2019.

In 2016, the **LEADER** and **SUSTAIN-6** trials showed reductions in cardiovascular events — evidence that the class did more than lower glucose.

## 2021–2023: obesity and beyond

Semaglutide 2.4 mg was approved for chronic weight management in 2021. In 2022, **tirzepatide** became the first approved dual GIP/GLP-1 agonist, reviving interest in GIP 50 years after its discovery. In 2023 the **SELECT** trial showed a 20% reduction in major cardiovascular events with semaglutide in people with obesity and cardiovascular disease but no diabetes.

## 2024: recognition

The **Lasker–DeBakey Clinical Medical Research Award** went to **Joel Habener, Svetlana Mojsov and Lotte Bjerre Knudsen** for the discovery and development of GLP-1-based medicines.

## 2025–2026: new molecules, new routes

China approved **mazdutide**, the first glucagon/GLP-1 dual agonist, in 2025. In the US, an oral semaglutide pill for weight management was approved in December 2025, followed in 2026 by **orforglipron**, a non-peptide oral GLP-1 agonist. Phase 3 programmes for the triple agonist **retatrutide** and the glucagon/GLP-1 agonist **survodutide** reported results.

Sixty years after the incretin effect was first described, the field is still accelerating. [See the full timeline](/research#timeline).`,
  },
  {
    slug: "glossary",
    title: "Glossary of incretin research terms",
    excerpt: "Plain-language definitions of the receptors, assays, chemistry and trial terminology used throughout the research library.",
    category: "Reference",
    coverImage: "/images/lab-bench.webp",
    readingMinutes: 7,
    content: `A quick reference to terms used across the GLP Research library. Terms are grouped by topic.

## Biology

**Incretin** — A gut hormone released after eating that enhances insulin secretion. GLP-1 and GIP are the two main incretins.

**Incretin effect** — The greater insulin response to oral glucose than to intravenous glucose at the same blood glucose level.

**L-cell** — Enteroendocrine cell in the lower small intestine and colon that secretes GLP-1, GLP-2 and oxyntomodulin.

**K-cell** — Enteroendocrine cell in the upper small intestine that secretes GIP.

**Proglucagon** — Precursor protein processed into glucagon (pancreas) or GLP-1, GLP-2, oxyntomodulin and glicentin (gut and brain).

**Oxyntomodulin** — A proglucagon-derived gut hormone that activates both the GLP-1 and glucagon receptors; the template for mazdutide.

**DPP-4 (dipeptidyl peptidase-4)** — Enzyme that inactivates GLP-1 and GIP by removing their first two amino acids.

**Glucose-dependent** — Describes an effect that occurs only when glucose is elevated, such as GLP-1-stimulated insulin secretion.

## Receptors and signalling

**GLP-1R** — The GLP-1 receptor, a class B1 G-protein-coupled receptor.

**GIPR** — The GIP receptor.

**GCGR** — The glucagon receptor, expressed predominantly in the liver.

**Class B1 GPCR** — Family of peptide-hormone receptors with a large extracellular domain, including GLP-1R, GIPR and GCGR.

**cAMP** — Cyclic adenosine monophosphate; the main second messenger produced when GLP-1R couples to Gαs.

**β-arrestin** — Protein recruited to activated receptors that promotes internalisation and can initiate signalling.

**Biased agonism** — When a ligand preferentially activates one signalling pathway over another at the same receptor.

**EC₅₀** — Concentration producing half of the maximal response; a measure of potency.

**Exendin(9-39)** — A truncated form of exendin-4 that blocks the GLP-1 receptor; used as an antagonist control.

**Tachyphylaxis** — Diminishing response with continued exposure, seen for the gastric-emptying effect of long-acting GLP-1 agonists.

## Chemistry

**Aib** — α-Aminoisobutyric acid, a non-natural amino acid used at position 2 to block DPP-4.

**Acylation / lipidation** — Attaching a fatty acid to a peptide, typically on a lysine side chain, to promote albumin binding.

**Fatty diacid** — A fatty acid with a carboxylic acid at both ends; binds albumin more strongly than a monoacid.

**OEG / AEEA** — 8-Amino-3,6-dioxaoctanoic acid, a hydrophilic linker unit used in semaglutide and related analogues.

**SPPS** — Solid-phase peptide synthesis, the standard method for making research peptides.

**Lyophilization** — Freeze-drying; removes water to give a stable dry powder.

## Analytics

**RP-HPLC** — Reverse-phase high-performance liquid chromatography; separates peptides by hydrophobicity to measure purity.

**ESI-MS** — Electrospray ionisation mass spectrometry; confirms identity by measuring molecular mass.

**COA** — Certificate of analysis; documents the test results for a specific batch.

**Net peptide content** — The proportion of a sample's weight that is peptide, as opposed to water and counter-ions.

**Counter-ion** — An ion (usually trifluoroacetate or acetate) paired with charged residues in a peptide salt.

## Clinical trial terms

**HbA1c** — Glycated haemoglobin; reflects average blood glucose over about three months.

**MACE** — Major adverse cardiovascular events; usually cardiovascular death, non-fatal heart attack or non-fatal stroke.

**Hazard ratio (HR)** — The relative rate of an event in one group versus another over time; HR 0.80 means a 20% lower rate.

**Estimand** — A precise definition of the treatment effect being estimated. The *treatment-regimen* estimand includes everyone regardless of whether they stopped treatment; the *efficacy* estimand estimates the effect had everyone stayed on treatment.

**Non-inferiority** — A trial design showing a treatment is not unacceptably worse than a comparator.

**MASH** — Metabolic-dysfunction-associated steatohepatitis, an inflammatory form of fatty liver disease (formerly NASH).

**HFpEF** — Heart failure with preserved ejection fraction.`,
  },
];
