import { cn } from "@/lib/utils";

export type Spine = { title: string; kind: string; href: string; external?: boolean; plate?: string; plateInk?: string };

const KIND_COLOUR: Record<string, string> = {
  Monograph: "",
  Article: "bg-field-paper text-ink",
  Trial: "bg-accent text-accent-ink",
  Reference: "bg-surface-2 text-ink",
};

/**
 * The research library as one shelf of spines: our articles, the seven compound monographs and the
 * trials they cite. Each spine is a link. On a phone the spines lie down into one dense paragraph.
 */
export function ResearchShelf({ spines, articleCount }: { spines: Spine[]; articleCount: number }) {
  return (
    <section className="frame py-28 md:py-40" aria-labelledby="shelf-title">
      <div className="flex flex-col gap-3 md:flex-row md:items-baseline md:justify-between" data-reveal>
        <h2 id="shelf-title" className="text-head font-semibold">
          The research shelf
        </h2>
        <p className="max-w-[48ch] text-body">
          {articleCount} referenced articles, the seven compound monographs and the trials they cite. Every spine opens it.
        </p>
      </div>

      <ul className="mt-12 hidden h-[440px] gap-1.5 md:flex" data-reveal style={{ "--i": 1 } as React.CSSProperties}>
        {spines.map((s) => (
          <li key={s.href + s.title} className="flex-1 min-w-0">
            <a
              href={s.href}
              {...(s.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className="spine group flex h-full w-full flex-col items-center justify-between bg-surface px-0.5 py-3 text-ink transition-colors duration-200 hover:bg-ink hover:text-white focus-visible:bg-ink focus-visible:text-white"
            >
              <span className="text-body font-medium [writing-mode:vertical-rl]">{s.title}</span>
              <span
                className={cn("px-0.5 py-1.5 text-small [writing-mode:vertical-rl]", KIND_COLOUR[s.kind])}
                style={s.kind === "Monograph" ? { backgroundColor: s.plate, color: s.plateInk } : undefined}
              >
                {s.kind}
              </span>
            </a>
          </li>
        ))}
      </ul>

      <ul className="mt-10 flex flex-wrap gap-x-2.5 gap-y-3.5 md:hidden">
        {spines.map((s) => (
          <li key={s.href + s.title}>
            <a href={s.href} {...(s.external ? { target: "_blank", rel: "noopener noreferrer" } : {})} className="text-body">
              <span className="underline decoration-[0.07em] underline-offset-[0.2em]">{s.title}</span>{" "}
              <span
                className={cn("px-1 py-0.5 text-small", KIND_COLOUR[s.kind])}
                style={s.kind === "Monograph" ? { backgroundColor: s.plate, color: s.plateInk } : undefined}
              >
                {s.kind}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
