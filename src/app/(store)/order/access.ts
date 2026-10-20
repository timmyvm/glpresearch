import "server-only";
import { timingSafeEqual } from "node:crypto";
import { getCurrentUser } from "@/lib/auth";

/** Constant-time comparison of a guest's order token. */
export function tokenMatches(expected: string, given: string | undefined | null) {
  if (!given) return false;
  const a = Buffer.from(expected);
  const b = Buffer.from(given);
  return a.length === b.length && timingSafeEqual(a, b);
}

/** True when the visitor owns the order (signed in) or holds its access token. */
export async function canAccessOrder(order: { userId: string | null; accessToken: string }, token?: string | null) {
  const user = await getCurrentUser();
  if (user && order.userId === user.id) return true;
  return tokenMatches(order.accessToken, token);
}
