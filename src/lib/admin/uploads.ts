import path from "node:path";

export const UPLOAD_DIR = path.join(process.cwd(), "uploads");
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

export const UPLOAD_TYPES: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  avif: "image/avif",
};

/** Only allow names we generate ourselves: 32 hex chars + a known extension. */
export const UPLOAD_NAME = /^[a-f0-9]{32}\.(png|jpe?g|webp|avif)$/;
