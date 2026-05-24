export type ProductListing = {
  id: string;
  name: string;
  slug: string;
  description: string;
  catchy_headline?: string;
  min_price_pkr: number;
  image_url: string | null;
  /** When present (see `product_listings` view): homepage “Featured picks” pool */
  is_featured?: boolean;
  featured_sort_order?: number;
  meta_keywords?: string;
  meta_description?: string;
  /** Cheapest (default) variant for quick add-to-cart. */
  default_variant_id?: string | null;
  default_variant_sku?: string | null;
  default_variant_title?: string | null;
  default_variant_price_pkr?: number | null;
};

export type ProductVariant = {
  id: string;
  product_id: string;
  sku: string;
  title: string;
  options: Record<string, unknown>;
  price_pkr: number;
  compare_at_price_pkr: number | null;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  catchy_headline?: string;
  category_id: string | null;
  brand_id: string | null;
  is_featured?: boolean;
  featured_sort_order?: number;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  thumbnail_url?: string;
  hero_icon_hint?: string;
};

export type HeroSlideRow = {
  id: string;
  url: string;
  alt: string;
  sort_order: number;
  is_active: boolean;
};

/** Homepage promo banner row: `id = 1` after hero carousel; `id = 2` before testimonials. */
export type HomeReviewsBannerRow = {
  id: number;
  background_image_url: string;
  heading: string;
  paragraph: string;
  button_label: string;
  button_href: string;
  is_active: boolean;
};

/** Singleton row (`id = 1`) for curated category + products in the Browse categories grid. */
export type HomeBrowseShowcaseRow = {
  id: number;
  category_id: string | null;
  section_title: string;
  is_active: boolean;
};

export type HomeBrowseShowcaseProductRow = {
  id: string;
  product_id: string;
  sort_order: number;
};

/** Singleton row (`id = 1`) — full-width strip after Browse categories grid on home. */
export type HomeAfterBrowseBannerRow = {
  id: number;
  image_url: string;
  link_href: string;
  alt_text: string;
  is_active: boolean;
};

