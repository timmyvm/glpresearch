// Native GLP-1 is cleared in about two minutes (DPP-4 cleavage plus renal clearance).
export const NATIVE_GLP1_HOURS = 2 / 60;

export type HalfLife = { hours: number | null; variable: boolean; label: string | null };

/** Parses strings such as "~1 week", "~5 days", "~13 hours" or "~2.4 hours" into hours. */
export function parseHalfLife(value: string | null | undefined): HalfLife {
  if (!value) return { hours: null, variable: false, label: null };
  const variable = /variable|range|\bto\b/i.test(value);
  const n = (re: RegExp) => {
    const m = value.match(re);
    return m ? parseFloat(m[1]) : null;
  };
  const weeks = n(/([\d.]+)\s*weeks?/i);
  const days = n(/([\d.]+)\s*days?/i);
  const hours = n(/([\d.]+)\s*(?:hours?|h)\b/i);
  const total = weeks !== null ? weeks * 168 : days !== null ? days * 24 : hours;
  return { hours: variable ? null : total, variable, label: value };
}

/** How many times longer than native GLP-1, rounded to a sensible figure. */
export function timesNative(hours: number) {
  const x = hours / NATIVE_GLP1_HOURS;
  return x >= 1000 ? Math.round(x / 10) * 10 : Math.round(x);
}
