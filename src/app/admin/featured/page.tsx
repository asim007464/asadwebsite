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
            <p className="mt-2 max-w-2xl text-xs leading-relaxed text-slate-600 sm:text-sm">
              Tick <span className="font-semibold">On</span>, set <span className="font-semibold">order</span> (0, 1, 2… smallest first), save each row. Home carousel advances one product at a time. For curated strips see{" "}
              <Link href="/admin/home-sections" className="font-semibold text-blue-700 hover:text-blue-800">
                Homepage strips
              </Link>
              .
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/admin/products" className="text-sm font-semibold text-blue-700 hover:text-blue-800">
              All products
            </Link>
            <Link href="/admin" className="text-sm font-semibold text-slate-600 hover:text-slate-900">
              ← Dashboard
            </Link>
          </div>
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
          <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200">
            <div className="hidden grid-cols-[3.5rem_4rem_minmax(0,1fr)_5rem] gap-2 border-b border-slate-200 bg-slate-50 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-500 sm:grid sm:px-4">
              <span>On</span>
              <span>Sort</span>
              <span>Product</span>
              <span className="text-right"> </span>
            </div>
            <div className="divide-y divide-slate-100 bg-white">
              {products.map((p) => (
                <form
                  key={p.id}
                  action={updateProductFeatured}
                  className="grid grid-cols-1 gap-2 px-3 py-2.5 sm:grid-cols-[3.5rem_4rem_minmax(0,1fr)_5rem] sm:items-center sm:gap-2 sm:px-4 sm:py-1.5"
                >
                  <input type="hidden" name="id" value={p.id} />
                  <label className="flex cursor-pointer items-center gap-2 text-xs font-semibold text-slate-700 sm:justify-center">
                    <input
                      type="checkbox"
                      name="is_featured"
                      defaultChecked={p.is_featured}
                      className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="sm:hidden">Featured</span>
                  </label>
                  <input
                    name="featured_sort_order"
                    type="number"
                    defaultValue={p.featured_sort_order}
                    title="Order (smaller appears first)"
                    className="h-9 w-full rounded-lg border border-slate-200 bg-white px-2 text-center text-sm tabular-nums outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-200 sm:w-14 sm:px-1"
                  />
                  <div className="min-w-0 sm:py-0.5">
                    <div className="truncate text-sm font-semibold text-slate-900">{p.name}</div>
                    <div className="truncate font-mono text-[11px] text-slate-500">{p.slug}</div>
                  </div>
                  <div className="flex sm:justify-end">
                    <button
                      type="submit"
                      className="inline-flex h-9 w-full items-center justify-center rounded-lg bg-blue-600 px-3 text-xs font-semibold text-white hover:bg-blue-700 sm:w-auto"
                    >
                      Save
                    </button>
                  </div>
                </form>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
