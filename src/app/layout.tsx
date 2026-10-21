import type { Metadata, Viewport } from "next";
import { Hanken_Grotesk } from "next/font/google";
import { siteUrl } from "@/lib/utils";
import "./globals.css";

const hanken = Hanken_Grotesk({
  variable: "--font-hanken",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: "GLP Research — GLP-1 research peptides, batch tested",
    template: "%s · GLP Research",
  },
  description:
    "Seven research compounds that act on the GLP-1 receptor, from semaglutide to retatrutide. Every batch independently verified by HPLC and mass spectrometry, with a referenced research library.",
  applicationName: "GLP Research",
  openGraph: {
    type: "website",
    siteName: "GLP Research",
    locale: "en_AU",
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-AU" className={hanken.variable} suppressHydrationWarning>
      <body className="min-h-dvh">
        <a
          href="#main"
          className="sr-only z-[100] bg-ink px-4 py-3 text-small font-medium text-on-navy focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
