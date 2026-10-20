import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  dark,
  className,
  action,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  align?: "left" | "center";
  dark?: boolean;
  className?: string;
  action?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-6 md:flex-row md:items-end md:justify-between",
        align === "center" && "items-center text-center md:flex-col md:items-center",
        className,
      )}
    >
      <div className={cn("max-w-2xl", align === "center" && "mx-auto")}>
        {eyebrow ? <p className={cn("eyebrow", dark && "text-mint-300")}>{eyebrow}</p> : null}
        <h2 className={cn("mt-3 text-3xl font-semibold tracking-tight text-balance sm:text-4xl", dark ? "text-white" : "text-ink-900")}>
          {title}
        </h2>
        {description ? (
          <p className={cn("mt-4 text-base leading-relaxed text-pretty", dark ? "text-ink-200" : "text-slate-600")}>{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}
