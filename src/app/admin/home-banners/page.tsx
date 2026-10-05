import Link from "next/link";
import type { ReactNode } from "react";
import { updateHomeBannersHub } from "@/app/admin/actions";
import { BannerHeightField } from "@/components/admin/BannerHeightField";
import {
  DEFAULT_AFTER_BROWSE_HEIGHT_PX,
  DEFAULT_HERO_HEIGHT_PX,
  DEFAULT_PROMO_BANNER_HEIGHT_PX,
  clampBannerHeightPx,
} from "@/lib/banner-height";
import {
  HOME_PROMO_BANNER_AFTER_HERO_ID,
  HOME_PROMO_BANNER_BEFORE_REVIEWS_ID,
  parseHomePromoBannerRow,
} from "@/lib/home-promo-banner";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getStorefrontPayload } from "@/lib/storefront";
import type { HomeAfterBrowseBannerRow, HomeBrowseShowcaseRow } from "@/lib/store-types";

export const dynamic = "force-dynamic";

function ActiveToggle({
  name,
  defaultChecked,
  label,
}: {
  name: string;
  defaultChecked: boolean;
  label: string;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/70 px-4 py-3 text-sm font-semibold text-slate-900">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="h-5 w-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
      />
      <span>
        {label}
        <span className="mt-0.5 block text-xs font-medium text-slate-600">Uncheck to hide on the homepage.</span>
      </span>
    </label>
  );
}

function BannerCard({
  title,
  description,
  editHref,
  children,
}: {
  title: string;
  description: string;
  editHref: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-slate-900">{title}</h2>
          <p className="mt-1 text-sm text-slate-600">{description}</p>
        </div>
        <Link href={editHref} className="text-sm font-semibold text-blue-700 hover:text-blue-800">
          Edit content →
        </Link>
      </div>
      <div className="mt-5 space-y-4 border-t border-slate-100 pt-5">{children}</div>
    </section>
  );
}

