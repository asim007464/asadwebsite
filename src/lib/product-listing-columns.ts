/** Columns shared by all `product_listings` queries (keep in sync with `supabase/schema.sql` view). */
export const PRODUCT_LISTING_SELECT =
  "id,name,slug,description,catchy_headline,min_price_pkr,image_url,is_featured,featured_sort_order,default_variant_id,default_variant_sku,default_variant_title,default_variant_price_pkr";

export const PRODUCT_LISTING_SELECT_WITH_CATEGORY =
  `${PRODUCT_LISTING_SELECT},category_id`;

/** Use when `catchy_headline` / view migration is not applied yet. */
export const PRODUCT_LISTING_SELECT_WITH_CATEGORY_LEGACY =
  "id,name,slug,description,min_price_pkr,image_url,is_featured,featured_sort_order,default_variant_id,default_variant_sku,default_variant_title,default_variant_price_pkr,category_id";
