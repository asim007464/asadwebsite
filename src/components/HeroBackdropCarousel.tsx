"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type HeroBackdropSlide = { id?: string; url: string; alt: string };

const INTERVAL_MS = 5000;

type HeroCarouselCtx = {
  index: number;
  setIndex: (i: number) => void;
  slideCount: number;
  slides: HeroBackdropSlide[];
};

const HeroCarouselContext = createContext<HeroCarouselCtx | null>(null);

function useHeroCarousel() {
  return useContext(HeroCarouselContext);
}

/** Auto-rotating slide state for the homepage hero image column. */
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

  const value = useMemo(
    () => ({ index, setIndex, slideCount: list.length, slides: list }),
    [index, list],
  );

  return <HeroCarouselContext.Provider value={value}>{children}</HeroCarouselContext.Provider>;
}

/** Full-width hero slides — natural colors, no text overlay. */
export function HeroCarouselImagePanel({
  className = "",
  variant = "banner",
}: {
  className?: string;
  variant?: "banner" | "card";
}) {
  const ctx = useHeroCarousel();
  const slides = ctx?.slides ?? [];
  const activeIndex = ctx?.index ?? 0;

  const shellClass =
    variant === "banner"
      ? "relative h-full w-full min-h-0 overflow-hidden bg-slate-100"
      : "relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-slate-100 shadow-md ring-1 ring-slate-200/80 sm:aspect-[16/11] lg:aspect-[4/3]";

  if (slides.length === 0) {
    return <div className={`${shellClass} ${className}`} aria-hidden />;
  }

  return (
    <div
      className={`${shellClass} ${className}`}
      aria-live="polite"
      aria-atomic="true"
      aria-label="Homepage banner slideshow"
    >
      {slides.map((s, i) => (
        <div
          key={s.id ?? `${s.url}-${i}`}
          className={`absolute inset-0 transition-opacity duration-[900ms] ease-out ${
            i === activeIndex ? "z-[1] opacity-100" : "pointer-events-none z-0 opacity-0"
          }`}
        >
          <img
            src={s.url}
            alt={s.alt || "Hero slide"}
            className="h-full w-full object-cover"
            loading={i === 0 ? "eager" : "lazy"}
            decoding="async"
            fetchPriority={i === 0 ? "high" : "low"}
          />
        </div>
      ))}
    </div>
  );
}

export function HeroCarouselDots({
  className = "",
  tone = "onImage",
}: {
  className?: string;
  tone?: "onImage" | "light";
}) {
  const ctx = useHeroCarousel();
  if (!ctx || ctx.slideCount <= 1) return null;

  const { index, setIndex, slideCount } = ctx;
  const activeDot = tone === "onImage" ? "w-6 bg-white" : "w-6 bg-blue-600";
  const idleDot = tone === "onImage" ? "w-1.5 bg-white/55 hover:bg-white/80" : "w-1.5 bg-slate-300 hover:bg-slate-400";

  return (
    <div
      className={`flex flex-wrap items-center justify-center gap-1 ${className}`}
      role="group"
      aria-label="Banner slides — choose a slide"
    >
      {Array.from({ length: slideCount }, (_, i) => (
        <button
          key={i}
          type="button"
          aria-current={i === index ? "true" : undefined}
          aria-label={`Show slide ${i + 1} of ${slideCount}`}
          onClick={() => setIndex(i)}
          className="inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
        >
          <span
            className={`pointer-events-none block h-1.5 rounded-full transition-[width,background-color] duration-300 ${
              i === index ? activeDot : idleDot
            }`}
            aria-hidden
          />
        </button>
      ))}
    </div>
  );
}
