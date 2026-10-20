"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export const ACK_COOKIE = "glp_ack";

/**
 * Research-use acknowledgement. Rendered by the server only when the cookie is missing,
 * in the page flow above the header, so it never covers content and never shifts layout.
 * Checkout still requires its own explicit confirmation.
 */
export function AgeGate() {
  const [hidden, setHidden] = useState(false);
  if (hidden) return null;

  const accept = () => {
    document.cookie = `${ACK_COOKIE}=1; Max-Age=31536000; Path=/; SameSite=Lax`;
    setHidden(true);
  };

  return (
    <div className="bg-ink text-on-navy" role="region" aria-label="Research use notice">
      <div className="frame flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-small text-on-navy-muted">
          <span className="text-on-navy">For laboratory research only.</span> By continuing you confirm you are 18 or
          over and that nothing bought here is for human or veterinary use.{" "}
          <Link href="/disclaimer" className="link text-on-navy">
            Research use policy
          </Link>
        </p>
        <Button variant="accent" size="sm" onClick={accept} className="self-start sm:self-auto">
          I Confirm
        </Button>
      </div>
    </div>
  );
}
