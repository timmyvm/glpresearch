"use client";

import { useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { Input } from "./fields";

const UPLOAD_ACCEPT = "image/png,image/jpeg,image/webp,image/avif";

/** Posts one image to /api/admin/upload and resolves to its served URL. */
export async function uploadImage(file: File) {
  const body = new FormData();
  body.append("file", file);
  const res = await fetch("/api/admin/upload", { method: "POST", body });
  const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
  if (!res.ok || !data.url) throw new Error(data.error ?? "Upload failed. Try again.");
  return data.url;
}

/**
 * An image URL with its Upload button joined to the field (one border, square inner corners).
 * Uncontrolled by default (posts as `name`); pass value/onChange to drive it from state instead.
 */
export function ImageField({
  name,
  defaultValue,
  value: controlled,
  onChange,
  accept = UPLOAD_ACCEPT,
  preview = true,
  placeholder = "/images/… or https://…",
  id,
  label = "Image URL",
}: {
  name?: string;
  defaultValue?: string | null;
  value?: string;
  onChange?: (value: string) => void;
  accept?: string;
  preview?: boolean;
  placeholder?: string;
  id?: string;
  label?: string;
}) {
  const [own, setOwn] = useState(defaultValue ?? "");
  const value = controlled ?? own;
  const setValue = (v: string) => (onChange ? onChange(v) : setOwn(v));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function upload(file: File) {
    setBusy(true);
    setError(null);
    try {
      setValue(await uploadImage(file));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed. Try again.");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  const isImage = value && !value.toLowerCase().endsWith(".pdf");

  return (
    <div className="flex items-start gap-3">
      {preview ? (
        <div className="relative size-10 shrink-0 overflow-hidden border border-[#dfe2e8] bg-surface">
          {isImage ? (
            // eslint-disable-next-line @next/next/no-img-element -- arbitrary admin-entered URLs
            <img src={value} alt="" className="size-full object-cover" />
          ) : null}
        </div>
      ) : null}
      <div className="min-w-0 flex-1">
        <div className="flex">
          <Input
            id={id}
            name={name}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={placeholder}
            aria-label={id ? undefined : label}
            autoComplete="off"
            spellCheck={false}
            className="min-w-0"
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={busy}
            className="press -ml-px inline-flex h-10 shrink-0 items-center gap-1.5 border border-[#dfe2e8] bg-white px-3 text-small font-medium text-ink hover:bg-surface disabled:opacity-50"
          >
            {busy ? <Loader2 className="size-3.5 animate-spin" aria-hidden="true" /> : null}
            {busy ? "Uploading…" : "Upload"}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept={accept}
            className="hidden"
            tabIndex={-1}
            aria-hidden="true"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void upload(file);
            }}
          />
        </div>
        {error ? (
          <p className="mt-1.5 text-small text-danger" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    </div>
  );
}
