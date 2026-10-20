import Image from "next/image";
import Link from "next/link";
import { db } from "@/lib/db";
import { plateInk, specimenImage } from "@/lib/plates";
import { splitTitle } from "./article-title";

/**
 * Somewhere to go next, for pages that have nothing of their own to show yet (an empty search,
 * a missing page): the seven compounds as plates, then the newest articles.
 */
export async function Browse() {
  const [products, articles] = await Promise.all([
    db.product.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" }, select: { slug: true, name: true, image: true, accentColor: true } }),
    db.article.findMany({
      where: { published: true },
      orderBy: { publishedAt: "desc" },
      take: 3,
      select: { slug: true, title: true, excerpt: true, category: true, coverImage: true, readingMinutes: true },
    }),
  ]);

  return (
    <>
      <section className="frame pt-20 md:pt-28" aria-labelledby="browse-compounds">
        <div className="flex flex-col gap-3 md:flex-row md:items-baseline md:justify-between">
          <h2 id="browse-compounds" className="text-index font-medium" data-reveal>
            The seven compounds
          </h2>
          <Link href="/compare" className="link font-medium">
            Compare them side by side
          </Link>
        </div>
        <ul className="mt-8 grid grid-cols-3 gap-1.5 sm:grid-cols-4 lg:grid-cols-7">
          {products.map((p, i) => (
            <li key={p.slug} data-reveal style={{ "--i": i % 4 } as React.CSSProperties}>
              <Link href={`/shop/${p.slug}`} className="group relative block aspect-[4/5] overflow-clip" style={{ backgroundColor: p.accentColor, color: plateInk(p.accentColor) }}>
                <Image src={specimenImage(p.image) ?? p.image} alt="" fill sizes="(min-width: 1024px) 14vw, (min-width: 640px) 25vw, 33vw" className="object-contain px-[16%] pt-[12%] pb-[20%] transition-transform duration-500 ease-[var(--ease-out)] group-hover:-translate-y-1" />
                <span className="absolute inset-x-3 bottom-2 text-small font-medium group-hover:underline">{p.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {articles.length ? (
        <section className="frame pt-20 md:pt-28" aria-labelledby="browse-articles">
          <div className="flex flex-col gap-3 md:flex-row md:items-baseline md:justify-between">
            <h2 id="browse-articles" className="text-index font-medium" data-reveal>
              New in the research library
            </h2>
            <Link href="/research" className="link font-medium">
              Every article
            </Link>
          </div>
          <ul className="mt-8 grid gap-x-3 gap-y-12 md:grid-cols-3">
            {articles.map((a, i) => {
              const t = splitTitle(a.title);
              return (
                <li key={a.slug} data-reveal style={{ "--i": i } as React.CSSProperties}>
                  <Link href={`/research/${a.slug}`} className="group block">
                    <span className="relative block aspect-[3/2] overflow-clip bg-ink">
                      {a.coverImage ? <Image src={a.coverImage} alt="" fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover transition-transform duration-700 ease-[var(--ease-out)] group-hover:scale-[1.02]" /> : null}
                    </span>
                    <span className="mt-4 block text-lead font-medium group-hover:underline group-hover:decoration-[0.07em] group-hover:underline-offset-[0.2em]">{t.head}</span>
                    <span className="mt-2 block">{a.excerpt}</span>
                    <span className="mt-2 block text-small text-muted">
                      {a.category}, {a.readingMinutes} minute read
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}
    </>
  );
}
