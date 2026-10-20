"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

export function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {}
      }}
      className="press inline-flex h-8 items-center gap-1.5 px-2 text-small font-medium text-muted hover:bg-surface hover:text-ink"
      aria-live="polite"
    >
      {copied ? <Check className="size-3.5 text-success" aria-hidden="true" /> : <Copy className="size-3.5" aria-hidden="true" />}
      {copied ? "Copied" : label}
    </button>
  );
}

export function PrintButton() {
  return (
    <button type="button" onClick={() => window.print()} className="press inline-flex h-10 items-center bg-ink px-4 text-sm font-medium text-on-navy hover:bg-ink-800 print:hidden">
      Print Packing Slip
    </button>
  );
}
