import { clampBannerHeightPx, DEFAULT_PROMO_BANNER_HEIGHT_PX } from "@/lib/banner-height";
import type { HomeReviewsBannerRow } from "@/lib/store-types";

export const HOME_PROMO_BANNER_AFTER_HERO_ID = 1;
export const HOME_PROMO_BANNER_BEFORE_REVIEWS_ID = 2;

export function isHomePromoBannerVisible(banner: HomeReviewsBannerRow | null | undefined): boolean {
  if (!banner?.is_active) return false;
  const bg = banner.background_image_url.trim();
  return bg.length > 0 && (/^https:\/\//i.test(bg) || bg.startsWith("/"));
}

function clampPct(raw: unknown, fallback: number) {
  const n = typeof raw === "number" ? raw : Number.parseInt(String(raw ?? ""), 10);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(100, Math.max(0, Math.round(n)));
}

export function parseHomePromoBannerRow(data: unknown, id: number): HomeReviewsBannerRow {
  const row = (data ?? {}) as Partial<HomeReviewsBannerRow>;
  const height_px = clampBannerHeightPx(row.height_px, DEFAULT_PROMO_BANNER_HEIGHT_PX, 140, 720);
  return {
    id,
    background_image_url: String(row.background_image_url ?? ""),
    background_image_mobile_url: String(row.background_image_mobile_url ?? ""),
    separate_mobile_image: Boolean(row.separate_mobile_image),
    heading: String(row.heading ?? ""),
    paragraph: String(row.paragraph ?? ""),
    button_label: String(row.button_label ?? ""),
    button_href: String(row.button_href ?? "/products"),
    image_opacity: clampPct(row.image_opacity, 100),
    overlay_opacity: clampPct(row.overlay_opacity, 70),
    height_px,
    height_mobile_px: clampBannerHeightPx(
      row.height_mobile_px,
      Math.max(140, Math.round(height_px * 0.65)),
      120,
      720,
    ),
    visible_on_mobile: row.visible_on_mobile !== false,
    is_active: Boolean(row.is_active),
  };
}
