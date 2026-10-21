/**
 * A readable companion to the httpOnly session cookie. It holds only what the header shows
 * (a first name, and whether to link to the admin), so public pages can stay static and the
 * header can read it in the browser. It grants nothing: every protected route and action
 * checks the signed session on the server.
 */
export const HINT_COOKIE = "glp_who";

export type SessionHint = { name: string; admin: boolean };

/** The cookie value to set on the server. Next.js URL-encodes cookie values itself. */
export function hintValue(hint: SessionHint) {
  return JSON.stringify(hint);
}

/** Reads the raw (URL-encoded) value from `document.cookie`. */
export function parseHint(raw: string | null | undefined): SessionHint | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(decodeURIComponent(raw));
    return typeof value?.name === "string" ? { name: value.name.slice(0, 60), admin: value.admin === true } : null;
  } catch {
    return null;
  }
}
