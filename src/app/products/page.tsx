import Link from "next/link";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Category, ProductListing } from "@/lib/store-types";
import { formatPKR } from "@/lib/money";
import { DEMO_PRODUCTS } from "@/lib/demo-products";
import { ProductCardMedia } from "@/components/ProductCardMedia";
import { ProductsFilters } from "@/components/ProductsFilters";
import { AddToCartButton } from "@/components/AddToCartButton";

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
  const min = minRaw && /^\d+$/.test(minRaw) ? Math.max(0, Number(minRaw)) : undefined;
  const max = maxRaw && /^\d+$/.test(maxRaw) ? Math.max(0, Number(maxRaw)) : undefined;
  const sort = typeof sp.sort === "string" ? sp.sort : "name";

  const supabase = createSupabaseAdminClient();
  const [{ data: categories }, { data: products }] = await Promise.all([
    supabase.from("categories").select("id,name,slug,parent_id").order("name"),
    (async () => {
      const base = supabase
        .from("product_listings")
        .select(
          "id,name,slug,description,min_price_pkr,image_url,category_id,default_variant_id,default_variant_sku,default_variant_title,default_variant_price_pkr",
        );
      const applyPrice = (qb: typeof base) => {
        let q2 = qb;
        if (typeof min === "number") q2 = q2.gte("min_price_pkr", min);
        if (typeof max === "number") q2 = q2.lte("min_price_pkr", max);
        return q2;
      };
      const applySort = (qb: typeof base) => {
        if (sort === "price_asc") return qb.order("min_price_pkr", { ascending: true }).order("name", { ascending: true });
        if (sort === "price_desc") return qb.order("min_price_pkr", { ascending: false }).order("name", { ascending: true });
        return qb.order("name", { ascending: true });
      };

      if (!category && q) {
        return await applySort(applyPrice(base.or(`name.ilike.%${q}%,description.ilike.%${q}%`))).limit(60);
      }

      if (!category) return await applySort(applyPrice(base)).limit(60);

      const { data: cat } = await supabase.from("categories").select("id").eq("slug", category).maybeSingle();
      if (!cat?.id) {
        return await applySort(applyPrice(base)).limit(60);
      }
      const byCat = base.eq("category_id", cat.id);
      if (q) {
        return await applySort(applyPrice(byCat.or(`name.ilike.%${q}%,description.ilike.%${q}%`))).limit(60);
      }
      return await applySort(applyPrice(byCat)).limit(60);
    })(),
  ]);

  const listings = (products?.data as ProductListing[] | null) ?? [];
  const hasLiveProducts = listings.length > 0;

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Shop</h1>
          <p className="mt-2 text-sm text-slate-600">
            {category ? (
              <>
                Showing results for <span className="font-semibold text-slate-900">{category}</span>
              </>
            ) : q ? (
              <>
                Showing results for <span className="font-semibold text-slate-900">“{q}”</span>
              </>
            ) : (
              "Browse our catalog with category shortcuts."
            )}
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

      {!hasLiveProducts ? (
        <div className="mt-6 rounded-3xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-950 shadow-sm">
          <div className="font-semibold">Catalog connection looks empty</div>
          <p className="mt-2 leading-relaxed">
            Run <code className="rounded bg-white px-1 py-0.5 text-xs ring-1 ring-amber-100">supabase/seed.sql</code> or publish SKUs from Supabase to populate this grid. Below is a{" "}
            <span className="font-semibold">non-clickable demo strip</span> so stakeholders can review spacing, imagery, and typography before inventory lands.
          </p>
        </div>
      ) : (
        <div className="mt-6 rounded-3xl border border-blue-100 bg-blue-50/60 p-6 text-sm text-blue-950 shadow-sm">
          <div className="font-semibold">Buying signals & dispatch cadence</div>
          <p className="mt-2 leading-relaxed">
            Live SKUs pull straight from Supabase—variants show watts, colours, and bundles on each detail page. Need alternate finishes or voltage checks for travelers? WhatsApp photos of your wall/outlet setup before COD confirmation.
          </p>
        </div>
      )}

      <div className="mt-8 grid gap-6 md:grid-cols-[18rem_1fr]">
        <ProductsFilters categories={((categories as Category[] | null) ?? []) as Category[]} />

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {hasLiveProducts
            ? listings.map((p) => (
                <article
                  key={p.id}
                  className="group overflow-hidden rounded-3xl border border-slate-200 bg-white/95 shadow-sm ring-1 ring-white/60 backdrop-blur-sm transition duration-200 ease-smooth-out motion-reduce:transition-none hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md motion-reduce:hover:translate-y-0"
                >
                  <Link href={`/product/${p.slug}`} className="block">
                    <ProductCardMedia imageUrl={p.image_url} alt={p.name} />
                  </Link>
                  <div className="flex flex-col gap-4 p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <Link href={`/product/${p.slug}`} className="block truncate text-base font-semibold text-slate-900 hover:text-blue-800 hover:underline">
                          {p.name}
                        </Link>
                        <div className="mt-1 line-clamp-2 text-sm text-slate-600">{p.description}</div>
                        <div className="mt-2 text-[11px] font-semibold text-slate-500">
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-700 ring-1 ring-slate-200/80">Specs on detail page</span>
                        </div>
                      </div>
                      <div className="shrink-0 rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-800">{formatPKR(p.min_price_pkr)}</div>
                    </div>

                    <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
                      <AddToCartButton
                        variant={
                          p.default_variant_id && p.default_variant_sku && p.default_variant_title && typeof p.default_variant_price_pkr === "number"
                            ? {
                                id: p.default_variant_id,
                                sku: p.default_variant_sku,
                                title: p.default_variant_title,
                                price_pkr: p.default_variant_price_pkr,
                                product_slug: p.slug,
                                product_name: p.name,
                                image_url: p.image_url,
                              }
                            : null
                        }
                        className="inline-flex h-10 items-center justify-center rounded-full bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-60"
                      />
                      <Link href="/cart" className="text-sm font-semibold text-blue-700 hover:text-blue-800">
                        View cart →
                      </Link>
                    </div>
                  </div>
                </article>
              ))
            : DEMO_PRODUCTS.map((p) => (
              <article key={p.sku} className="flex flex-col overflow-hidden rounded-3xl border border-dashed border-blue-200 bg-white/95 shadow-sm ring-1 ring-white/60 backdrop-blur-sm">
                <div className="relative">
                  <ProductCardMedia imageUrl={p.imageUrl} alt={p.name} />
                  <div className="pointer-events-none absolute left-4 top-4 z-20 rounded-full bg-white/85 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-blue-900 shadow-sm ring-1 ring-blue-100 backdrop-blur">
                    Demo preview
                  </div>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <div className="text-[11px] font-semibold uppercase tracking-wide text-blue-700">{p.category}</div>
                  <div className="mt-2 text-base font-semibold text-slate-900">{p.name}</div>
                  <div className="mt-1 text-xs font-medium text-slate-500">SKU {p.sku}</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {p.unit ? (
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700 ring-1 ring-slate-200">{p.unit}</span>
                    ) : null}
                    {p.warranty ? (
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-800 ring-1 ring-emerald-100">{p.warranty}</span>
                    ) : null}
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">{p.description}</p>
                  {p.stockHint ? <p className="mt-2 text-xs text-slate-500">{p.stockHint}</p> : null}
                  <ul className="mt-4 space-y-1.5 text-sm text-slate-700">
                    {p.specs.map((spec) => (
                      <li key={spec} className="flex gap-2">
                        <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                        <span>{spec}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-5">
                    <div className="text-lg font-semibold text-slate-900">{formatPKR(p.pricePkr)}</div>
                    {p.compareAtPkr ? <div className="text-sm text-slate-400 line-through">{formatPKR(p.compareAtPkr)}</div> : null}
                    <span className="ml-auto rounded-full bg-slate-900 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white">Layout sample</span>
                  </div>
                </div>
              </article>
            ))}
        </div>
      </div>

      {hasLiveProducts ? (
        <section className="mt-10 rounded-3xl border border-dashed border-blue-200 bg-gradient-to-br from-blue-50/60 via-white to-white p-6 sm:p-8">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="inline-flex rounded-full bg-blue-600 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white">
                Merchandising playground
              </div>
              <h2 className="mt-3 text-xl font-semibold tracking-tight text-slate-900">Need richer storytelling while inventory ramps?</h2>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600">
                These fake SKUs mirror how bundles, badges, and cross-sell rails will feel once marketing drops campaign copy. They stay offline until you wire real equivalents.
              </p>
            </div>
            <span className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-blue-900 ring-1 ring-blue-100">Non-interactive samples</span>
          </div>

          <div className="mt-6 grid gap-5 lg:grid-cols-3">
            {DEMO_PRODUCTS.slice(0, 3).map((p) => (
              <article key={`story-${p.sku}`} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="text-xs font-semibold uppercase tracking-wide text-blue-700">{p.category}</div>
                <div className="mt-2 text-base font-semibold text-slate-900">{p.name}</div>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">{p.description}</p>
                <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Cross-sell ideas • cooler pads • spare jug • diffuser nozzle • sandwich waffle plates
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}

