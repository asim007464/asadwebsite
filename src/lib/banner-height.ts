import type { CSSProperties } from "react";

/** Clamp admin banner height (px) to a safe storefront range. */
export function clampBannerHeightPx(raw: unknown, fallback: number, min = 120, max = 720) {
  const n = typeof raw === "number" ? raw : Number.parseInt(String(raw ?? ""), 10);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, Math.round(n)));
}

export const DEFAULT_HERO_HEIGHT_PX = 420;
export const DEFAULT_HERO_HEIGHT_MOBILE_PX = 260;
export const DEFAULT_PROMO_BANNER_HEIGHT_PX = 340;
export const DEFAULT_PROMO_BANNER_HEIGHT_MOBILE_PX = 220;
export const DEFAULT_AFTER_BROWSE_HEIGHT_PX = 240;
export const DEFAULT_AFTER_BROWSE_HEIGHT_MOBILE_PX = 160;
export const DEFAULT_ABOUT_BANNER_HEIGHT_PX = 420;
export const DEFAULT_ABOUT_BANNER_HEIGHT_MOBILE_PX = 300;

/** Hide on phones when admin turns off mobile visibility (`md` and up still show). */
export function hideOnMobileClass(visibleOnMobile: boolean | null | undefined) {
  return visibleOnMobile === false ? "hidden md:block" : "";
}

/**
 * CSS vars for responsive banner height.
 * Pair with `BANNER_HEIGHT_CLASS` (min-height) or `BANNER_HEIGHT_FIXED_CLASS` (height).
 */
export function bannerHeightStyle(desktopPx: number, mobilePx: number): CSSProperties {
  return {
    ["--banner-h" as string]: `${mobilePx}px`,
    ["--banner-h-md" as string]: `${desktopPx}px`,
  };
}

/** min-height: mobile → desktop from `md` breakpoint */
export const BANNER_HEIGHT_CLASS =
  "min-h-[var(--banner-h)] md:min-h-[var(--banner-h-md)]";

/** fixed height: mobile → desktop from `md` breakpoint */
export const BANNER_HEIGHT_FIXED_CLASS =
  "h-[var(--banner-h)] md:h-[var(--banner-h-md)]";
