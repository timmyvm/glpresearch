import { siteUrl } from "@/lib/utils";

/** Stable ids so pages can point at the one Organization and WebSite node. */
export const ORG_ID = siteUrl("/#organization");
export const SITE_ID = siteUrl("/#website");

export function organizationLd(store: { name: string; email: string }) {
  return {
    "@type": "Organization",
    "@id": ORG_ID,
    name: store.name,
    url: siteUrl("/"),
    logo: siteUrl("/icon.png"),
    email: store.email,
    contactPoint: { "@type": "ContactPoint", contactType: "customer support", email: store.email, areaServed: "AU", availableLanguage: "en" },
  };
}

export function websiteLd(name: string) {
  return {
    "@type": "WebSite",
    "@id": SITE_ID,
    name,
    url: siteUrl("/"),
    inLanguage: "en-AU",
    publisher: { "@id": ORG_ID },
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: siteUrl("/search?q={search_term_string}") },
      "query-input": "required name=search_term_string",
    },
  };
}

export function breadcrumbLd(trail: { name: string; path: string }[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: trail.map((step, i) => ({ "@type": "ListItem", position: i + 1, name: step.name, item: siteUrl(step.path) })),
  };
}
