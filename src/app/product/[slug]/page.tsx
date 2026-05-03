import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Product, ProductVariant } from "@/lib/store-types";
import { formatPKR } from "@/lib/money";
import { AddToCart } from "./ui";
import { ProductImageGallery } from "./gallery";
import { AddToWishlistButton } from "@/components/AddToWishlistButton";

export const dynamic = "force-dynamic";

function humanizeKey(key: string) {
  return key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function VariantSpecs({ options }: { options: Record<string, unknown> }) {
  const entries = Object.entries(options).filter(([, v]) => v != null && String(v).trim() !== "");
  if (!entries.length) return null;
  return (
    <dl className="mt-3 grid grid-cols-1 gap-2 text-xs sm:grid-cols-2">
      {entries.map(([k, v]) => (
        <div key={k} className="flex justify-between gap-3 rounded-xl bg-white/90 px-3 py-2 ring-1 ring-slate-200/90">
          <dt className="text-slate-500">{humanizeKey(k)}</dt>
          <dd className="text-right font-semibold text-slate-900">{String(v)}</dd>
        </div>
      ))}
    </dl>
  );
}

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
      <span className="rounded-full bg-orange-50 px-2.5 py-0.5 text-[11px] font-semibold text-orange-900 ring-1 ring-orange-100">Low stock ({qty} available)</span>
    );
  }
  return (
    <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-900 ring-1 ring-emerald-100">
      In stock ({qty}+)
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
    .select("id,name,slug,description,category_id,brand_id,is_active")
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
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">{product.name}</h1>
            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-600">{product.description}</p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-sm ring-1 ring-white/60 backdrop-blur-sm">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="text-sm font-semibold text-slate-900">Variants</div>
              <div className="text-xs text-slate-500">Each line shows live inventory where synced</div>
            </div>
            <div className="mt-4 grid gap-3">
              {variantRows.map((v) => (
                <div key={v.id} className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 p-4 ring-1 ring-white/70">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-slate-900">{v.title}</div>
                      <div className="mt-1 text-xs text-slate-500">SKU: {v.sku}</div>
                      <div className="mt-2">{stockBadge(qtyByVariant.get(v.id))}</div>
                      <VariantSpecs options={v.options as Record<string, unknown>} />
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="text-sm font-semibold text-blue-800">{formatPKR(v.price_pkr)}</div>
                      {v.compare_at_price_pkr ? (
                        <div className="mt-1 text-xs text-slate-500 line-through">{formatPKR(v.compare_at_price_pkr)}</div>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200/80 pt-3">
                    <div className="text-xs text-slate-600">Cart & wishlist persist on this device until checkout.</div>
                    <div className="flex flex-wrap items-center justify-end gap-2">
                      <AddToWishlistButton
                        variant={{
                          variantId: v.id,
                          productSlug: (product as Product).slug,
                          productName: (product as Product).name,
                          variantTitle: v.title,
                          sku: v.sku,
                          unitPricePkr: v.price_pkr,
                          imageUrl: hero?.url ?? null,
                        }}
                        className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-800"
                      />
                      <AddToCart
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
                </div>
              ))}
              {variantRows.length === 0 ? (
                <div className="text-sm text-slate-600">No active variants yet — add rows in Supabase.</div>
              ) : null}
            </div>
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
