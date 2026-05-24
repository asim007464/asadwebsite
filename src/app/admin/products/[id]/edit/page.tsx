import Link from "next/link";
import { notFound } from "next/navigation";
import {
  addProductVariant,
  deleteProductVariant,
  updateProduct,
  updateProductVariant,
} from "@/app/admin/actions";
import { AdminProductGallery } from "@/components/admin/AdminProductGallery";
import { AdminStockQtyField } from "@/components/admin/AdminStockQtyField";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

function errMsg(code: string) {
  if (code === "name") return "Enter a product name (at least 2 characters).";
  if (code === "slug") return "Enter a valid slug or leave it blank to generate from the name.";
  if (code === "sku") return "SKU must be at least 2 characters.";
  if (code === "variant") return "Enter a variant label.";
  if (code === "price") return "Price (PKR) must be a whole number ≥ 0.";
  if (code === "compare") return "Compare-at price must be empty or a whole number ≥ 0.";
  if (code === "image") return "Image URL must be empty, https://, or a path starting with /.";
  if (code === "no-gallery-files") return "Choose at least one image file to upload.";
  if (code === "gallery-too-many") return `You can upload at most 12 images at a time.`;
  if (code === "cover-not-found") return "That image could not be found; refresh and try again.";
  if (code === "brand") return "Could not save that brand. Try a shorter name or try again.";
  return code.length < 220 ? code : "Something went wrong.";
}

const input =
  "mt-2 h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100";
const monoInput = `${input} font-mono text-[11px]`;

type VariantRow = {
  id: string;
  sku: string;
  title: string;
  price_pkr: number;
  compare_at_price_pkr: number | null;
  is_active: boolean;
};

