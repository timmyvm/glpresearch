# GLP Research

An e-commerce and education site for incretin-class research peptides: GLP-1, dual GIP/GLP-1, glucagon co-agonists and triple agonists. It has a storefront, a referenced research library, customer accounts, checkout and a full admin panel.

Built with **Next.js 16 (App Router)**, **React 19**, **Tailwind CSS 4**, **Prisma** and **TypeScript**. All imagery was generated with Higgsfield: the logo, the product vials and their cut-outs, the lab photography, the article covers and the homepage video loop.

## Quick start

```bash
npm install            # also runs `prisma generate`
cp .env.example .env   # then set AUTH_SECRET (openssl rand -base64 32)
npm run db:push        # create the SQLite database
npm run db:seed        # load products, articles, demo customers & orders
npm run dev            # http://localhost:3000
```

Seeded logins:

| Role | Email | Password |
|---|---|---|
| Admin | `admin@glpresearch.com` (or `SEED_ADMIN_EMAIL`) | `ChangeMe123!` (or `SEED_ADMIN_PASSWORD`) |
| Customer | `olivia.chen@example.com` | `Password123!` |

**Change the admin password before going live.** You can promote any account to admin from **Admin → Customers**.

## Design

The look is documented in **[DESIGN.md](DESIGN.md)**. Read it before changing any screen.

- **The idea:** each compound is a "specimen". Its vial is shown on its own flat colour plate, taken from the stripe on its label, and catalogued like a field guide.
- **Type:** one typeface, Hanken Grotesk.
- **Colour:** navy ink on white, with a mint accent for actions.
- **Shape and finish:** square corners, and no gradients, shadows or hairline rules on resting elements.
- **App screens:** admin, account and checkout follow app-screen rules: quiet borders, pale status pills and right-aligned tabular figures.

### Design skills (`.claude/skills/`)

The project ships with the skills used to design it, so Claude Code sessions in this repo pick them up automatically:

