"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { useEffect, useMemo, useState } from "react";
import { CategoryGlyph } from "@/components/category-glyphs";
import { SafeRemoteImage } from "@/components/SafeRemoteImage";
import type { Category } from "@/lib/store-types";

export type CategorySliderItem = Pick<
  Category,
  "id" | "name" | "slug" | "thumbnail_url" | "hero_icon_hint"
>;

function CategoryIconBox({ c }: { c: CategorySliderItem }) {
  const thumb = (c.thumbnail_url ?? "").trim();
  const useImg =
    thumb.startsWith("https://") || (thumb.startsWith("/") && thumb.length > 1);
  if (useImg) {
    return (
      <div className="relative mb-3 aspect-[16/11] w-full overflow-hidden rounded-xl ring-1 ring-inset ring-blue-100/90">
        <SafeRemoteImage
          src={thumb}
          alt=""
          fill
          className="object-cover"
          sizes="144px"
        />
      </div>
    );
  }
  return (
    <div className="mb-3 flex h-14 items-center justify-center rounded-xl bg-blue-50 text-blue-600 ring-1 ring-inset ring-blue-100/90 transition-colors group-hover:bg-blue-100/80">
      <CategoryGlyph slug={(c.hero_icon_hint || c.slug).trim()} />
    </div>
  );
}

export function CategorySlider({
  categories,
}: {
  categories: CategorySliderItem[];
}) {
  const itemsAll = categories ?? [];
  const [narrow, setNarrow] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    const sync = () => setNarrow(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const mobileCap = 5;

  const items = useMemo(() => {
    if (!narrow || expanded) return itemsAll;
    if (itemsAll.length <= mobileCap) return itemsAll;
    return itemsAll.slice(0, mobileCap);
  }, [itemsAll, narrow, expanded]);

  const canExpandMobile = narrow && itemsAll.length > mobileCap;

  if (!itemsAll.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-sm text-slate-600">
        No categories yet. Run{" "}
        <code className="rounded bg-slate-100 px-1 py-0.5 text-xs">
          supabase/seed.sql
        </code>
        , or add categories in{" "}
        <Link
          href="/admin/categories"
          className="font-semibold text-blue-700 hover:text-blue-800"
        >
          Admin → Categories
        </Link>
        .
      </div>
    );
  }

  const durationSec = Math.min(Math.max(items.length * 4, 22), 72);

  const cardClass =
    "group flex min-h-[11rem] min-w-[10.5rem] max-w-[11rem] shrink-0 flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition duration-200 ease-smooth-out motion-reduce:transition-none hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md motion-reduce:hover:translate-y-0 sm:min-h-[11.5rem] sm:min-w-[12rem] sm:max-w-[13rem] sm:p-5";

  return (
    <div className="relative space-y-4">
      <div className="relative">
        <div
          className="pointer-events-none absolute inset-y-0 left-0 z-[1] w-10 bg-gradient-to-r from-slate-50 to-transparent sm:w-14"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-y-0 right-0 z-[1] w-10 bg-gradient-to-l from-slate-50 to-transparent sm:w-14"
          aria-hidden
        />

        <div className="hidden motion-reduce:block overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex w-max gap-3 pt-0.5">
            {items.map((c) => (
              <Link
                key={c.id}
                href={`/products?category=${encodeURIComponent(c.slug)}`}
                className={cardClass}
              >
                <div>
                  <CategoryIconBox c={c} />
                  <div className="text-sm font-semibold leading-snug text-slate-900 group-hover:text-blue-800">
                    {c.name}
                  </div>
                </div>
                <div className="mt-3 text-xs font-medium text-blue-600/90">
                  Explore products →
                </div>
              </Link>
            ))}
          </div>
        </div>

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
                  <CategoryIconBox c={c} />
                  <div className="text-sm font-semibold leading-snug text-slate-900 group-hover:text-blue-800">
                    {c.name}
                  </div>
                </div>
                <div className="mt-3 text-xs font-medium text-blue-600/90">
                  Explore products →
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {canExpandMobile && !expanded ? (
        <div className="flex justify-center sm:justify-start">
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="rounded-full border border-blue-200 bg-blue-50 px-5 py-2 text-xs font-semibold text-blue-800 shadow-sm hover:bg-blue-100"
          >
            See all {itemsAll.length} categories
          </button>
        </div>
      ) : null}

      {canExpandMobile && expanded ? (
        <div className="flex justify-center sm:justify-start">
          <button
            type="button"
            onClick={() => setExpanded(false)}
            className="text-xs font-semibold text-slate-600 underline underline-offset-2 hover:text-slate-900"
          >
            Show top {mobileCap} only
          </button>
        </div>
      ) : null}
    </div>
  );
}
