import "server-only";
import { headers } from "next/headers";
import { db } from "./db";

/**
 * Fixed-window limiter backed by the database, so it holds across serverless instances.
 * Returns true when the action may proceed.
 */
export async function rateLimit(scope: string, identifier: string, limit: number, windowSeconds: number) {
  const key = `${scope}:${identifier.toLowerCase()}`;
  const now = new Date();
  const existing = await db.rateLimit.findUnique({ where: { key } });
  if (!existing || existing.resetAt <= now) {
    await db.rateLimit.upsert({
      where: { key },
      update: { count: 1, resetAt: new Date(now.getTime() + windowSeconds * 1000) },
      create: { key, count: 1, resetAt: new Date(now.getTime() + windowSeconds * 1000) },
    });
    return true;
  }
  if (existing.count >= limit) return false;
  await db.rateLimit.update({ where: { key }, data: { count: { increment: 1 } } });
  return true;
}

/** Best-effort client IP for rate-limit keys. */
export async function clientIp() {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
}
