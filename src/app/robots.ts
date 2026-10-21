import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/utils";

export default function robots(): MetadataRoute.Robots {
  return {
    // Private and transactional pages, plus internal search results (which are noindex anyway).
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/account", "/checkout", "/cart", "/order", "/search", "/api"] }],
    sitemap: siteUrl("/sitemap.xml"),
  };
}
