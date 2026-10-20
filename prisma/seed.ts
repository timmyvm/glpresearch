import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { randomBytes } from "node:crypto";
import { products } from "./data/products";
import { articles } from "./data/articles";

const db = new PrismaClient();

// Deterministic pseudo-random so demo data is stable between seeds.
let seed = 42;
const rand = () => {
  seed = (seed * 16807) % 2147483647;
  return (seed - 1) / 2147483646;
};
const pick = <T,>(arr: T[]) => arr[Math.floor(rand() * arr.length)];
const daysAgo = (d: number, h = 0) => new Date(Date.now() - d * 86400000 - h * 3600000);

const customers = [
  { firstName: "Olivia", lastName: "Chen", institution: "Monash Biomedicine Discovery Lab", city: "Clayton", state: "VIC", postcode: "3168" },
  { firstName: "James", lastName: "Whitaker", institution: "Harbour Metabolic Research", city: "Sydney", state: "NSW", postcode: "2000" },
  { firstName: "Priya", lastName: "Natarajan", institution: "QBio Analytical", city: "Brisbane", state: "QLD", postcode: "4000" },
  { firstName: "Liam", lastName: "O'Connor", institution: null, city: "Perth", state: "WA", postcode: "6000" },
  { firstName: "Sofia", lastName: "Rossi", institution: "Adelaide Peptide Chemistry Group", city: "Adelaide", state: "SA", postcode: "5000" },
  { firstName: "Noah", lastName: "Williams", institution: null, city: "Hobart", state: "TAS", postcode: "7000" },
  { firstName: "Ava", lastName: "Thompson", institution: "Canberra Endocrine Lab", city: "Canberra", state: "ACT", postcode: "2600" },
  { firstName: "Ethan", lastName: "Nguyen", institution: "Southbank Cell Signalling", city: "Melbourne", state: "VIC", postcode: "3006" },
  { firstName: "Mia", lastName: "Patel", institution: null, city: "Gold Coast", state: "QLD", postcode: "4217" },
  { firstName: "Lucas", lastName: "Kowalski", institution: "Newcastle Receptor Pharmacology", city: "Newcastle", state: "NSW", postcode: "2300" },
  { firstName: "Isla", lastName: "MacDonald", institution: null, city: "Geelong", state: "VIC", postcode: "3220" },
  { firstName: "Henry", lastName: "Kim", institution: "Darwin Tropical Health Research", city: "Darwin", state: "NT", postcode: "0800" },
];

const streets = ["Collins St", "George St", "Queen St", "Hay St", "King William St", "Macquarie St", "Northbourne Ave", "Swanston St"];

