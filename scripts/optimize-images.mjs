// Converts generated PNG artwork in public/images to web-friendly WebP and removes the originals.
import { readdir, unlink } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = path.resolve("public/images");

async function walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) await walk(full);
    else if (entry.name.endsWith(".png")) {
      const out = full.replace(/\.png$/, ".webp");
      const width = dir.endsWith("products") ? 1200 : 1920;
      await sharp(full).resize({ width, withoutEnlargement: true }).webp({ quality: 82 }).toFile(out);
      await unlink(full);
      console.log("optimized", path.relative(root, out));
    }
  }
}

await walk(root);
