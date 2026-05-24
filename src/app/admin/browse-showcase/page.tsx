import Link from "next/link";
import {
  addHomeBrowseShowcaseProduct,
  removeHomeBrowseShowcaseProduct,
  updateHomeBrowseShowcase,
  updateHomeBrowseShowcaseProductSort,
} from "@/app/admin/actions";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { HomeBrowseShowcaseRow } from "@/lib/store-types";

export const dynamic = "force-dynamic";

type CuratedRow = { id: string; product_id: string; sort_order: number };

const EMPTY_SHOWCASE: HomeBrowseShowcaseRow = {
  id: 1,
  category_id: null,
  section_title: "",
  is_active: false,
};

export default async function AdminBrowseShowcasePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const error = typeof sp.error === "string" ? sp.error : undefined;

  const supabase = createSupabaseAdminClient();

  const [{ data: showcaseData, error: loadError }, { data: categories }, { data: curated }, { data: products }] =
    await Promise.all([
      supabase.from("home_browse_showcase").select("id,category_id,section_title,is_active").eq("id", 1).maybeSingle(),
      supabase.from("categories").select("id,name,slug").order("name"),
      supabase.from("home_browse_showcase_products").select("id,product_id,sort_order").order("sort_order"),
      supabase.from("products").select("id,name,slug,category_id,is_active").order("name"),
    ]);

  const showcase =
    loadError || !showcaseData
      ? EMPTY_SHOWCASE
      : ({
          id: 1,
          category_id: (showcaseData as HomeBrowseShowcaseRow).category_id,
          section_title: String((showcaseData as HomeBrowseShowcaseRow).section_title ?? ""),
          is_active: Boolean((showcaseData as HomeBrowseShowcaseRow).is_active),
        } satisfies HomeBrowseShowcaseRow);

  const categoryList = (categories as { id: string; name: string; slug: string }[] | null) ?? [];
  const rows = (curated as CuratedRow[] | null) ?? [];
  const allProducts =
    ((products ?? []) as { id: string; name: string; slug: string; category_id: string | null; is_active: boolean | null }[]).filter(
      (p) => p.is_active !== false,
    );

  const nameById = new Map(allProducts.map((p) => [p.id, p.name] as const));
  const already = new Set(rows.map((r) => r.product_id));
  const selectedCategoryId = showcase.category_id ?? "";

  const productsInCategory = selectedCategoryId
    ? allProducts.filter((p) => p.category_id === selectedCategoryId && !already.has(p.id))
    : [];

  return (
    <main className="py-6 lg:py-0">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Browse categories grid</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Control the homepage <span className="font-semibold">Browse categories</span> block (up to{" "}
              <span className="font-semibold">5 products across</span> on large screens). Pick one category, then choose
              which products from that category appear. If this is off or empty, shoppers see the default category tiles
              instead.
            </p>
          </div>
          <Link href="/admin" className="text-sm font-semibold text-blue-700 hover:text-blue-800">
            ← Dashboard
          </Link>
        </div>

        {loadError ? (
          <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-950">
            Could not load settings ({loadError.message}). Run the{" "}
            <span className="font-mono text-xs">home_browse_showcase</span> migration in Supabase, then refresh.
          </div>
        ) : null}

        {error === "pick-category" ? (
          <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">
            Choose a category before turning the curated grid on.
          </div>
        ) : null}
        {error === "wrong-category" ? (
          <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">
            That product does not belong to the selected category.
          </div>
        ) : null}
        {error === "need-products" ? (
          <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">
            Add at least one product when the curated grid is active.
          </div>
        ) : null}
        {error && !["pick-category", "wrong-category", "need-products"].includes(error) ? (
          <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">
            {error}
          </div>
        ) : null}

        <form action={updateHomeBrowseShowcase} className="mt-8 grid grid-cols-1 gap-5 border-t border-slate-100 pt-8 md:grid-cols-2 md:gap-6">
          <div className="md:col-span-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Category</label>
            <select
              name="category_id"
              defaultValue={selectedCategoryId}
              required
              className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
            >
              <option value="">Choose category…</option>
              {categoryList.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Section title (optional)</label>
            <input
              name="section_title"
              defaultValue={showcase.section_title}
              placeholder="Defaults to category name"
              className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
            />
          </div>

          <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 md:col-span-2">
            <input type="checkbox" name="is_active" defaultChecked={showcase.is_active} className="h-4 w-4 rounded border-slate-300" />
            Use curated product grid on homepage (needs category + at least one product below)
          </label>

          <div className="md:col-span-2">
            <button
              type="submit"
              className="inline-flex h-12 max-w-xs items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
            >
              Save category &amp; settings
            </button>
          </div>
        </form>

        <form
          action={addHomeBrowseShowcaseProduct}
          className="mt-8 grid grid-cols-1 gap-3 rounded-3xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-12"
        >
          <div className="sm:col-span-7">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Add product from category</label>
            <select
              name="product_id"
              required
              disabled={!selectedCategoryId}
              className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100 disabled:opacity-60"
            >
              <option value="">
                {!selectedCategoryId ? "Save a category first…" : productsInCategory.length ? "Choose product…" : "No more products in category"}
              </option>
              {productsInCategory.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.slug})
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
          <div className="flex items-end sm:col-span-2">
            <button
              type="submit"
              disabled={!selectedCategoryId}
              className="inline-flex h-12 w-full items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-60"
            >
              Add
            </button>
          </div>
        </form>

        <div className="mt-8 space-y-3">
          {!rows.length ? (
            <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-600">
              No products in this grid yet. Save a category above, then add products here.
            </p>
          ) : (
            rows.map((row) => (
              <div
                key={row.id}
                className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between"
              >
                <div className="min-w-0">
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Product</div>
                  <div className="mt-1 truncate text-base font-semibold text-slate-900">{nameById.get(row.product_id) ?? row.product_id}</div>
                </div>
                <form action={updateHomeBrowseShowcaseProductSort} className="flex flex-wrap items-end gap-3">
                  <input type="hidden" name="row_id" value={row.id} />
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
                <form action={removeHomeBrowseShowcaseProduct}>
                  <input type="hidden" name="row_id" value={row.id} />
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
      </div>
    </main>
  );
}
