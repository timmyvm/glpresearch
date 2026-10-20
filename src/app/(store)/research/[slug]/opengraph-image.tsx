import { ImageResponse } from "next/og";
import { db } from "@/lib/db";
import { splitTitle } from "@/components/store/article-title";
import { OG, OG_SIZE, OgWordmark, ogFonts, ogPicture } from "@/components/store/og";

export const alt = "A GLP Research library article";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [article, fonts, logo] = await Promise.all([
    db.article.findFirst({ where: { slug, published: true }, select: { title: true, category: true, readingMinutes: true } }),
    ogFonts(),
    ogPicture("logo-mark"),
  ]);
  const { head, rest } = splitTitle(article?.title ?? "The research library");
  // Long titles step down so they hold to three lines.
  const titleSize = head.length > 48 ? 64 : head.length > 30 ? 76 : 92;

  return new ImageResponse(
    (
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: "100%", height: "100%", background: OG.navy, color: OG.onNavy, fontFamily: "Hanken Grotesk", padding: 64 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <OgWordmark logo={logo} color={OG.onNavy} />
          <div style={{ fontSize: 28, color: OG.onNavyMuted }}>Research library</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", maxWidth: 1000 }}>
          <div style={{ fontSize: titleSize, fontWeight: 500, lineHeight: 1.04, letterSpacing: -1.5 }}>{head}</div>
          {rest ? <div style={{ marginTop: 24, fontSize: 40, lineHeight: 1.2, color: OG.onNavyMuted }}>{rest}</div> : null}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 28, color: OG.onNavyMuted }}>
          <div style={{ width: 20, height: 20, background: OG.mint }} />
          <div>{article ? `${article.category}, ${article.readingMinutes} minute read` : "GLP Research"}</div>
        </div>
      </div>
    ),
    { ...size, fonts },
  );
}
