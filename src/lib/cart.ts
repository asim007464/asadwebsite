export type CartItem = {
  variantId: string;
  productSlug: string;
  productName: string;
  variantTitle: string;
  sku: string;
  unitPricePkr: number;
  quantity: number;
  imageUrl?: string | null;
};

const CART_KEY = "asad_store_cart_v1";

export function readCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(CART_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

export function writeCart(items: CartItem[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CART_KEY, JSON.stringify(items));
}

/** Add one unit of a variant (or bump qty if already in cart). */
export function addVariantToCart(variant: {
  id: string;
  sku: string;
  title: string;
  price_pkr: number;
  product_slug: string;
  product_name: string;
  image_url?: string | null;
}): CartItem[] {
  const items = readCart();
  const existing = items.find((i) => i.variantId === variant.id);
  if (existing) {
    existing.quantity += 1;
  } else {
    items.push({
      variantId: variant.id,
      productSlug: variant.product_slug,
      productName: variant.product_name,
      variantTitle: variant.title,
      sku: variant.sku,
      unitPricePkr: variant.price_pkr,
      quantity: 1,
      imageUrl: variant.image_url ?? null,
    });
  }
  writeCart(items);
  return items;
}

export function cartSubtotal(items: CartItem[]) {
  return items.reduce((sum, it) => sum + it.unitPricePkr * it.quantity, 0);
}

