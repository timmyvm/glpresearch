import { expect, type BrowserContext, type Page } from "@playwright/test";

/** Pre-acknowledge the research-use notice so it does not appear in tests. */
export async function acknowledge(context: BrowserContext, baseURL: string) {
  await context.addCookies([{ name: "glp_ack", value: "1", url: baseURL }]);
}

/** Collect uncaught page errors; call assertNone() at the end of a test. */
export function trackErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  return {
    assertNone: () => expect(errors, `page errors:\n${errors.join("\n")}`).toEqual([]),
  };
}

export const unique = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
