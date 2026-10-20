"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search } from "lucide-react";
import { Select } from "@/components/ui/form";

/** Search box + optional select filter that update the URL query string. */
export function ListFilters({
  placeholder = "Search…",
  selectName,
  selectOptions,
  selectLabel,
}: {
  placeholder?: string;
  selectName?: string;
  selectOptions?: { value: string; label: string }[];
  selectLabel?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  function update(next: Record<string, string>) {
    const sp = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(next)) {
      if (v) sp.set(k, v);
      else sp.delete(k);
    }
    sp.delete("page");
    router.push(`${pathname}${sp.size ? `?${sp}` : ""}`);
  }

  return (
    <div className="mb-4 flex flex-col gap-2 sm:flex-row">
      <form
        className="relative flex-1"
        onSubmit={(e) => {
          e.preventDefault();
          const q = new FormData(e.currentTarget).get("q");
          update({ q: typeof q === "string" ? q.trim() : "" });
        }}
      >
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
        <input
          name="q"
          defaultValue={params.get("q") ?? ""}
          placeholder={placeholder}
          className="h-10 w-full rounded-lg border border-slate-300 bg-white pr-3 pl-9 text-sm shadow-xs placeholder:text-slate-400 focus:border-mint-500 focus:ring-2 focus:ring-mint-500/20 focus:outline-none"
        />
      </form>
      {selectName && selectOptions ? (
        <Select
          aria-label={selectLabel}
          className="sm:w-56"
          defaultValue={params.get(selectName) ?? ""}
          onChange={(e) => update({ [selectName]: e.target.value })}
        >
          {selectOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </Select>
      ) : null}
    </div>
  );
}
