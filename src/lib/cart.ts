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

export function cartSubtotal(items: CartItem[]) {
  return items.reduce((sum, it) => sum + it.unitPricePkr * it.quantity, 0);
}

