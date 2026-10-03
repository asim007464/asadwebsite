import Link from "next/link";
import { BulkProductUpload } from "@/components/admin/BulkProductUpload";
import { ConfirmDeleteProduct } from "@/components/admin/ConfirmDeleteProduct";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

type ProductRow = {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
  category_id: string | null;
  brand_id: string | null;
  created_at: string;
};

type SortKey = "name" | "newest" | "oldest" | "category";

function parseSort(raw: string | undefined): SortKey {
  if (raw === "newest" || raw === "oldest" || raw === "category" || raw === "name") return raw;
  return "newest";
}

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const error = typeof sp.error === "string" ? decodeURIComponent(sp.error) : undefined;
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const categoryFilter = typeof sp.category === "string" ? sp.category.trim() : "";
  const sort = parseSort(typeof sp.sort === "string" ? sp.sort : undefined);

  const supabase = createSupabaseAdminClient();

  const [{ data: products }, { data: categories }, { data: brands }, { data: variantRows }, { data: productCatRows }] =
    await Promise.all([
      supabase
        .from("products")
        .select("id,name,slug,is_active,category_id,brand_id,created_at")
        .order("created_at", { ascending: false }),
      supabase.from("categories").select("id,name").order("name"),
      supabase.from("brands").select("id,name").order("name"),
      supabase.from("product_variants").select("product_id"),
      supabase.from("product_categories").select("product_id,category_id,sort_order"),
    ]);

  const allRows = ((products ?? []) as ProductRow[]) ?? [];
  const catMap = new Map((categories ?? []).map((c: { id: string; name: string }) => [c.id, c.name]));
  const brandMap = new Map((brands ?? []).map((b: { id: string; name: string }) => [b.id, b.name]));
  const variantCount = new Map<string, number>();
  for (const v of (variantRows ?? []) as { product_id: string }[]) {
    variantCount.set(v.product_id, (variantCount.get(v.product_id) ?? 0) + 1);
  }

  const categoriesByProduct = new Map<string, string[]>();
  for (const link of (productCatRows ?? []) as { product_id: string; category_id: string; sort_order: number }[]) {
    const list = categoriesByProduct.get(link.product_id) ?? [];
    list.push(link.category_id);
    categoriesByProduct.set(link.product_id, list);
  }
  // Fallback to primary category_id when junction rows missing (pre-migration)
  for (const p of allRows) {
    if (!categoriesByProduct.has(p.id) && p.category_id) {
      categoriesByProduct.set(p.id, [p.category_id]);
    }
  }

  const qLower = q.toLowerCase();
  let rows = allRows.filter((p) => {
    if (qLower) {
      const hay = `${p.name} ${p.slug}`.toLowerCase();
      if (!hay.includes(qLower)) return false;
    }
    if (categoryFilter) {
      const ids = categoriesByProduct.get(p.id) ?? [];
      if (!ids.includes(categoryFilter)) return false;
    }
    return true;
  });

  rows = [...rows].sort((a, b) => {
    if (sort === "newest") {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
    if (sort === "oldest") {
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    }
    if (sort === "category") {
      const aName = (categoriesByProduct.get(a.id) ?? [])
        .map((id) => catMap.get(id) ?? "")
        .filter(Boolean)
        .sort()[0] ?? "zzz";
      const bName = (categoriesByProduct.get(b.id) ?? [])
        .map((id) => catMap.get(id) ?? "")
        .filter(Boolean)
        .sort()[0] ?? "zzz";
      const byCat = aName.localeCompare(bName);
      return byCat !== 0 ? byCat : a.name.localeCompare(b.name);
    }
    return a.name.localeCompare(b.name);
  });

  const catList = (categories ?? []) as { id: string; name: string }[];
  const hasFilters = Boolean(q || categoryFilter || sort !== "newest");

  return (
    <main className="py-6 lg:py-0">
      <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm ring-1 ring-slate-200/60">
        <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 via-white to-blue-50/35 px-5 py-5 sm:px-8 sm:py-7">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between md:gap-8">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-600/90">Catalog</p>
              <h1 className="mt-1 text-balance text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Products</h1>
              <p className="mt-3 max-w-2xl text-pretty text-sm leading-relaxed text-slate-600 sm:text-[15px]">
                Add catalog items with at least one SKU, price, and stock. Listings and product pages use the first image and
                cheapest active variant by default. Products can belong to more than one category.
              </p>
            </div>
            <div className="w-full shrink-0 sm:max-w-md md:max-w-none md:w-auto md:min-w-[18rem]">
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                <Link
                  href="/admin/products/new"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(37,99,235,0.28)] transition hover:bg-blue-700 hover:shadow-[0_10px_24px_rgba(37,99,235,0.34)] active:scale-[0.98] sm:min-h-12"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 opacity-95" fill="none" stroke="currentColor" strokeWidth="2.25" aria-hidden>
                    <path strokeLinecap="round" d="M12 5v14M5 12h14" />
                  </svg>
                  Add product
                </Link>
                <Link
                  href="/admin/products/bulk"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-900 active:scale-[0.98] sm:min-h-12"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6.5h16M4 12h16M4 17.5h10" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 15v4m0 0l-1.5-1.5M18 19l1.5-1.5" />
                  </svg>
                  CSV bulk
                </Link>
              </div>
              <div className="mt-2.5 flex flex-wrap items-center gap-2">
                <BulkProductUpload
                  categoryNames={(categories ?? []).map((c: { name: string }) => c.name)}
                />
              </div>
              <div className="mt-2.5 grid grid-cols-2 gap-2.5">
                <Link
                  href="/admin/products/seo"
                  className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl border border-slate-200/90 bg-slate-50/80 px-3 text-xs font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-white hover:text-blue-800 sm:min-h-11 sm:text-[13px]"
                >
                  SEO snippets
                  <span aria-hidden className="text-blue-600">→</span>
                </Link>
                <Link
                  href="/admin"
                  className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl border border-slate-200/90 bg-slate-50/80 px-3 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-white hover:text-slate-900 sm:min-h-11 sm:text-[13px]"
                >
                  <span aria-hidden>←</span>
                  Dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-8 sm:pt-7">
          {error ? (
            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">
              {error}
            </div>
          ) : null}

          <form
            method="get"
            className="mb-6 grid gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 p-4 sm:grid-cols-12 sm:items-end"
          >
            <div className="sm:col-span-5">
              <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Search</label>
              <div className="relative mt-1.5">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden>
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="7" />
                    <path d="M20 20 16.5 16.5" strokeLinecap="round" />
                  </svg>
                </span>
                <input
                  name="q"
                  defaultValue={q}
                  placeholder="Search by name or slug…"
                  className="h-11 w-full rounded-2xl border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
                />
              </div>
            </div>
            <div className="sm:col-span-3">
              <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Filter category</label>
              <select
                name="category"
                defaultValue={categoryFilter}
                className="mt-1.5 h-11 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
              >
                <option value="">All categories</option>
                {catList.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Sort by</label>
              <select
                name="sort"
                defaultValue={sort}
                className="mt-1.5 h-11 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
              >
                <option value="newest">New to old</option>
                <option value="oldest">Old to new</option>
                <option value="category">Category</option>
                <option value="name">Name A–Z</option>
              </select>
            </div>
            <div className="flex gap-2 sm:col-span-2">
              <button
                type="submit"
                className="inline-flex h-11 flex-1 items-center justify-center rounded-full bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
              >
                Apply
              </button>
              {hasFilters ? (
                <Link
                  href="/admin/products"
                  className="inline-flex h-11 items-center justify-center rounded-full border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Clear
                </Link>
              ) : null}
            </div>
          </form>

          {allRows.length === 0 ? (
            <p className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-600">
              No products yet.{" "}
              <Link href="/admin/products/new" className="font-semibold text-blue-700 hover:text-blue-800">
                Create your first product
              </Link>
              .
            </p>
          ) : rows.length === 0 ? (
            <p className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-600">
              No products match your search/filters.{" "}
              <Link href="/admin/products" className="font-semibold text-blue-700 hover:text-blue-800">
                Clear filters
              </Link>
            </p>
          ) : (
            <>
              <p className="mb-3 text-xs font-semibold text-slate-500">
                Showing {rows.length} of {allRows.length} product{allRows.length === 1 ? "" : "s"}
              </p>
              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="min-w-[52rem] w-full text-left text-sm">
                  <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Product</th>
                      <th className="px-4 py-3">Categories</th>
                      <th className="px-4 py-3">Brand</th>
                      <th className="px-4 py-3">Variants</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {rows.map((p) => {
                      const catNames = (categoriesByProduct.get(p.id) ?? [])
                        .map((cid) => catMap.get(cid))
                        .filter(Boolean) as string[];
                      return (
                        <tr key={p.id} className="bg-white">
                          <td className="px-4 py-3">
                            <div className="font-semibold text-slate-900">{p.name}</div>
                            <div className="mt-0.5 font-mono text-xs text-slate-500">{p.slug}</div>
                          </td>
                          <td className="px-4 py-3 text-slate-600">
                            {catNames.length ? (
                              <div className="flex flex-wrap gap-1">
                                {catNames.map((name) => (
                                  <span
                                    key={name}
                                    className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700"
                                  >
                                    {name}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              "—"
                            )}
                          </td>
                          <td className="px-4 py-3 text-slate-600">
                            {p.brand_id ? (brandMap.get(p.brand_id) ?? "—") : "—"}
                          </td>
                          <td className="px-4 py-3 text-slate-700">{variantCount.get(p.id) ?? 0}</td>
                          <td className="px-4 py-3">
                            {p.is_active ? (
                              <span className="inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-900">
                                Live
                              </span>
                            ) : (
                              <span className="inline-flex rounded-full bg-slate-200 px-2 py-0.5 text-[11px] font-bold text-slate-700">
                                Hidden
                              </span>
                            )}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-right">
                            <div className="inline-flex flex-nowrap items-center justify-end gap-1.5">
                              <Link
                                href={`/admin/products/${p.id}/edit`}
                                className="inline-flex h-8 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-800 hover:border-blue-300 hover:bg-blue-50"
                              >
                                Edit
                              </Link>
                              <Link
                                href={`/product/${p.slug}`}
                                className="inline-flex h-8 shrink-0 items-center justify-center rounded-full border border-slate-200 px-3 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                              >
                                View
                              </Link>
                              <ConfirmDeleteProduct id={p.id} />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
