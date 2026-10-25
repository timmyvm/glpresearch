import { ImageResponse } from "next/og";
import { db } from "@/lib/db";
import { splitTitle } from "@/components/store/article-title";
import { OG, OG_SIZE, OgSheet, OgWordmark, ogFonts, ogPicture } from "@/components/store/og";

export const alt = "A GLP Research library article";
export const size = OG_SIZE;
export const contentType = "image/png";

// Built with the pages, so share cards are static files rather than rendered per request.
export async function generateStaticParams() {
  const rows = await db.article.findMany({ where: { published: true }, select: { slug: true } });
  return rows.map(({ slug }) => ({ slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [article, fonts, logo] = await Promise.all([
    db.article.findFirst({ where: { slug, published: true }, select: { title: true, category: true, readingMinutes: true, author: true } }),
    ogFonts(),
    ogPicture("logo-peak"),
  ]);
  const { head, rest } = splitTitle(article?.title ?? "The research library");
  // Long titles step down so they hold to three lines.
  const titleSize = head.length > 48 ? 64 : head.length > 30 ? 76 : 92;

  return new ImageResponse(
    (
      <OgSheet ground={OG.black}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <OgWordmark logo={logo} color={OG.ink} />
          <div style={{ fontSize: 26, color: OG.muted }}>Research library</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", marginTop: "auto", maxWidth: 960 }}>
          <div style={{ fontSize: titleSize, fontWeight: 600, lineHeight: 0.95, letterSpacing: -2.5 }}>{head}</div>
          {rest ? <div style={{ marginTop: 22, fontSize: 36, lineHeight: 1.2, color: OG.ink }}>{rest}</div> : null}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 34, fontSize: 24, color: OG.muted }}>
          <div style={{ width: 16, height: 16, background: OG.accent }} />
          <div>{article ? `${article.category}, ${article.readingMinutes} minute read, ${article.author}` : "GLP Research"}</div>
        </div>
      </OgSheet>
    ),
    { ...size, fonts },
  );
}
