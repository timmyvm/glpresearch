import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export type Tile = { slug: string; title: string; category: string; readingMinutes: number; coverImage: string | null };

// "Staggered tiles, empty cells": positions for six articles on a four-column grid.
const PLACES = [
  "md:col-span-2 md:col-start-1 md:row-start-1 aspect-[3/2]",
  "md:col-start-4 md:row-start-1 aspect-[4/5]",
  "md:col-start-2 md:row-start-2 aspect-[4/5]",
  "md:col-start-3 md:row-start-2 aspect-[4/5]",
  "md:col-span-2 md:col-start-3 md:row-start-3 aspect-[3/2]",
  "md:col-start-1 md:row-start-3 aspect-[4/5]",
];

export function LibraryTiles({ tiles }: { tiles: Tile[] }) {
  return (
    <section className="pt-32 md:pt-48" aria-labelledby="library-title">
      <div className="grid grid-cols-2 gap-x-2.5 gap-y-10 px-[5vw] md:grid-cols-4 md:gap-x-4 md:gap-y-16">
        <div className="col-span-2 md:col-span-1 md:col-start-3 md:row-start-1 md:self-end" data-reveal>
          <h2 id="library-title" className="text-head">
            Research
            <br />
            library
          </h2>
          <p className="mt-5 max-w-[30ch]">Referenced explainers on incretin biology, the trials and the lab bench.</p>
          <Link href="/research" className="link mt-4 inline-block font-medium">
            All articles
          </Link>
        </div>
        {tiles.slice(0, PLACES.length).map((t, i) => (
          <Link
            key={t.slug}
            href={`/research/${t.slug}`}
            className={cn("group block", i % 2 === 1 ? "col-start-2 md:col-start-auto" : "col-start-1 md:col-start-auto", PLACES[i].replace(/aspect-\S+/, ""), i === 0 || i === 4 ? "col-span-2" : "")}
            data-reveal
            style={{ "--i": i % 3 } as React.CSSProperties}
          >
            <div className={cn("relative overflow-clip bg-ink", PLACES[i].match(/aspect-\S+/)?.[0])}>
              {t.coverImage ? (
                <Image src={t.coverImage} alt="" fill sizes="(min-width: 768px) 45vw, 90vw" className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]" />
              ) : null}
            </div>
            <p className="mt-3 max-w-[48ch] font-medium text-ink group-hover:underline">{t.title}</p>
            <p className="mt-1 text-small text-muted">
              {t.category}, {t.readingMinutes} min read
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
