"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ProductGridCard } from "@/components/ProductGridCard";
import type { ProductListing } from "@/lib/store-types";

export function FeaturedProductsCarousel({ products }: { products: ProductListing[] }) {
  const n = products.length;
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [perView, setPerView] = useState(3);
  const [page, setPage] = useState(0);
  const imgSizes = "(max-width:640px) 100vw, (max-width:1024px) 50vw, (max-width:1536px) 33vw, 25vw";

  useEffect(() => {
    const xxl = window.matchMedia("(min-width: 1536px)");
    const lg = window.matchMedia("(min-width: 1024px)");
    const sm = window.matchMedia("(min-width: 640px)");
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

  const maxPage = Math.max(0, n - perView);
  const canSlide = n > perView;
  const gapPx = 16;

  const scrollToPage = useCallback(
    (nextPage: number) => {
      const el = scrollerRef.current;
      if (!el) return;
      const last = Math.max(0, n - perView);
      const target = ((nextPage % (last + 1)) + (last + 1)) % (last + 1);
      const card = el.children[target] as HTMLElement | undefined;
      if (!card) return;
      el.scrollTo({ left: card.offsetLeft, behavior: "smooth" });
      setPage(target);
    },
    [n, perView],
  );

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        ticking = false;
        const first = el.children[0] as HTMLElement | undefined;
        const step = first ? first.offsetWidth + gapPx : el.clientWidth / perView;
        if (step <= 0) return;
        const idx = Math.round(el.scrollLeft / step);
        setPage(Math.max(0, Math.min(maxPage, idx)));
      });
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [maxPage, perView]);

  useEffect(() => {
    if (page > maxPage) scrollToPage(maxPage);
  }, [maxPage, page, scrollToPage]);

  if (n === 0) return null;

  return (
    <div className="relative sm:px-12 lg:px-14">
      {canSlide ? (
        <>
          <button
            type="button"
            onClick={() => scrollToPage(page - 1)}
            aria-label="Show previous products"
            className="absolute left-0 top-[42%] z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-lg font-semibold text-slate-700 shadow-md transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-800 sm:flex"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => scrollToPage(page + 1)}
            aria-label="Show next products"
            className="absolute right-0 top-[42%] z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-lg font-semibold text-slate-700 shadow-md transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-800 sm:flex"
          >
            ›
          </button>
          <div className="mb-4 flex justify-center gap-3 sm:hidden">
            <button
              type="button"
              onClick={() => scrollToPage(page - 1)}
              className="inline-flex h-10 min-w-[5.5rem] items-center justify-center rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm"
            >
              ‹ Prev
            </button>
            <button
              type="button"
              onClick={() => scrollToPage(page + 1)}
              className="inline-flex h-10 min-w-[5.5rem] items-center justify-center rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm"
            >
              Next ›
            </button>
          </div>
        </>
      ) : null}

      <div
        ref={scrollerRef}
        className="flex w-full min-w-0 snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        aria-roledescription="carousel"
        aria-label="Products"
      >
        {products.map((p) => (
          <div
            key={p.id}
            className="flex shrink-0 snap-start"
            style={{
              flexBasis: `calc((100% - ${gapPx * (perView - 1)}px) / ${perView})`,
              width: `calc((100% - ${gapPx * (perView - 1)}px) / ${perView})`,
            }}
          >
            <div className="flex h-full w-full flex-col">
              <ProductGridCard product={p} sizes={imgSizes} />
            </div>
          </div>
        ))}
      </div>

      {canSlide && maxPage > 0 ? (
        <div className="mt-5 flex flex-wrap items-center justify-center gap-1.5" role="tablist" aria-label="Product slides">
          {Array.from({ length: maxPage + 1 }, (_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === page}
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => scrollToPage(i)}
              className="inline-flex h-8 w-8 items-center justify-center"
            >
              <span className={`block h-2 rounded-full transition-all ${i === page ? "w-8 bg-blue-600" : "w-2 bg-slate-300 hover:bg-slate-400"}`} />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
