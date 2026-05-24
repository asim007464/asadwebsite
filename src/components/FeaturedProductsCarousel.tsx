"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ProductGridCard } from "@/components/ProductGridCard";
import type { ProductListing } from "@/lib/store-types";

export function FeaturedProductsCarousel({ products }: { products: ProductListing[] }) {
  const n = products.length;
  const [perView, setPerView] = useState(3);
  const [active, setActive] = useState(0);
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  const stepPrev = useCallback(() => {
    setActive((i) => (i - 1 + n) % n);
  }, [n]);

  const stepNext = useCallback(() => {
    setActive((i) => (i + 1) % n);
  }, [n]);

  if (n === 0) return null;

  useEffect(() => {
    const xxl = window.matchMedia("(min-width: 1536px)");
    const lg = window.matchMedia("(min-width: 1024px)");
    const sm = window.matchMedia("(min-width: 640px)");
    // Keep cards roomy: 4-up only on very wide screens.
    const sync = () => setPerView(xxl.matches ? 4 : lg.matches ? 3 : sm.matches ? 2 : 1);
    sync();
    xxl.addEventListener("change", sync);
    lg.addEventListener("change", sync);
    sm.addEventListener("change", sync);
    return () => {
      xxl.removeEventListener("change", sync);
      lg.removeEventListener("change", sync);
      sm.removeEventListener("change", sync);
    };
  }, []);

  // Align carousel horizontally only — scrollIntoView also moves the document vertically.
  useEffect(() => {
    const scroller = scrollerRef.current;
    const el = itemRefs.current[active];
    if (!scroller || !el) return;
    const targetLeft = scroller.scrollLeft + (el.getBoundingClientRect().left - scroller.getBoundingClientRect().left);
    scroller.scrollTo({ left: targetLeft, behavior: "smooth" });
  }, [active]);

  const showNav = n > 4;

  const imgSizes = "(max-width:640px) 100vw, (max-width:1024px) 50vw, (max-width:1536px) 33vw, 25vw";

  const dotCount = useMemo(() => Math.min(n, 8), [n]);

  return (
    <div className="relative px-0 sm:px-12 lg:px-14">
      {showNav ? (
        <>
          <button
            type="button"
            onClick={stepPrev}
            aria-label="Show previous featured products"
            className="absolute left-0 top-[38%] z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-md transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-800 sm:flex"
          >
            <span aria-hidden className="text-xl leading-none">
              ‹
            </span>
          </button>
          <button
            type="button"
            onClick={stepNext}
            aria-label="Show next featured products"
            className="absolute right-0 top-[38%] z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-md transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-800 sm:flex"
          >
            <span aria-hidden className="text-xl leading-none">
              ›
            </span>
          </button>
          <div className="mb-5 flex justify-center gap-3 sm:hidden">
            <button
              type="button"
              onClick={stepPrev}
              aria-label="Previous featured products"
              className="inline-flex h-11 min-w-[6rem] items-center justify-center rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm hover:border-blue-200 hover:bg-blue-50"
            >
              ‹ Prev
            </button>
            <button
              type="button"
              onClick={stepNext}
              aria-label="Next featured products"
              className="inline-flex h-11 min-w-[6rem] items-center justify-center rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm hover:border-blue-200 hover:bg-blue-50"
            >
              Next ›
            </button>
          </div>
        </>
      ) : null}

      <div className="mx-auto" aria-live="polite" aria-label="Featured products carousel">
        <div
          ref={scrollerRef}
          className="flex items-stretch gap-6 overflow-x-auto scroll-smooth pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [scroll-snap-type:x_mandatory]"
          aria-label="Featured products"
        >
          {products.map((p, i) => (
            <div
              key={p.id}
              ref={(el) => {
                itemRefs.current[i] = el;
              }}
              className="snap-start"
              style={{
                flex: `0 0 calc((100% - ${(perView - 1) * 1.5}rem) / ${perView})`,
                minWidth: perView >= 3 ? "11rem" : perView === 2 ? "10rem" : "100%",
              }}
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
            >
              <ProductGridCard product={p} sizes={imgSizes} />
            </div>
          ))}
        </div>

        {showNav ? (
          <div className="mt-6 flex items-center justify-center gap-2" role="tablist" aria-label="Featured product positions">
            {Array.from({ length: dotCount }, (_, i) => {
              const isActive = i === Math.min(active, dotCount - 1);
              return (
                <button
                  key={i}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-label={`Go to item ${i + 1}`}
                  onClick={() => setActive(i)}
                  className={`h-2 rounded-full transition-[width,background-color] duration-300 ${
                    isActive ? "w-8 bg-blue-600" : "w-2 bg-slate-300 hover:bg-slate-400"
                  }`}
                />
              );
            })}
          </div>
        ) : null}
      </div>
    </div>
  );
}
