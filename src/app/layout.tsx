import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { siteUrl } from "@/lib/utils";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: "GLP Research — Research-grade GLP-1 peptides & incretin science",
    template: "%s · GLP Research",
  },
  description:
    "Third-party tested GLP-1, dual and triple incretin receptor agonist peptides for laboratory research, plus an in-depth library on incretin biology and published clinical data.",
  openGraph: {
    type: "website",
    siteName: "GLP Research",
    images: [{ url: "/images/hero-vials.webp", width: 1600, height: 900 }],
  },
};

export const viewport: Viewport = {
  themeColor: "#0b1530",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
