"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Category } from "@/lib/store-types";
import { PRICE_FILTER_MAX_PKR } from "@/lib/money";
import { PriceRangeSlider } from "@/components/PriceRangeSlider";

const PRICE_STEP = 1_000;

function buildUrl(pathname: string, params: Record<string, string | undefined>) {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v && v.trim().length) sp.set(k, v);
  }
  const qs = sp.toString();
  return qs ? `${pathname}?${qs}` : pathname;
}

function roundPriceStep(n: number) {
  return Math.min(PRICE_FILTER_MAX_PKR, Math.max(0, Math.round(n / PRICE_STEP) * PRICE_STEP));
}

function parseUrlToRange(minStr: string, maxStr: string): { low: number; high: number } {
  let low = 0;
  let high = PRICE_FILTER_MAX_PKR;
  if (minStr && /^\d+$/.test(minStr)) {
    low = Math.min(PRICE_FILTER_MAX_PKR, Math.max(0, Number(minStr)));
  }
  if (maxStr && /^\d+$/.test(maxStr)) {
    high = Math.min(PRICE_FILTER_MAX_PKR, Math.max(0, Number(maxStr)));
  }
  if (high < low) {
    return { low: roundPriceStep(high), high: roundPriceStep(low) };
  }
  return { low: roundPriceStep(low), high: roundPriceStep(high) };
}

export function ProductsFilters({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const current = useMemo(() => {
    const q = sp.get("q") ?? "";
    const category = sp.get("category") ?? "";
    const min = sp.get("min") ?? "";
    const max = sp.get("max") ?? "";
    const sort = sp.get("sort") ?? "name";
    const featured = sp.get("featured") === "1" || sp.get("featured") === "true" ? "1" : "";
    return { q, category, min, max, sort, featured };
  }, [sp]);

  const [q, setQ] = useState(current.q);
  const [category, setCategory] = useState(current.category);
  const [{ low, high }, setRange] = useState(() => parseUrlToRange(current.min, current.max));

  useEffect(() => {
    setRange(parseUrlToRange(current.min, current.max));
  }, [current.min, current.max]);

  useEffect(() => {
    setQ(current.q);
    setCategory(current.category);
  }, [current.q, current.category]);

  const apply = () => {
    router.push(
      buildUrl(pathname, {
        q: q.trim() || undefined,
        category: category || undefined,
        min: low > 0 ? String(low) : undefined,
        max: high < PRICE_FILTER_MAX_PKR ? String(high) : undefined,
        sort: current.sort && current.sort !== "name" ? current.sort : undefined,
        featured: current.featured || undefined,
      }),
    );
  };

  const clear = () => {
    setQ("");
    setCategory("");
    setRange({ low: 0, high: PRICE_FILTER_MAX_PKR });
    router.push("/products");
  };

  const panel = (
    <div className="rounded-3xl border border-slate-200/85 bg-white p-6 shadow-[0_4px_28px_-6px_rgba(15,23,42,0.1),0_2px_8px_-4px_rgba(15,23,42,0.06)] ring-1 ring-slate-900/[0.035]">
      <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-5">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">Filters</div>
          <div className="mt-1.5 text-lg font-semibold tracking-tight text-slate-900">Refine results</div>
          <p className="mt-1 text-xs leading-relaxed text-slate-500">Narrow the catalog, then apply.</p>
        </div>
        <button
          type="button"
          onClick={clear}
          className="shrink-0 rounded-full border border-slate-200/90 bg-slate-50 px-3.5 py-1.5 text-xs font-semibold text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-white hover:text-slate-900"
        >
          Clear all
        </button>
      </div>

      <div className="mt-5 space-y-5">
        <div>
          <label className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">Search</label>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name or description…"
            className="mt-2 h-11 w-full rounded-2xl border border-slate-200/90 bg-slate-50/40 px-4 text-sm text-slate-900 outline-none ring-slate-900/[0.04] transition placeholder:text-slate-400 focus:border-blue-400/80 focus:bg-white focus:ring-4 focus:ring-blue-500/15"
          />
        </div>

        <div>
          <label className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="mt-2 h-11 w-full cursor-pointer rounded-2xl border border-slate-200/90 bg-slate-50/40 px-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-blue-400/80 focus:bg-white focus:ring-4 focus:ring-blue-500/15"
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <label className="block">
          <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">Price (PKR)</span>
          <PriceRangeSlider low={low} high={high} onChange={setRange} />
        </label>

        <button
          type="button"
          onClick={apply}
          className="inline-flex h-12 w-full items-center justify-center rounded-full bg-gradient-to-b from-blue-600 to-blue-700 text-sm font-semibold text-white shadow-[0_4px_14px_-2px_rgba(37,99,235,0.45),inset_0_1px_0_0_rgba(255,255,255,0.12)] transition hover:from-blue-700 hover:to-blue-800 hover:shadow-[0_6px_18px_-2px_rgba(37,99,235,0.5)] active:translate-y-px"
        >
          Apply filters
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/*
       * Sticky (not fixed) so the panel rides with the catalog and stops once the grid scrolls away,
       * instead of hovering over the merchandising strip and footer.
       */}
      <div className="hidden md:block md:sticky md:top-[calc(var(--site-header-height)+1rem)] md:z-10 md:h-fit md:w-full md:self-start md:pb-8">
        <div className="max-h-[calc(100dvh-var(--site-header-height)-2rem)] overflow-y-auto overscroll-contain pr-1 pb-1 [scrollbar-gutter:stable]">
          {panel}
        </div>
      </div>
      <div className="md:hidden">
        <details className="group rounded-3xl border border-slate-200/85 bg-white shadow-[0_4px_24px_-6px_rgba(15,23,42,0.08)] ring-1 ring-slate-900/[0.03]">
          <summary className="cursor-pointer list-none px-5 py-4 text-sm font-semibold text-slate-900 transition hover:bg-slate-50/80 marker:hidden [&::-webkit-details-marker]:hidden">
            <span className="flex items-center justify-between gap-2">
              <span className="tracking-tight">Filters</span>
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-500 group-open:bg-blue-50 group-open:text-blue-700">
                Tap to expand
              </span>
            </span>
          </summary>
          <div className="border-t border-slate-100 bg-slate-50/40 p-3">{panel}</div>
        </details>
      </div>
    </>
  );
}
