import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { db } from "@/lib/db";
import { plateInk, specimenImage } from "@/lib/plates";
import { PageIntro, TitleLines } from "@/components/store/page-intro";
import { LibraryBody, LibraryBodyFromUrl, LibraryTopics, LibraryTopicsFromUrl } from "@/components/store/library";

export const metadata: Metadata = {
  title: "Research library",
  description:
    "Referenced articles on GLP-1 and incretin biology, receptor pharmacology, the landmark clinical trials, analytical testing and laboratory handling of peptides.",
  alternates: { canonical: "/research" },
};

export default async function ResearchPage() {
  // Every article is fetched once; the topic filter runs in the browser (see library.tsx).
  const [articles, products] = await Promise.all([
    db.article.findMany({
      where: { published: true },
      orderBy: [{ featured: "desc" }, { publishedAt: "desc" }],
      select: { slug: true, title: true, excerpt: true, category: true, coverImage: true, readingMinutes: true, publishedAt: true },
    }),
    db.product.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
      select: { slug: true, name: true, subtitle: true, image: true, accentColor: true },
    }),
  ]);

  return (
    <>
      <PageIntro
        title={<TitleLines lines={["The research", "library"]} />}
        lead="Referenced articles on GLP-1 biology, receptor pharmacology, the clinical trials and good laboratory practice, written for researchers."
      >
        <Suspense fallback={<LibraryTopics />}>
          <LibraryTopicsFromUrl />
        </Suspense>
      </PageIntro>

      <Suspense fallback={<LibraryBody articles={articles} />}>
        <LibraryBodyFromUrl articles={articles} />
      </Suspense>

      <section className="frame pt-28 md:pt-40" aria-labelledby="monographs-title">
        <div className="flex flex-col gap-3 md:flex-row md:items-baseline md:justify-between" data-reveal>
          <h2 id="monographs-title" className="text-head font-semibold">
            Compound monographs
          </h2>
          <p className="max-w-[46ch] text-body">
            Each compound&apos;s page is a full monograph: structure, receptor pharmacology, half-life, batch certificates and the trials behind it.
          </p>
        </div>
        <ul className="mt-10 grid grid-cols-2 gap-x-2 gap-y-8 sm:grid-cols-4 lg:grid-cols-7">
          {products.map((p, i) => (
            <li key={p.slug} data-reveal style={{ "--i": i % 4 } as React.CSSProperties}>
              <Link href={`/shop/${p.slug}`} className="group block">
                <span className="relative block aspect-[3/4] overflow-clip" style={{ backgroundColor: p.accentColor, color: plateInk(p.accentColor) }}>
                  <Image
                    src={specimenImage(p.image) ?? p.image}
                    alt={`${p.name} research vial`}
                    fill
                    sizes="(min-width: 1024px) 14vw, (min-width: 640px) 25vw, 50vw"
                    className="object-contain px-[14%] pt-[14%] pb-[5%] transition-transform duration-500 ease-[var(--ease-out)] group-hover:-translate-y-1"
                  />
                </span>
                <span className="mt-3 block text-lead font-medium group-hover:underline">{p.name}</span>
                <span className="mt-0.5 block text-small text-muted">{p.subtitle}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
