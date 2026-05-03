"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Category } from "@/lib/store-types";
import { getCategoryThumb } from "@/lib/category-thumbs";
import { SafeRemoteImage } from "@/components/SafeRemoteImage";

function pickCategoryVisual(c: Category) {
  const t = c.thumbnail_url?.trim() ?? "";
  if (t.startsWith("https://") || (t.startsWith("/") && t.length > 1)) {
    return { url: t, alt: `${c.name} category` };
  }
  const fb = getCategoryThumb(c.slug);
  return { url: fb.url, alt: fb.alt };
}

export function BrowseCategoriesGrid({
  categories,
}: {
  categories: Category[];
}) {
  const [narrow, setNarrow] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    const sync = () => setNarrow(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const desktopCap = 10;
  const cap = narrow ? 5 : desktopCap;
  const canExpand = categories.length > cap;

  const visible = useMemo(() => {
    if (expanded || !canExpand) return categories;
    return categories.slice(0, cap);
  }, [categories, expanded, canExpand, cap]);

  if (!categories.length) {
    return (
      <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-600">
        No categories yet. Add them in{" "}
        <span className="font-semibold text-blue-800">Admin → Categories</span>.
      </div>
    );
  }

  return (
    <div className="mt-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {visible.map((c) => {
          const vis = pickCategoryVisual(c);
          return (
            <Link
              key={c.id}
              href={`/products?category=${encodeURIComponent(c.slug)}`}
              className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md motion-reduce:hover:translate-y-0"
            >
              <div className="relative aspect-[16/10] w-full bg-slate-100">
                <div
                  aria-hidden
                  className="absolute inset-0 scale-110 bg-cover bg-center opacity-30 blur-[2px]"
                  style={{ backgroundImage: `url(${vis.url})` }}
                />
                <SafeRemoteImage
                  src={vis.url}
                  alt={vis.alt}
                  fill
                  className="z-10 object-cover transition-transform duration-200 ease-smooth-out motion-reduce:transition-none group-hover:scale-[1.03] motion-reduce:group-hover:scale-100"
                  sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 20vw"
                />
              </div>
              <div className="p-4">
                <div className="truncate text-sm font-semibold text-slate-900 group-hover:text-blue-800">
                  {c.name}
                </div>
                <div className="mt-1 text-xs font-medium text-slate-500">
                  Explore →
                </div>
              </div>
            </Link>
          );
        })}
      </div>
      {canExpand && !expanded ? (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="mt-6 w-full rounded-2xl border border-slate-200 bg-white py-3 text-sm font-semibold text-blue-800 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 sm:w-auto sm:px-8"
        >
          See all {categories.length} categories
        </button>
      ) : null}
      {canExpand && expanded ? (
        <button
          type="button"
          onClick={() => setExpanded(false)}
          className="mt-4 text-sm font-semibold text-slate-600 underline-offset-4 hover:text-slate-900 hover:underline"
        >
          Show fewer categories
        </button>
      ) : null}
    </div>
  );
}
