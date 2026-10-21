import { ImageResponse } from "next/og";
import { db } from "@/lib/db";
import { formatMoney } from "@/lib/money";
import { plateInk } from "@/lib/plates";
import { OG_SIZE, OgWordmark, ogFonts, ogPicture, vialPicture } from "@/components/store/og";

export const alt = "A GLP Research peptide vial on its label colour";
export const size = OG_SIZE;
export const contentType = "image/png";

// Built with the pages, so share cards are static files rather than rendered per request.
export async function generateStaticParams() {
  const rows = await db.product.findMany({ where: { active: true }, select: { slug: true } });
  return rows.map(({ slug }) => ({ slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await db.product.findFirst({
    where: { slug, active: true },
    select: { name: true, subtitle: true, image: true, accentColor: true, variants: { where: { active: true }, select: { price: true } } },
  });
  const [fonts, logo, vial] = await Promise.all([ogFonts(), ogPicture("logo-mark"), product ? vialPicture(product.image) : null]);

  const ground = product?.accentColor ?? "#a7ff9c";
  const ink = plateInk(ground);
  const from = product?.variants.length ? Math.min(...product.variants.map((v) => v.price)) : null;

  return new ImageResponse(
    (
      <div style={{ display: "flex", position: "relative", width: "100%", height: "100%", background: ground, color: ink, fontFamily: "Hanken Grotesk", padding: 64 }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: 700 }}>
          <OgWordmark logo={logo} color={ink} />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 112, fontWeight: 500, lineHeight: 1, letterSpacing: -2.5 }}>{product?.name ?? "GLP Research"}</div>
            <div style={{ marginTop: 22, fontSize: 40, lineHeight: 1.2 }}>{product?.subtitle ?? "GLP-1 research peptides"}</div>
            <div style={{ marginTop: 36, fontSize: 28, lineHeight: 1.3 }}>
              {from != null ? `From ${formatMoney(from)}. Every batch tested by HPLC and mass spectrometry.` : "Every batch tested by HPLC and mass spectrometry."}
            </div>
          </div>
        </div>
        {vial ? (
          <img src={vial} alt="" width={Math.round((600 * 347) / 520)} height={600} style={{ position: "absolute", right: 96, bottom: -40 }} />
        ) : null}
      </div>
    ),
    { ...size, fonts },
  );
}
