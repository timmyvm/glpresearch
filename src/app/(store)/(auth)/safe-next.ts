/** Only allow same-site relative redirect targets (blocks //evil.com and /\evil.com). */
export function safeNext(next: string | undefined | null, fallback: string) {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return fallback;
  return next;
}
