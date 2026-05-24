import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Product, ProductVariant } from "@/lib/store-types";
import { formatPKR } from "@/lib/money";
import { SPEC_LISTS_OPTIONS_KEY, specListsFromOptions } from "@/lib/product-spec-lists";
import { AddToCart } from "./ui";
import { ProductImageGallery } from "./gallery";

export const dynamic = "force-dynamic";

function humanizeKey(key: string) {
  return key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function VariantSpecs({ options }: { options: Record<string, unknown> }) {
  const lists = specListsFromOptions(options);
  const entries = Object.entries(options).filter(
    ([k, v]) => k !== SPEC_LISTS_OPTIONS_KEY && v != null && String(v).trim() !== "",
  );

  if (!lists.length && !entries.length) return null;

  return (
    <div className="space-y-3">
      {lists.map((list, i) => (
        <div key={i}>
          {list.heading ? (
            <h3 className="text-sm font-semibold text-slate-900">{list.heading}</h3>
          ) : null}
          {list.points.length ? (
            <ul
              className={`list-disc space-y-0.5 pl-4 text-sm leading-snug text-slate-600 marker:text-blue-600 ${list.heading ? "mt-1" : ""}`}
            >
              {list.points.map((point, j) => (
                <li key={j} className="pl-0.5">
                  {point}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ))}
      {entries.length ? (
        <dl className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {entries.map(([k, v]) => (
            <div
              key={k}
              className="flex justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2.5 text-sm"
            >
              <dt className="text-slate-500">{humanizeKey(k)}</dt>
              <dd className="text-right font-semibold text-slate-900">{String(v)}</dd>
            </div>
          ))}
        </dl>
      ) : null}
    </div>
  );
}

function variantTitleVisible(productName: string, variantTitle: string, multipleVariants: boolean) {
  if (!multipleVariants) return false;
  return variantTitle.trim().toLowerCase() !== productName.trim().toLowerCase();
}

const addToCartClass =
  "inline-flex h-12 w-full items-center justify-center rounded-xl bg-blue-600 px-6 text-sm font-semibold text-white shadow-md shadow-blue-600/20 transition hover:bg-blue-700 disabled:opacity-60 sm:w-auto sm:min-w-[11rem]";

function stockBadge(qty: number | undefined) {
  if (qty === undefined) {
    return (
      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-700 ring-1 ring-slate-200">Stock: message us</span>
    );
  }
  if (qty <= 0) {
    return (
      <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-900 ring-1 ring-amber-100">
        Awaiting restock — reserve via WhatsApp
      </span>
    );
  }
  if (qty < 10) {
    return (
      <span className="rounded-full bg-orange-50 px-2.5 py-0.5 text-[11px] font-semibold text-orange-900 ring-1 ring-orange-100">
        Low stock
      </span>
    );
  }
  return (
    <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-900 ring-1 ring-emerald-100">
      In stock
    </span>
  );
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("products")
    .select("name,is_active,meta_keywords,meta_description,description")
    .eq("slug", slug)
    .maybeSingle();
  if (!data || !(data as { is_active?: boolean }).is_active) {
    return { title: "Product" };
  }
  const metaDesc = ((data as { meta_description?: string }).meta_description ?? "").trim();
  const descSource = metaDesc.length ? metaDesc : (data as { description?: string }).description ?? "";
  const description =
    descSource.length <= 165 ? descSource : `${descSource.slice(0, 161).trim()}…`;

  const rawKw = ((data as { meta_keywords?: string }).meta_keywords ?? "").trim();
  const keywords =
    rawKw.length > 0
      ? rawKw
          .split(",")
          .map((x) => x.trim())
          .filter(Boolean)
      : undefined;

  return {
    title: (data as { name?: string }).name ?? "Product",
    description,
    ...(keywords?.length ? { keywords } : {}),
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = createSupabaseAdminClient();

  const { data: product } = await supabase
    .from("products")
    .select("id,name,slug,catchy_headline,description,category_id,brand_id,is_active")
    .eq("slug", slug)
    .maybeSingle();

  if (!product || !(product as { is_active?: boolean }).is_active) return notFound();

  const [{ data: variants }, { data: images }] = await Promise.all([
    supabase
      .from("product_variants")
      .select("id,product_id,sku,title,options,price_pkr,compare_at_price_pkr")
      .eq("product_id", product.id)
      .eq("is_active", true)
      .order("price_pkr"),
    supabase.from("product_images").select("id,url,alt,sort_order").eq("product_id", product.id).order("sort_order"),
  ]);

  const variantRows = (variants as ProductVariant[] | null) ?? [];
  const variantIds = variantRows.map((v) => v.id);

  const { data: inventoryRows } =
    variantIds.length > 0
      ? await supabase.from("inventory").select("variant_id,qty_available").in("variant_id", variantIds)
      : { data: [] as { variant_id: string; qty_available: number }[] | null };

  const qtyByVariant = new Map<string, number>();
  for (const row of inventoryRows ?? []) {
    qtyByVariant.set(row.variant_id, row.qty_available);
  }

  const imgs = (images ?? []) as { id: string; url: string; alt: string; sort_order: number }[];
  const hero = imgs[0];
  const galleryImages = imgs.map((img) => ({
    id: img.id,
    url: img.url,
    alt: img.alt || product.name,
  }));

  const leadVariant = variantRows[0];
  const minPrice = leadVariant?.price_pkr ?? null;
  const maxPrice = variantRows.length > 0 ? variantRows[variantRows.length - 1]!.price_pkr : null;
  const showFromPrice = variantRows.length > 1 && minPrice != null && maxPrice != null && minPrice !== maxPrice;
  const multipleVariants = variantRows.length > 1;
  const productDescription = (product.description ?? "").trim();
  const catchyHeadline = String((product as Product).catchy_headline ?? "").trim();
  const introText = catchyHeadline || productDescription;
  const bodyDescription = catchyHeadline ? productDescription : "";
  const compareAt = leadVariant?.compare_at_price_pkr ?? null;
  const showCompare = compareAt != null && minPrice != null && compareAt > minPrice;

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10">
      <div className="text-xs text-slate-600">
        <Link href="/products" className="font-semibold text-blue-700 hover:text-blue-800">
          Shop
        </Link>
        <span className="mx-2 text-slate-400">/</span>
        <span className="text-slate-900">{product.name}</span>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-10">
        <div className="space-y-4">
          <ProductImageGallery images={galleryImages} productName={product.name} />
          <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 text-xs leading-relaxed text-slate-600 shadow-sm ring-1 ring-white/60 backdrop-blur-sm">
            <span className="font-semibold text-slate-900">Imagery:</span> Swipe thumbnails to compare angles; box shots and spec plates help COD buyers validate before courier dispatch.
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="rounded-3xl border border-slate-200/90 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex gap-4">
              <div className="min-w-0 flex-1">
                <h1 className="text-2xl font-semibold tracking-tight text-slate-900 capitalize sm:text-[1.75rem] sm:leading-tight">
                  {product.name}
                </h1>
                {introText ? (
                  <p
                    className={
                      catchyHeadline
                        ? "mt-1 text-sm font-semibold leading-snug text-blue-800"
                        : "mt-1 whitespace-pre-line text-sm leading-normal text-slate-600"
                    }
                  >
                    {introText}
                  </p>
                ) : null}
                {bodyDescription ? (
                  <p className="mt-2 whitespace-pre-line text-sm leading-normal text-slate-600">{bodyDescription}</p>
                ) : null}
              </div>
              {(leadVariant && !multipleVariants) || minPrice != null ? (
                <div className="flex shrink-0 flex-col items-end gap-1 self-start text-right">
                  {leadVariant && !multipleVariants ? stockBadge(qtyByVariant.get(leadVariant.id)) : null}
                  {minPrice != null ? (
                    <>
                      {showFromPrice ? (
                        <p className="text-xs font-medium text-slate-500">Starting from</p>
                      ) : null}
                      <p className="text-2xl font-bold tabular-nums tracking-tight text-blue-800 sm:text-[1.65rem]">
                        {formatPKR(minPrice)}
                      </p>
                      {showCompare ? (
                        <p className="text-sm text-slate-400 line-through tabular-nums">{formatPKR(compareAt)}</p>
                      ) : null}
                    </>
                  ) : null}
                </div>
              ) : null}
            </div>

            {variantRows.length === 0 ? (
              <p className="mt-4 text-sm text-slate-600">This product is not available for order yet.</p>
            ) : null}

            <div className={multipleVariants ? "mt-4 space-y-3" : "mt-4"}>
              {variantRows.map((v) => {
                const specs = v.options as Record<string, unknown>;
                const hasSpecs =
                  specListsFromOptions(specs).length > 0 ||
                  Object.entries(specs).some(
                    ([k, val]) => k !== SPEC_LISTS_OPTIONS_KEY && val != null && String(val).trim() !== "",
                  );
                const showTitle = variantTitleVisible(product.name, v.title, multipleVariants);

                return (
                  <div
                    key={v.id}
                    className={
                      multipleVariants
                        ? "rounded-2xl border border-slate-200 bg-slate-50/50 p-4 sm:p-5"
                        : undefined
                    }
                  >
                    {multipleVariants ? (
                      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200/80 pb-4">
                        <div className="min-w-0">
                          {showTitle ? (
                            <p className="text-sm font-semibold text-slate-900">{v.title}</p>
                          ) : (
                            stockBadge(qtyByVariant.get(v.id))
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-base font-bold tabular-nums text-blue-800">{formatPKR(v.price_pkr)}</p>
                          {v.compare_at_price_pkr && v.compare_at_price_pkr > v.price_pkr ? (
                            <p className="text-xs text-slate-400 line-through tabular-nums">
                              {formatPKR(v.compare_at_price_pkr)}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    ) : null}

                    {multipleVariants && showTitle ? (
                      <div className="mt-3">{stockBadge(qtyByVariant.get(v.id))}</div>
                    ) : null}

                    {hasSpecs ? (
                      <div
                        className={`${multipleVariants ? "mt-3 border-t border-slate-100 pt-3" : introText || bodyDescription ? "mt-3 border-t border-slate-100 pt-3" : "mt-3"}`}
                      >
                        <VariantSpecs options={specs} />
                      </div>
                    ) : null}

                    <div
                      className={
                        multipleVariants
                          ? "mt-4 flex justify-end border-t border-slate-100 pt-3"
                          : "mt-4 flex flex-col gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between"
                      }
                    >
                      {!multipleVariants ? (
                        <p className="text-xs text-slate-500">Cash on delivery · confirmed before dispatch</p>
                      ) : null}
                      <AddToCart
                        className={multipleVariants ? `${addToCartClass} sm:w-auto` : addToCartClass}
                        variant={{
                          id: v.id,
                          sku: v.sku,
                          title: v.title,
                          price_pkr: v.price_pkr,
                          product_slug: (product as Product).slug,
                          product_name: (product as Product).name,
                          image_url: hero?.url ?? null,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {variantRows.length === 1 ? (
              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  href="/products"
                  className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                >
                  Continue shopping
                </Link>
                <Link
                  href="/cart"
                  className="inline-flex h-11 items-center justify-center rounded-xl border border-blue-200 bg-blue-50 px-5 text-sm font-semibold text-blue-800 transition hover:bg-blue-100"
                >
                  View cart
                </Link>
              </div>
            ) : null}
          </div>

          <div className="rounded-3xl border border-blue-100 bg-blue-50/90 p-5 text-sm text-blue-950 shadow-sm ring-1 ring-white/60 backdrop-blur-sm">
            <div className="font-semibold">Cash on delivery</div>
            <div className="mt-1 text-blue-950/85">
              We confirm your order by phone/WhatsApp before dispatch. Courier charges depend on city—fans, coolers, and juicers need reinforced cartons; reels count toward volumetric weight.
            </div>
          </div>
        </div>
      </div>

      <section className="mt-12 grid gap-6 lg:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-sm ring-1 ring-white/60 backdrop-blur-sm">
          <div className="text-sm font-semibold text-slate-900">Dispatch checklist</div>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            <li className="flex gap-2">
              <span className="text-blue-600">•</span>
              Share site PIN / landmark if receiving on a truck-access road.
            </li>
            <li className="flex gap-2">
              <span className="text-blue-600">•</span>
              Mention if delivery needs doorstep-only drops—large fan cartons and coolers often need two-person offload.
            </li>
            <li className="flex gap-2">
              <span className="text-blue-600">•</span>
              Combine SKUs on one COD order to minimize duplicate confirmation calls.
            </li>
          </ul>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-sm ring-1 ring-white/60 backdrop-blur-sm">
          <div className="text-sm font-semibold text-slate-900">Returns & swaps</div>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            Appliances are inspected before packing. Report transit damage within 24 hours with photos of the courier pouch and labels—our team coordinates replacements case‑by‑case once COD reconciliation is complete.
          </p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-sm ring-1 ring-white/60 backdrop-blur-sm">
          <div className="text-sm font-semibold text-slate-900">Need sizing help?</div>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            WhatsApp model numbers, wattage limits, or nursery-use cases—we suggest safer alternatives before you pay on delivery.
          </p>
          <Link href="/contact" className="mt-4 inline-flex text-sm font-semibold text-blue-700 hover:text-blue-800">
            Contact page →
          </Link>
        </div>
      </section>
    </main>
  );
}
