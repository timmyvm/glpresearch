"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useCookie } from "@/lib/use-cookie";

export const ACK_COOKIE = "glp_ack";

/**
 * Research-use acknowledgement for first visits. Pages are static, so the browser decides
 * whether to show it. It sits at the end of the page flow and sticks to the bottom of the
 * screen: nothing above it moves when it appears, and it parks below the footer rather than
 * covering it. Checkout still requires its own explicit confirmation.
 */
export function AgeGate() {
  // The server render assumes "acknowledged", so the notice never flashes for returning visitors.
  const acknowledged = useCookie(ACK_COOKIE, "1") === "1";
  const [hidden, setHidden] = useState(false);
  if (acknowledged || hidden) return null;

  const accept = () => {
    document.cookie = `${ACK_COOKIE}=1; Max-Age=31536000; Path=/; SameSite=Lax`;
    setHidden(true);
  };

  return (
    <div className="sticky bottom-0 z-30 bg-ink text-on-navy" role="region" aria-label="Research use notice" data-load style={{ "--d": "0ms" } as React.CSSProperties}>
      <div className="frame flex flex-col gap-3 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:flex-row sm:items-center sm:justify-between">
        <p className="text-small text-on-navy-muted">
          <span className="text-on-navy">For laboratory research only.</span> By continuing you confirm you are 18 or
          over and that nothing bought here is for human or veterinary use.{" "}
          <Link href="/disclaimer" className="link text-on-navy">
            Research use policy
          </Link>
        </p>
        <Button variant="accent" size="sm" onClick={accept} className="w-full shrink-0 sm:w-auto">
          I Confirm
        </Button>
      </div>
    </div>
  );
}
