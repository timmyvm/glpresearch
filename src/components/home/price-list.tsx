import Image from "next/image";
import Link from "next/link";
import { formatMoney } from "@/lib/money";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

export type PriceRow = {
  slug: string;
  name: string;
  note: string;
  sizes: string;
  from: number;
  latestBatch: Date | null;
};

/**
 * "Object riding down the schedule": the catalogue as a price list on the navy field.
 * A vial sits in the gap of the heading and travels down the centre of the rows as the
 * page scrolls (CSS sticky, no script). The row with the newest batch takes the accent.
 */
export function PriceList({ rows, vial }: { rows: PriceRow[]; vial: string }) {
  const newest = rows.reduce<PriceRow | null>((a, r) => (r.latestBatch && (!a?.latestBatch || r.latestBatch > a.latestBatch) ? r : a), null);

  return (
    <section className="relative bg-field-navy py-24 text-on-navy md:py-32" aria-labelledby="price-list-title">
      <div className="pointer-events-none absolute inset-y-0 left-1/2 hidden w-[15vw] -translate-x-1/2 md:block" aria-hidden="true">
        <div className="sticky top-[16vh] h-[46vh]">
          <Image src={vial} alt="" fill sizes="15vw" className="object-contain" />
        </div>
      </div>

      <div className="frame relative">
        <h2 id="price-list-title" className="flex items-center justify-center gap-[clamp(2rem,20vw,22rem)] text-head">
          <span>Price</span>
          <span>list</span>
        </h2>
        <div className="relative mx-auto mt-6 h-[36vh] w-[40%] md:hidden" aria-hidden="true">
          <Image src={vial} alt="" fill sizes="40vw" className="object-contain" />
        </div>
        <p className="mx-auto mt-6 max-w-[46ch] text-center text-on-navy-muted md:mt-[32vh]" data-reveal>
          Every compound we sell, with the vial sizes in stock. Prices are in Australian dollars and include the
          batch certificate.
        </p>

        <ol className="mt-12">
          {rows.map((r, i) => {
            const isNew = newest?.slug === r.slug;
            return (
              <li key={r.slug} data-reveal style={{ "--i": i } as React.CSSProperties}>
                <Link
                  href={`/shop/${r.slug}`}
                  className={cn(
                    "group grid min-h-[5.25rem] gap-1 px-4 py-4 transition-colors duration-200 md:grid-cols-2 md:items-end md:px-6",
                    isNew ? "bg-accent text-accent-ink" : i % 2 ? "bg-white/[0.06] hover:bg-white/[0.12]" : "hover:bg-white/[0.08]",
                  )}
                >
                  <span>
                    <span className="block text-lead font-medium">{r.name}</span>
                    <span className={cn("block", isNew ? "text-accent-ink" : "text-on-navy-muted")}>
                      {isNew && r.latestBatch ? `New batch, released ${formatDate(r.latestBatch, { year: undefined })}` : r.note}
                    </span>
                  </span>
                  <span className="md:text-right">
                    <span className="tabular block text-lead font-medium">from {formatMoney(r.from)}</span>
                    <span className={cn("block", isNew ? "text-accent-ink" : "text-on-navy-muted")}>{r.sizes}</span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
