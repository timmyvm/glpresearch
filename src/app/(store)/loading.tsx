/** Shown while a store page's data loads: the page's frame in quiet blocks, no shimmer. */
export default function Loading() {
  return (
    <div className="frame pt-12 pb-24 md:pt-20" aria-busy="true">
      <p className="sr-only" role="status">
        Loading…
      </p>
      <div className="grid gap-6 md:grid-cols-12 md:items-end md:gap-x-[var(--gutter)]" aria-hidden="true">
        <div className="space-y-3 md:col-span-7">
          <div className="h-[clamp(2.75rem,6vw,5.5rem)] w-4/5 bg-surface" />
          <div className="h-[clamp(2.75rem,6vw,5.5rem)] w-1/2 bg-surface" />
        </div>
        <div className="space-y-2.5 md:col-span-5">
          <div className="h-6 w-full bg-surface" />
          <div className="h-6 w-11/12 bg-surface" />
          <div className="h-6 w-2/3 bg-surface" />
        </div>
      </div>
      <div className="mt-14 grid grid-cols-2 gap-x-2 gap-y-10 md:grid-cols-4 md:gap-x-3" aria-hidden="true">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i}>
            <div className="aspect-[4/5] bg-surface" />
            <div className="mt-4 h-6 w-2/3 bg-surface" />
            <div className="mt-2 h-5 w-1/2 bg-surface" />
          </div>
        ))}
      </div>
    </div>
  );
}
