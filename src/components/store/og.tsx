import { readFile } from "node:fs/promises";
import { basename, join } from "node:path";

/**
 * Shared pieces for the generated Open Graph cards (1200×630). Each card is a sheet of the
 * site's paperwork: a paper certificate on the navy ground, set in Bricolage Grotesque.
 */

export const OG_SIZE = { width: 1200, height: 630 };

export const OG = {
  ink: "#1f2b4d",
  muted: "#5d6479",
  paper: "#edebe7",
  ground: "#1f2b4d",
  black: "#05070a",
  accent: "#f7941d",
  rule: "#e3e1dc",
};

const CONTENT = join(process.cwd(), "src/content");

export async function ogFonts() {
  const [regular, medium, display] = await Promise.all([
    readFile(join(CONTENT, "fonts/BricolageGrotesque-Text400.ttf")),
    readFile(join(CONTENT, "fonts/BricolageGrotesque-Text500.ttf")),
    readFile(join(CONTENT, "fonts/BricolageGrotesque-Display600.ttf")),
  ]);
  return [
    { name: "Bricolage Grotesque", data: regular, weight: 400 as const, style: "normal" as const },
    { name: "Bricolage Grotesque", data: medium, weight: 500 as const, style: "normal" as const },
    { name: "Bricolage Grotesque", data: display, weight: 600 as const, style: "normal" as const },
  ];
}

/** A PNG from src/content/og as a data URL, or null when there is none (Satori can't read WebP). */
export async function ogPicture(name: string) {
  try {
    const data = await readFile(join(CONTENT, "og", `${name}.png`));
    return `data:image/png;base64,${data.toString("base64")}`;
  } catch {
    return null;
  }
}

/** The PNG cut-out for a product image path such as /images/products/semaglutide-10mg.webp. */
export function vialPicture(image: string) {
  return ogPicture(basename(image).replace(/\.\w+$/, ""));
}

/** The wordmark: the logo tile and the name. */
export function OgWordmark({ logo, color, tile = "#ffffff" }: { logo: string | null; color: string; tile?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 52, height: 52, background: tile }}>
        {/* Satori renders plain <img>; next/image has no meaning inside an ImageResponse. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {logo ? <img src={logo} width={34} height={34} alt="" /> : null}
      </div>
      <div style={{ fontSize: 28, fontWeight: 500, color }}>GLP Research</div>
    </div>
  );
}

/**
 * The certificate: a paper sheet on the navy ground, with a dotted perforation along its top
 * edge. Children fill the sheet.
 */
export function OgSheet({ children, ground = OG.ground }: { children: React.ReactNode; ground?: string }) {
  return (
    <div style={{ display: "flex", width: "100%", height: "100%", background: ground, padding: "40px 48px", fontFamily: "Bricolage Grotesque" }}>
      <div style={{ display: "flex", flexDirection: "column", position: "relative", width: "100%", height: "100%", background: OG.paper, color: OG.ink, padding: "40px 48px", overflow: "hidden" }}>
        {children}
      </div>
    </div>
  );
}

/** A thin HPLC trace for the cards: one sharp peak on a quiet baseline, as an SVG data URL. */
export function ogTrace(width = 520, height = 120, peakAt = 0.62) {
  const points: string[] = [];
  for (let i = 0; i <= 260; i++) {
    const t = i / 260;
    const g = Math.exp(-((t - peakAt) ** 2) / (2 * 0.006 ** 2));
    const small = 0.04 * Math.exp(-((t - peakAt + 0.06) ** 2) / (2 * 0.005 ** 2));
    const y = height - 4 - (g + small) * (height - 12) - Math.sin(i * 1.7) * 0.6;
    points.push(`${(t * width).toFixed(1)},${y.toFixed(1)}`);
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><polyline points="${points.join(" ")}" fill="none" stroke="${OG.ink}" stroke-width="3" stroke-linejoin="round"/></svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}
