// End-to-end test of customer flows against a running site with seeded data.
// Run: npm run test:flows   (E2E_BASE_URL defaults to http://localhost:3000)
// Covers: register, cart, checkout (coupon, validation, focus), order page, claim payment, cancel + restock,
// invoices (owner / guest token / 404), addresses, settings, sign in/out, track, forgot/reset,
// rate limiting, guest checkout with account, close account. Cleans up everything it creates.
const { existsSync } = require("node:fs");
const { chromium } = require("@playwright/test");
const { PrismaClient } = require("@prisma/client");

const BASE = process.env.E2E_BASE_URL ?? "http://localhost:3000";
const OUT = require("node:path").resolve("test-results/customer-flows");
const db = new PrismaClient();
const stamp = Date.now();
const email = `fork.test+${stamp}@example.com`;
const guestEmail = `fork.guest+${stamp}@example.com`;
const limitEmail = `fork.limit+${stamp}@example.com`;
const LOCAL_IPS = ["unknown", "::1", "127.0.0.1", "::ffff:127.0.0.1"];
const state = { mainUserId: null, numbers: [], stockBefore: {}, couponBefore: null };
let passed = 0;
const log = (...a) => console.log("•", ...a);
function check(cond, label) {
  if (!cond) throw new Error(`Check failed: ${label}`);
  passed++;
  log("ok", label);
}

async function newContext(browser, viewport = { width: 1360, height: 900 }) {
  const ctx = await browser.newContext({ viewport });
  await ctx.addCookies([{ name: "glp_ack", value: "1", url: BASE }]);
  return ctx;
}

async function clearLocalLimits() {
  await db.rateLimit.deleteMany({
    where: {
      OR: [
        { key: { contains: String(stamp) } },
        ...["register", "forgot-ip", "track"].flatMap((s) => LOCAL_IPS.map((ip) => ({ key: `${s}:${ip}` }))),
      ],
    },
  });
}

