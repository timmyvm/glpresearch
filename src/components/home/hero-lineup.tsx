"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { plateInk } from "@/lib/plates";

export type LineupItem = {
  slug: string;
  name: string;
  fact: string;
  plate: string;
  image: string;
};

/**
 * "Line-up on an arc": the seven vials on a native scroll-snap row. The centred vial is the
 * current one; siblings step back 30% smaller and a quarter darker. The ground takes the
 * current compound's label colour. Drag, swipe, arrow keys or a click on a sibling all work.
 */
/** How far back a vial stands at `d` slots from the centre. */
function stepStyle(i: number, d: number) {
  const a = Math.min(Math.abs(d), 3.2);
  return {
    transform: `translateY(${(i % 2 ? -1 : 1) * Math.min(a, 1) * 14}px) scale(${Math.pow(0.7, a).toFixed(3)})`,
    filter: `brightness(${Math.pow(0.8, a).toFixed(3)})`,
  };
}

export function HeroLineup({ items, title, aside }: { items: LineupItem[]; title: React.ReactNode; aside: React.ReactNode }) {
  const track = useRef<HTMLDivElement>(null);
  const start = Math.floor(items.length / 2);
  const [current, setCurrent] = useState(start);
  const item = items[current];
  const ink = plateInk(item.plate);

  const place = useCallback(() => {
    const el = track.current;
    if (!el) return;
    const mid = el.scrollLeft + el.clientWidth / 2;
    const slots = [...el.querySelectorAll<HTMLElement>("[data-slot]")];
    // Read every slot before writing any style, so a frame costs one layout instead of seven.
    const offsets = slots.map((slot) => (slot.offsetLeft + slot.offsetWidth / 2 - mid) / slot.offsetWidth);
    let best = 0;
    offsets.forEach((d, i) => {
      Object.assign((slots[i].firstElementChild as HTMLElement).style, stepStyle(i, d));
      if (Math.abs(d) < Math.abs(offsets[best])) best = i;
    });
    setCurrent((prev) => (prev === best ? prev : best));
  }, []);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(place);
    };
    // Start on the middle compound so siblings stand on both sides.
    const first = el.querySelectorAll<HTMLElement>("[data-slot]")[start];
    if (first) el.scrollLeft = first.offsetLeft + first.offsetWidth / 2 - el.clientWidth / 2;
    place();
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [place, start]);

  const go = (i: number) => {
    const el = track.current;
    const slot = el?.querySelectorAll<HTMLElement>("[data-slot]")[i];
    if (!el || !slot) return;
    el.scrollTo({ left: slot.offsetLeft + slot.offsetWidth / 2 - el.clientWidth / 2, behavior: "smooth" });
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      go(Math.min(items.length - 1, current + 1));
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      go(Math.max(0, current - 1));
    }
  };

  return (
    <section
      className="relative overflow-hidden transition-[background-color,color] duration-300 ease-out"
      style={{ backgroundColor: item.plate, color: ink }}
      aria-labelledby="hero-title"
    >
      <div className="frame grid gap-6 pt-8 md:grid-cols-12 md:items-end md:pt-12">
        <div className="md:col-span-7">{title}</div>
        <div className="hidden md:col-span-5 md:block">{aside}</div>
      </div>

      <div
        ref={track}
        className="drag-row relative mt-2 px-[calc(50%-clamp(5.5rem,11vw,8.5rem))] outline-none md:mt-0"
        tabIndex={0}
        role="group"
        aria-roledescription="carousel"
        aria-label="The seven compounds. Use the arrow keys to move between them."
        onKeyDown={onKey}
      >
        {items.map((it, i) => (
          <div key={it.slug} data-slot data-start={i === start ? "" : undefined} className="flex w-[clamp(11rem,22vw,17rem)] shrink-0 justify-center">
            <button
              type="button"
              onClick={() => go(i)}
              className="relative block h-[clamp(18rem,44vh,27rem)] w-full origin-bottom transition-[transform,filter] duration-200 ease-out will-change-transform"
              // The server already stands the vials in their starting line-up, so nothing jumps on hydration.
              style={stepStyle(i, i - start)}
              aria-label={`Show ${it.name}`}
              aria-pressed={i === current}
              tabIndex={-1}
            >
              <Image
                src={it.image}
                alt={`${it.name} research vial`}
                fill
                // The centred vial is the largest paint, so it alone loads eagerly and first.
                loading={i === start ? "eager" : undefined}
                fetchPriority={i === start ? "high" : undefined}
                sizes="(min-width: 768px) 17rem, 11rem"
                className="pointer-events-none object-contain object-bottom select-none"
                draggable={false}
              />
            </button>
          </div>
        ))}
      </div>

      <div className="frame pt-3 pb-10 text-center md:pb-12" aria-live="polite">
        <Link href={`/shop/${item.slug}`} className="link text-index font-medium">
          {item.name}
        </Link>
        <p className="mt-1 text-body">{item.fact}</p>
      </div>
      <div className="frame pb-10 md:hidden">{aside}</div>
    </section>
  );
}
