import { readFile } from "node:fs/promises";
import { basename, join } from "node:path";

/** Shared pieces for the generated Open Graph cards (1200×630, the site's face and colours). */

export const OG_SIZE = { width: 1200, height: 630 };

export const OG = {
  ink: "#0b1530",
  muted: "#4a5468",
  mint: "#a7ff9c",
  navy: "#0b1530",
  onNavy: "#ffffff",
  onNavyMuted: "#b9c2d6",
};

const CONTENT = join(process.cwd(), "src/content");

export async function ogFonts() {
  const [regular, medium] = await Promise.all([
    readFile(join(CONTENT, "fonts/HankenGrotesk-Regular.ttf")),
    readFile(join(CONTENT, "fonts/HankenGrotesk-Medium.ttf")),
  ]);
  return [
    { name: "Hanken Grotesk", data: regular, weight: 400 as const, style: "normal" as const },
    { name: "Hanken Grotesk", data: medium, weight: 500 as const, style: "normal" as const },
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
    <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 64, height: 64, background: tile }}>
        {logo ? <img src={logo} width={42} height={42} alt="" /> : null}
      </div>
      <div style={{ fontSize: 34, fontWeight: 500, color }}>GLP Research</div>
    </div>
  );
}