| Skill | Source | What it does |
|---|---|---|
| `frontend-design` | [anthropics/claude-plugins-official](https://github.com/anthropics/claude-plugins-official/tree/main/plugins/frontend-design) | Art direction: distinctive type, palette and layout, and avoiding templated defaults |
| `design-taste-frontend` | [Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill) | Deals a researched direction and enforces a no-ornament house style. Includes a source linter and a real-browser inspector |
| `web-design-guidelines` | [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills) | Vercel's Web Interface Guidelines: accessibility, focus, forms, motion and copy |
| `vercel-react-best-practices` | [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills) | Vercel's React and Next.js performance rules |

Check a page against the house rules:

```bash
node .claude/skills/design-taste-frontend/scripts/lint.mjs src            # source scan
node .claude/skills/design-taste-frontend/scripts/inspect.mjs http://localhost:3000/shop   # real browser (needs Chrome; set CHROME_PATH)
```

## What's in it

**Storefront**
- **Homepage:** a hero you can drag through the seven vials, a price list, a half-life explainer that compares each compound with native GLP-1, the latest certificates of analysis, the research library, the fulfilment process and FAQs.
- **Catalogue (`/shop`):** compounds as specimen tiles, filtered by receptor class.
- **Product pages:** a full research monograph covering mechanism, published studies, specifications, sequence, batch certificates, storage and references, plus "Email me when it's back" for sold-out sizes.
- **Research library (`/research`):** 10 referenced articles, a glossary and a timeline.
- **Other pages:** compound comparison (`/compare`), certificate lookup by batch number (`/coa`), site search across compounds, articles, FAQs and batches (`/search`), FAQ, About, Contact and policy pages.
- **Plumbing:** a research-use notice (cookie-based, never covers content), Open Graph images, JSON-LD, sitemap and robots.

**Customers**
- **Sign-in:** register, sign in, and password reset, all rate-limited.
- **Account:**
  - an overview and order history with a progress tracker and timeline;
  - saved addresses;
  - profile and password settings;
  - an option to close the account.
- **Cart and checkout (guest or signed in):** prices are recalculated on the server, stock is checked, and coupons and standard or express shipping are applied. Payment is by bank transfer, PayID or crypto, with instructions shown after the order.
- **After ordering:**
  - **"I've sent payment"** notifies the store.
  - Customers can cancel while the order is unpaid.
  - A printable invoice is available.
  - Orders can be tracked at `/track`.

**Admin (`/admin`)**
- **Overview:** payments to match (customer-reported payments first), orders ready to pack, revenue and order figures, top compounds and stock.
- **Orders:**
  - filters and CSV export;
  - a status workflow that emails customers;
  - tracking numbers, notes and packing slips;
  - a **Customer says paid** queue with one-click Mark Paid.
- **Unpaid-order expiry:** orders still unpaid after the payment window (48 hours by default) are cancelled automatically, their stock is returned and the customer is emailed.
- **Catalogue:** products and variants, inventory, batch certificates, and **stock alerts** that email waiting customers when stock returns.
- **Everything else:** customers, coupons, articles (markdown editor), inbox and subscribers, email log, and store settings.

## Emails

Every transactional email is written to the admin **Email log**: welcome, order confirmation, new-order alert, payment report, status updates, back in stock, expiry and password reset. Set `RESEND_API_KEY` and `EMAIL_FROM` to also deliver them through [Resend](https://resend.com).

## Scheduled job

`vercel.json` runs `GET /api/cron/expire-orders` every hour. The route needs `Authorization: Bearer $CRON_SECRET`; Vercel sends this automatically when `CRON_SECRET` is set in the project's environment variables. Outside Vercel, call it from any scheduler with that header, or use **Cancel Expired** in the admin.

## Deploying

The default database is a local SQLite file, which is fine for development but not for serverless hosts. For production:

1. Create a Postgres database (Supabase, Neon or Vercel Postgres).
2. In `prisma/schema.prisma`, change `provider = "sqlite"` to `provider = "postgresql"`.
3. Set `DATABASE_URL`, `AUTH_SECRET`, `NEXT_PUBLIC_SITE_URL` and `CRON_SECRET` in the host's environment.
4. Run `npm run db:push && npm run db:seed` once against the new database. Seeding wipes existing data.
5. Deploy (e.g. Vercel). `npm run build` runs `prisma generate` first.

Admin image uploads are saved to `./uploads` and served from `/api/uploads/…`. On serverless hosts the filesystem isn't persistent, so either paste image URLs or swap the upload route for object storage (Vercel Blob, S3 or Cloudinary).

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` / `npm start` | Production build / serve |
| `npm run lint` / `npm run typecheck` | ESLint / TypeScript |
| `npm run test:e2e` | Playwright end-to-end tests (uses the dev server on :3000; seed first) |
| `npm run test:flows` | Customer journey checks: register, checkout, payment, cancel, invoices, rate limits, close account. Cleans up after itself |
| `npm run db:push` | Sync the Prisma schema to the database |
| `npm run db:seed` | **Wipe** and reseed demo data |
| `npm run db:reset` | Force-reset the schema and reseed |
| `npm run db:studio` | Open Prisma Studio |
| `npm run images` | Convert new PNGs in `public/images` to WebP |

## Content accuracy

Compound data and trial results were checked against PubChem/KEGG, FDA labels, PubMed and sponsor releases as of October 2026: formulas, molecular weights, CAS numbers, half-lives, regulatory status and trial results. Edit products and articles in the admin as new data is published.

## Compliance

The site presents every product as **for laboratory research use only, not for human or veterinary use**. It has a research-use notice, compliance checkboxes at checkout and a research use policy.

Peptides such as semaglutide and tirzepatide are prescription-only medicines in many countries; in Australia they are Schedule 4 under the TGA. You are responsible for making sure the business, its listings and its payment methods comply with the laws where you operate and sell. Get legal advice before launching.
