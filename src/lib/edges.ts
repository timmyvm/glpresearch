/**
 * Shaped edges for the paper pieces (clip-path polygons, since CSS cannot repeat a shape along an
 * edge). Teeth are spaced in percent so they scale with the piece; the depth is fixed in pixels.
 */
export function zigzagBottom(teeth = 18, depth = 12) {
  const points = ["0 0", "100% 0"];
  for (let k = teeth * 2; k >= 0; k--) {
    const x = ((k / (teeth * 2)) * 100).toFixed(3);
    points.push(`${x}% ${k % 2 ? "100%" : `calc(100% - ${depth}px)`}`);
  }
  return `polygon(${points.join(", ")})`;
}
