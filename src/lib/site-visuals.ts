/**
 * Decorative backgrounds (plain URLs for `<img>` / CSS — avoid relying on Next image optimizer for SSR).
 * Picsum IDs are stable; swap for Supabase Storage or your CDN in production.
 */
export const SITE_PRODUCT_BACKDROP_URL = "https://picsum.photos/id/292/2400/1600";

export const SITE_HERO_BACKDROP_URL = "https://picsum.photos/id/312/2400/1600";

/** Used when `hero_slides` has no active rows — 5 slides until Admin → Hero fills DB. */
export const FALLBACK_HERO_BACKDROP_SLIDES: readonly { url: string; alt: string }[] = [
  { url: "https://picsum.photos/id/312/2400/1600", alt: "Hero backdrop 1" },
  { url: "https://picsum.photos/id/429/2400/1600", alt: "Hero backdrop 2" },
  { url: "https://picsum.photos/id/292/2400/1600", alt: "Hero backdrop 3" },
  { url: "https://picsum.photos/id/193/2400/1600", alt: "Hero backdrop 4" },
  { url: "https://picsum.photos/id/866/2400/1600", alt: "Hero backdrop 5" },
];
