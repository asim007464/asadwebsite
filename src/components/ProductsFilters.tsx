"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Category } from "@/lib/store-types";

function buildUrl(pathname: string, params: Record<string, string | undefined>) {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v && v.trim().length) sp.set(k, v);
  }
  const qs = sp.toString();
  return qs ? `${pathname}?${qs}` : pathname;
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
    return { q, category, min, max, sort };
  }, [sp]);

  const [q, setQ] = useState(current.q);
  const [category, setCategory] = useState(current.category);
  const [min, setMin] = useState(current.min);
  const [max, setMax] = useState(current.max);
  const [sort, setSort] = useState(current.sort);

  const apply = () => {
    router.push(
      buildUrl(pathname, {
        q: q.trim() || undefined,
        category: category || undefined,
        min: min.trim() || undefined,
        max: max.trim() || undefined,
        sort: sort && sort !== "name" ? sort : undefined,
      }),
    );
  };

  const clear = () => {
    setQ("");
    setCategory("");
    setMin("");
    setMax("");
    setSort("name");
    router.push("/products");
  };

  const panel = (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Filters</div>
          <div className="mt-1 text-base font-semibold text-slate-900">Refine results</div>
        </div>
        <button
          type="button"
          onClick={clear}
          className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-800"
        >
          Clear
        </button>
      </div>

      <div className="mt-5 space-y-4">
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Search</label>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search products…"
            className="mt-2 h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
          />
        </div>

        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="mt-2 h-11 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-800 outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Price (PKR)</label>
          <div className="mt-2 grid grid-cols-2 gap-3">
            <input
              inputMode="numeric"
              value={min}
              onChange={(e) => setMin(e.target.value.replace(/[^\d]/g, ""))}
              placeholder="Min"
              className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
            />
            <input
              inputMode="numeric"
              value={max}
              onChange={(e) => setMax(e.target.value.replace(/[^\d]/g, ""))}
              placeholder="Max"
              className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Sort</label>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="mt-2 h-11 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-800 outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
          >
            <option value="name">Name (A–Z)</option>
            <option value="price_asc">Price (low → high)</option>
            <option value="price_desc">Price (high → low)</option>
          </select>
        </div>

        <button
          type="button"
          onClick={apply}
          className="mt-1 inline-flex h-11 w-full items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
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
        <details className="rounded-3xl border border-slate-200 bg-white shadow-sm">
          <summary className="cursor-pointer list-none px-5 py-4 text-sm font-semibold text-slate-900">
            Filters
            <span className="ml-2 text-xs font-semibold text-slate-500">(tap to open)</span>
          </summary>
          <div className="px-5 pb-5">{panel}</div>
        </details>
      </div>
    </>
  );
}

