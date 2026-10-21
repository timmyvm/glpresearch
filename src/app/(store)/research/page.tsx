import type { Metadata } from "next";
import { Suspense } from "react";
import { db } from "@/lib/db";
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
  const articles = await db.article.findMany({
    where: { published: true },
    orderBy: [{ featured: "desc" }, { publishedAt: "desc" }],
    select: { slug: true, title: true, excerpt: true, category: true, coverImage: true, readingMinutes: true, publishedAt: true },
  });

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
    </>
  );
}
