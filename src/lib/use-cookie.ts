"use client";

import { useSyncExternalStore } from "react";

type CookieStoreLike = {
  addEventListener: (type: "change", listener: () => void) => void;
  removeEventListener: (type: "change", listener: () => void) => void;
};

// Browsers with the Cookie Store API report changes; elsewhere the value refreshes on the next render.
function subscribe(onChange: () => void) {
  const store = (window as Window & { cookieStore?: CookieStoreLike }).cookieStore;
  store?.addEventListener("change", onChange);
  return () => store?.removeEventListener("change", onChange);
}

export function readCookie(name: string) {
  const prefix = `${name}=`;
  const found = document.cookie.split("; ").find((c) => c.startsWith(prefix));
  return found ? found.slice(prefix.length) : null;
}

/**
 * A cookie's value read in the browser, for static pages that cannot read cookies on the
 * server. Server rendering and hydration see `serverValue`; the real value follows straight after.
 */
export function useCookie(name: string, serverValue: string | null = null) {
  return useSyncExternalStore(
    subscribe,
    () => readCookie(name),
    () => serverValue,
  );
}
