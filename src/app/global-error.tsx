"use client";

import { useEffect } from "react";
import { Bricolage_Grotesque } from "next/font/google";
import "./globals.css";

const bricolage = Bricolage_Grotesque({ variable: "--font-bricolage", subsets: ["latin"], axes: ["opsz"], display: "swap" });

/** Replaces the root layout when it fails, so it brings its own document, styles and font. */
export default function GlobalError({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en-AU" className={bricolage.variable}>
      <body className="min-h-dvh">
        <title>Something went wrong · GLP Research</title>
        <main className="frame grid min-h-dvh content-center gap-6 py-16 md:grid-cols-12 md:items-end md:gap-x-[var(--gutter)]">
          <h1 className="text-display md:col-span-7">GLP Research is having trouble</h1>
          <div className="md:col-span-5">
            <p className="max-w-[44ch] text-lead">
              The site failed to load. It&apos;s usually temporary: try again in a moment. Your cart is saved on this device.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-6">
              <button
                type="button"
                onClick={() => retry()}
                className="press inline-flex h-14 items-center bg-ink px-7 font-medium text-on-navy hover:bg-ink-800"
              >
                Try Again
              </button>
              {/* A full page load, since the app shell itself failed. */}
              {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
              <a href="/" className="link font-medium">
                Go to the Homepage
              </a>
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
