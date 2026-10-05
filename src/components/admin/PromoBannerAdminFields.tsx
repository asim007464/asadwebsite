import { BannerHeightField } from "@/components/admin/BannerHeightField";
import { PromoBannerOpacitySliders } from "@/components/admin/PromoBannerOpacitySliders";
import { ADMIN_IMAGE_FILE_INPUT_CLASS, ADMIN_IMAGE_UPLOAD_HINT } from "@/lib/admin-media-upload";
import type { HomeReviewsBannerRow } from "@/lib/store-types";

export function PromoBannerAdminFields({ row }: { row: HomeReviewsBannerRow }) {
  return (
    <>
      <input type="hidden" name="banner_id" value={String(row.id)} />

      <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/70 px-4 py-3.5 text-sm font-semibold text-slate-900">
        <input
          type="checkbox"
          name="is_active"
          defaultChecked={row.is_active}
          className="h-5 w-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
        />
        <span>
          Show this banner on the homepage
          <span className="mt-0.5 block text-xs font-medium text-slate-600">Uncheck to hide it from shoppers.</span>
        </span>
      </label>

      <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-sky-200 bg-sky-50/70 px-4 py-3.5 text-sm font-semibold text-slate-900">
        <input
          type="checkbox"
          name="visible_on_mobile"
          defaultChecked={row.visible_on_mobile !== false}
          className="h-5 w-5 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
        />
        <span>
          Visible on mobile
          <span className="mt-0.5 block text-xs font-medium text-slate-600">
            Uncheck to hide on phones (still shows on desktop/tablet).
          </span>
        </span>
      </label>

      <BannerHeightField defaultValue={row.height_px ?? 340} min={140} max={720} />

      <div>
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Background image URL</label>
        <input
          name="background_image_url"
          defaultValue={row.background_image_url}
          placeholder="https://… or /image-in-public.jpg"
          className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 font-mono text-xs outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100 md:text-sm"
        />
        <label className="mt-3 block text-xs font-semibold uppercase tracking-wide text-slate-500">Or upload from computer</label>
        <input
          name="background_image_file"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className={ADMIN_IMAGE_FILE_INPUT_CLASS}
        />
        <p className="mt-1 text-[11px] text-slate-500">{ADMIN_IMAGE_UPLOAD_HINT}</p>
      </div>

      <PromoBannerOpacitySliders
        imageOpacity={row.image_opacity ?? 100}
        overlayOpacity={row.overlay_opacity ?? 70}
      />

      <div>
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Heading</label>
        <input
          name="heading"
          defaultValue={row.heading}
          placeholder="Headline for this strip…"
          className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
        />
      </div>

      <div>
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Paragraph</label>
        <textarea
          name="paragraph"
          rows={4}
          defaultValue={row.paragraph}
          placeholder="Short supporting message…"
          className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Button label</label>
          <input
            name="button_label"
            defaultValue={row.button_label}
            placeholder="Shop now"
            className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
          />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Button link</label>
          <input
            name="button_href"
            defaultValue={row.button_href}
            placeholder="/products or https://…"
            className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 font-mono text-xs outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100 md:text-sm"
          />
        </div>
      </div>

    </>
  );
}
