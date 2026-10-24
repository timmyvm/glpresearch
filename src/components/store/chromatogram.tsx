import { cn } from "@/lib/utils";

/**
 * An HPLC trace drawn from a batch's reported purity: one main peak whose share of the total area
 * is the purity, plus small impurity peaks for the remainder. Seeded by the batch number, so a
 * batch always prints the same trace. It illustrates the reported figure; it is not raw data.
 * The trace stretches to its box (labels are HTML, so they never distort); give the figure a
 * height or an aspect ratio.
 */

const W = 640;
const H = 200;
const RUN_MIN = 20;

function seeded(seed: string) {
  let h = 2166136261;
  for (const ch of seed) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

export function tracePeaks(purity: number, seed: string) {
  const rand = seeded(seed);
  const main = { at: 9 + rand() * 4, width: 0.11, area: purity };
  const rest = Math.max(0, 100 - purity);
  const shares = [0.5 + rand() * 0.2, 0.2 + rand() * 0.1];
  shares.push(Math.max(0, 1 - shares[0] - shares[1]));
  const impurities = shares.map((s, i) => ({
    at: i === 0 ? main.at - 0.9 - rand() * 1.4 : i === 1 ? main.at + 0.7 + rand() * 1.6 : 3 + rand() * 3,
    width: 0.09 + rand() * 0.05,
    area: rest * s,
  }));
  return { main, impurities, rand };
}

export function Chromatogram({ purity, seed, className, label }: { purity: number; seed: string; className?: string; label?: string }) {
  const { main, impurities, rand } = tracePeaks(purity, seed);
  const peaks = [main, ...impurities];
  // Peak height from area and width (Gaussian); the main peak reaches 90% of the box.
  const heightOf = (p: { area: number; width: number }) => p.area / p.width;
  const scale = (H * 0.9) / heightOf(main);
  // Impurities are drawn at 6× so the eye can find them; the label gives the real figure.
  const lift = 6;
  const points: string[] = [];
  const steps = 480;
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * RUN_MIN;
    let y = (rand() - 0.5) * 1.6;
    for (const p of peaks) {
      const g = Math.exp(-((t - p.at) ** 2) / (2 * p.width ** 2));
      y += heightOf(p) * scale * g * (p === main ? 1 : lift);
    }
    points.push(`${((t / RUN_MIN) * W).toFixed(1)},${(H - 2 - Math.min(y, H - 4)).toFixed(1)}`);
  }
  const peakX = (main.at / RUN_MIN) * 100;

  return (
    <figure className={cn("relative flex flex-col", className)} role="img" aria-label={label ?? `HPLC trace, main peak ${purity.toFixed(2)}% of total area`}>
      <div className="relative min-h-0 flex-1">
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="absolute inset-0 size-full" aria-hidden="true">
          <polyline points={points.join(" ")} fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        </svg>
        <span className="tabular absolute top-0 text-small font-medium" style={{ left: `calc(${peakX}% + 10px)` }} aria-hidden="true">
          {purity.toFixed(2)}%
        </span>
      </div>
      <div className="tabular mt-1.5 flex justify-between text-small text-muted" aria-hidden="true">
        <span>0</span>
        <span>5</span>
        <span>10</span>
        <span>15</span>
        <span>20 min</span>
      </div>
    </figure>
  );
}
