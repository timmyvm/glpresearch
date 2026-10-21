import { randomBytes } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { getCurrentUser } from "@/lib/auth";
import { MAX_UPLOAD_BYTES, UPLOAD_DIR, UPLOAD_TYPES } from "@/lib/admin/uploads";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") return Response.json({ error: "Unauthorized" }, { status: 401 });

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return Response.json({ error: "No file received." }, { status: 400 });
  if (file.size > MAX_UPLOAD_BYTES) return Response.json({ error: "File is larger than 5 MB." }, { status: 413 });

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  const type = UPLOAD_TYPES[ext];
  if (!type || (file.type && file.type !== type)) {
    return Response.json({ error: "Only PNG, JPG, WebP or AVIF images are allowed." }, { status: 415 });
  }

  const name = `${randomBytes(16).toString("hex")}.${ext === "jpeg" ? "jpg" : ext}`;
  await mkdir(UPLOAD_DIR, { recursive: true });
  // Runtime-only location, so keep the bundler from tracing the whole project into the function.
  await writeFile(path.join(/*turbopackIgnore: true*/ UPLOAD_DIR, name), Buffer.from(await file.arrayBuffer()));

  return Response.json({ url: `/api/uploads/${name}` });
}