async function main() {
  console.log("Clearing database…");
  await db.orderEvent.deleteMany();
  await db.orderItem.deleteMany();
  await db.order.deleteMany();
  await db.batch.deleteMany();
  await db.productVariant.deleteMany();
  await db.product.deleteMany();
  await db.address.deleteMany();
  await db.passwordResetToken.deleteMany();
  await db.user.deleteMany();
  await db.coupon.deleteMany();
  await db.article.deleteMany();
  await db.contactMessage.deleteMany();
  await db.subscriber.deleteMany();
  await db.emailLog.deleteMany();
  await db.setting.deleteMany();

  console.log("Creating admin…");
  const adminEmail = (process.env.SEED_ADMIN_EMAIL ?? "admin@glpresearch.com").toLowerCase();
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "ChangeMe123!";
  await db.user.create({
    data: {
      email: adminEmail,
      passwordHash: await bcrypt.hash(adminPassword, 12),
      firstName: "Store",
      lastName: "Admin",
      role: "ADMIN",
    },
  });

  console.log("Creating catalogue…");
  const variantRecords: { id: string; productName: string; label: string; sku: string; price: number; image: string }[] = [];
  for (const [i, p] of products.entries()) {
    const { variants, references, ...data } = p;
    const product = await db.product.create({
      data: {
        ...data,
        image: variants[Math.min(1, variants.length - 1)].image,
        references: JSON.stringify(references),
        sortOrder: i,
        variants: { create: variants.map((v, j) => ({ ...v, sortOrder: j })) },
      },
      include: { variants: true },
    });
    for (const v of product.variants) {
      variantRecords.push({ id: v.id, productName: product.name, label: v.label, sku: v.sku, price: v.price, image: v.image ?? product.image });
    }

    // Two published batches per product with COA data.
    const code = p.variants[0].sku.split("-")[1];
    for (let b = 0; b < 2; b++) {
      const tested = daysAgo(20 + b * 75 + i * 3);
      await db.batch.create({
        data: {
          productId: product.id,
          batchNumber: `${code}-${tested.getFullYear().toString().slice(2)}${String(tested.getMonth() + 1).padStart(2, "0")}-${String(100 + i * 7 + b * 31)}`,
          variantLabel: p.variants[b % p.variants.length].label,
          purity: Math.round((99.1 + rand() * 0.8) * 100) / 100,
          massSpec: p.molecularWeight
            ? `Identity confirmed — observed mass consistent with theoretical ${p.molecularWeight.replace(" g/mol", " Da")}`
            : "Identity confirmed — observed mass consistent with reference standard",
          laboratory: b === 0 ? "Independent ISO/IEC 17025-accredited laboratory" : "Independent analytical laboratory (HPLC/MS)",
          testedAt: tested,
          expiresAt: new Date(tested.getTime() + 730 * 86400000),
          notes: b === 0 ? "Current batch" : null,
        },
      });
    }
  }

  console.log("Creating customers…");
  const passwordHash = await bcrypt.hash("Password123!", 12);
  const users = [];
  for (const [i, c] of customers.entries()) {
    const email = `${c.firstName}.${c.lastName}`.toLowerCase().replace(/[^a-z.]/g, "") + "@example.com";
    const user = await db.user.create({
      data: {
        email,
        passwordHash,
        firstName: c.firstName,
        lastName: c.lastName,
        institution: c.institution,
        phone: `04${String(10000000 + i * 1234567).slice(0, 8)}`,
        marketingOptIn: i % 3 === 0,
        createdAt: daysAgo(120 - i * 8),
        lastLoginAt: daysAgo(i),
        addresses: {
          create: {
            label: c.institution ? "Lab" : "Home",
            firstName: c.firstName,
            lastName: c.lastName,
            company: c.institution,
            line1: `${10 + i * 7} ${streets[i % streets.length]}`,
            city: c.city,
            state: c.state,
            postcode: c.postcode,
            country: "Australia",
            isDefault: true,
          },
        },
      },
      include: { addresses: true },
    });
    users.push(user);
  }

  console.log("Creating coupons…");
  await db.coupon.createMany({
    data: [
      { code: "WELCOME10", description: "10% off first order", type: "PERCENT", value: 10, usedCount: 7 },
      { code: "LAB25", description: "$25 off orders over $300", type: "FIXED", value: 2500, minSubtotal: 30000, usedCount: 3 },
      { code: "BULK15", description: "15% off orders over $600", type: "PERCENT", value: 15, minSubtotal: 60000, maxUses: 50, usedCount: 2 },
    ],
  });

  console.log("Creating orders…");
  const statuses = ["DELIVERED", "DELIVERED", "DELIVERED", "SHIPPED", "SHIPPED", "PROCESSING", "PAID", "PENDING_PAYMENT", "PENDING_PAYMENT", "CANCELLED"];
  const methods = ["BANK_TRANSFER", "PAYID", "PAYID", "CRYPTO"];
  for (let n = 0; n < 48; n++) {
    const user = pick(users);
    const address = user.addresses[0];
    const age = Math.floor(rand() * 75);
    const created = daysAgo(age, Math.floor(rand() * 20));
    let status = pick(statuses);
    if (age < 2 && status === "DELIVERED") status = "PROCESSING";
    if (age > 10 && status === "PENDING_PAYMENT") status = "DELIVERED";

    const lines = Array.from({ length: 1 + Math.floor(rand() * 3) }, () => pick(variantRecords));
    const unique = [...new Map(lines.map((l) => [l.id, l])).values()];
    const items = unique.map((v) => {
      const quantity = 1 + Math.floor(rand() * 3);
      return { variantId: v.id, productName: v.productName, variantLabel: v.label, sku: v.sku, image: v.image, unitPrice: v.price, quantity, lineTotal: v.price * quantity };
    });
    const subtotal = items.reduce((s, i) => s + i.lineTotal, 0);
    const discount = n % 7 === 0 ? Math.round(subtotal * 0.1) : 0;
    const shippingMethod = rand() > 0.75 ? "EXPRESS" : "STANDARD";
    const shipping = shippingMethod === "EXPRESS" ? 1995 : subtotal - discount >= 25000 ? 0 : 1295;
    const paid = !["PENDING_PAYMENT", "CANCELLED"].includes(status);
    const shipped = ["SHIPPED", "DELIVERED"].includes(status);

    const events: { type: string; status?: string; message: string; createdAt: Date; createdBy?: string }[] = [
      { type: "STATUS", status: "PENDING_PAYMENT", message: "Order placed. Awaiting payment.", createdAt: created },
    ];
    if (paid) events.push({ type: "PAYMENT", status: "PAID", message: "Payment received and confirmed.", createdAt: new Date(created.getTime() + 5 * 3600000), createdBy: adminEmail });
    if (["PROCESSING", "SHIPPED", "DELIVERED"].includes(status)) events.push({ type: "STATUS", status: "PROCESSING", message: "Order is being picked and packed.", createdAt: new Date(created.getTime() + 20 * 3600000), createdBy: adminEmail });
    if (shipped) events.push({ type: "STATUS", status: "SHIPPED", message: "Shipped with Australia Post.", createdAt: new Date(created.getTime() + 30 * 3600000), createdBy: adminEmail });
    if (status === "DELIVERED") events.push({ type: "STATUS", status: "DELIVERED", message: "Delivered.", createdAt: new Date(created.getTime() + 4 * 86400000), createdBy: adminEmail });
    if (status === "CANCELLED") events.push({ type: "STATUS", status: "CANCELLED", message: "Cancelled — payment not received within 48 hours.", createdAt: new Date(created.getTime() + 50 * 3600000), createdBy: adminEmail });

    await db.order.create({
      data: {
        number: `GLP-${10240 + n}`,
        accessToken: randomBytes(16).toString("hex"),
        userId: user.id,
        email: user.email,
        status,
        paymentMethod: pick(methods),
        paymentStatus: paid ? "PAID" : "UNPAID",
        subtotal,
        discount,
        shipping,
        total: subtotal - discount + shipping,
        couponCode: discount ? "WELCOME10" : null,
        shippingMethod,
        shipFirstName: address.firstName,
        shipLastName: address.lastName,
        shipCompany: address.company,
        shipLine1: address.line1,
        shipCity: address.city,
        shipState: address.state,
        shipPostcode: address.postcode,
        shipCountry: address.country,
        carrier: shipped ? "Australia Post" : null,
        trackingNumber: shipped ? `33LPR${String(500000 + n * 7919).padStart(7, "0")}01000` : null,
        researchAck: true,
        paidAt: paid ? events.find((e) => e.status === "PAID")?.createdAt : null,
        shippedAt: shipped ? events.find((e) => e.status === "SHIPPED")?.createdAt : null,
        deliveredAt: status === "DELIVERED" ? events.find((e) => e.status === "DELIVERED")?.createdAt : null,
        cancelledAt: status === "CANCELLED" ? events.find((e) => e.status === "CANCELLED")?.createdAt : null,
        createdAt: created,
        items: { create: items },
        events: { create: events },
      },
    });
  }

  console.log("Creating articles…");
  for (const [i, a] of articles.entries()) {
    await db.article.create({ data: { ...a, publishedAt: daysAgo(10 + i * 9) } });
  }

  console.log("Creating inbox…");
  await db.contactMessage.createMany({
    data: [
      { name: "Dr. Hannah Lee", email: "h.lee@example.com", subject: "Bulk / institutional pricing", message: "Hi, our group is planning a 12-month receptor-binding study and will need recurring supply of tirzepatide and retatrutide. Do you offer institutional pricing or standing orders?", createdAt: daysAgo(1) },
      { name: "Marcus Bell", email: "marcus.bell@example.com", subject: "Order enquiry", orderNumber: "GLP-10262", message: "Could you confirm whether my payment has been matched? I used PayID this morning.", status: "READ", createdAt: daysAgo(3) },
      { name: "Grace Liu", email: "grace.liu@example.com", subject: "COA request", message: "Is the full HPLC chromatogram available for batch SEM lot from last month?", status: "REPLIED", createdAt: daysAgo(9) },
    ],
  });
  await db.subscriber.createMany({
    data: ["lab.manager@example.com", "peptide.chem@example.com", "research.ops@example.com", "j.doe@example.com"].map((email, i) => ({ email, createdAt: daysAgo(i * 6) })),
  });

  console.log(`\nSeed complete.\n  Admin login: ${adminEmail} / ${adminPassword}\n  Demo customer: olivia.chen@example.com / Password123!\n`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
