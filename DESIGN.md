# GLP Research design system

The site's art direction, set with the skills in `.claude/skills/` (`design-taste-frontend`, `frontend-design`, `web-design-guidelines`, `vercel-react-best-practices`). Read this before you build or restyle any screen.

## Direction

**The specimen catalogue** (taste-skill draw, seed 410654917, type slot redrawn).

The idea: each compound's vial, with its colour-coded label stripe, is a specimen shown on its own flat colour plate and catalogued like a field guide. Every vial is shot at the same scale and angle and named plainly with its formula, half-life and receptors. The stripe colour is that compound's colour everywhere it appears: its plate, its row and its chart line.

The live thing is the **half-life dial** on the homepage. Pick a compound and see how much longer it lasts than native GLP-1's roughly two minutes, for example semaglutide at about 5,040×. The hero line-up is a drag row through the seven vials.

Why the type slot was redrawn: the dealt Clarendon is a heritage bill-poster face. This subject's printed world is the vial label, the data sheet and the journal paper, all set in grotesks, so the type system was redrawn to Hanken Grotesk.

## Tokens (`src/app/globals.css`)

| Role | Value | Notes |
|---|---|---|
| `--bg` | `#ffffff` | Ground, 70–90% of every page |
| `--surface` | `#eef0f3` | One tone step. Panels, inputs and photo grounds; it matches the vial photo backdrop |
| `--ink` | `#0b1530` | Vial-cap navy. All running text and headlines |
| `--muted` | `#4a5468` | Secondary text only (7:1 on white) |
| `--accent` | `#a7ff9c` | Mint. The primary action, plus at most one other mark per screen |
| `--accent-ink` | `#0b1530` | Text on the accent |
| `--field-grey` / `--field-mint` / `--field-orange` / `--field-navy` | `#c9ced6` / `#a7ff9c` / `#ff6831` / `#0b1530` | Whole-section grounds, as hard cuts with no fades |

**Compound plates** (the label stripe colours, stored as `Product.accentColor`):

| Compound | Plate | Ink on plate |
|---|---|---|
| Semaglutide | `#2dd4bf` | navy |
| Tirzepatide | `#ff6831` | navy |
| Retatrutide | `#f59e0b` | navy |
| Liraglutide | `#38bdf8` | navy |
| Exenatide | `#10b981` | navy |
| Survodutide | `#f43f5e` | navy |
| Mazdutide | `#2563eb` | white |

Use `plateInk(hex)` from `src/lib/plates.ts` to get the ink for any plate colour.

## Type

One family: **Hanken Grotesk**, weights 400 and 500 only, with no bold anywhere.

| Step | Size | Use |
|---|---|---|
| `text-small` | 13–14px | Captions, legal text, table meta. Never smaller |
| `text-body` | 17–19px | Running text, at leading 1.5 and a measure of 62ch or less |
| `text-lead` | 20–26px | Supporting lines, item names |
| `text-head` | 32–64px | Section headings, at tracking −0.04em and leading 0.95 |
| `text-display` | 44–88px | The single h1 on each page, at tracking −0.05em and leading 0.9 |

Headline rules:
- Two lines or fewer at every width. Author the line breaks.
- Use `text-wrap: balance` on headings and `pretty` on paragraphs.
- Use tabular numbers for prices and data.
- Headings are sentence case; buttons and navigation labels are Title Case.

## Geometry

- **Grid:** one pair of margins (`--margin`, 16–32px) and a 12-column grid, capped at 1760px. Large things run to the margins, and only the measure of running text is constrained.
- **Corners:** square everywhere, on buttons, tiles, inputs and images. Status pills in app screens are the one rounded exception.
- **Section spacing:** 128–192px between sections on desktop and 80–112px on a phone. A change of ground colour can stand in for some of the space.

## Never (all of these are checked by `node .claude/skills/design-taste-frontend/scripts/lint.mjs src`)

- Eyebrow or kicker labels above headings, or tiny uppercase tracked labels.
- Monospace outside real code. Use tabular numbers in the text face instead.
- 01/02/03 index numbering.
- Gradients. The one exception is a neutral scrim behind text on a photo.
- Shadows on resting elements. Only menus, dialogs and the sticky header may float.
- Hairline dividers or 1px outlined boxes outside real tables, form fields and `data-ui` app fragments. Separate things with space or a tone step instead.
- Backdrop blur, glass panels or pill navigation.
- Violet or indigo.
- An accent-styled word inside a headline.
- Icon-topped feature cards, or rows of identical cards.
- Emoji, decorative blobs, or `transition: all`.
- More than about two em dashes on a page.

## Components

- **Button** (`src/components/ui/button.tsx`): square corners and Title Case labels. `primary` is a mint fill with navy text, `ink` is navy with white text, and `outline` is a navy 2px frame (a control, not a hairline). The press state is `scale(.97)`.
- **Form fields:** filled with `--surface`, no border, and a focus ring of 2px `--ink` with a 2px offset. Labels sit above the field and errors appear inline under it.
- **Prices:** tabular numbers, set in the text face.

## Motion (`src/app/globals.css`, `src/components/motion/*`)

- **Easing:** `--ease-out` for UI under 600ms and `--ease-expo` for reveals.
- **Durations:** press 140ms, hover 180ms, reveal 800ms.
- **Load sequence:** the hero h1 lines rise from a mask, then the lead and the action follow. Everything settles within 1.2s.
- **Reveals:** `[data-reveal]` elements rise 24px with opacity, once, in reading order with 70ms between them. They are hidden only under `@media (scripting: enabled)`, so with scripting off everything shows.
- **Hero:** the signature move is the drag row of vials, built on native scroll-snap.
- **One moving picture:** a slow drift on the lab photograph.
- **Reduced motion:** everything sits inside `prefers-reduced-motion: no-preference`, and the reduced state is simply the finished state.

## App screens

The admin, account, checkout and order screens are worked in, not read, so they follow `references/app-screens.md` from the taste skill:
- Quiet 1px borders on tables and panels, small sentence-case labels and status pills are all acceptable.
- Gradients, glows, icons in tinted squares, rainbow charts and invented numbers are not.

## Accessibility and quality floor (Vercel Web Interface Guidelines)

- Every page has a skip link, visible `:focus-visible`, `aria-label` on icon buttons, and `aria-live` on async messages.
- Inputs have `autocomplete`, the right `type`/`inputmode`, and `spellCheck={false}` on emails. Placeholders end in "…".
- Use real `<a>`/`<Link>` for navigation and `<button>` for actions. Destructive actions need a confirmation.
- Images have dimensions; below-fold images are lazy and the hero has priority.
- Filters, tabs and pagination live in the URL.
- Use `Intl` for every date and number.
