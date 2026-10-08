import { revalidatePath } from "next/cache";

/** Bust Full Route Cache for storefront pages after admin edits. */
export function revalidatePublicStorefront() {
  revalidatePath("/", "layout");
  revalidatePath("/");
  revalidatePath("/about");
  revalidatePath("/contact");
  revalidatePath("/checkout");
  revalidatePath("/products");
  revalidatePath("/shop");
}

/** After product / category catalog changes. */
export function revalidateCatalog(productSlug?: string) {
  revalidatePublicStorefront();
  if (productSlug?.trim()) {
    revalidatePath(`/product/${productSlug.trim()}`);
  }
}
