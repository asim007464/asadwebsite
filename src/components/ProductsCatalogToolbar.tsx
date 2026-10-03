import Link from "next/link";

type ToolbarProps = {
  category?: string;
  q?: string;
  min?: number;
  max?: number;
  sort: string;
  featured: boolean;
};

const PRICE_BANDS: { id: string; label: string; min?: number; max?: number }[] = [
  { id: "any", label: "Any price" },
  { id: "under5k", label: "Under ₨5,000", max: 5_000 },
  { id: "5-15k", label: "₨5k – ₨15k", min: 5_000, max: 15_000 },
  { id: "15-35k", label: "₨15k – ₨35k", min: 15_000, max: 35_000 },
  { id: "35k-plus", label: "₨35k+", min: 35_000 },
];

export function buildProductsListingHref(state: ToolbarProps & { page?: number }) {
  const u = new URLSearchParams();
  if (state.category) u.set("category", state.category);
  if (state.q) u.set("q", state.q);
  if (typeof state.min === "number" && state.min > 0) u.set("min", String(state.min));
  if (typeof state.max === "number" && state.max > 0) u.set("max", String(state.max));
  if (state.sort && state.sort !== "name") u.set("sort", state.sort);
  if (state.featured) u.set("featured", "1");
  const page = state.page ?? 1;
  if (page > 1) u.set("page", String(page));
  const qs = u.toString();
  return qs ? `/products?${qs}` : "/products";
}

function effectiveMin(min?: number) {
  return typeof min === "number" && min > 0 ? min : undefined;
}

function effectiveMax(max?: number) {
  return typeof max === "number" && max > 0 ? max : undefined;
}

function bandIsActive(band: (typeof PRICE_BANDS)[number], min?: number, max?: number) {
  const m = effectiveMin(min);
  const x = effectiveMax(max);
  if (band.id === "any") return m === undefined && x === undefined;
  return m === effectiveMin(band.min) && x === effectiveMax(band.max);
}

const SORT_OPTIONS: { value: string; label: string }[] = [
  { value: "name", label: "A–Z" },
  { value: "price_asc", label: "Price ↑" },
  { value: "price_desc", label: "Price ↓" },
];

const chipBase =
  "shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-semibold shadow-sm outline-none ring-offset-2 transition duration-200 ease-out focus-visible:ring-2 focus-visible:ring-blue-500/40 sm:px-3.5 sm:py-2 sm:text-sm";

const chipInactive =
  "border-slate-200/90 bg-white text-slate-700 hover:border-blue-200/80 hover:bg-gradient-to-b hover:from-blue-50/90 hover:to-white hover:text-blue-900 hover:shadow-md active:scale-[0.98]";

const chipActive =
  "border-blue-600 bg-gradient-to-b from-blue-600 to-blue-700 text-white shadow-[0_4px_12px_-2px_rgba(37,99,235,0.4),inset_0_1px_0_0_rgba(255,255,255,0.12)] hover:from-blue-700 hover:to-blue-800";

const MOBILE_PRICE_LABELS: Record<string, string> = {
  any: "Any",
  under5k: "< ₨5k",
  "5-15k": "₨5–15k",
  "15-35k": "₨15–35k",
  "35k-plus": "₨35k+",
};

export function ProductsCatalogToolbar(props: ToolbarProps) {
  const { category, q, min, max, sort, featured } = props;

  const base = { category, q, min, max, featured };

  return (
    <div className="mt-4 rounded-xl border border-slate-200/85 bg-gradient-to-br from-slate-50/90 via-white to-white p-3 shadow-[0_4px_28px_-8px_rgba(15,23,42,0.12),0_2px_8px_-4px_rgba(15,23,42,0.06)] ring-1 ring-slate-900/[0.04] sm:mt-5 sm:rounded-2xl sm:p-5">
      <div className="flex flex-col gap-3 sm:gap-5 md:flex-row md:items-stretch md:justify-between md:gap-8">
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-1.5 sm:gap-2">
            <span className="text-[9px] font-semibold uppercase tracking-[0.14em] text-slate-400 sm:text-[10px] sm:tracking-[0.16em]">
              Price bands
            </span>
            <span className="hidden text-xs text-slate-400 sm:inline">·</span>
            <span className="hidden text-xs font-medium text-slate-500 sm:inline">Quick picks</span>
          </div>
          <div className="-mx-0.5 mt-2 flex gap-1.5 overflow-x-auto px-0.5 pb-1 pt-0.5 [-ms-overflow-style:none] [scrollbar-width:none] sm:mt-3 sm:gap-2 sm:pb-1.5 [&::-webkit-scrollbar]:hidden">
            {PRICE_BANDS.map((band) => {
              const active = bandIsActive(band, min, max);
              const href = buildProductsListingHref({
                category,
                q,
                sort,
                featured,
                min: band.min,
                max: band.max,
                page: 1,
              });
              const short = MOBILE_PRICE_LABELS[band.id] ?? band.label;
              return (
                <Link
                  key={band.id}
                  href={href}
                  className={`${chipBase} ${active ? chipActive : chipInactive}`}
                  title={band.label}
                >
                  <span className="sm:hidden">{short}</span>
                  <span className="hidden sm:inline">{band.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="flex w-full shrink-0 flex-col items-stretch border-t border-slate-200/80 pt-3 sm:pt-5 md:w-auto md:border-l md:border-t-0 md:pl-8 md:pt-0">
          <div className="flex flex-col items-stretch sm:items-end md:min-w-[14rem]">
            <span className="text-[9px] font-semibold uppercase tracking-[0.14em] text-slate-400 sm:text-[10px] sm:tracking-[0.16em]">
              Sort order
            </span>
            <div className="mt-2 flex flex-wrap gap-1.5 rounded-xl border border-slate-200/60 bg-slate-50/40 p-1.5 ring-1 ring-slate-900/[0.03] sm:mt-3 sm:justify-end sm:gap-2 sm:rounded-2xl sm:p-2">
              {SORT_OPTIONS.map((opt) => {
                const active = opt.value === "name" ? sort === "name" : sort === opt.value;
                const href = buildProductsListingHref({
                  ...base,
                  sort: opt.value,
                  page: 1,
                });
                return (
                  <Link
                    key={opt.value}
                    href={href}
                    className={`${chipBase} ${active ? chipActive : chipInactive}`}
                  >
                    {opt.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
