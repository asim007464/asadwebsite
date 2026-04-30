"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type HeroBackdropSlide = { id?: string; url: string; alt: string };

const INTERVAL_MS = 5000;

type HeroCarouselCtx = {
  index: number;
  setIndex: (i: number) => void;
  slideCount: number;
};

const HeroCarouselContext = createContext<HeroCarouselCtx | null>(null);

function HeroBackdropStack({
  slides,
  activeIndex,
  className = "",
}: {
  slides: HeroBackdropSlide[];
  activeIndex: number;
  className?: string;
}) {
  return (
    <div className={`absolute inset-0 z-0 brightness-[0.62] saturate-[0.92] ${className}`} aria-hidden>
      {slides.map((s, i) => (
        <div
          key={s.id ?? `${s.url}-${i}`}
          className={`absolute inset-0 transition-opacity duration-[900ms] ease-out ${
            i === activeIndex ? "z-[1] opacity-100" : "pointer-events-none z-0 opacity-0"
          }`}
        >
          <img
            src={s.url}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            loading={i === 0 ? "eager" : "lazy"}
            decoding="async"
            fetchPriority={i === 0 ? "high" : "low"}
          />
        </div>
      ))}
    </div>
  );
}

/** Wraps the hero and mounts the image stack; place overlays + copy inside `children`. */
export function HeroCarouselProvider({
  slides,
  children,
}: {
  slides: HeroBackdropSlide[];
  children: ReactNode;
}) {
  const list = slides.length > 0 ? slides : [];
  const slideKey = list.map((s) => s.id ?? s.url).join("|");
  const [index, setIndex] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onChange = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    setIndex(0);
  }, [slideKey]);

  useEffect(() => {
    if (list.length <= 1 || reducedMotion) return;
    const t = window.setInterval(() => {
      setIndex((i) => (i + 1) % list.length);
    }, INTERVAL_MS);
    return () => window.clearInterval(t);
  }, [list.length, reducedMotion]);

  const value = useMemo(() => ({ index, setIndex, slideCount: list.length }), [index, list.length]);

  if (list.length === 0) {
    return <>{children}</>;
  }

  return (
    <HeroCarouselContext.Provider value={value}>
      <HeroBackdropStack slides={list} activeIndex={index} />
      {children}
    </HeroCarouselContext.Provider>
  );
}

/** Place inside hero copy (e.g. under CTAs) so dots align with your text column. */
export function HeroCarouselDots({ className = "" }: { className?: string }) {
  const ctx = useContext(HeroCarouselContext);
  if (!ctx || ctx.slideCount <= 1) return null;

  const { index, setIndex, slideCount } = ctx;

  return (
    <div
      className={`relative z-20 flex flex-wrap items-center justify-center gap-1 pointer-events-auto ${className}`}
      role="group"
      aria-label="Hero background slides — choose a slide"
    >
      {Array.from({ length: slideCount }, (_, i) => (
        <button
          key={i}
          type="button"
          aria-current={i === index ? "true" : undefined}
          aria-label={`Show slide ${i + 1} of ${slideCount}`}
          onClick={() => setIndex(i)}
          className="inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full bg-transparent outline-none transition-opacity hover:opacity-90 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-transparent active:scale-95 sm:size-9"
        >
          <span
            className={`pointer-events-none block h-1.5 rounded-full transition-[width,background-color] duration-300 ${
              i === index ? "w-6 bg-white" : "w-1.5 bg-white/50 hover:bg-white/75"
            }`}
            aria-hidden
          />
        </button>
      ))}
    </div>
  );
}
