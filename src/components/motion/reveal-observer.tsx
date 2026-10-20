"use client";

import { useEffect } from "react";

/**
 * One shared IntersectionObserver for every [data-reveal] element, including content that
 * streams in later (watched with a MutationObserver). Revealed elements get a
 * `data-revealed` attribute, which React does not manage, so hydration never sees a mismatch.
 */
export function RevealObserver() {
  useEffect(() => {
    const reveal = (el: Element) => el.setAttribute("data-revealed", "");

    if (!("IntersectionObserver" in window)) {
      document.querySelectorAll("[data-reveal]").forEach(reveal);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            reveal(e.target);
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.05 },
    );

    const watch = (root: ParentNode) => {
      root.querySelectorAll<HTMLElement>("[data-reveal]:not([data-revealed])").forEach((el) => {
        // Anything already on screen is shown at once, never held back.
        if (el.getBoundingClientRect().top < window.innerHeight * 0.88) reveal(el);
        else io.observe(el);
      });
    };

    watch(document);

    let queued = false;
    const mo = new MutationObserver(() => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => {
        queued = false;
        watch(document);
      });
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, []);

  return null;
}
