import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { PRODUCT_LISTING_SELECT } from "@/lib/product-listing-columns";
import type { ProductListing } from "@/lib/store-types";

export type HomeSection = "featured" | "gadgets";

/**
 * Curated homepage strip: use `homepage_section_products` when rows exist,
 * otherwise fall back to featured flag or plain catalog listing.
 */
export async function getHomeSectionListings(section: HomeSection, catalogFallbackLimit: number): Promise<{
  rows: ProductListing[];
  source: "curated" | "featured" | "catalog";
}> {
  const supabase = createSupabaseAdminClient();

  const curated = await supabase
    .from("homepage_section_products")
    .select("product_id,sort_order")
    .eq("section", section)
    .order("sort_order", { ascending: true });

  const ids = (curated.data ?? []).map((r) => r.product_id).filter(Boolean);
  if (ids.length > 0) {
    const { data: listings } = await supabase
      .from("product_listings")
      .select(PRODUCT_LISTING_SELECT)
      .in("id", ids);

    const list = ((listings as ProductListing[] | null) ?? []) as ProductListing[];
    const order = new Map(ids.map((id, i) => [id, i]));
    list.sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));
    return { rows: list, source: "curated" };
  }

  if (section === "featured") {
    const featured = await supabase
      .from("product_listings")
      .select(PRODUCT_LISTING_SELECT)
      .eq("is_featured", true)
      .order("featured_sort_order", { ascending: true })
      .order("name", { ascending: true })
      .limit(48);
    if (!featured.error && featured.data?.length) {
      return { rows: featured.data as ProductListing[], source: "featured" };
    }
  }

  const fb = await supabase
    .from("product_listings")
    .select(PRODUCT_LISTING_SELECT)
    .order("name", { ascending: true })
    .limit(catalogFallbackLimit);

  return {
    rows: ((fb.data as ProductListing[] | null) ?? []) as ProductListing[],
    source: "catalog",
  };
}
