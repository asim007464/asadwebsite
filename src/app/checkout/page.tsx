import { getStorefrontPayload } from "@/lib/storefront";
import { CheckoutClient } from "./CheckoutClient";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const storefront = await getStorefrontPayload();
  return <CheckoutClient storefront={storefront} />;
}