export default async function AdminHomeBannersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const saved = sp.saved === "1";
  const error = typeof sp.error === "string" ? sp.error : undefined;

  const supabase = createSupabaseAdminClient();
  const [storefront, promoRes, afterRes, showcaseRes] = await Promise.all([
    getStorefrontPayload(),
    supabase
      .from("home_reviews_banner")
      .select("id,background_image_url,heading,paragraph,button_label,button_href,image_opacity,overlay_opacity,height_px,is_active")
      .in("id", [1, 2]),
    supabase.from("home_after_browse_banner").select("id,image_url,link_href,alt_text,height_px,is_active").eq("id", 1).maybeSingle(),
    supabase.from("home_browse_showcase").select("id,category_id,section_title,is_active").eq("id", 1).maybeSingle(),
  ]);

  const promo1 = parseHomePromoBannerRow(
    (promoRes.data ?? []).find((r) => Number((r as { id: number }).id) === HOME_PROMO_BANNER_AFTER_HERO_ID),
    HOME_PROMO_BANNER_AFTER_HERO_ID,
  );
  const promo2 = parseHomePromoBannerRow(
    (promoRes.data ?? []).find((r) => Number((r as { id: number }).id) === HOME_PROMO_BANNER_BEFORE_REVIEWS_ID),
    HOME_PROMO_BANNER_BEFORE_REVIEWS_ID,
  );

  const afterBrowse = afterRes.data
    ? ({
        id: 1,
        image_url: String((afterRes.data as HomeAfterBrowseBannerRow).image_url ?? ""),
        link_href: String((afterRes.data as HomeAfterBrowseBannerRow).link_href ?? ""),
        alt_text: String((afterRes.data as HomeAfterBrowseBannerRow).alt_text ?? ""),
        height_px: clampBannerHeightPx(
          (afterRes.data as HomeAfterBrowseBannerRow).height_px,
          DEFAULT_AFTER_BROWSE_HEIGHT_PX,
          120,
          640,
        ),
        is_active: Boolean((afterRes.data as HomeAfterBrowseBannerRow).is_active),
      } satisfies HomeAfterBrowseBannerRow)
    : {
        id: 1,
        image_url: "",
        link_href: "",
        alt_text: "",
        height_px: DEFAULT_AFTER_BROWSE_HEIGHT_PX,
        is_active: false,
      };

  const showcase = showcaseRes.data
    ? ({
        id: 1,
        category_id: (showcaseRes.data as HomeBrowseShowcaseRow).category_id,
        section_title: String((showcaseRes.data as HomeBrowseShowcaseRow).section_title ?? ""),
        is_active: Boolean((showcaseRes.data as HomeBrowseShowcaseRow).is_active),
      } satisfies HomeBrowseShowcaseRow)
    : { id: 1, category_id: null, section_title: "", is_active: false };

  const heroEnabled = storefront.heroEnabled !== false;
  const heroHeightPx = clampBannerHeightPx(storefront.heroHeightPx, DEFAULT_HERO_HEIGHT_PX, 200, 720);

  return (
    <main className="py-6 lg:py-0">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-600/90">Homepage</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">Home banners</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Show or hide every homepage banner and set image height. Use <span className="font-semibold">Edit content</span>{" "}
              on each card to change images, copy, and links.
            </p>
          </div>
          <Link href="/admin" className="text-sm font-semibold text-blue-700 hover:text-blue-800">
            ← Dashboard
          </Link>
        </div>

        {promoRes.error || afterRes.error ? (
          <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-950">
            Could not load all banner settings. Run{" "}
            <span className="font-mono text-xs">supabase/migrations/20260523200000_banner_heights.sql</span> in Supabase if
            height fields are missing.
          </div>
        ) : null}

        {saved ? (
          <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-900">
            Banner visibility and heights saved.
          </div>
        ) : null}
        {error ? (
          <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">
            {error}
          </div>
        ) : null}

        <form action={updateHomeBannersHub} className="mt-8 space-y-5">
          <BannerCard
            title="1. Hero carousel"
            description="Top full-width image slider."
            editHref="/admin/hero"
          >
            <ActiveToggle name="hero_enabled" defaultChecked={heroEnabled} label="Show hero carousel" />
            <BannerHeightField
              name="hero_height_px"
              defaultValue={heroHeightPx}
              min={200}
              max={720}
              label="Hero height"
            />
          </BannerCard>

          <BannerCard
            title="2. Promo banner (after hero)"
            description="Strip under the hero with heading, text, and button."
            editHref="/admin/reviews-banner"
          >
            <ActiveToggle
              name={`promo_${HOME_PROMO_BANNER_AFTER_HERO_ID}_active`}
              defaultChecked={promo1.is_active}
              label="Show promo banner 1"
            />
            <BannerHeightField
              name={`promo_${HOME_PROMO_BANNER_AFTER_HERO_ID}_height_px`}
              defaultValue={promo1.height_px ?? DEFAULT_PROMO_BANNER_HEIGHT_PX}
              min={140}
              max={720}
            />
          </BannerCard>

          <BannerCard
            title="3. Browse grid"
            description="Curated category product grid (no image height — show/hide only)."
            editHref="/admin/browse-showcase"
          >
            <ActiveToggle
              name="browse_showcase_active"
              defaultChecked={showcase.is_active}
              label="Show browse categories grid"
            />
          </BannerCard>

          <BannerCard
            title="4. After browse banner"
            description="Wide image under the browse grid."
            editHref="/admin/after-browse-banner"
          >
            <ActiveToggle
              name="after_browse_active"
              defaultChecked={afterBrowse.is_active}
              label="Show after-browse banner"
            />
            <BannerHeightField
              name="after_browse_height_px"
              defaultValue={afterBrowse.height_px}
              min={120}
              max={640}
            />
          </BannerCard>

          <BannerCard
            title="5. Promo banner (before reviews)"
            description="Lower homepage promo strip above customer reviews."
            editHref="/admin/reviews-banner"
          >
            <ActiveToggle
              name={`promo_${HOME_PROMO_BANNER_BEFORE_REVIEWS_ID}_active`}
              defaultChecked={promo2.is_active}
              label="Show promo banner 2"
            />
            <BannerHeightField
              name={`promo_${HOME_PROMO_BANNER_BEFORE_REVIEWS_ID}_height_px`}
              defaultValue={promo2.height_px ?? DEFAULT_PROMO_BANNER_HEIGHT_PX}
              min={140}
              max={720}
            />
          </BannerCard>

          <button
            type="submit"
            className="inline-flex h-12 min-w-[12rem] items-center justify-center rounded-full bg-blue-600 px-8 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
          >
            Save all banner settings
          </button>
        </form>
      </div>
    </main>
  );
}
