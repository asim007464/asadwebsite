/** Clamp admin banner height (px) to a safe storefront range. */
export function clampBannerHeightPx(raw: unknown, fallback: number, min = 120, max = 720) {
  const n = typeof raw === "number" ? raw : Number.parseInt(String(raw ?? ""), 10);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, Math.round(n)));
}

export const DEFAULT_HERO_HEIGHT_PX = 420;
export const DEFAULT_PROMO_BANNER_HEIGHT_PX = 340;
export const DEFAULT_AFTER_BROWSE_HEIGHT_PX = 240;
