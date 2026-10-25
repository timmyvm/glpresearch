import { ImageResponse } from "next/og";
import { OG, OG_SIZE, OgSheet, OgWordmark, ogFonts, ogPicture, ogTrace } from "@/components/store/og";

export const alt = "GLP Research: a certificate of analysis for GLP-1 research peptides, batch tested";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image() {
  const [fonts, logo, vial] = await Promise.all([ogFonts(), ogPicture("logo-peak"), ogPicture("semaglutide-10mg")]);

  return new ImageResponse(
    (
      <OgSheet>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 92, fontWeight: 600, lineHeight: 0.9, letterSpacing: -3.5 }}>
          <span>GLP-1</span>
          <span>research</span>
          <span>peptides</span>
        </div>
        <div style={{ display: "flex", flex: 1, marginTop: 36, gap: 36 }}>
          <div style={{ display: "flex", flexDirection: "column", width: 470, fontSize: 30, lineHeight: 1.3 }}>
            <div style={{ fontWeight: 500 }}>Seven compounds, from</div>
            <div style={{ fontWeight: 500 }}>semaglutide to retatrutide</div>
            <div style={{ marginTop: 14 }}>Purity by HPLC, every batch</div>
            <div>Identity by mass spectrometry</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end", flex: 1, paddingBottom: 8 }}>
            <img src={ogTrace(290, 150)} width={290} height={150} alt="" />
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", width: 210, background: "#2dd4bf" }}>
            {vial ? <img src={vial} alt="" width={170} height={255} style={{ marginBottom: 14 }} /> : null}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 28 }}>
          <OgWordmark logo={logo} color={OG.ink} />
          <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 24, color: OG.muted }}>
            <div style={{ width: 16, height: 16, background: OG.accent }} />
            Certificate on file for every batch
          </div>
        </div>
      </OgSheet>
    ),
    { ...size, fonts },
  );
}
