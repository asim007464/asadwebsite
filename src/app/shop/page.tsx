import { redirect } from "next/navigation";

/** Alias for the catalog (“Shop”) page; filters use the same layout as `/products`. */
export default function ShopPage() {
  redirect("/products");
}
