# GLP Research

An e-commerce and education site for incretin-class research peptides (GLP-1, dual GIP/GLP-1, glucagon co-agonists and triple agonists). It includes the storefront, a referenced research library, customer accounts and a full admin panel.

Built with **Next.js 16 (App Router)**, **React 19**, **Tailwind CSS 4**, **Prisma** and **TypeScript**. All imagery (logo, product vials, hero and article art) was generated with Higgsfield.

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

**Change the admin password before going live.** You can also promote any account to admin from **Admin → Customers**.

## What's in it

**Storefront**
- Home, catalogue with receptor-class filters (`/shop`), and product pages with a full research monograph: mechanism, published studies, specifications, sequence, batch COAs, storage and references.
- Research library (`/research`): long-form articles, a glossary and a timeline of incretin science.
- Compound comparison (`/compare`), batch certificate lookup (`/coa`), FAQ, About, Contact and policy pages.
- Research-use acknowledgement gate, cart drawer, SEO metadata, JSON-LD, sitemap and robots.

**Customers**
- Register, sign in, forgot/reset password.
- Account dashboard, order history with a live progress tracker and timeline, saved addresses, and profile/password settings.
- Cart and checkout (guest or signed in): server-side repricing, stock checks, coupons, standard/express shipping, and bank transfer, PayID or crypto with payment instructions.
- Order confirmation page and public order tracking (`/track`).

**Admin (`/admin`)**
- Dashboard: revenue, orders, AOV, customer KPIs and charts.
- Orders: filtering, CSV export, status workflow with customer emails, tracking numbers, notes and packing slips.
- Products & variants, inventory, batches/COAs, customers, coupons, articles (markdown editor), inbox and subscribers, email log, and store settings (shipping rates, payment details, announcement bar).

## Emails

Transactional emails (welcome, order confirmation, status updates, password reset) are written to the **Email log** in the admin panel. Set `RESEND_API_KEY` and `EMAIL_FROM` to also deliver them through [Resend](https://resend.com).

## Deploying

The default database is a local SQLite file, which is fine for development but not for serverless hosts. For production:

1. Create a Postgres database (Supabase, Neon or Vercel Postgres).
2. In `prisma/schema.prisma`, change `provider = "sqlite"` to `provider = "postgresql"`.
3. Set `DATABASE_URL`, `AUTH_SECRET` and `NEXT_PUBLIC_SITE_URL` in your host's environment.
4. Run `npm run db:push && npm run db:seed` once against the new database.
5. Deploy (e.g. Vercel). `npm run build` runs `prisma generate` first.

Admin image uploads are saved to `./uploads` and served from `/api/uploads/…`. On serverless hosts the filesystem isn't persistent, so either paste image URLs, or swap the upload route for object storage such as Vercel Blob, S3 or Cloudinary.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` / `npm start` | Production build / serve |
| `npm run lint` / `npm run typecheck` | ESLint / TypeScript |
| `npm run db:push` | Sync the Prisma schema to the database |
| `npm run db:seed` | **Wipe** and reseed demo data |
| `npm run db:reset` | Force-reset the schema and reseed |
| `npm run db:studio` | Open Prisma Studio |
| `npm run images` | Convert new PNGs in `public/images` to WebP |

## Content accuracy

Compound data (formulas, molecular weights, CAS numbers, half-lives, regulatory status and trial results) was checked against PubChem/KEGG, FDA labels, PubMed and sponsor releases as of October 2026. Edit products and articles in the admin panel as new data is published.

## Compliance

The site presents every product as **for laboratory research use only, not for human or veterinary use**. It includes an entry gate, compliance checkboxes at checkout and a research use policy. Peptides such as semaglutide and tirzepatide are prescription-only medicines in many countries (in Australia they are Schedule 4 under the TGA). You are responsible for making sure your business, product listings and payment methods comply with the laws where you operate and sell. Get legal advice before launching.