async function main() {
  require("fs").mkdirSync(OUT, { recursive: true });
  await clearLocalLimits();
  const variants = await db.productVariant.findMany({ where: { sku: { in: ["GLP-SEM-10", "GLP-TIR-15"] } }, include: { product: true } });
  check(variants.length === 2, "test variants exist");
  const cart = variants.map((v, i) => ({
    variantId: v.id,
    productSlug: v.product.slug,
    productName: v.product.name,
    variantLabel: v.label,
    sku: v.sku,
    price: v.price + 1, // stale price on purpose: the checkout should re-price
    image: v.image ?? v.product.image,
    quantity: i + 1,
  }));
  state.stockBefore = Object.fromEntries(variants.map((v) => [v.id, v.stock]));
  state.couponBefore = (await db.coupon.findUnique({ where: { code: "WELCOME10" } }))?.usedCount;
  const settings = Object.fromEntries((await db.setting.findMany()).map((s) => [s.key, JSON.parse(s.value)]));
  const supportEmail = settings.supportEmail ?? "support@glpresearch.com";

  const executablePath = process.env.PW_EXEC ?? (existsSync("/opt/pw-browsers/chromium") ? "/opt/pw-browsers/chromium" : undefined);
  const args = typeof process.getuid === "function" && process.getuid() === 0 ? ["--no-sandbox"] : [];
  const browser = await chromium.launch({ executablePath, args });
  const context = await newContext(browser);
  const page = await context.newPage();
  const errors = [];
  const watch = (p, tag) => {
    p.on("pageerror", (e) => errors.push(`${tag}: ${e.message}`));
    p.on("console", (m) => {
      if (m.type() !== "error" || /404|Failed to load resource/.test(m.text())) return;
      errors.push(`${tag}: ${m.text()}`);
    });
  };
  watch(page, "main");

  // ── Register ────────────────────────────────────────────────
  await page.goto(`${BASE}/register`);
  await page.click("button[type=submit]");
  await page.waitForSelector("text=Please check the highlighted fields.");
  check(await page.evaluate(() => document.activeElement?.getAttribute("aria-invalid") === "true"), "register: focus moves to first invalid field");
  await page.fill("#firstName", "Fork");
  await page.fill("#lastName", "Tester");
  await page.fill("#email", email);
  await page.fill("#institution", "Test Lab");
  await page.fill("#password", "abc12345");
  await page.fill("#confirmPassword", "abc12345");
  await page.check("input[name=agree]");
  await page.click("button[type=submit]");
  await page.waitForURL(`${BASE}/account`);
  state.mainUserId = (await db.user.findUnique({ where: { email } })).id;
  check(!!state.mainUserId, "register: account created and signed in");
  await page.waitForSelector("text=Nothing ordered yet");
  check(true, "overview: honest empty state");

  // ── Cart ────────────────────────────────────────────────────
  await page.evaluate((items) => localStorage.setItem("glp-cart", JSON.stringify({ state: { items }, version: 0 })), cart);
  await page.goto(`${BASE}/cart`);
  await page.waitForSelector("text=Summary");
  await page.waitForSelector("a:has-text('Checkout')");
  check(true, "cart renders items, summary and Checkout");

  // ── Checkout ────────────────────────────────────────────────
  await page.goto(`${BASE}/checkout`);
  await page.waitForSelector("text=Place Order");
  await page.fill("#line1", "1 Test Street");
  await page.fill("#city", "Melbourne");
  await page.selectOption("#state", "VIC");
  await page.fill("#postcode", "3000");
  await page.fill("#coupon", "NOPE-CODE");
  await page.click("button:has-text('Apply')");
  await page.waitForSelector("#coupon-error");
  check(true, "checkout: bad discount code shows inline error");
  await page.fill("#coupon", "WELCOME10");
  await page.click("button:has-text('Apply')");
  await page.waitForSelector("text=Discount code WELCOME10 applied");
  check(true, "checkout: coupon applied");
  await page.click("button[type=submit]");
  await page.waitForSelector("text=Please confirm research-use only");
  await page.waitForTimeout(300);
  check(await page.evaluate(() => document.activeElement?.getAttribute("aria-invalid") === "true"), "checkout: focus moves to first invalid field");
  await page.locator("label:has-text('laboratory research use only') input").check();
  await page.locator("label:has-text('Terms of Sale') input").check();
  await page.click("button[type=submit]");
  await page.waitForURL(/\/order\/.+\?token=/, { timeout: 60000 });
  const orderUrl = page.url();
  const number = decodeURIComponent(new URL(orderUrl).pathname.split("/").pop());
  state.numbers.push(number);
  await page.waitForSelector("text=Pay by PayID");
  check(true, `order ${number} placed, payment instructions shown`);

  const order = await db.order.findUnique({ where: { number }, include: { items: true } });
  const expectedSubtotal = variants.reduce((s, v, i) => s + v.price * (i + 1), 0);
  check(order.subtotal === expectedSubtotal, "server re-priced the cart");
  check(order.discount === Math.round(expectedSubtotal * 0.1), "discount applied server-side");
  check((await page.evaluate(() => localStorage.getItem("glp-cart"))).includes('"items":[]'), "cart cleared after order");
  const notice = await db.emailLog.findFirst({ where: { to: supportEmail, subject: { contains: `New order ${number}` } } });
  check(!!notice, "new-order notification emailed to the store");

  // ── Account pages ───────────────────────────────────────────
  for (const path of ["/account", "/account/orders", `/account/orders/${number}`, "/account/addresses", "/account/settings", `/account/orders/${number}/invoice`]) {
    const res = await page.goto(`${BASE}${path}`);
    check(res.status() === 200, `${path} → 200`);
  }
  await page.waitForSelector("h1:has-text('Invoice')");
  check(true, "owner invoice renders as Invoice while unpaid");

  // ── Claim payment ───────────────────────────────────────────
  await page.goto(`${BASE}/account/orders/${number}`);
  await page.click("button:has-text(\"I've Sent Payment\")");
  await page.waitForSelector("text=We're checking your payment");
  await page.waitForSelector("text=You reported the payment as sent");
  const claimed = await db.order.findUnique({ where: { number }, include: { events: true } });
  check(!!claimed.paymentClaimedAt, "claim: paymentClaimedAt set");
  check(claimed.events.some((e) => e.type === "PAYMENT" && e.visibleToCustomer && /reported as sent/.test(e.message)), "claim: customer-visible PAYMENT event");
  check(!!(await db.emailLog.findFirst({ where: { to: supportEmail, subject: { contains: `Payment reported for ${number}` } } })), "claim: store notified by email");
  await page.reload();
  await page.waitForSelector("text=We're checking your payment");
  check((await page.locator("button:has-text(\"I've Sent Payment\")").count()) === 0, "claim: button gone once reported");
  const firstClaimAt = claimed.paymentClaimedAt.getTime();
  // Idempotent: a second claim from the guest-token page changes nothing.
  const anon0 = await newContext(browser);
  const a0 = await anon0.newPage();
  await a0.goto(`${BASE}/order/${number}?token=${order.accessToken}`);
  check((await a0.locator("button:has-text(\"I've Sent Payment\")").count()) === 0, "claim: token page also hides the button");
  await anon0.close();
  const again = await db.order.findUnique({ where: { number }, include: { events: { where: { type: "PAYMENT" } } } });
  check(again.paymentClaimedAt.getTime() === firstClaimAt && again.events.length === 1, "claim: idempotent");

  // ── Addresses ───────────────────────────────────────────────
  await page.goto(`${BASE}/account/addresses`);
  await page.click("button:has-text('Add Address')");
  await page.fill("#label", "Office");
  await page.fill("#firstName", "Fork");
  await page.fill("#lastName", "Tester");
  await page.fill("#line1", "99 Lab Road");
  await page.fill("#city", "Sydney");
  await page.selectOption("#state", "NSW");
  await page.fill("#postcode", "2000");
  await page.check("input[name=isDefault]");
  await page.click("button:has-text('Save Address')");
  await page.waitForSelector("text=99 Lab Road");
  const addrs = await db.address.findMany({ where: { userId: state.mainUserId } });
  check(addrs.length === 2 && addrs.filter((a) => a.isDefault).length === 1 && addrs.find((a) => a.isDefault).line1 === "99 Lab Road", "addresses: saved, one default");
  await page.locator("li:has-text('99 Lab Road') button:has-text('Delete')").click();
  await page.click("button:has-text('Yes, Delete')");
  await page.waitForSelector("text=99 Lab Road", { state: "detached" });
  const left = await db.address.findMany({ where: { userId: state.mainUserId } });
  check(left.length === 1 && left[0].isDefault, "addresses: delete after confirm, default passed on");

  // ── Settings ────────────────────────────────────────────────
  await page.goto(`${BASE}/account/settings`);
  await page.fill("#phone", "0400000000");
  await page.click("button:has-text('Save Profile')");
  await page.waitForSelector("text=Profile saved.");
  await page.fill("#currentPassword", "wrongpass1");
  await page.fill("#newPassword", "newpass123");
  await page.fill("#confirmNewPassword", "newpass123");
  await page.click("button:has-text('Update Password')");
  await page.waitForSelector("text=Your current password is incorrect.");
  await page.fill("#currentPassword", "abc12345");
  await page.click("button:has-text('Update Password')");
  await page.waitForSelector("text=Password updated.");
  check(true, "settings: profile saved, password changed");

  // ── Sign out / in ───────────────────────────────────────────
  await page.goto(`${BASE}/account`);
  await page.click("button:has-text('Sign Out')");
  await page.waitForURL(`${BASE}/`);
  await page.goto(`${BASE}/login?next=//evil.com`);
  await page.fill("#email", email);
  await page.fill("#password", "newpass123");
  await page.click("button:has-text('Sign In')");
  await page.waitForURL(`${BASE}/account`);
  check(true, "sign in ignores an off-site next");
  await page.click("button:has-text('Sign Out')");
  await page.waitForURL(`${BASE}/`);
  await page.goto(`${BASE}/login`);
  await page.fill("#email", email);
  await page.fill("#password", "nope12345");
  await page.click("button:has-text('Sign In')");
  await page.waitForSelector("text=Incorrect email or password.");
  check(true, "wrong password rejected");

  // ── Order access ────────────────────────────────────────────
  const noTok = await page.goto(`${BASE}/order/${number}`);
  if (noTok.status() !== 404) {
    log("DEBUG status", noTok.status(), page.url(), (await context.cookies()).map((c) => `${c.name}=${c.value.slice(0, 12)}`));
    log("DEBUG h1", await page.locator("h1").first().textContent());
  }
  check(noTok.status() === 404, "order page without token → 404");
  check((await page.goto(`${BASE}/order/${number}?token=deadbeef`)).status() === 404, "order page with bad token → 404");
  check((await page.goto(`${BASE}/order/${number}/invoice`)).status() === 404, "guest invoice without token → 404");
  check((await page.goto(`${BASE}/order/${number}/invoice?token=deadbeef`)).status() === 404, "guest invoice with bad token → 404");
  const inv = await page.goto(`${BASE}/order/${number}/invoice?token=${order.accessToken}`);
  check(inv.status() === 200 && (await page.locator("h1:has-text('Invoice')").count()) === 1, "guest invoice with token → 200");
  check((await page.locator("button:has-text('Print or Save as PDF')").count()) === 1, "invoice has a Print button");
  await page.goto(`${BASE}/account/orders/${number}/invoice`);
  check(page.url().includes("/login"), "account invoice signed out → sign in");

  // ── Track ───────────────────────────────────────────────────
  await page.goto(`${BASE}/track`);
  await page.fill("#number", number);
  await page.fill("#email", "wrong@example.com");
  await page.click("button:has-text('Find My Order')");
  await page.waitForSelector("text=We couldn't find an order");
  await page.fill("#email", email.toUpperCase());
  await page.click("button:has-text('Find My Order')");
  await page.waitForURL(/\/order\/.+\?token=/);
  check(true, "track: wrong email rejected, right email opens the order");

  // ── Forgot / reset ──────────────────────────────────────────
  await page.goto(`${BASE}/forgot-password`);
  await page.fill("#email", email);
  await page.click("button:has-text('Send Reset Link')");
  await page.waitForSelector("text=If an account exists");
  const mail = await db.emailLog.findFirst({ where: { to: email, subject: { contains: "Reset" } }, orderBy: { createdAt: "desc" } });
  const link = mail.body.match(/https?:\/\/\S+reset-password\?token=\w+/)[0];
  await page.goto(link);
  await page.fill("#password", "reset1234");
  await page.fill("#confirmPassword", "reset1234");
  await page.click("button[type=submit]");
  await page.waitForURL(`${BASE}/account`);
  check(true, "password reset signs in");
  await page.goto(link);
  check((await page.content()).includes("invalid or has expired"), "reset link can't be reused");

  // ── Rate limit ──────────────────────────────────────────────
  const rl = await newContext(browser);
  const r = await rl.newPage();
  for (let i = 0; i < 4; i++) {
    await r.goto(`${BASE}/forgot-password`);
    await r.fill("#email", limitEmail);
    await r.click("button:has-text('Send Reset Link')");
    await r.waitForSelector(i < 3 ? "text=If an account exists" : "text=Too many reset requests");
  }
  check(true, "rate limit: 4th reset request for one email is refused");
  await rl.close();

  // ── Guest checkout with account creation, then cancel by token ─
  const guest = await newContext(browser, { width: 390, height: 844 });
  const g = await guest.newPage();
  watch(g, "guest");
  await g.goto(`${BASE}/`);
  await g.evaluate((items) => localStorage.setItem("glp-cart", JSON.stringify({ state: { items }, version: 0 })), cart);
  await g.goto(`${BASE}/checkout`);
  await g.waitForSelector("text=Place Order");
  await g.fill("#email", guestEmail);
  await g.fill("#firstName", "Guest");
  await g.fill("#lastName", "Buyer");
  await g.fill("#line1", "5 Guest Lane");
  await g.fill("#city", "Brisbane");
  await g.selectOption("#state", "QLD");
  await g.fill("#postcode", "4000");
  await g.locator("label:has-text('Create an account with this email') input").check();
  await g.fill("#password", "guest1234");
  await g.click("label:has-text('Cryptocurrency')");
  await g.click("label:has-text('Express tracked')");
  await g.fill("#coupon", "WELCOME10");
  await g.click("button:has-text('Apply')");
  await g.waitForSelector("text=Discount code WELCOME10 applied");
  await g.locator("label:has-text('laboratory research use only') input").check();
  await g.locator("label:has-text('Terms of Sale') input").check();
  await g.click("button[type=submit]");
  await g.waitForURL(/\/order\/.+\?token=/, { timeout: 60000 });
  await g.waitForSelector("text=Pay in cryptocurrency");
  const gNumber = decodeURIComponent(new URL(g.url()).pathname.split("/").pop());
  state.numbers.push(gNumber);
  const gOrder = await db.order.findUnique({ where: { number: gNumber }, include: { items: true } });
  const guestUser = await db.user.findUnique({ where: { email: guestEmail }, include: { addresses: true } });
  check(!!guestUser && gOrder.userId === guestUser.id && guestUser.addresses.length === 1, "guest checkout created an account with the address");
  const stockMid = Object.fromEntries((await db.productVariant.findMany({ where: { id: { in: Object.keys(state.stockBefore) } } })).map((v) => [v.id, v.stock]));
  const couponMid = (await db.coupon.findUnique({ where: { code: "WELCOME10" } })).usedCount;
  check(couponMid === state.couponBefore + 2, "coupon used twice");
  // Another customer can't reach this account's invoice
  check((await g.goto(`${BASE}/account/orders/${number}/invoice`)).status() === 404, "another customer's account invoice → 404");

  // Cancel from a context with no session, using only the token link
  const anon = await newContext(browser);
  const a = await anon.newPage();
  watch(a, "anon");
  await a.goto(`${BASE}/order/${gNumber}?token=${gOrder.accessToken}`);
  await a.click("button:has-text('Cancel This Order')");
  await a.waitForSelector(`text=Cancel order ${gNumber}?`);
  await a.click(`button:has-text('Yes, Cancel ${gNumber}')`);
  await a.waitForSelector("text=This order was cancelled");
  const cancelled = await db.order.findUnique({ where: { number: gNumber }, include: { events: true } });
  check(cancelled.status === "CANCELLED" && !!cancelled.cancelledAt, "cancel: order cancelled");
  check(cancelled.events.some((e) => e.status === "CANCELLED" && e.visibleToCustomer), "cancel: event recorded");
  const stockAfter = await db.productVariant.findMany({ where: { id: { in: Object.keys(state.stockBefore) } } });
  check(
    stockAfter.every((v) => v.stock === stockMid[v.id] + (gOrder.items.find((i) => i.variantId === v.id)?.quantity ?? 0)),
    "cancel: stock returned",
  );
  check((await db.coupon.findUnique({ where: { code: "WELCOME10" } })).usedCount === couponMid - 1, "cancel: coupon use released");
  check(!!(await db.emailLog.findFirst({ where: { to: guestEmail, subject: `Order ${gNumber} cancelled` } })), "cancel: customer emailed");
  await a.reload();
  await a.waitForSelector("text=Cancelled by the customer before payment.");
  check((await a.locator("button:has-text('Cancel This Order')").count()) === 0, "cancel: actions gone after cancelling");
  await anon.close();
  await guest.close();

  // ── Close account ───────────────────────────────────────────
  await page.goto(`${BASE}/account/settings`);
  await page.click("button:has-text('Close Account')");
  await page.fill("#closePassword", "reset1234");
  await page.fill("#confirmEmail", "someone@else.com");
  await page.click("button:has-text('Close My Account')");
  await page.waitForSelector("text=Type your email address exactly as shown");
  check(true, "close: typed confirmation must match");
  await page.fill("#confirmEmail", email);
  await page.click("button:has-text('Close My Account')");
  await page.waitForURL(`${BASE}/?account=closed`);
  const closed = await db.user.findUnique({ where: { id: state.mainUserId }, include: { addresses: true, orders: true, resetTokens: true } });
  check(closed.status === "CLOSED" && closed.email === `closed+${closed.id}@invalid.local` && closed.firstName === "Closed", "close: account anonymised");
  check(closed.addresses.length === 0 && closed.resetTokens.length === 0 && closed.phone === null && closed.institution === null && !closed.marketingOptIn, "close: addresses, tokens and contact details removed");
  check(closed.orders.length === 1, "close: orders kept");
  const acc = await page.goto(`${BASE}/account`);
  check(page.url().includes("/login"), "close: session ended");
  await page.fill("#email", email);
  await page.fill("#password", "reset1234");
  await page.click("button:has-text('Sign In')");
  await page.waitForSelector("text=Incorrect email or password.");
  check(true, "close: sign in with the old details is refused");
  void acc;

  await browser.close();
  console.log(`\n${passed} checks passed.`);
  console.log("Client errors:", errors.length ? errors : "none");
  if (errors.length) process.exitCode = 1;
}

