import Link from "next/link";
import { notFound } from "next/navigation";
import { SafeRemoteImage } from "@/components/SafeRemoteImage";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Product, ProductVariant } from "@/lib/store-types";
import { formatPKR } from "@/lib/money";
import { ProductCardMedia } from "@/components/ProductCardMedia";
import { AddToCart } from "./ui";

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
    return <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-700 ring-1 ring-slate-200">Stock: message us</span>;
  }
  if (qty <= 0) {
    return <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-900 ring-1 ring-amber-100">Awaiting restock — reserve via WhatsApp</span>;
  }
  if (qty < 10) {
    return <span className="rounded-full bg-orange-50 px-2.5 py-0.5 text-[11px] font-semibold text-orange-900 ring-1 ring-orange-100">Low stock ({qty} available)</span>;
  }
  return <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-900 ring-1 ring-emerald-100">In stock ({qty}+)</span>;
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = createSupabaseAdminClient();

  const { data: product } = await supabase
    .from("products")
    .select("id,name,slug,description,category_id,brand_id")
    .eq("slug", slug)
    .maybeSingle();

  if (!product) return notFound();

  const [{ data: variants }, { data: images }] = await Promise.all([
    supabase
      .from("product_variants")
      .select("id,product_id,sku,title,options,price_pkr,compare_at_price_pkr")
      .eq("product_id", product.id)
      .eq("is_active", true)
      .order("price_pkr"),
    supabase.from("product_images").select("url,alt,sort_order").eq("product_id", product.id).order("sort_order"),
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

  const imgs = images ?? [];
  const hero = imgs[0];

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
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm ring-1 ring-white/70 backdrop-blur-sm">
            <ProductCardMedia imageUrl={hero?.url ?? null} alt={hero?.alt || product.name} aspectClassName="aspect-[4/3]" />
          </div>
          {imgs.length > 1 ? (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {imgs.map((img, i) => (
                <div key={`${img.url}-${i}`} className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl ring-1 ring-slate-200">
                  <SafeRemoteImage src={img.url} alt={img.alt || `${product.name} ${i + 1}`} fill className="object-cover" sizes="64px" />
                </div>
              ))}
            </div>
          ) : null}
          <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 text-xs leading-relaxed text-slate-600 shadow-sm ring-1 ring-white/60 backdrop-blur-sm">
            <span className="font-semibold text-slate-900">Photography note:</span> Add box shots, watt plates, accessory grids, and scale references—buyers compare blades, guards, and plate finishes online before COD.
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">{product.name}</h1>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">{product.description}</p>
            <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-semibold">
              <span className="rounded-full bg-blue-50 px-2.5 py-1 text-blue-800 ring-1 ring-blue-100">COD nationwide</span>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-700 ring-1 ring-slate-200">Phone / WhatsApp confirmation</span>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-700 ring-1 ring-slate-200">Specs tied to SKU</span>
            </div>
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
                    <div className="text-xs text-slate-600">Adds to cart locally → checkout collects COD details.</div>
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
              ))}
              {variantRows.length === 0 ? <div className="text-sm text-slate-600">No active variants yet — add rows in Supabase.</div> : null}
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
