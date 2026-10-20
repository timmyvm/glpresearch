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
export function HeroLineup({ items, title, aside }: { items: LineupItem[]; title: React.ReactNode; aside: React.ReactNode }) {
  const track = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(Math.floor(items.length / 2));
  const item = items[current];
  const ink = plateInk(item.plate);

  const place = useCallback(() => {
    const el = track.current;
    if (!el) return;
    const mid = el.scrollLeft + el.clientWidth / 2;
    let best = 0;
    let bestD = Infinity;
    el.querySelectorAll<HTMLElement>("[data-slot]").forEach((slot, i) => {
      const c = slot.offsetLeft + slot.offsetWidth / 2;
      const d = (c - mid) / slot.offsetWidth;
      const a = Math.min(Math.abs(d), 3.2);
      const fig = slot.firstElementChild as HTMLElement;
      fig.style.transform = `translateY(${(i % 2 ? -1 : 1) * Math.min(a, 1) * 14}px) scale(${Math.pow(0.7, a).toFixed(3)})`;
      fig.style.filter = `brightness(${Math.pow(0.8, a).toFixed(3)})`;
      if (Math.abs(d) < bestD) {
        bestD = Math.abs(d);
        best = i;
      }
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
    const start = el.querySelectorAll<HTMLElement>("[data-slot]")[Math.floor(items.length / 2)];
    if (start) el.scrollLeft = start.offsetLeft + start.offsetWidth / 2 - el.clientWidth / 2;
    place();
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [place, items.length]);

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
          <div key={it.slug} data-slot className="flex w-[clamp(11rem,22vw,17rem)] shrink-0 justify-center">
            <button
              type="button"
              onClick={() => go(i)}
              className="relative block h-[clamp(18rem,44vh,27rem)] w-full origin-bottom transition-[transform,filter] duration-200 ease-out will-change-transform"
              aria-label={`Show ${it.name}`}
              aria-pressed={i === current}
              tabIndex={-1}
            >
              <Image
                src={it.image}
                alt={`${it.name} research vial`}
                fill
                priority={i < 3}
                sizes="(min-width: 768px) 22vw, 60vw"
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
