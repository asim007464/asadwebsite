/** COD includes a flat delivery fee; prepaid orders ship free. */
export const COD_SHIPPING_PKR = 250;

export type CheckoutPaymentMethod = "cod" | "jazzcash" | "bank_transfer";

export function shippingPkrForPaymentMethod(method: CheckoutPaymentMethod): number {
  return method === "cod" ? COD_SHIPPING_PKR : 0;
}
