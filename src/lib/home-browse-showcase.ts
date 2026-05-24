import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { PRODUCT_LISTING_SELECT } from "@/lib/product-listing-columns";
import type { Category, HomeBrowseShowcaseRow, ProductListing } from "@/lib/store-types";

export async function getHomeBrowseShowcasePayload(): Promise<{
  showcase: HomeBrowseShowcaseRow | null;
  category: Category | null;
  products: ProductListing[];
}> {
  const supabase = createSupabaseAdminClient();

  const [showcaseRes, curatedRes] = await Promise.all([
    supabase.from("home_browse_showcase").select("id,category_id,section_title,is_active").eq("id", 1).maybeSingle(),
    supabase.from("home_browse_showcase_products").select("product_id,sort_order").order("sort_order"),
  ]);

  const showcase =
    showcaseRes.error || !showcaseRes.data
      ? null
      : ({
          id: 1,
          category_id: (showcaseRes.data as HomeBrowseShowcaseRow).category_id,
          section_title: String((showcaseRes.data as HomeBrowseShowcaseRow).section_title ?? ""),
          is_active: Boolean((showcaseRes.data as HomeBrowseShowcaseRow).is_active),
        } satisfies HomeBrowseShowcaseRow);

  if (!showcase?.is_active || !showcase.category_id) {
    return { showcase, category: null, products: [] };
  }

  const ids = (curatedRes.data ?? []).map((r) => r.product_id).filter(Boolean);
  if (ids.length === 0) {
    return { showcase, category: null, products: [] };
  }

  const [{ data: category }, { data: listings }] = await Promise.all([
    supabase.from("categories").select("id,name,slug,parent_id,thumbnail_url,hero_icon_hint").eq("id", showcase.category_id).maybeSingle(),
    supabase
      .from("product_listings")
      .select(PRODUCT_LISTING_SELECT)
      .in("id", ids),
  ]);

  const list = ((listings as ProductListing[] | null) ?? []) as ProductListing[];
  const order = new Map(ids.map((id, i) => [id, i]));
  list.sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));

  return {
    showcase,
    category: (category as Category | null) ?? null,
    products: list,
  };
}
