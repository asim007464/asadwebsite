import type { SupabaseClient } from "@supabase/supabase-js";
import type { ProductListing } from "@/lib/store-types";
import {
  PRODUCT_LISTING_SELECT_WITH_CATEGORY,
  PRODUCT_LISTING_SELECT_WITH_CATEGORY_LEGACY,
} from "@/lib/product-listing-columns";

function isCatchyHeadlineSchemaError(message: string | undefined) {
  if (!message) return false;
  const m = message.toLowerCase();
  return m.includes("catchy_headline") || (m.includes("column") && m.includes("does not exist"));
}

type ListingsResult = { data: ProductListing[] | null; count: number | null; error: string | null };

type ListingQueryResult = {
  data: unknown;
  count: number | null;
  error: { message: string } | null;
};

export async function queryProductListingsPage(
  _supabase: SupabaseClient,
  build: (select: string) => PromiseLike<ListingQueryResult>,
): Promise<ListingsResult> {
  const run = async (select: string): Promise<ListingsResult> => {
    const res = await build(select);
    return {
      data: (res.data as ProductListing[] | null) ?? null,
      count: res.count ?? null,
      error: res.error?.message ?? null,
    };
  };

  let result = await run(PRODUCT_LISTING_SELECT_WITH_CATEGORY);
  if (result.error && isCatchyHeadlineSchemaError(result.error)) {
    result = await run(PRODUCT_LISTING_SELECT_WITH_CATEGORY_LEGACY);
  }
  return result;
}
