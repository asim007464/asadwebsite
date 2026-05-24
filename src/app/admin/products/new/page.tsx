import Link from "next/link";
import { createProduct } from "@/app/admin/actions";
import { ADMIN_IMAGE_FILE_INPUT_CLASS, ADMIN_IMAGE_UPLOAD_HINT } from "@/lib/admin-media-upload";
import { AdminSpecListsField } from "@/components/admin/AdminSpecListsField";
import { AdminStockQtyField } from "@/components/admin/AdminStockQtyField";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

function errMsg(code: string) {
  if (code === "name") return "Enter a product name (at least 2 characters).";
  if (code === "slug") return "Enter a valid slug or leave it blank to generate from the name.";
  if (code === "price") return "Price (PKR) must be a whole number ≥ 0.";
  if (code === "compare") return "Compare-at price must be empty or a whole number ≥ 0.";
  if (code === "image") return "Image URL must be empty, https://, or a path starting with /.";
  if (code === "gallery-too-many") return "You can upload at most 12 images at once.";
  if (code === "brand") return "Could not save that brand. Try a shorter name or try again.";
  return code.length < 180 ? code : "Something went wrong.";
}

const input =
  "mt-2 h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100";
const monoInput = `${input} font-mono text-[11px]`;

export default async function AdminNewProductPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const errorRaw = typeof sp.error === "string" ? sp.error : "";
  const error = errorRaw ? errMsg(decodeURIComponent(errorRaw)) : "";

  const supabase = createSupabaseAdminClient();
  const { data: categories } = await supabase.from("categories").select("id,name").order("name");

  const cats = (categories ?? []) as { id: string; name: string }[];

  return (
    <main className="py-6 lg:py-0">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Catalog</p>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Add product</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              You can add more variants and tweak images after saving. At least one variant with price and stock is required.
            </p>
          </div>
          <Link href="/admin/products" className="text-sm font-semibold text-blue-700 hover:text-blue-800">
            ← All products
          </Link>
        </div>

        {error ? (
          <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">{error}</div>
        ) : null}

        <form action={createProduct} className="mt-8 grid max-w-3xl grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Product name</label>
            <input name="name" required placeholder="e.g. Ceiling fan 56″ with remote" className={input} />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Catchy headline (optional)</label>
            <input
              name="catchy_headline"
              placeholder="e.g. Stay charged on the go — fast charge, pocket size"
              className={input}
            />
            <p className="mt-1 text-[11px] text-slate-500">Short line under the product name on the storefront.</p>
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Slug (optional)</label>
            <input name="slug" placeholder="auto from name if empty" className={monoInput} />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Description</label>
            <textarea
              name="description"
              rows={4}
              placeholder="Short sales copy — specs can go in variant titles."
              className={`${input} min-h-[6rem] resize-y py-3`}
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Category</label>
            <select name="category_id" className={input}>
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
              placeholder="e.g. Philips — new names create a brand automatically"
              className={input}
              autoComplete="off"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-slate-800">
              <input type="checkbox" name="is_active" defaultChecked className="h-4 w-4 rounded border-slate-300" />
              Visible on storefront (active)
            </label>
          </div>

          <div className="sm:col-span-2 border-t border-slate-100 pt-6">
            <h2 className="text-sm font-bold text-slate-900">Product lists</h2>
            <p className="mt-1 text-xs text-slate-500">
              Add a heading, then bullet points underneath. Use “Add point” for more lines or “Add another list” for a second
              section. Shown on the product page; price and stock are below.
            </p>
          </div>
          <div className="sm:col-span-2">
            <AdminSpecListsField inputClassName={input} />
          </div>
          <div className="sm:col-span-2 border-t border-slate-100 pt-2">
            <h2 className="text-sm font-bold text-slate-900">Price &amp; stock</h2>
            <p className="mt-1 text-xs text-slate-500">Stock code is created automatically from the product slug.</p>
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Price (PKR)</label>
            <input name="price_pkr" type="number" required min={0} step={1} placeholder="17800" className={input} />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Compare-at (PKR, optional)</label>
            <input name="compare_at_price_pkr" type="number" min={0} step={1} placeholder="19500" className={input} />
          </div>
          <div>
            <AdminStockQtyField name="stock_qty" label="Stock quantity" defaultQty={0} inputClassName={input} />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Images — URL (optional)</label>
            <input
              name="primary_image_url"
              placeholder="https://… or /photo-in-public.jpg — used only if you upload no files below"
              className={monoInput}
            />
            <label className="mt-3 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Or upload one or more images
            </label>
            <input
              name="gallery_files"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              multiple
              className={ADMIN_IMAGE_FILE_INPUT_CLASS}
            />
            <p className="mt-1 text-[11px] text-slate-500">
              {ADMIN_IMAGE_UPLOAD_HINT} Select multiple files with Ctrl or ⌘ (up to 12). The first file is the cover;
              change order later on the edit screen.
            </p>
          </div>

          <div className="sm:col-span-2 flex flex-wrap gap-3">
            <button
              type="submit"
              className="inline-flex h-11 items-center justify-center rounded-full bg-blue-600 px-8 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
            >
              Create product
            </button>
            <Link
              href="/admin/products"
              className="inline-flex h-11 items-center justify-center rounded-full border border-slate-200 px-8 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}
