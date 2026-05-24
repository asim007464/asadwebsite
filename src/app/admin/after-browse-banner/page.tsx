import Link from "next/link";
import { updateHomeAfterBrowseBanner } from "@/app/admin/actions";
import { ADMIN_IMAGE_FILE_INPUT_CLASS, ADMIN_IMAGE_UPLOAD_HINT } from "@/lib/admin-media-upload";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { HomeAfterBrowseBannerRow } from "@/lib/store-types";

export const dynamic = "force-dynamic";

const EMPTY_ROW: HomeAfterBrowseBannerRow = {
  id: 1,
  image_url: "",
  link_href: "",
  alt_text: "",
  is_active: false,
};

function productSlugFromHref(href: string) {
  const m = href.trim().match(/^\/product\/([^/?#]+)/i);
  return m?.[1] ? decodeURIComponent(m[1]) : "";
}

export default async function AdminAfterBrowseBannerPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const error = typeof sp.error === "string" ? sp.error : undefined;

  const supabase = createSupabaseAdminClient();
  const [{ data, error: loadError }, { data: products }] = await Promise.all([
    supabase.from("home_after_browse_banner").select("*").eq("id", 1).maybeSingle(),
    supabase.from("products").select("id,name,slug").order("name"),
  ]);

  const row =
    loadError || !data
      ? EMPTY_ROW
      : ({
          id: 1,
          image_url: String((data as HomeAfterBrowseBannerRow).image_url ?? ""),
          link_href: String((data as HomeAfterBrowseBannerRow).link_href ?? ""),
          alt_text: String((data as HomeAfterBrowseBannerRow).alt_text ?? ""),
          is_active: Boolean((data as HomeAfterBrowseBannerRow).is_active),
        } satisfies HomeAfterBrowseBannerRow);

  const selectedProductSlug = productSlugFromHref(row.link_href);
  const productList = (products as { id: string; name: string; slug: string }[] | null) ?? [];

  return (
    <main className="py-6 lg:py-0">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">After browse banner</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Full-width background image shown on the homepage <span className="font-semibold">right after</span> the Browse
              categories / product grid section (before Featured picks). Upload an image or paste an{" "}
              <span className="font-semibold">https://</span> URL. Link is optional — leave blank for a display-only banner.
            </p>
          </div>
          <Link href="/admin" className="text-sm font-semibold text-blue-700 hover:text-blue-800">
            ← Dashboard
          </Link>
        </div>

        {loadError ? (
          <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-950">
            Could not load settings ({loadError.message}). Run{" "}
            <span className="font-mono text-xs">home_after_browse_banner</span> migration in Supabase, then refresh.
          </div>
        ) : null}

        {error === "invalid-image-url" ? (
          <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">
            Image URL must start with <span className="font-mono text-xs">https://</span>, a site path, or be uploaded.
          </div>
        ) : null}
        {error === "invalid-link-href" ? (
          <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">
            Link must be a product, a path like <span className="font-mono text-xs">/products</span>, or{" "}
            <span className="font-mono text-xs">https://…</span>.
          </div>
        ) : null}
        {error && !["invalid-image-url", "invalid-link-href"].includes(error) ? (
          <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">
            {error}
          </div>
        ) : null}

        {row.image_url ? (
          <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
            <div
              className="aspect-[2.8/1] w-full bg-cover bg-center"
              style={{ backgroundImage: `url(${JSON.stringify(row.image_url.trim()).slice(1, -1)})` }}
              role="img"
              aria-label={row.alt_text || "Preview"}
            />
          </div>
        ) : null}

        <form action={updateHomeAfterBrowseBanner} className="mt-8 grid grid-cols-1 gap-5 border-t border-slate-100 pt-8 md:gap-6">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Banner image URL</label>
            <input
              name="image_url"
              defaultValue={row.image_url}
              placeholder="https://… or /image-in-public.jpg"
              className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 font-mono text-xs outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100 md:text-sm"
            />
            <label className="mt-3 block text-xs font-semibold uppercase tracking-wide text-slate-500">Or upload from computer</label>
            <input
              name="image_file"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className={ADMIN_IMAGE_FILE_INPUT_CLASS}
            />
            <p className="mt-1 text-[11px] text-slate-500">{ADMIN_IMAGE_UPLOAD_HINT}</p>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Link to product (optional)</label>
            <select
              name="product_slug"
              defaultValue={selectedProductSlug}
              className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
            >
              <option value="">— No product link / custom below —</option>
              {productList.map((p) => (
                <option key={p.id} value={p.slug}>
                  {p.name} ({p.slug})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Custom link (optional)</label>
            <input
              name="link_href"
              defaultValue={selectedProductSlug ? "" : row.link_href}
              placeholder="/product/my-slug or /products"
              className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 font-mono text-xs outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100 md:text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Image description (accessibility)</label>
            <input
              name="alt_text"
              defaultValue={row.alt_text}
              placeholder="Describe the banner for screen readers"
              className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
            />
          </div>

          <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800">
            <input type="checkbox" name="is_active" defaultChecked={row.is_active} className="h-4 w-4 rounded border-slate-300" />
            Show on storefront (needs an image)
          </label>

          <button
            type="submit"
            className="inline-flex h-12 max-w-xs items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
          >
            Save
          </button>
        </form>
      </div>
    </main>
  );
}
