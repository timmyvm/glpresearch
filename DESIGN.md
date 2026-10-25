# GLP Research design system (v2)

The site's art direction, set with the skills in `.claude/skills/` (`design-taste-frontend`, `frontend-design`, `web-design-guidelines`, `vercel-react-best-practices`). Read this before you build or restyle any screen.

## Direction

**The page is the object** (taste-skill draw, seed 1150358053, sector physical-product, tone technical).

**The idea:** the certificate of analysis that comes with every GLP Research batch becomes the page itself.
- The homepage opens on the certificate, printed as a paper card over a dark lab.
- Every other screen is another piece of the same lab paperwork, built as filled paper shapes with real edges.
- The footer is the back of the certificate.

**The live thing** is on the homepage certificate. Pick one of the seven compounds and the sheet reprints from that compound's latest published batch:
- batch number, purity and observed mass;
- an HPLC trace drawn from the purity;
- the amino-acid sequence, with every residue that differs from native GLP-1 marked in the compound's label colour.

**The signature move** is the pinned story. On wide screens the certificate holds its place while the lab's photographs pass, shrinking to a stub at the bottom-left. It is pure CSS (`animation-timeline`), with a static fallback.

## The artefact for each screen

| Screen | Paperwork it is built as |
|---|---|
| Home | The certificate, the catalogue data sheet, stacked history sheets, the batch register, the research shelf, the dispatch slip |
| Catalogue `/shop` | A price list or data sheet: specimen plates with tabular rows |
| Product page | The compound's data sheet: label stripe, specifications set as a sheet, batch certificates with traces, sequence strip |
| Lab results `/coa` | The certificate itself, printed in full for the batch you look up |
| Compare | A comparison table on paper |
| Research library and articles | Journal pages: a contents sheet, then an article set like a printed paper |
| Cart and checkout | A receipt and order form on slips |
| Order confirmation and invoice | A receipt torn off along its bottom edge |
| Account | Folders of an order history |
| Admin | An app screen (`references/app-screens.md`), with the same palette and type |

## Tokens (`src/app/globals.css`)

| Role | Value | Notes |
|---|---|---|
| `--color-bg` | `#ffffff` | The page ground |
| `--color-surface` / `--color-surface-2` | `#f4f4f2` / `#e9e8e4` | Tone steps for panels, inputs and tabs |
| `--color-paper` | `#edebe7` | Paper: the certificate, slips and the back of the card |
| `--color-ink` | `#1f2b4d` | Navy. All running text and headlines |
| `--color-muted` | `#5d6479` | Secondary text only |
| `--color-accent` / `--color-accent-ink` | `#f7941d` / `#1f2b4d` | Tangerine. The one action on a screen, plus trial labels on the shelf |
| `--color-field-black` | `#05070a` | The ground behind the hero, the photo run and the dispatch slip |
| `--color-field-paper` | `#e3e1dc` | Warm grey ground: the batch register and the footer |
| `--color-on-black-muted` / `--color-on-navy-muted` | `#a9aebb` / `#b8bed0` | Secondary text on dark grounds |

The old field names (`field-grey`, `field-mint`, `field-orange`, `field-navy`) still resolve to the new palette, so un-migrated screens stay on palette. New work uses the roles above.

**Compound label colours** are stored as `Product.accentColor` and come from the vial label stripe. They appear only as a label stripe, a specimen plate, a tab swatch or a marked residue. They are never whole section grounds. Use `plateInk(hex)` from `src/lib/plates.ts` for text on them.

## Type

One family: **Bricolage Grotesque**, a variable font loaded with optical sizing (`next/font`, `--font-bricolage`).
- Display weight is 600, at tracking −0.04em and leading 0.9.
- Text weights are 400, with 500 for emphasis.

