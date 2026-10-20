"use client";

import { useEffect, useRef } from "react";

/** The search input. With no query yet, it takes focus on devices with a fine pointer (not phones). */
export function SearchField({ defaultValue }: { defaultValue?: string }) {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!defaultValue && window.matchMedia("(pointer: fine)").matches) ref.current?.focus();
  }, [defaultValue]);

  return (
    <input
      ref={ref}
      id="q"
      name="q"
      type="search"
      defaultValue={defaultValue}
      minLength={2}
      maxLength={80}
      autoComplete="off"
      spellCheck={false}
      enterKeyHint="search"
      placeholder="Try tirzepatide, half-life or SEM-2609-100…"
      className="h-14 min-w-0 flex-1 bg-surface px-4 text-body placeholder:text-muted/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-ink"
    />
  );
}
