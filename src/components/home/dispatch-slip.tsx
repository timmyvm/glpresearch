import { DispatchLine } from "@/components/site/dispatch-clock";
import { Slip, SlipRow } from "@/components/store/paper";

const DAYS = [
  {
    when: "Order day",
    rows: [
      ["Order placed", "any time"],
      ["Payment matched", "same day"],
      ["Packed with a cold pack", "same afternoon"],
      ["Tracked dispatch from Sydney", "same day"],
    ],
  },
  {
    when: "The days after",
    rows: [
      ["Express, tracked", "1 to 3 business days"],
      ["Standard, tracked", "2 to 6 business days"],
    ],
  },
];

/** The fulfilment promise printed as a dispatch slip, torn off along its bottom edge. */
export function DispatchSlip() {
  return (
    <section className="bg-field-black py-28 text-white md:py-40" aria-labelledby="slip-title">
      <div className="frame grid gap-12 md:grid-cols-12 md:gap-x-[var(--gutter)]">
        <div className="md:col-span-5" data-reveal>
          <h2 id="slip-title" className="text-head font-semibold">
            Freezer to bench
          </h2>
          <p className="mt-6 max-w-[34ch] text-lead">
            Orders paid before 1 pm Sydney time leave the same day, packed cold, with a slip giving each vial&apos;s batch number.
          </p>
          <DispatchLine className="mt-6 max-w-[34ch] text-body text-on-black-muted" />
        </div>

        <Slip className="w-full max-w-[30rem] px-6 pt-7 md:col-span-5 md:col-start-7 md:px-8 md:pt-8" data-reveal>
          {DAYS.map((d, i) => (
            <div key={d.when} className={i ? "mt-7" : ""}>
              <h3 className="text-body font-semibold">{d.when}</h3>
              <ul className="mt-2 space-y-1.5 text-body">
                {d.rows.map(([what, time]) => (
                  <li key={what}>
                    <SlipRow label={what} value={time} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <p className="-mx-6 mt-7 flex h-11 items-center justify-between gap-3 bg-ink px-6 text-body font-medium text-white md:-mx-8 md:px-8">
            <span>Vials on your bench</span>
            <span className="tabular whitespace-nowrap">1 to 6 days</span>
          </p>
        </Slip>
      </div>
    </section>
  );
}
