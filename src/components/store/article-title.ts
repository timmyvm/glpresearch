/**
 * Splits "What is GLP-1? An introduction to incretin biology" into a short headline and its
 * standfirst, so headlines stay within two lines on a phone.
 */
export function splitTitle(title: string): { head: string; rest: string | null } {
  const m = title.match(/^(.{8,60}?[?:])\s+(.+)$/);
  if (!m) return { head: title, rest: null };
  const head = m[1].endsWith(":") ? m[1].slice(0, -1) : m[1];
  const rest = m[2].charAt(0).toUpperCase() + m[2].slice(1);
  return { head, rest };
}
