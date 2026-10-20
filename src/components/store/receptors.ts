import { splitList } from "@/lib/utils";

export const RECEPTORS = [
  { key: "GLP-1R", short: "GLP-1", name: "GLP-1 receptor" },
  { key: "GIPR", short: "GIP", name: "GIP receptor" },
  { key: "GCGR", short: "glucagon", name: "Glucagon receptor" },
] as const;

const SHORT: Record<string, string> = Object.fromEntries(RECEPTORS.map((r) => [r.key, r.short]));
const LONG: Record<string, string> = {
  "GLP-1R": "glucagon-like peptide-1 receptor",
  GIPR: "glucose-dependent insulinotropic polypeptide receptor",
  GCGR: "glucagon receptor",
};

function join(words: string[]) {
  if (words.length <= 1) return words[0] ?? "";
  return `${words.slice(0, -1).join(", ")} and ${words.at(-1)}`;
}

/** "GLP-1 receptor", "GIP and GLP-1 receptors", "GIP, GLP-1 and glucagon receptors". */
export function receptorPhrase(targets: string) {
  const words = splitList(targets).map((t) => SHORT[t] ?? t);
  return `${join(words)} ${words.length > 1 ? "receptors" : "receptor"}`;
}

export function receptorLongNames(targets: string) {
  return join(splitList(targets).map((t) => LONG[t] ?? t));
}

/** "5, 10 and 20 mg" from ["5 mg", "10 mg", "20 mg"]. */
export function sizePhrase(labels: string[]) {
  const mg = labels.map((l) => l.replace(/\s*mg$/i, ""));
  return mg.length > 1 ? `${mg.slice(0, -1).join(", ")} and ${mg.at(-1)} mg` : labels[0] ?? "";
}

/** "~1 week" → "About 1 week"; "Variable — ~6 to 28 days…" → "Variable, about 6 to 28 days…". */
export function halfLifeText(value: string | null | undefined) {
  if (!value) return null;
  return value
    .replace(/^~\s*/, "About ")
    .replace(/\s*[—–]\s*~?\s*/g, ", about ")
    .replace(/\s+~\s*/g, " about ")
    .replace(/\s*\(.*\)$/, "");
}
