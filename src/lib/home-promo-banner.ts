import type { HomeReviewsBannerRow } from "@/lib/store-types";

export const HOME_PROMO_BANNER_AFTER_HERO_ID = 1;
export const HOME_PROMO_BANNER_BEFORE_REVIEWS_ID = 2;

export function isHomePromoBannerVisible(banner: HomeReviewsBannerRow | null | undefined): boolean {
  if (!banner?.is_active) return false;
  const bg = banner.background_image_url.trim();
  const bgOk = bg.length > 0 && (/^https:\/\//i.test(bg) || bg.startsWith("/"));
  if (!bgOk) return false;
  const heading = banner.heading.trim();
  const paragraph = banner.paragraph.trim();
  const label = banner.button_label.trim();
  return heading.length > 0 || paragraph.length > 0 || label.length > 0;
}

export function parseHomePromoBannerRow(data: unknown, id: number): HomeReviewsBannerRow {
  const row = (data ?? {}) as Partial<HomeReviewsBannerRow>;
  return {
    id,
    background_image_url: String(row.background_image_url ?? ""),
    heading: String(row.heading ?? ""),
    paragraph: String(row.paragraph ?? ""),
    button_label: String(row.button_label ?? ""),
    button_href: String(row.button_href ?? "/products"),
    is_active: Boolean(row.is_active),
  };
}
