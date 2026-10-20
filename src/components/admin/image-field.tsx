"use client";

import { useRef, useState } from "react";
import { ImageIcon, Loader2, Upload } from "lucide-react";
import { Input } from "@/components/ui/form";
import { cn } from "@/lib/utils";

/** URL text input with an upload button that stores the file via /api/admin/upload. */
export function ImageField({
  name,
  defaultValue,
  accept = "image/png,image/jpeg,image/webp,image/avif",
  preview = true,
  placeholder = "/images/... or https://...",
  id,
}: {
  name: string;
  defaultValue?: string | null;
  accept?: string;
  preview?: boolean;
  placeholder?: string;
  id?: string;
}) {
  const [value, setValue] = useState(defaultValue ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function upload(file: File) {
    setBusy(true);
    setError(null);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      setValue(data.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  const isImage = value && !value.toLowerCase().endsWith(".pdf");

  return (
    <div className="flex items-start gap-3">
      {preview ? (
        <div className={cn("relative grid size-10 shrink-0 place-items-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50")}>
          {isImage ? (
            // eslint-disable-next-line @next/next/no-img-element -- arbitrary admin-entered URLs
            <img src={value} alt="" className="size-full object-cover" />
          ) : (
            <ImageIcon className="size-4 text-slate-400" />
          )}
        </div>
      ) : null}
      <div className="min-w-0 flex-1">
        <div className="flex gap-2">
          <Input id={id} name={name} value={value} onChange={(e) => setValue(e.target.value)} placeholder={placeholder} />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={busy}
            className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 text-xs font-semibold text-ink-800 hover:bg-slate-50 disabled:opacity-50"
          >
            {busy ? <Loader2 className="size-3.5 animate-spin" /> : <Upload className="size-3.5" />} Upload
          </button>
          <input
            ref={fileRef}
            type="file"
            accept={accept}
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void upload(file);
            }}
          />
        </div>
        {error ? <p className="mt-1 text-xs text-rose-600">{error}</p> : null}
      </div>
    </div>
  );
}
