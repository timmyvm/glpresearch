"use client";

import { Button } from "@/components/ui/button";

/** Prints the certificate (the page's print styles leave out everything else on it). */
export function PrintButton() {
  return (
    <Button type="button" variant="ink" size="md" onClick={() => window.print()}>
      Print Certificate
    </Button>
  );
}
