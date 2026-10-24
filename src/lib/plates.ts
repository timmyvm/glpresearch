// Compound plate colours come from each vial's label stripe (Product.accentColor).

/** Relative luminance per WCAG. */
function luminance(hex: string) {
  const v = hex.replace("#", "");
  const n = v.length === 3 ? v.split("").map((c) => c + c).join("") : v;
  const [r, g, b] = [0, 2, 4].map((i) => {
    const c = parseInt(n.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

const NAVY = "#1f2b4d";
const WHITE = "#ffffff";

/** The ink (navy or white) with the better contrast on a plate colour. */
export function plateInk(hex: string) {
  const l = luminance(hex);
  const onNavy = (l + 0.05) / (luminance(NAVY) + 0.05);
  const onWhite = (1.05) / (l + 0.05);
  return onNavy >= onWhite ? NAVY : WHITE;
}

/** Cut-out photograph of a vial on a transparent ground, by variant image path. */
export function specimenImage(image: string | null | undefined) {
  if (!image) return null;
  const m = image.match(/\/images\/products\/([a-z0-9-]+)\.webp$/);
  return m ? `/images/specimens/${m[1]}.webp` : image;
}
