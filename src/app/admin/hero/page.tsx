import Link from "next/link";
import { SafeRemoteImage } from "@/components/SafeRemoteImage";
import {
  createHeroSlide,
  deleteHeroSlide,
  updateHeroCarouselLayout,
  updateHeroSlide,
} from "@/app/admin/actions";
import { BannerHeightField } from "@/components/admin/BannerHeightField";
import { ADMIN_IMAGE_FILE_INPUT_CLASS, ADMIN_IMAGE_UPLOAD_HINT } from "@/lib/admin-media-upload";
import { clampBannerHeightPx, DEFAULT_HERO_HEIGHT_PX } from "@/lib/banner-height";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getStorefrontPayload } from "@/lib/storefront";
import type { HeroSlideRow } from "@/lib/store-types";

export const dynamic = "force-dynamic";

export default async function AdminHeroSlidesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const error = typeof sp.error === "string" ? sp.error : undefined;
  const saved = sp.saved === "1";

  const supabase = createSupabaseAdminClient();
  const [{ data: rows, error: loadError }, storefront] = await Promise.all([
    supabase.from("hero_slides").select("id,url,alt,sort_order,is_active").order("sort_order"),
    getStorefrontPayload(),
  ]);

  const slides = (rows as HeroSlideRow[] | null) ?? [];
  const heroEnabled = storefront.heroEnabled !== false;
  const heroVisibleOnMobile = storefront.heroVisibleOnMobile !== false;
  const heroHeightPx = clampBannerHeightPx(storefront.heroHeightPx, DEFAULT_HERO_HEIGHT_PX, 200, 720);

  return (
    <main className="py-6 lg:py-0">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Hero slides</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Background images on the home hero crossfade automatically (about every 5½ seconds). Only rows marked{" "}
              <span className="font-semibold">Active</span> are visible to shoppers. Use an <span className="font-semibold">https://</span> image URL or upload a file from your computer.
            </p>
          </div>
          <div className="flex flex-col items-start gap-2 sm:items-end">
            <Link href="/admin/home-banners" className="text-sm font-semibold text-blue-700 hover:text-blue-800">
              All home banners →
            </Link>
            <Link href="/admin" className="text-sm font-semibold text-slate-500 hover:text-slate-800">
              ← Dashboard
            </Link>
          </div>
        </div>

        {saved ? (
          <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-900">
            Hero layout saved.
          </div>
        ) : null}

        <form
          action={updateHeroCarouselLayout}
          className="mt-6 space-y-4 rounded-3xl border border-slate-200 bg-slate-50/80 p-5"
        >
          <input type="hidden" name="redirect_to" value="/admin/hero" />
          <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/70 px-4 py-3.5 text-sm font-semibold text-slate-900">
            <input
              type="checkbox"
              name="hero_enabled"
              defaultChecked={heroEnabled}
              className="h-5 w-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            />
            <span>
              Show hero carousel on homepage
              <span className="mt-0.5 block text-xs font-medium text-slate-600">Uncheck to hide the whole top banner.</span>
            </span>
          </label>
          <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-sky-200 bg-sky-50/70 px-4 py-3.5 text-sm font-semibold text-slate-900">
            <input
              type="checkbox"
              name="hero_visible_on_mobile"
              defaultChecked={heroVisibleOnMobile}
              className="h-5 w-5 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
            />
            <span>
              Visible on mobile
              <span className="mt-0.5 block text-xs font-medium text-slate-600">
                Uncheck to hide on phones (still shows on desktop/tablet).
              </span>
            </span>
          </label>
          <BannerHeightField
            name="hero_height_px"
            defaultValue={heroHeightPx}
            min={200}
            max={720}
            label="Hero height"
          />
          <button
            type="submit"
            className="inline-flex h-11 items-center justify-center rounded-full bg-blue-600 px-6 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Save hero layout
          </button>
        </form>

        {loadError ? (
          <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-950">
            Could not load hero slides ({loadError.message}). Apply the <span className="font-mono text-xs">hero_slides</span> section from{" "}
            <span className="font-mono text-xs">supabase/schema.sql</span> in the Supabase SQL editor, then refresh.
          </div>
        ) : null}

        {error ? (
          <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">
            {error === "invalid-url" ? "Add an https:// image URL, a path starting with /, or upload a file." : error}
          </div>
        ) : null}

        <form
          action={createHeroSlide}
          className="mt-6 grid grid-cols-1 gap-3 rounded-3xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-12 sm:p-5"
        >
          <div className="sm:col-span-5">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Image URL (https)</label>
            <input
              name="url"
              placeholder="https://…"
              className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
            />
            <label className="mt-3 block text-xs font-semibold uppercase tracking-wide text-slate-500">Or upload</label>
            <input name="image_file" type="file" accept="image/jpeg,image/png,image/webp,image/gif" className={ADMIN_IMAGE_FILE_INPUT_CLASS} />
            <p className="mt-1 text-[11px] text-slate-500">{ADMIN_IMAGE_UPLOAD_HINT}</p>
          </div>
          <div className="sm:col-span-4">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Alt text</label>
            <input
              name="alt"
              placeholder="Short description (accessibility)"
              className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Sort order</label>
            <input
              name="sort_order"
              type="number"
              defaultValue={slides.length}
              className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
            />
          </div>
          <div className="flex items-end sm:col-span-1">
            <button
              type="submit"
              className="inline-flex h-12 w-full items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
            >
              Add
            </button>
          </div>
        </form>

        <div className="mt-8 hidden space-y-6 lg:block">
          {slides.map((s) => (
            <div key={s.id} className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
              <div className="grid grid-cols-[140px_1fr] gap-0 border-b border-slate-100">
                <div className="relative h-28 bg-slate-100">
                  <SafeRemoteImage src={s.url} alt="" fill className="object-cover" sizes="140px" />
                </div>
                <div className="p-4">
                  <form id={`hero-slide-edit-${s.id}`} action={updateHeroSlide} className="grid gap-3 sm:grid-cols-12">
                    <input type="hidden" name="id" value={s.id} />
                    <div className="sm:col-span-5">
                      <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">URL</label>
                      <input
                        name="url"
                        defaultValue={s.url}
                        className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3 font-mono text-xs outline-none focus:border-blue-300"
                      />
                      <label className="mt-2 block text-[10px] font-semibold uppercase tracking-wide text-slate-500">Upload</label>
                      <input name="image_file" type="file" accept="image/jpeg,image/png,image/webp,image/gif" className={ADMIN_IMAGE_FILE_INPUT_CLASS} />
                    </div>
                    <div className="sm:col-span-3">
                      <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Alt</label>
                      <input
                        name="alt"
                        defaultValue={s.alt}
                        className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-blue-300"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Sort</label>
                      <input
                        name="sort_order"
                        type="number"
                        defaultValue={s.sort_order}
                        className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-blue-300"
                      />
                    </div>
                    <div className="flex items-end sm:col-span-2">
                      <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-slate-800">
                        <input type="checkbox" name="is_active" defaultChecked={s.is_active} className="h-4 w-4 rounded border-slate-300" />
                        Active
                      </label>
                    </div>
                  </form>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="submit"
                      form={`hero-slide-edit-${s.id}`}
                      className="rounded-full bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                    >
                      Save
                    </button>
                    <form action={deleteHeroSlide} className="inline">
                      <input type="hidden" name="id" value={s.id} />
                      <button
                        type="submit"
                        className="rounded-full border border-red-200 px-4 py-2 text-xs font-semibold text-red-700 hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 grid gap-4 lg:hidden">
          {slides.map((s) => (
            <div key={s.id} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="relative mx-auto aspect-[16/10] w-full max-w-sm overflow-hidden rounded-2xl bg-slate-100">
                <SafeRemoteImage src={s.url} alt="" fill className="object-cover" sizes="(max-width:400px) 100vw, 400px" />
              </div>
              <form id={`hero-slide-edit-m-${s.id}`} action={updateHeroSlide} className="mt-4 space-y-3">
                <input type="hidden" name="id" value={s.id} />
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">URL</label>
                  <input
                    name="url"
                    defaultValue={s.url}
                    className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3 font-mono text-[11px] outline-none focus:border-blue-300"
                  />
                  <label className="mt-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">Or upload</label>
                  <input name="image_file" type="file" accept="image/jpeg,image/png,image/webp,image/gif" className={ADMIN_IMAGE_FILE_INPUT_CLASS} />
                  <p className="mt-1 text-[11px] text-slate-500">{ADMIN_IMAGE_UPLOAD_HINT}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Alt</label>
                  <input name="alt" defaultValue={s.alt} className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-blue-300" />
                </div>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Sort</label>
                    <input
                      name="sort_order"
                      type="number"
                      defaultValue={s.sort_order}
                      className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-blue-300"
                    />
                  </div>
                  <label className="mt-6 flex shrink-0 items-center gap-2 text-sm font-semibold text-slate-800">
                    <input type="checkbox" name="is_active" defaultChecked={s.is_active} className="h-4 w-4 rounded border-slate-300" />
                    Active
                  </label>
                </div>
              </form>
              <div className="flex flex-wrap gap-2 pt-3">
                <button
                  type="submit"
                  form={`hero-slide-edit-m-${s.id}`}
                  className="rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  Save changes
                </button>
                <form action={deleteHeroSlide} className="inline">
                  <input type="hidden" name="id" value={s.id} />
                  <button
                    type="submit"
                    className="rounded-full border border-red-200 px-5 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>

        {slides.length === 0 ? (
          <p className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-600">
            No slides yet — add one above, or run <span className="font-mono text-xs">seed.sql</span> in Supabase for demo images.
          </p>
        ) : null}
      </div>
    </main>
  );
}
