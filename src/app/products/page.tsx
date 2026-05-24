import Link from "next/link";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Category, ProductListing } from "@/lib/store-types";
import { PRICE_FILTER_MAX_PKR } from "@/lib/money";
import { ProductGridCard } from "@/components/ProductGridCard";
import { ProductsCatalogToolbar } from "@/components/ProductsCatalogToolbar";
import { ProductsFilters } from "@/components/ProductsFilters";
import { queryProductListingsPage } from "@/lib/product-listings-query";

export const dynamic = "force-dynamic";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const category = typeof sp.category === "string" ? sp.category : undefined;
  const qRaw = typeof sp.q === "string" ? sp.q : undefined;
  const q = qRaw ? qRaw.trim().slice(0, 64) : undefined;
  const minRaw = typeof sp.min === "string" ? sp.min : undefined;
  const maxRaw = typeof sp.max === "string" ? sp.max : undefined;
  const min =
    minRaw && /^\d+$/.test(minRaw)
      ? Math.min(PRICE_FILTER_MAX_PKR, Math.max(0, Number(minRaw)))
      : undefined;
  const max =
    maxRaw && /^\d+$/.test(maxRaw)
      ? Math.min(PRICE_FILTER_MAX_PKR, Math.max(0, Number(maxRaw)))
      : undefined;
  const sort = typeof sp.sort === "string" ? sp.sort : "name";
  const featured = sp.featured === "1" || sp.featured === "true";

  const PAGE_SIZE = 12;
  const pageRaw = typeof sp.page === "string" ? Number.parseInt(sp.page, 10) : NaN;
  const page = Number.isFinite(pageRaw) && pageRaw > 0 ? pageRaw : 1;
  const rangeFrom = (page - 1) * PAGE_SIZE;
  const rangeTo = rangeFrom + PAGE_SIZE - 1;

  const supabase = createSupabaseAdminClient();
  const [{ data: categories }, listingsPack] = await Promise.all([
    supabase.from("categories").select("id,name,slug,parent_id,thumbnail_url,hero_icon_hint").order("name"),
    queryProductListingsPage(supabase, async (select) => {
      const started = () => {
        let qb = supabase.from("product_listings").select(select, { count: "exact" });
        if (featured) qb = qb.eq("is_featured", true);
        return qb;
      };
      type RowQ = ReturnType<typeof started>;
      const applyPrice = (qb: RowQ) => {
        let q2 = qb;
        if (typeof min === "number") q2 = q2.gte("min_price_pkr", min);
        if (typeof max === "number") q2 = q2.lte("min_price_pkr", max);
        return q2;
      };
      const applySort = (qb: RowQ) => {
        if (sort === "price_asc") return qb.order("min_price_pkr", { ascending: true }).order("name", { ascending: true });
        if (sort === "price_desc") return qb.order("min_price_pkr", { ascending: false }).order("name", { ascending: true });
        return qb.order("name", { ascending: true });
      };

      if (!category && q) {
        return applySort(applyPrice(started().or(`name.ilike.%${q}%,description.ilike.%${q}%`))).range(rangeFrom, rangeTo);
      }

      if (!category) {
        return applySort(applyPrice(started())).range(rangeFrom, rangeTo);
      }

      const { data: cat } = await supabase.from("categories").select("id").eq("slug", category).maybeSingle();
      if (!cat?.id) {
        return applySort(applyPrice(started())).range(rangeFrom, rangeTo);
      }

      let scoped = started().eq("category_id", cat.id);
      scoped = applyPrice(scoped);
      if (q) scoped = scoped.or(`name.ilike.%${q}%,description.ilike.%${q}%`);
      return applySort(scoped).range(rangeFrom, rangeTo);
    }),
  ]);

  const listings = listingsPack.error ? [] : (listingsPack.data ?? []);
  const totalCount = listingsPack.error ? 0 : (listingsPack.count ?? listings.length);
  const listingsError = listingsPack.error;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const hasLiveProducts = listings.length > 0;
  const showingFrom = totalCount === 0 ? 0 : rangeFrom + 1;
  const showingTo = Math.min(rangeTo + 1, totalCount);

  function pageHref(next: number) {
    const u = new URLSearchParams();
    if (category) u.set("category", category);
    if (q) u.set("q", q);
    if (typeof min === "number") u.set("min", String(min));
    if (typeof max === "number") u.set("max", String(max));
    if (sort && sort !== "name") u.set("sort", sort);
    if (featured) u.set("featured", "1");
    u.set("page", String(Math.max(1, Math.min(next, totalPages))));
    return `/products?${u.toString()}`;
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Shop</h1>
          <p className="mt-1.5 text-sm text-slate-600">
            {category ? (
              <>
                <span className="font-semibold text-slate-900">{category}</span>
                <span className="text-slate-500"> · category</span>
              </>
            ) : q ? (
              <>
                <span className="font-semibold text-slate-900">“{q}”</span>
                <span className="text-slate-500"> · search</span>
              </>
            ) : (
              "Filter by category, search, or price."
            )}
            {hasLiveProducts ? (
              <>
                {" "}
                <span className="text-slate-500">
                  · {showingFrom}–{showingTo} of {totalCount} products
                </span>
              </>
            ) : null}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 md:hidden">
          <Link
            href="/products"
            className={`rounded-full border px-3 py-1.5 text-sm font-semibold transition ${
              !category
                ? "border-blue-600 bg-blue-600 text-white shadow-sm"
                : "border-slate-200 bg-white text-blue-800 hover:border-blue-200 hover:bg-blue-50"
            }`}
          >
            All
          </Link>
          {(categories as Category[] | null)?.map((c) => (
            <Link
              key={c.id}
              href={`/products?category=${encodeURIComponent(c.slug)}`}
              className={`rounded-full border px-3 py-1.5 text-sm font-semibold transition ${
                category === c.slug
                  ? "border-blue-600 bg-blue-600 text-white shadow-sm"
                  : "border-slate-200 bg-white text-blue-800 hover:border-blue-200 hover:bg-blue-50"
              }`}
            >
              {c.name}
            </Link>
          )) ?? null}
        </div>
      </div>

      {listingsError ? (
        <div className="mt-6 rounded-3xl border border-red-200 bg-red-50 p-6 text-sm text-red-950 shadow-sm">
          <div className="font-semibold">Could not load your catalog</div>
          <p className="mt-2 leading-relaxed">
            {listingsError}. In Supabase SQL editor, run{" "}
            <code className="rounded bg-white px-1 py-0.5 text-xs ring-1 ring-red-100">supabase/migrations/20260523150000_product_listings_catchy_headline.sql</code>{" "}
            (or the latest <code className="rounded bg-white px-1 py-0.5 text-xs ring-1 ring-red-100">schema.sql</code>), then refresh.
          </p>
        </div>
      ) : !hasLiveProducts ? (
        <div className="mt-6 rounded-3xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-950 shadow-sm">
          <div className="font-semibold">No products on the shop yet</div>
          <p className="mt-2 leading-relaxed">
            Add products in{" "}
            <Link href="/admin/products" className="font-semibold text-blue-800 underline underline-offset-2 hover:text-blue-900">
              Admin → Products
            </Link>{" "}
            and turn on <span className="font-semibold">Visible on storefront (active)</span>. If you ran demo seed data and only want your own items, open each sample SKU in admin and deactivate or delete it.
          </p>
        </div>
      ) : (
        <ProductsCatalogToolbar
          category={category}
          q={q}
          min={min}
          max={max}
          sort={sort}
          featured={featured}
        />
      )}

      <div className="mt-8 grid gap-6 md:grid-cols-[18rem_1fr]">
        <ProductsFilters categories={((categories as Category[] | null) ?? []) as Category[]} />

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:gap-4">
          {hasLiveProducts
            ? listings.map((p) => (
                <ProductGridCard
                  key={p.id}
                  product={p}
                  sizes="(max-width:640px) 50vw, (max-width:1024px) 25vw, 20vw"
                />
              ))
            : null}
        </div>
      </div>

      {hasLiveProducts && totalPages > 1 ? (
        <nav className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center" aria-label="Catalog pagination">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Link
              href={pageHref(page - 1)}
              aria-disabled={page <= 1}
              className={`inline-flex min-w-[8rem] items-center justify-center rounded-full border px-5 py-2.5 text-sm font-semibold ${
                page <= 1 ? "pointer-events-none border-slate-100 text-slate-300" : "border-slate-200 text-slate-800 hover:bg-slate-50"
              }`}
            >
              Previous
            </Link>
            <Link
              href={pageHref(page + 1)}
              aria-disabled={page >= totalPages}
              className={`inline-flex min-w-[8rem] items-center justify-center rounded-full border px-5 py-2.5 text-sm font-semibold ${
                page >= totalPages ? "pointer-events-none border-slate-100 text-slate-300" : "border-slate-200 text-slate-800 hover:bg-slate-50"
              }`}
            >
              Next
            </Link>
          </div>
          <p className="text-sm text-slate-600">
            Page <span className="font-semibold text-slate-900">{page}</span> / {totalPages}
          </p>
        </nav>
      ) : null}
    </main>
  );
}

