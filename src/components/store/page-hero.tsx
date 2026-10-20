import Image from "next/image";
import { cn } from "@/lib/utils";

export function PageHero({
  eyebrow,
  title,
  description,
  image,
  children,
  className,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  image?: string;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("relative isolate overflow-hidden bg-ink-950 text-white", className)}>
      {image ? (
        <Image src={image} alt="" fill priority sizes="100vw" className="-z-10 object-cover opacity-40" />
      ) : null}
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-ink-950 via-ink-950/85 to-ink-950/30" />
      <div className="grid-bg absolute inset-0 -z-10 opacity-60" />
      <div className="container-page py-16 sm:py-20">
        <div className="max-w-2xl animate-fade-up">
          {eyebrow ? <p className="eyebrow text-mint-300">{eyebrow}</p> : null}
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-balance sm:text-5xl">{title}</h1>
          {description ? <p className="mt-4 text-lg leading-relaxed text-pretty text-ink-200">{description}</p> : null}
          {children}
        </div>
      </div>
    </section>
  );
}
