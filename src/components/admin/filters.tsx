"use client";

import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search } from "lucide-react";

/** Search box (and optional select) that update the URL query string, so the view is linkable. */
export function ListFilters({
  placeholder = "Search…",
  label = "Search",
  selectName,
  selectOptions,
  selectLabel,
  count,
}: {
  placeholder?: string;
  label?: string;
  selectName?: string;
  selectOptions?: { value: string; label: string }[];
  selectLabel?: string;
  count?: React.ReactNode;
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

  const control = "h-9 border border-ink/20 bg-white text-sm text-ink placeholder:text-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ink";

  return (
    <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center">
      <form
        role="search"
        className="relative w-full sm:w-80"
        onSubmit={(e) => {
          e.preventDefault();
          const q = new FormData(e.currentTarget).get("q");
          update({ q: typeof q === "string" ? q.trim() : "" });
        }}
      >
        <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted" aria-hidden="true" />
        <input
          name="q"
          type="search"
          aria-label={label}
          autoComplete="off"
          spellCheck={false}
          defaultValue={params.get("q") ?? ""}
          placeholder={placeholder}
          className={`${control} w-full pr-3 pl-9`}
        />
      </form>
      {selectName && selectOptions ? (
        <select
          aria-label={selectLabel}
          className={`${control} px-2 sm:w-52`}
          defaultValue={params.get(selectName) ?? ""}
          onChange={(e) => update({ [selectName]: e.target.value })}
        >
          {selectOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      ) : null}
      {count !== undefined ? <p className="tabular text-sm text-muted sm:ml-auto">{count}</p> : null}
    </div>
  );
}

/** Underline tabs on a full-width rule. Each tab is a link, so the state lives in the URL. */
export function Tabs({ tabs, label }: { tabs: { href: string; label: string; count?: number; active: boolean }[]; label: string }) {
  return (
    <nav className="mb-4 overflow-x-auto overscroll-x-contain border-b border-ink/10" aria-label={label}>
      <ul className="flex min-w-max gap-5">
        {tabs.map((t) => (
          <li key={t.href}>
            <Link
              href={t.href}
              aria-current={t.active ? "page" : undefined}
              className={`-mb-px inline-flex items-center gap-1.5 border-b-2 pt-1 pb-2 text-sm whitespace-nowrap ${
                t.active ? "border-ink text-ink" : "border-transparent text-muted hover:text-ink"
              }`}
            >
              {t.label}
              {t.count !== undefined ? <span className="tabular text-muted">{t.count}</span> : null}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
