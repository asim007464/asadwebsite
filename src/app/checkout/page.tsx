import { getStorefrontPayload } from "@/lib/storefront";
import { CheckoutClient } from "./CheckoutClient";

export default async function CheckoutPage() {
  const storefront = await getStorefrontPayload();
  return <CheckoutClient storefront={storefront} />;
}
