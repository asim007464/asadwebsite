import Link from "next/link";
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
};

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const error = typeof sp.error === "string" ? decodeURIComponent(sp.error) : undefined;

  const supabase = createSupabaseAdminClient();

  const [{ data: products }, { data: categories }, { data: brands }, { data: variantRows }] = await Promise.all([
    supabase.from("products").select("id,name,slug,is_active,category_id,brand_id").order("name"),
    supabase.from("categories").select("id,name").order("name"),
    supabase.from("brands").select("id,name").order("name"),
    supabase.from("product_variants").select("product_id"),
  ]);

  const rows = ((products ?? []) as ProductRow[]) ?? [];
  const catMap = new Map((categories ?? []).map((c: { id: string; name: string }) => [c.id, c.name]));
  const brandMap = new Map((brands ?? []).map((b: { id: string; name: string }) => [b.id, b.name]));
  const variantCount = new Map<string, number>();
  for (const v of (variantRows ?? []) as { product_id: string }[]) {
    variantCount.set(v.product_id, (variantCount.get(v.product_id) ?? 0) + 1);
  }

  return (
    <main className="py-6 lg:py-0">
      <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm ring-1 ring-slate-200/60">
        {/* Page hero — matches admin catalog pattern; stacks cleanly on narrow screens */}
        <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 via-white to-blue-50/35 px-5 py-5 sm:px-8 sm:py-7">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between md:gap-8">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-600/90">Catalog</p>
              <h1 className="mt-1 text-balance text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Products</h1>
              <p className="mt-3 max-w-2xl text-pretty text-sm leading-relaxed text-slate-600 sm:text-[15px]">
                Add catalog items with at least one SKU, price, and stock. Listings and product pages use the first image and cheapest active variant by default.
              </p>
            </div>
            <div className="flex w-full shrink-0 flex-col gap-3 sm:max-w-md md:w-auto md:max-w-none md:items-end">
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end sm:gap-x-4 sm:gap-y-2">
                <Link
                  href="/admin/products/new"
                  className="inline-flex min-h-[44px] w-full items-center justify-center rounded-full bg-blue-600 px-7 text-sm font-semibold text-white shadow-md shadow-blue-600/20 transition hover:bg-blue-700 active:bg-blue-800 sm:min-h-0 sm:w-auto"
                >
                  Add product
                </Link>
                <Link
                  href="/admin/products/seo"
                  className="inline-flex min-h-[44px] w-full items-center justify-center text-sm font-semibold text-blue-700 transition hover:text-blue-800 sm:w-auto sm:min-h-0 sm:justify-center"
                >
                  SEO snippets →
                </Link>
              </div>
              <Link
                href="/admin"
                className="inline-flex min-h-[44px] items-center text-sm font-semibold text-slate-500 transition hover:text-slate-800 sm:min-h-0 sm:self-end"
              >
                ← Dashboard
              </Link>
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-8 sm:pt-7">
          {error ? (
            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">{error}</div>
          ) : null}

          {rows.length === 0 ? (
            <p className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-600">
              No products yet.{" "}
              <Link href="/admin/products/new" className="font-semibold text-blue-700 hover:text-blue-800">
                Create your first product
              </Link>
              .
            </p>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="min-w-[44rem] w-full text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Product</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Brand</th>
                    <th className="px-4 py-3">Variants</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rows.map((p) => (
                    <tr key={p.id} className="bg-white">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900">{p.name}</div>
                        <div className="mt-0.5 font-mono text-xs text-slate-500">{p.slug}</div>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{p.category_id ? (catMap.get(p.category_id) ?? "—") : "—"}</td>
                      <td className="px-4 py-3 text-slate-600">{p.brand_id ? (brandMap.get(p.brand_id) ?? "—") : "—"}</td>
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
                      <td className="px-4 py-3 text-right">
                        <div className="flex flex-wrap justify-end gap-2">
                          <Link
                            href={`/admin/products/${p.id}/edit`}
                            className="inline-flex h-9 items-center justify-center rounded-full border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-800 hover:border-blue-300 hover:bg-blue-50"
                          >
                            Edit
                          </Link>
                          <Link
                            href={`/product/${p.slug}`}
                            className="inline-flex h-9 items-center justify-center rounded-full border border-slate-200 px-4 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                          >
                            View
                          </Link>
                          <ConfirmDeleteProduct id={p.id} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
