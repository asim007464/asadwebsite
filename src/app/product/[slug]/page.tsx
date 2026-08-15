import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Product, ProductVariant } from "@/lib/store-types";
import { ProductImageGallery } from "./gallery";
import { ProductPurchasePanel } from "./purchase-panel";

export const dynamic = "force-dynamic";

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

  const productDescription = (product.description ?? "").trim();
  const catchyHeadline = String((product as Product).catchy_headline ?? "").trim();
  const introText = catchyHeadline || productDescription;
  const bodyDescription = catchyHeadline ? productDescription : "";
  const qtyRecord = Object.fromEntries(qtyByVariant);

  return (
    <main className="mx-auto w-full max-w-6xl px-3 py-6 sm:px-4 sm:py-10">
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
          <div className="hidden rounded-2xl border border-slate-200 bg-white/90 p-4 text-xs leading-relaxed text-slate-600 shadow-sm ring-1 ring-white/60 backdrop-blur-sm sm:block">
            <span className="font-semibold text-slate-900">Imagery:</span> Swipe thumbnails to compare angles; box shots and spec plates help COD buyers validate before courier dispatch.
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6">
            <h1 className="text-xl font-semibold tracking-tight text-slate-900 capitalize sm:text-[1.75rem] sm:leading-tight">
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

            <ProductPurchasePanel
              productName={(product as Product).name}
              productSlug={(product as Product).slug}
              imageUrl={hero?.url ?? null}
              variants={variantRows.map((v) => ({
                id: v.id,
                sku: v.sku,
                title: v.title,
                options: (v.options ?? {}) as Record<string, unknown>,
                price_pkr: v.price_pkr,
                compare_at_price_pkr: v.compare_at_price_pkr,
              }))}
              qtyByVariant={qtyRecord}
            />
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
