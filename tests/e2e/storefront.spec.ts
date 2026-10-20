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
