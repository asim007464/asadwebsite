"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { CategoryGlyph } from "@/components/category-glyphs";
import type { Category } from "@/lib/store-types";

export type CategorySliderItem = Pick<Category, "id" | "name" | "slug">;

export function CategorySlider({ categories }: { categories: CategorySliderItem[] }) {
  const items = categories ?? [];

  if (!items.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-sm text-slate-600">
        No categories yet. Run <code className="rounded bg-slate-100 px-1 py-0.5 text-xs">supabase/seed.sql</code>, or add categories in{" "}
        <Link href="/admin/categories" className="font-semibold text-blue-700 hover:text-blue-800">
          Admin → Categories
        </Link>
        .
      </div>
    );
  }

  /** ~4s per card, bounded so motion stays readable */
  const durationSec = Math.min(Math.max(items.length * 4, 22), 72);

  const cardClass =
    "group flex min-h-[11rem] min-w-[10.5rem] max-w-[11rem] shrink-0 flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition duration-200 ease-smooth-out motion-reduce:transition-none hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md motion-reduce:hover:translate-y-0 sm:min-h-[11.5rem] sm:min-w-[12rem] sm:max-w-[13rem] sm:p-5";

  return (
    <div className="relative">
      <div
        className="pointer-events-none absolute inset-y-0 left-0 z-[1] w-10 bg-gradient-to-r from-slate-50 to-transparent sm:w-14"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 z-[1] w-10 bg-gradient-to-l from-slate-50 to-transparent sm:w-14"
        aria-hidden
      />

      {/* prefers-reduced-motion: horizontal scroll, single strip */}
      <div className="hidden motion-reduce:block overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex w-max gap-3 pt-0.5">
          {items.map((c) => (
            <Link key={c.id} href={`/products?category=${encodeURIComponent(c.slug)}`} className={cardClass}>
              <div>
                <div className="mb-3 flex h-14 items-center justify-center rounded-xl bg-blue-50 text-blue-600 ring-1 ring-inset ring-blue-100/90 transition-colors group-hover:bg-blue-100/80">
                  <CategoryGlyph slug={c.slug} />
                </div>
                <div className="text-sm font-semibold leading-snug text-slate-900 group-hover:text-blue-800">{c.name}</div>
              </div>
              <div className="mt-3 text-xs font-medium text-blue-600/90">Explore products →</div>
            </Link>
          ))}
        </div>
      </div>

      {/* Auto-scroll marquee (duplicate strip for seamless loop) */}
      <div className="motion-reduce:hidden overflow-hidden pb-1 pt-0.5">
        <div
          className="category-marquee-track flex w-max gap-3"
          style={{ "--marquee-duration": `${durationSec}s` } as CSSProperties}
        >
          {[...items, ...items].map((c, i) => (
            <Link
              key={`${c.id}-${i}`}
              href={`/products?category=${encodeURIComponent(c.slug)}`}
              className={cardClass}
            >
              <div>
                <div className="mb-3 flex h-14 items-center justify-center rounded-xl bg-blue-50 text-blue-600 ring-1 ring-inset ring-blue-100/90 transition-colors group-hover:bg-blue-100/80">
                  <CategoryGlyph slug={c.slug} />
                </div>
                <div className="text-sm font-semibold leading-snug text-slate-900 group-hover:text-blue-800">{c.name}</div>
              </div>
              <div className="mt-3 text-xs font-medium text-blue-600/90">Explore products →</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
