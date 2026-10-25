import { ImageResponse } from "next/og";
import { db } from "@/lib/db";
import { formatMoney } from "@/lib/money";
import { plateInk } from "@/lib/plates";
import { OG, OG_SIZE, OgSheet, OgWordmark, ogFonts, ogPicture, vialPicture } from "@/components/store/og";

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
    select: {
      name: true,
      subtitle: true,
      image: true,
      accentColor: true,
      variants: { where: { active: true }, select: { price: true } },
      batches: { where: { published: true }, orderBy: { testedAt: "desc" }, take: 1, select: { batchNumber: true, purity: true } },
    },
  });
  const [fonts, logo, vial] = await Promise.all([ogFonts(), ogPicture("logo-peak"), product ? vialPicture(product.image) : null]);

  const plate = product?.accentColor ?? OG.accent;
  const from = product?.variants.length ? Math.min(...product.variants.map((v) => v.price)) : null;
  const batch = product?.batches[0];
  const name = product?.name ?? "GLP Research";

  return new ImageResponse(
    (
      <OgSheet>
        <div style={{ display: "flex", flex: 1, gap: 44 }}>
          <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
            <OgWordmark logo={logo} color={OG.ink} />
            <div style={{ display: "flex", marginTop: "auto", fontSize: name.length > 11 ? 96 : 112, fontWeight: 600, lineHeight: 0.92, letterSpacing: -3.5 }}>{name}</div>
            <div style={{ marginTop: 18, fontSize: 34, lineHeight: 1.2 }}>{product?.subtitle ?? "GLP-1 research peptides"}</div>
            <div style={{ display: "flex", flexDirection: "column", marginTop: 28, fontSize: 26, lineHeight: 1.35, color: OG.muted }}>
              <div>{batch ? `Batch ${batch.batchNumber}, purity ${batch.purity.toFixed(2)}% by HPLC` : "Every batch tested by HPLC and mass spectrometry"}</div>
              <div>{from != null ? `From ${formatMoney(from)}. For laboratory research only.` : "For laboratory research only."}</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", width: 330, background: plate, color: plateInk(plate), position: "relative" }}>
            <div style={{ position: "absolute", top: 16, left: 18, fontSize: 24, fontWeight: 500 }}>{name}</div>
            {vial ? <img src={vial} alt="" width={250} height={375} style={{ marginBottom: 20 }} /> : null}
          </div>
        </div>
      </OgSheet>
    ),
    { ...size, fonts },
  );
}
