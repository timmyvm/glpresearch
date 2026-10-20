import { ImageResponse } from "next/og";
import { OG, OG_SIZE, OgWordmark, ogFonts, ogPicture } from "@/components/store/og";

export const alt = "GLP Research: GLP-1 research peptides, batch tested";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image() {
  const [fonts, logo, ...vials] = await Promise.all([
    ogFonts(),
    ogPicture("logo-mark"),
    ogPicture("semaglutide-10mg"),
    ogPicture("tirzepatide-15mg"),
  ]);

  return new ImageResponse(
    (
      <div style={{ display: "flex", position: "relative", width: "100%", height: "100%", background: OG.mint, color: OG.ink, fontFamily: "Hanken Grotesk", padding: 64 }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: 640 }}>
          <OgWordmark logo={logo} color={OG.ink} />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 80, fontWeight: 500, lineHeight: 1.04, letterSpacing: -1.5 }}>GLP-1 peptides, batch tested</div>
            <div style={{ marginTop: 28, fontSize: 30, lineHeight: 1.3, color: OG.ink, maxWidth: 560 }}>
              Seven research compounds, each with HPLC and mass-spectrometry results for every batch.
            </div>
          </div>
        </div>
        <div style={{ display: "flex", position: "absolute", right: 44, bottom: -24, alignItems: "flex-end" }}>
          {vials.map((src, i) => {
            const h = i === 1 ? 520 : 420;
            return src ? <img key={i} src={src} alt="" width={Math.round((h * 347) / 520)} height={h} style={{ marginLeft: i === 0 ? 0 : -84 }} /> : null;
          })}
        </div>
      </div>
    ),
    { ...size, fonts },
  );
}
