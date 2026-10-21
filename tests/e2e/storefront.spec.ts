import { expect, test } from "@playwright/test";
import { acknowledge, trackErrors } from "./helpers";

const PAGES = [
  "/",
  "/shop",
  "/shop/semaglutide",
  "/shop/retatrutide",
  "/compare",
  "/coa",
  "/research",
  "/research/what-is-glp-1",
  "/faq",
  "/about",
  "/contact",
  "/shipping",
  "/terms",
  "/privacy",
  "/disclaimer",
  "/search?q=tirz",
  "/login",
  "/register",
  "/track",
  "/cart",
];

test.beforeEach(async ({ context, baseURL }) => {
  await acknowledge(context, baseURL!);
});

for (const path of PAGES) {
  test(`renders ${path} with one h1 and no page errors`, async ({ page }) => {
    const errors = trackErrors(page);
    const res = await page.goto(path);
    expect(res?.status(), `${path} status`).toBe(200);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("main#main")).toBeVisible();
    errors.assertNone();
  });
}

test("unknown pages return 404", async ({ page }) => {
  const res = await page.goto("/definitely-not-a-page");
  expect(res?.status()).toBe(404);
});

test("research-use notice shows for new visitors and stays dismissed", async ({ browser, baseURL }) => {
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto(baseURL!);
  const notice = page.getByRole("region", { name: "Research use notice" });
  await expect(notice).toBeVisible();
  await notice.getByRole("button", { name: "I Confirm" }).click();
  await expect(notice).toBeHidden();
  await page.reload();
  await expect(page.getByRole("region", { name: "Research use notice" })).toHaveCount(0);
  await context.close();
});

test("half-life dial compares a compound with native GLP-1", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Semaglutide", exact: true }).click();
  await expect(page.getByText(/times as long as native GLP-1/)).toBeVisible();
});

test("certificate lookup finds a published batch", async ({ page }) => {
  await page.goto("/coa");
  const firstBatch = page.locator('a[href^="/coa?batch="]').first();
  const batch = (await firstBatch.getAttribute("href"))!.split("=")[1];
  await page.goto(`/coa?batch=${batch}`);
  await expect(page.getByText(decodeURIComponent(batch)).first()).toBeVisible();
});

test("sitemap lists products and articles", async ({ request }) => {
  const res = await request.get("/sitemap.xml");
  expect(res.ok()).toBeTruthy();
  const xml = await res.text();
  expect(xml).toContain("/shop/semaglutide");
  expect(xml).toContain("/research/what-is-glp-1");
});

test("catalogue filters run in the browser on the static page", async ({ page }) => {
  await page.goto("/shop?category=DUAL");
  const filters = page.getByRole("navigation", { name: "Filter by receptor class" });
  const grid = page.getByRole("region", { name: "Compounds" });
  const active = filters.locator('[aria-current="page"]');
  await expect(active).toContainText("Dual agonists");
  const dual = Number(await active.locator(".tabular").textContent());
  await expect(grid.locator('a[href^="/shop/"]')).toHaveCount(dual);

  await filters.getByRole("link", { name: /^All/ }).click();
  await expect(page).toHaveURL(/\/shop$/);
  const all = Number(await filters.locator('[aria-current="page"] .tabular').textContent());
  expect(all).toBeGreaterThan(dual);
  await expect(grid.locator('a[href^="/shop/"]')).toHaveCount(all);
});

test("research topics filter in the browser on the static page", async ({ page }) => {
  await page.goto("/research?category=Compounds");
  await expect(page.getByRole("navigation", { name: "Filter by topic" }).locator('[aria-current="page"]')).toHaveText("Compounds");
  await expect(page.getByRole("heading", { name: "Six decades of incretin science" })).toHaveCount(0);
  await page.getByRole("link", { name: "All topics" }).click();
  await expect(page.getByRole("heading", { name: "Six decades of incretin science" })).toBeVisible();
});

test("header shows a signed-in customer's name on static pages", async ({ page, isMobile }) => {
  test.skip(isMobile, "the account link lives in the menu on phones");
  await page.goto("/login");
  await page.fill("#email", "olivia.chen@example.com");
  await page.fill("#password", "Password123!");
  await page.click("button:has-text('Sign In')");
  await page.waitForURL(/\/account/);
  await page.goto("/shop");
  const header = page.getByRole("banner");
  await expect(header.getByRole("link", { name: "Olivia" })).toBeVisible();
  await page.goto("/account");
  await page.getByRole("button", { name: "Sign Out" }).click();
  await page.waitForURL((url) => !url.pathname.startsWith("/account"));
  await page.goto("/shop");
  await expect(header.getByRole("link", { name: "Sign In" })).toBeVisible();
});

test("public pages carry a canonical URL and valid structured data", async ({ page }) => {
  for (const [path, canonical, types] of [
    ["/shop?category=DUAL&sort=name", "/shop", ["ItemList", "BreadcrumbList"]],
    ["/shop/semaglutide", "/shop/semaglutide", ["Product", "BreadcrumbList", "Organization"]],
    ["/research/what-is-glp-1", "/research/what-is-glp-1", ["Article", "BreadcrumbList", "Organization"]],
    ["/faq", "/faq", ["FAQPage"]],
  ] as const) {
    await page.goto(path);
    expect(new URL((await page.locator('link[rel="canonical"]').getAttribute("href"))!).pathname, `${path} canonical`).toBe(canonical);
    const graphs = await page.locator('script[type="application/ld+json"]').allTextContents();
    const found = graphs.flatMap((g) => JSON.parse(g)["@graph"].map((n: { "@type": string }) => n["@type"]));
    expect(found, `${path} structured data`).toEqual(expect.arrayContaining([...types]));
  }
});

test("robots and sitemap leave out private and noindex pages", async ({ request }) => {
  const robots = await (await request.get("/robots.txt")).text();
  for (const path of ["/admin", "/account", "/checkout", "/search"]) expect(robots).toContain(`Disallow: ${path}`);
  const locs = [...(await (await request.get("/sitemap.xml")).text()).matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
  expect(locs).toContain("/shop/semaglutide");
  for (const path of ["/search", "/cart", "/login"]) expect(locs).not.toContain(path);
});
