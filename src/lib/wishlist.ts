/** Local-only wishlist (variant ids) — persists like the cart */

export type WishlistItem = {
  variantId: string;
  productSlug: string;
  productName: string;
  variantTitle: string;
  sku: string;
  unitPricePkr: number;
  imageUrl?: string | null;
};

const KEY = "asad_store_wishlist_v1";

export function readWishlist(): WishlistItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

export function writeWishlist(items: WishlistItem[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(items));
}

export function wishlistToggle(item: WishlistItem): { added: boolean; items: WishlistItem[] } {
  const prev = readWishlist();
  const idx = prev.findIndex((x) => x.variantId === item.variantId);
  if (idx >= 0) {
    prev.splice(idx, 1);
    writeWishlist(prev);
    return { added: false, items: prev };
  }
  prev.push(item);
  writeWishlist(prev);
  return { added: true, items: prev };
}

export function wishlistContains(variantId: string) {
  return readWishlist().some((x) => x.variantId === variantId);
}

export function wishlistItemCount(items = readWishlist()) {
  return items.length;
}
