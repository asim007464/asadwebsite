import Link from "next/link";
import {
  addHomepageSectionProduct,
  removeHomepageSectionProduct,
  updateHomepageSectionSort,
} from "@/app/admin/actions";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

type Row = { id: string; section: string; sort_order: number; product_id: string };

export default async function AdminHomeSectionsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const error = typeof sp.error === "string" ? sp.error : undefined;
  const rawSection = typeof sp.section === "string" ? sp.section : undefined;
  const tab = rawSection === "gadgets" ? "gadgets" : "featured";

  const supabase = createSupabaseAdminClient();

  const [{ data: curated }, { data: products }] = await Promise.all([
    supabase.from("homepage_section_products").select("id,section,sort_order,product_id").eq("section", tab).order("sort_order"),
    supabase.from("products").select("id,name,slug,is_active").order("name"),
  ]);

  const rows = (curated as Row[] | null) ?? [];
  const activeProducts = ((products ?? []) as { id: string; name: string; slug: string; is_active: boolean | null }[]).filter(
    (p) => p.is_active !== false,
  );
  const nameById = new Map(activeProducts.map((p) => [p.id, p.name] as const));
  const already = new Set(rows.map((r) => r.product_id));

  return (
    <main className="py-6 lg:py-0">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Homepage product strips</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Featured and Gadget carousel rows pulled before legacy “featured picks” toggles — control order with sort numbers (smallest first). More than four SKUs triggers navigation dots + arrows on the storefront.
            </p>
          </div>
          <Link href="/admin" className="text-sm font-semibold text-blue-700 hover:text-blue-800">
            ← Dashboard
          </Link>
        </div>

        <div className="mt-6 inline-flex rounded-full border border-slate-200 bg-slate-50 p-1 text-sm font-semibold">
          <Link
            href="/admin/home-sections?section=featured"
            className={`rounded-full px-5 py-2 ${tab === "featured" ? "bg-white shadow-sm ring-1 ring-blue-100 text-blue-900" : "text-slate-600"}`}
          >
            Featured
          </Link>
          <Link
            href="/admin/home-sections?section=gadgets"
            className={`rounded-full px-5 py-2 ${tab === "gadgets" ? "bg-white shadow-sm ring-1 ring-blue-100 text-blue-900" : "text-slate-600"}`}
          >
            Gadgets
          </Link>
        </div>

        {error ? (
          <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">{error}</div>
        ) : null}

        <form action={addHomepageSectionProduct} className="mt-8 grid grid-cols-1 gap-3 rounded-3xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-12">
          <input type="hidden" name="section" value={tab} />
          <div className="sm:col-span-6">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Attach product</label>
            <select
              name="product_id"
              required
              className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
            >
              <option value="">Choose…</option>
              {activeProducts
                .filter((p) => !already.has(p.id))
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
            </select>
          </div>
          <div className="sm:col-span-3">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Sort order</label>
            <input
              name="sort_order"
              type="number"
              defaultValue={rows.length * 10}
              className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
            />
          </div>
          <div className="flex items-end sm:col-span-3">
            <button
              type="submit"
              className="inline-flex h-12 w-full items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
            >
              Add to strip
            </button>
          </div>
        </form>

        <div className="mt-8 space-y-3">
          {!rows.length ? (
            <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-600">
              No curated rows yet for <span className="font-semibold text-slate-900">{tab}</span> — storefront falls back to featured flags/catalog.
            </p>
          ) : (
            rows.map((row) => (
              <div
                key={row.id}
                className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between"
              >
                <div className="min-w-0">
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Product</div>
                  <div className="mt-1 truncate text-base font-semibold text-slate-900">{nameById.get(row.product_id) ?? "Unknown id"}</div>
                  <div className="mt-1 font-mono text-xs text-slate-500">{row.product_id}</div>
                </div>
                <form action={updateHomepageSectionSort} className="flex flex-wrap items-end gap-3">
                  <input type="hidden" name="row_id" value={row.id} />
                  <input type="hidden" name="section" value={tab} />
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Sort order</label>
                    <input
                      name="sort_order"
                      type="number"
                      defaultValue={row.sort_order}
                      className="mt-1 h-11 w-28 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
                    />
                  </div>
                  <button type="submit" className="h-11 rounded-full bg-blue-600 px-5 text-xs font-semibold text-white hover:bg-blue-700">
                    Update order
                  </button>
                </form>
                <form action={removeHomepageSectionProduct}>
                  <input type="hidden" name="row_id" value={row.id} />
                  <input type="hidden" name="section" value={tab} />
                  <button
                    type="submit"
                    className="rounded-full border border-red-200 px-5 py-2 text-xs font-semibold text-red-700 hover:bg-red-50"
                  >
                    Remove
                  </button>
                </form>
              </div>
            ))
          )}
        </div>

        <p className="mt-8 rounded-2xl bg-blue-50 px-4 py-3 text-sm text-blue-900 ring-1 ring-blue-100">
          Icon cues for category sliders: set <span className="font-semibold">hero_icon_hint</span> keywords (e.g. <code className="text-xs">fan</code>,
          <code className="text-xs">led</code>) and upload thumbnails in <Link className="font-semibold underline" href="/admin/categories">
            Categories
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
