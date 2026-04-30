"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ProductCardMedia } from "@/components/ProductCardMedia";
import { AddToCartButton } from "@/components/AddToCartButton";
import { AddToWishlistButton } from "@/components/AddToWishlistButton";
import { formatPKR } from "@/lib/money";
import type { ProductListing } from "@/lib/store-types";

export function FeaturedProductsCarousel({ products }: { products: ProductListing[] }) {
  const n = products.length;
  const [perView, setPerView] = useState(3);
  const [active, setActive] = useState(0);
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);

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

  // Keep scroller aligned when active changes (smooth).
  useEffect(() => {
    const el = itemRefs.current[active];
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
  }, [active]);

  const showNav = n > 4;

  const cardClass =
    "group flex h-full min-h-0 min-w-0 flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white/95 shadow-sm ring-1 ring-white/60 backdrop-blur-sm transition duration-200 ease-smooth-out motion-reduce:transition-none hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md motion-reduce:hover:translate-y-0";

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
            <article
              key={p.id}
              className={`${cardClass} snap-start`}
              style={{
                flex: `0 0 calc((100% - ${(perView - 1) * 1.5}rem) / ${perView})`,
                minWidth: perView >= 3 ? "18rem" : perView === 2 ? "16rem" : "100%",
              }}
              onMouseEnter={() => setActive(i)}
            >
              <Link
                href={`/product/${p.slug}`}
                ref={(el) => {
                  itemRefs.current[i] = el;
                }}
                onFocus={() => setActive(i)}
                className="block"
              >
                <ProductCardMedia imageUrl={p.image_url} alt={p.name} aspectClassName="aspect-[4/3] sm:aspect-[5/3]" sizes={imgSizes} />
              </Link>
              <div className="flex flex-1 flex-col p-4">
                <Link
                  href={`/product/${p.slug}`}
                  onFocus={() => setActive(i)}
                  className="min-h-[2.6rem] text-sm font-semibold leading-snug tracking-tight text-slate-900 line-clamp-2 sm:text-[15px] hover:text-blue-800 hover:underline"
                >
                  {p.name}
                </Link>
                <p className="mt-2 min-h-[2.5rem] text-sm leading-relaxed text-slate-600 line-clamp-2">{p.description}</p>
                <div className="mt-auto space-y-3 border-t border-slate-100 pt-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap gap-2 text-[11px] font-semibold text-slate-500">
                      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-slate-700 ring-1 ring-slate-200/80">COD</span>
                      <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-blue-800 ring-1 ring-blue-100">Phone confirmed</span>
                    </div>
                    <div className="shrink-0 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold tabular-nums text-blue-800 ring-1 ring-blue-100/80">
                      {formatPKR(p.min_price_pkr)}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <AddToWishlistButton
                        variant={
                          p.default_variant_id && p.default_variant_sku && p.default_variant_title && typeof p.default_variant_price_pkr === "number"
                            ? {
                                variantId: p.default_variant_id,
                                productSlug: p.slug,
                                productName: p.name,
                                variantTitle: p.default_variant_title,
                                sku: p.default_variant_sku,
                                unitPricePkr: p.default_variant_price_pkr,
                                imageUrl: p.image_url,
                              }
                            : null
                        }
                        className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-800"
                      />
                      <AddToCartButton
                        variant={
                          p.default_variant_id && p.default_variant_sku && p.default_variant_title && typeof p.default_variant_price_pkr === "number"
                            ? {
                                id: p.default_variant_id,
                                sku: p.default_variant_sku,
                                title: p.default_variant_title,
                                price_pkr: p.default_variant_price_pkr,
                                product_slug: p.slug,
                                product_name: p.name,
                                image_url: p.image_url,
                              }
                            : null
                        }
                        className="inline-flex h-10 items-center justify-center rounded-full bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-60"
                      />
                    </div>
                    <Link href="/cart" className="text-sm font-semibold text-blue-700 hover:text-blue-800">
                      Cart →
                    </Link>
                  </div>
                </div>
              </div>
            </article>
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