export default async function AdminEditProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const errorRaw = typeof sp.error === "string" ? decodeURIComponent(sp.error) : "";
  const error = errorRaw ? errMsg(errorRaw) : "";
  const notice = typeof sp.notice === "string" ? sp.notice : "";

  const supabase = createSupabaseAdminClient();

  const [{ data: product }, { data: categories }, { data: variants }, { data: galleryRows }] = await Promise.all([
    supabase
      .from("products")
      .select("id,name,slug,catchy_headline,description,category_id,brand_id,is_active")
      .eq("id", id)
      .maybeSingle(),
    supabase.from("categories").select("id,name").order("name"),
    supabase
      .from("product_variants")
      .select("id,sku,title,price_pkr,compare_at_price_pkr,is_active")
      .eq("product_id", id)
      .order("price_pkr", { ascending: true }),
    supabase
      .from("product_images")
      .select("id,url,alt,sort_order")
      .eq("product_id", id)
      .order("sort_order", { ascending: true }),
  ]);

  if (!product) notFound();

  const p = product as {
    id: string;
    name: string;
    slug: string;
    catchy_headline: string;
    description: string;
    category_id: string | null;
    brand_id: string | null;
    is_active: boolean;
  };

  const cats = ((categories ?? []) as { id: string; name: string }[]) ?? [];
  const varRows = ((variants ?? []) as VariantRow[]) ?? [];
  const variantIds = varRows.map((v) => v.id);

  const { data: invRows } =
    variantIds.length > 0
      ? await supabase.from("inventory").select("variant_id,qty_available").in("variant_id", variantIds)
      : { data: [] as { variant_id: string; qty_available: number }[] };

  const stock = new Map((invRows ?? []).map((r) => [r.variant_id, r.qty_available]));
  const galleryImages =
    (galleryRows ?? []) as { id: string; url: string; alt: string; sort_order: number }[];

  let brandNameDefault = "";
  if (p.brand_id) {
    const { data: brRow } = await supabase.from("brands").select("name").eq("id", p.brand_id).maybeSingle();
    brandNameDefault = typeof brRow?.name === "string" ? brRow.name.trim() : "";
  }

  const noticeMsg =
    notice === "created"
      ? "Product created. You can add more variants below."
      : notice === "saved"
        ? "Product details saved."
        : notice === "variant-added"
          ? "New variant added."
          : notice === "saved-variant"
            ? "Variant updated."
            : notice === "variant-removed"
              ? "Variant removed."
              : notice === "saved-images"
                ? "Gallery updated."
                : "";

  return (
    <main className="py-6 lg:py-0">
      <div className="space-y-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Edit product</p>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{p.name}</h1>
              <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 font-mono text-xs text-slate-500">
                <span>{p.slug}</span>
                <Link href={`/product/${p.slug}`} className="text-blue-700 hover:text-blue-800">
                  View live →
                </Link>
                <Link className="text-blue-700 hover:text-blue-800" href="/admin/products/seo">
                  SEO meta →
                </Link>
              </div>
            </div>
            <Link href="/admin/products" className="text-sm font-semibold text-blue-700 hover:text-blue-800">
              ← All products
            </Link>
          </div>

          {noticeMsg ? (
            <div className="mt-5 rounded-2xl border border-emerald-200/80 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-950">{noticeMsg}</div>
          ) : null}
          {error ? (
            <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">{error}</div>
          ) : null}

          <form action={updateProduct} className="mt-8 grid max-w-3xl grid-cols-1 gap-6 sm:grid-cols-2">
            <input type="hidden" name="id" value={p.id} />
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Product name</label>
              <input name="name" required defaultValue={p.name} className={input} />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Catchy headline (optional)</label>
              <input
                name="catchy_headline"
                defaultValue={p.catchy_headline ?? ""}
                placeholder="e.g. Stay charged on the go — fast charge, pocket size"
                className={input}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Slug</label>
              <input name="slug" defaultValue={p.slug} className={monoInput} />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Description</label>
              <textarea name="description" rows={4} defaultValue={p.description} className={`${input} min-h-[6rem] resize-y py-3`} />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Category</label>
              <select name="category_id" defaultValue={p.category_id ?? ""} className={input}>
                <option value="">— None —</option>
                {cats.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Brand (optional)</label>
              <input
                name="brand_name"
                defaultValue={brandNameDefault}
                placeholder="Type brand name — leave empty for no brand"
                className={input}
                autoComplete="off"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-slate-800">
                <input type="checkbox" name="is_active" defaultChecked={p.is_active} className="h-4 w-4 rounded border-slate-300" />
                visible on storefront (active)
              </label>
            </div>
            <div className="sm:col-span-2">
              <button
                type="submit"
                className="inline-flex h-11 items-center justify-center rounded-full bg-blue-600 px-8 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
              >
                Save product
              </button>
            </div>
          </form>
        </div>

        <AdminProductGallery productId={p.id} productName={p.name} images={galleryImages} />

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-lg font-semibold text-slate-900">Variants &amp; stock</h2>
          <p className="mt-1 max-w-2xl text-sm text-slate-600">Each row is a sellable SKU. Customers see the lowest-priced active variant by default on grids.</p>

          <div className="mt-6 space-y-6">
            {varRows.map((v) => (
              <div key={v.id} className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 sm:p-5">
                <form action={updateProductVariant} className="space-y-4">
                  <input type="hidden" name="variant_id" value={v.id} />
                  <input type="hidden" name="product_id" value={p.id} />
                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:items-end">
                    <div className="lg:col-span-3">
                      <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">SKU</label>
                      <input name="sku" required defaultValue={v.sku} className={monoInput} />
                    </div>
                    <div className="lg:col-span-4">
                      <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Label</label>
                      <input name="title" required defaultValue={v.title} className={input} />
                    </div>
                    <div className="lg:col-span-2">
                      <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Price PKR</label>
                      <input name="price_pkr" type="number" required min={0} step={1} defaultValue={v.price_pkr} className={input} />
                    </div>
                    <div className="lg:col-span-2">
                      <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Compare PKR</label>
                      <input
                        name="compare_at_price_pkr"
                        type="number"
                        min={0}
                        step={1}
                        defaultValue={v.compare_at_price_pkr ?? ""}
                        className={input}
                      />
                    </div>
                    <div className="lg:col-span-1">
                      <AdminStockQtyField
                        name="stock_qty"
                        label="Stock"
                        defaultQty={stock.get(v.id) ?? 0}
                        inputClassName={input}
                      />
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 border-t border-slate-200/80 pt-4">
                    <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-slate-800">
                      <input type="checkbox" name="is_active" defaultChecked={v.is_active} className="h-4 w-4 rounded border-slate-300" />
                      Active
                    </label>
                    <button
                      type="submit"
                      className="inline-flex h-10 items-center justify-center rounded-full bg-blue-600 px-6 text-xs font-semibold text-white hover:bg-blue-700"
                    >
                      Save variant
                    </button>
                  </div>
                </form>
                <form action={deleteProductVariant} className="mt-3 inline">
                  <input type="hidden" name="variant_id" value={v.id} />
                  <input type="hidden" name="product_id" value={p.id} />
                  <button
                    type="submit"
                    className="text-xs font-semibold text-red-700 hover:text-red-800 disabled:opacity-40"
                    disabled={varRows.length <= 1}
                  >
                    Remove variant
                  </button>
                </form>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-4 sm:p-5">
            <h3 className="text-sm font-bold text-slate-900">Add another variant</h3>
            <form action={addProductVariant} className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-12 lg:items-end">
              <input type="hidden" name="product_id" value={p.id} />
              <div className="sm:col-span-2 lg:col-span-3">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">SKU</label>
                <input name="sku" required className={monoInput} placeholder="Unique SKU" />
              </div>
              <div className="sm:col-span-2 lg:col-span-4">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Label</label>
                <input name="title" required className={input} placeholder="e.g. Walnut blades" />
              </div>
              <div className="lg:col-span-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Price PKR</label>
                <input name="price_pkr" type="number" required min={0} step={1} className={input} />
              </div>
              <div className="lg:col-span-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Compare PKR</label>
                <input name="compare_at_price_pkr" type="number" min={0} step={1} className={input} />
              </div>
              <div className="lg:col-span-1">
                <AdminStockQtyField name="stock_qty" label="Stock" defaultQty={0} inputClassName={input} />
              </div>
              <div className="sm:col-span-2 lg:col-span-12">
                <button
                  type="submit"
                  className="inline-flex h-10 items-center justify-center rounded-full bg-slate-900 px-6 text-xs font-semibold text-white hover:bg-slate-800"
                >
                  Add variant
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
