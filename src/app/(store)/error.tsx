"use client";

import { useEffect } from "react";
import { Button, ButtonLink } from "@/components/ui/button";
import { Slip, SlipRow } from "@/components/store/paper";

export default function StoreError({ error, retry }: { error: unknown; retry: () => void }) {
  const digest = error instanceof Error && "digest" in error ? String((error as Error & { digest?: string }).digest ?? "") : "";

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="frame grid gap-6 pt-12 pb-24 md:grid-cols-12 md:items-end md:gap-x-[var(--gutter)] md:pt-20 md:pb-40" aria-labelledby="error-title">
      <h1 id="error-title" className="text-display font-semibold md:col-span-7">
        This page didn&apos;t load
      </h1>
      <div className="md:col-span-5">
        <p className="max-w-[44ch] text-lead">
          Something went wrong on our side. It&apos;s usually temporary, so try again.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-6">
          <Button variant="ink" size="lg" onClick={() => retry()}>
            Try Again
          </Button>
          <ButtonLink href="/" variant="ghost" size="lg" className="px-0 hover:bg-transparent hover:underline">
            Go to the Homepage
          </ButtonLink>
        </div>
        <Slip className="mt-10 max-w-[24rem] px-6 pt-6 pb-9">
          <p className="text-lead font-semibold">Request slip</p>
          <dl className="mt-3 space-y-2 text-body">
            {[
              ["Status", "Server error"],
              ["Cart", "Saved on this device"],
              ...(digest ? [["Reference", <span key="ref" translate="no">{digest}</span>]] : []),
            ].map(([label, value]) => (
              <div key={String(label)}>
                <dt className="sr-only">{label}</dt>
                <dd>
                  <SlipRow label={label} value={value} />
                </dd>
              </div>
            ))}
          </dl>
          {digest ? <p className="mt-5 text-small text-muted">If it keeps happening, contact us and quote the reference.</p> : null}
        </Slip>
      </div>
    </section>
  );
}
