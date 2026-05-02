import Link from "next/link";
import { updateProductFeatured } from "@/app/admin/actions";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

type ProductFeaturedRow = {
  id: string;
  name: string;
  slug: string;
  is_featured: boolean;
  featured_sort_order: number;
};

export default async function AdminFeaturedProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const error = typeof sp.error === "string" ? sp.error : undefined;

  const supabase = createSupabaseAdminClient();
  const { data: rows, error: loadError } = await supabase
    .from("products")
    .select("id,name,slug,is_featured,featured_sort_order")
    .order("is_featured", { ascending: false })
    .order("featured_sort_order", { ascending: true })
    .order("name", { ascending: true });

  const products = (rows as ProductFeaturedRow[] | null) ?? [];

  return (
    <main className="py-6 lg:py-0">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Featured picks</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Mark hot sellers for the home page strip. Shoppers see four products at once on large screens; Prev / Next shifts the window by{" "}
              <span className="font-semibold">one SKU</span>. Sort order is smallest-first.
            </p>
          </div>
          <Link href="/admin" className="text-sm font-semibold text-blue-700 hover:text-blue-800">
            ← Dashboard
          </Link>
        </div>

        {loadError ? (
          <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-950">
            Could not load products ({loadError.message}). Run the <span className="font-mono text-xs">products</span> featured columns and{" "}
            <span className="font-mono text-xs">product_listings</span> view section from <span className="font-mono text-xs">supabase/schema.sql</span>, then refresh.
          </div>
        ) : null}

        {error ? (
          <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">{error}</div>
        ) : null}

        {products.length === 0 ? (
          <p className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-600">
            No products in the catalog yet.{" "}
            <Link href="/admin/products/new" className="font-semibold text-blue-700 hover:text-blue-800">
              Add a product
            </Link>{" "}
            in the admin or run <span className="font-mono text-xs">seed.sql</span>.
          </p>
        ) : (
          <div className="mt-8 space-y-4">
            {products.map((p) => (
              <div key={p.id} className="rounded-3xl border border-slate-200 bg-slate-50/80 p-4 sm:p-5">
                <form action={updateProductFeatured} className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                  <input type="hidden" name="id" value={p.id} />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Product</div>
                    <div className="mt-1 truncate text-base font-semibold text-slate-900">{p.name}</div>
                    <div className="mt-0.5 font-mono text-xs text-slate-500">{p.slug}</div>
                  </div>
                  <div className="flex flex-wrap items-end gap-4">
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Featured sort</label>
                      <input
                        name="featured_sort_order"
                        type="number"
                        defaultValue={p.featured_sort_order}
                        className="mt-2 h-11 w-24 rounded-2xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
                      />
                    </div>
                    <label className="flex cursor-pointer items-center gap-2 pb-2.5 text-sm font-semibold text-slate-800">
                      <input type="checkbox" name="is_featured" defaultChecked={p.is_featured} className="h-4 w-4 rounded border-slate-300" />
                      Featured on home
                    </label>
                    <button
                      type="submit"
                      className="inline-flex h-11 items-center justify-center rounded-full bg-blue-600 px-6 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
                    >
                      Save
                    </button>
                  </div>
                </form>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
