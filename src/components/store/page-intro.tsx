import { cn } from "@/lib/utils";

/**
 * The opening of an inner page: the h1 on the left, the supporting line at the far end of the
 * same grid ("opposite ends"), and an optional second row for a form or a picture.
 */
export function PageIntro({
  title,
  lead,
  children,
  field,
  className,
  titleClassName,
}: {
  title: React.ReactNode;
  lead?: React.ReactNode;
  children?: React.ReactNode;
  field?: "mint" | "grey" | "navy" | "orange";
  className?: string;
  titleClassName?: string;
}) {
  const ground = {
    mint: "bg-field-mint text-ink",
    grey: "bg-field-grey text-ink",
    navy: "bg-field-navy text-on-navy",
    orange: "bg-field-orange text-ink",
  } as const;

  return (
    <section className={cn(field ? ground[field] : "", className)}>
      <div className={cn("frame grid gap-6 pt-12 md:grid-cols-12 md:items-end md:gap-x-[var(--gutter)] md:pt-20", field ? "pb-14 md:pb-20" : "pb-4")}>
        <h1 className={cn("lines text-display md:col-span-7", titleClassName)}>{title}</h1>
        {lead ? (
          <div className="md:col-span-5" data-load style={{ "--d": "300ms" } as React.CSSProperties}>
            {typeof lead === "string" ? <p className="max-w-[44ch] text-lead">{lead}</p> : lead}
          </div>
        ) : null}
        {children ? <div className="md:col-span-12">{children}</div> : null}
      </div>
    </section>
  );
}

/** Wraps a two-line title so each line rises from its own mask on load. */
export function TitleLines({ lines }: { lines: string[] }) {
  return (
    <>
      {lines.map((l, i) => (
        <span key={l} className="line">
          <span data-line style={{ "--i": i } as React.CSSProperties}>
            {l}
          </span>
        </span>
      ))}
    </>
  );
}
