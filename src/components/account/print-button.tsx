"use client";

import { Button } from "@/components/ui/button";

export function PrintButton() {
  return (
    <Button variant="ink" onClick={() => window.print()}>
      Print or Save as PDF
    </Button>
  );
}
