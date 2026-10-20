/** Plain-text search over the small catalogue: every term must appear somewhere in the record. */

export function normalise(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "");
}

const compact = (value: string) => normalise(value).replace(/[^a-z0-9]/g, "");

/** Up to six terms of two characters or more. "GLP 1" and "glp-1" both match "GLP-1". */
export function toTerms(query: string) {
  return normalise(query)
    .split(/\s+/)
    .filter((t) => t.length >= 2 && compact(t).length > 0)
    .slice(0, 6);
}

export function hasTerm(text: string | null | undefined, term: string) {
  if (!text) return false;
  return normalise(text).includes(term) || compact(text).includes(compact(term));
}

export function hasAll(text: string, terms: string[]) {
  return terms.every((t) => hasTerm(text, t));
}

/** Markdown to plain running text, for snippets. */
export function plain(markdown: string) {
  return markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/^\s*\|.*\|\s*$/gm, " ")
    .replace(/^#+\s+/gm, "")
    .replace(/[*_`>]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** About 220 characters around the first term found, cut at word boundaries. */
export function snippet(text: string, terms: string[], length = 220) {
  const lower = normalise(text);
  const at = terms.map((t) => lower.indexOf(t)).filter((i) => i >= 0).sort((a, b) => a - b)[0];
  if (at == null || at < 60) {
    if (text.length <= length) return text;
    return text.slice(0, text.lastIndexOf(" ", length)) + "…";
  }
  const start = text.indexOf(" ", at - 70) + 1;
  const endAt = start + length;
  const end = endAt >= text.length ? text.length : text.lastIndexOf(" ", endAt);
  return "…" + text.slice(start, end) + (end < text.length ? "…" : "");
}

export function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Batch numbers look like SEM-2609-100. */
export const BATCH_PATTERN = /^[a-z]{3}-?\d{2,}/i;
