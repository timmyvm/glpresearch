/**
 * Reads the peptide sequences stored on products (written either in three-letter form,
 * "H-His-Aib-Glu-…-OH", or one-letter form, "Y-Aib-EGTFTSDYSI-…-NH2") into one residue per token,
 * and marks each residue against native GLP-1(7-37). Powers the certificate's sequence row.
 */

export const NATIVE_GLP1 = "HAEGTFTSDVSSYLEGQAAKEFIAWLVKGRG";

const THREE_TO_ONE: Record<string, string> = {
  Ala: "A", Arg: "R", Asn: "N", Asp: "D", Cys: "C", Gln: "Q", Glu: "E", Gly: "G", His: "H", Ile: "I",
  Leu: "L", Lys: "K", Met: "M", Phe: "F", Pro: "P", Ser: "S", Thr: "T", Trp: "W", Tyr: "Y", Val: "V",
};

/** Non-standard residues, shown by their usual abbreviation. */
const SPECIAL = new Set(["Aib", "Ac4c", "αMeL"]);

export type Residue = {
  /** One-letter code, or the abbreviation of a non-standard residue. */
  code: string;
  /** Side-chain modification, e.g. the fatty acid on lysine. */
  mod?: string;
  /** How it compares with native GLP-1 at the same position. */
  status: "same" | "changed" | "modified" | "added";
};

/** Splits on hyphens that are not inside brackets. */
function topLevelSegments(seq: string) {
  const out: string[] = [];
  let depth = 0;
  let cur = "";
  for (const ch of seq) {
    if (ch === "(") depth++;
    if (ch === ")") depth--;
    if (ch === "-" && depth === 0) {
      out.push(cur);
      cur = "";
    } else cur += ch;
  }
  out.push(cur);
  return out.map((s) => s.trim()).filter(Boolean);
}

export function parseSequence(raw: string | null | undefined): Residue[] {
  if (!raw) return [];
  const segments = topLevelSegments(raw.replace(/\s+/g, ""));
  const threeLetter = segments.some((s) => s.replace(/\(.*\)$/, "") in THREE_TO_ONE);

  // Terminal groups: "H-" (free amine) and "-OH" / "-NH2" (acid or amide) are not residues.
  if (threeLetter && segments[0] === "H") segments.shift();
  if (["OH", "NH2"].includes(segments.at(-1) ?? "")) segments.pop();

  const tokens: Omit<Residue, "status">[] = [];
  for (const seg of segments) {
    const m = seg.match(/^([^(]+)\((.+)\)$/);
    const base = m ? m[1] : seg;
    const mod = m ? m[2] : undefined;
    if (base in THREE_TO_ONE) tokens.push({ code: THREE_TO_ONE[base], mod });
    else if (SPECIAL.has(base)) tokens.push({ code: base, mod });
    else if (/^[A-Z]$/.test(base)) tokens.push({ code: base, mod });
    else if (/^\(?[A-Z]+\)?$/.test(base)) for (const ch of base.replace(/[()]/g, "")) tokens.push({ code: ch });
    else tokens.push({ code: base.replace(/[()]/g, ""), mod });
  }

  return tokens.map((t, i) => {
    const native = NATIVE_GLP1[i];
    const status: Residue["status"] = !native ? "added" : t.code !== native ? "changed" : t.mod ? "modified" : "same";
    return { ...t, status };
  });
}

/** Share of the first 31 positions that match native GLP-1, as a whole percentage. */
export function identityWithNative(residues: Residue[]) {
  const span = residues.slice(0, NATIVE_GLP1.length);
  if (!span.length) return 0;
  const same = span.filter((r) => r.status === "same" || r.status === "modified").length;
  return Math.round((same / NATIVE_GLP1.length) * 100);
}