async function cleanup() {
  const orders = await db.order.findMany({ where: { OR: [{ email: { in: [email, guestEmail] } }, { number: { in: state.numbers } }] }, include: { items: true } });
  for (const o of orders) {
    if (o.status === "CANCELLED") continue; // already restocked and released by the cancel
    for (const it of o.items) if (it.variantId) await db.productVariant.update({ where: { id: it.variantId }, data: { stock: { increment: it.quantity } } });
    if (o.couponCode) await db.coupon.update({ where: { code: o.couponCode }, data: { usedCount: { decrement: 1 } } });
  }
  await db.order.deleteMany({ where: { id: { in: orders.map((o) => o.id) } } });
  await db.user.deleteMany({ where: { OR: [{ email: { in: [email, guestEmail] } }, ...(state.mainUserId ? [{ id: state.mainUserId }] : [])] } });
  await db.emailLog.deleteMany({
    where: { OR: [{ to: { in: [email, guestEmail, limitEmail] } }, ...state.numbers.map((n) => ({ subject: { contains: n } }))] },
  });
  await db.subscriber.deleteMany({ where: { email: { in: [email, guestEmail] } } });
  await clearLocalLimits();
  const after = await db.productVariant.findMany({ where: { id: { in: Object.keys(state.stockBefore) } } });
  const coupon = await db.coupon.findUnique({ where: { code: "WELCOME10" } });
  log("cleanup: stock restored:", after.every((v) => v.stock === state.stockBefore[v.id]), "coupon restored:", coupon?.usedCount === state.couponBefore);
  const leftovers = await db.order.count({ where: { number: { in: state.numbers } } });
  log("cleanup: test orders left:", leftovers);
}

main()
  .catch(async (e) => {
    console.error("FAILED:", e.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await cleanup().catch((e) => console.error("cleanup failed", e));
    await db.$disconnect();
  });