| Step | Size | Use |
|---|---|---|
| `text-small` | 13–14px | Captions, credits, meta. Never smaller |
| `text-body` | 17–19px | Running text, at leading 1.5 and a measure of 62ch or less |
| `text-lead` | 20–26px | Supporting lines, facts on a certificate |
| `text-index` | 28–44px | Panel headings |
| `text-head` | 36–76px | Section headings |
| `text-display` | 48–136px | The page's h1 and big figures |

Headline rules:
- Two lines or fewer at every width.
- Sentence case for headings; Title Case for buttons.
- Tabular figures for prices, purities and batch numbers.
- No monospace anywhere, including batch numbers and sequences, which use tabular figures in the text face.

## Stationery (shared components)

- `src/components/store/paper.tsx`:
  - `Scallops`: a scalloped top edge.
  - `Slip`: a paper slip with a zigzag bottom edge, from `zigzagBottom()` in `src/lib/edges.ts`.
  - `SlipRow`: a label, a dot leader and a value.
- `.leader`: a dot leader made of round 4px dots, from `border-bottom: dotted`.
- `src/components/store/chromatogram.tsx`: an HPLC trace drawn from a batch's purity and seeded by its batch number. It stretches to its box; give it a height or an aspect ratio.
- `src/components/store/sequence-strip.tsx` with `parseSequence()` from `src/lib/sequence.ts`: residues compared with native GLP-1.
- Paper cards may be tilted by 1 to 1.5 degrees and cut off by a section edge (the batch register).

## Geometry

- **Grid:** one pair of margins (`--margin`) and a 12-column grid, capped at 1760px (`.frame`).
- **Corners:** square everywhere. The only round shapes are scallops and status pills in app screens.
- **Section spacing:** 112–160px between sections, and a change of ground colour is a hard cut.

## Never (checked by `node .claude/skills/design-taste-frontend/scripts/lint.mjs src`)

- Eyebrow or kicker labels, or tiny uppercase tracked labels.
- Monospace outside real code.
- 01/02/03 index numbering.
- Gradients. The one exception is a neutral scrim behind text on a photo.
- Shadows on resting elements.
- Hairline dividers or 1px outlined boxes outside real tables, form fields and `data-ui` fragments. Edges are made by fills and clip-paths instead.
- Glass, backdrop blur or pill navigation.
- Violet or indigo.
- An accent-styled word in a headline.
- Icon-topped cards or rows of identical cards.
- Emoji or decorative blobs.

## Motion

- **Scroll reveals:** `[data-reveal]` elements rise 24px with opacity over 160px of scroll (CSS `animation-timeline: view()`), with `--i` adding 24px per step for a stagger. No JavaScript is involved.
- **The pinned story:** the hero (see Direction).
- **Reprint:** `.reprint` replays a short rise when a certificate or tab panel changes.
- **Feedback:** `.press` on every control, and underline colour on links.
- **Moving pictures:** the hero lab loop (`/video/lab-night.mp4`, plays on wide screens only) and the HPLC loop in the batch register. Both have a Pause control.
- Everything has a `prefers-reduced-motion` fallback that keeps the content.

## Imagery

- **Lab photography** (generated with Higgsfield, all in one low-key documentary light) lives in `public/images/lab/`: the night lab, autosampler, freezer rack, crimp sealing, packing, freeze-dried cake, vial check and notebook.
- **Product vials and specimen cut-outs** are in `public/images/products/` and `public/images/specimens/`.
- **Archival plates** (open licences, credited in the footer through `src/content/credits.ts`) live in `public/images/archive/`:
  - the 1686 intestines engraving;
  - Wirsung's 1642 pancreas drawing;
  - a reticulate Gila monster (exenatide's origin) and a hand-coloured Heloderma print;
  - an islets of Langerhans micrograph;
  - Kirtland's 1806 engraving of the heart;
  - the "Chymie" laboratory engraving.
- Article covers use these plates or the lab photographs, and every picture's caption comes from `pictureCaption()` in `src/content/credits.ts`.
- Never show another company's name or a fake brand in a generated picture. Never let a picture claim more than the business does: orders ship with a packing slip of batch numbers, and certificates are published online.
