"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * A muted decorative loop. It plays only while on screen, never under reduced motion,
 * and has a visible Pause control (loops over five seconds need one).
 */
export function LoopVideo({ src, poster, label, className }: { src: string; poster: string; label: string; className?: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !reduced.matches && !video.dataset.userPaused) video.play().catch(() => {});
        else video.pause();
      },
      { threshold: 0.25 },
    );
    io.observe(video);
    return () => io.disconnect();
  }, []);

  const toggle = () => {
    const video = ref.current;
    if (!video) return;
    if (video.paused) {
      delete video.dataset.userPaused;
      video.play().catch(() => {});
      setPaused(false);
    } else {
      video.dataset.userPaused = "1";
      video.pause();
      setPaused(true);
    }
  };

  return (
    <div className={cn("relative", className)}>
      <video
        ref={ref}
        className="absolute inset-0 size-full object-cover"
        src={src}
        poster={poster}
        muted
        loop
        playsInline
        preload="metadata"
        aria-label={label}
      />
      <button
        type="button"
        onClick={toggle}
        className="press absolute right-3 bottom-3 bg-ink px-3 py-1.5 text-small font-medium text-on-navy"
        aria-label={paused ? "Play background video" : "Pause background video"}
      >
        {paused ? "Play" : "Pause"}
      </button>
    </div>
  );
}
