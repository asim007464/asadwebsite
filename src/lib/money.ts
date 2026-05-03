/** Upper bound for catalog min/max price filters (PKR). */
export const PRICE_FILTER_MAX_PKR = 100_000;

/** Sanitize numeric price filter input and clamp to [0, {@link PRICE_FILTER_MAX_PKR}]. */
export function clampPriceFilterInput(raw: string): string {
  const digits = raw.replace(/[^\d]/g, "");
  if (!digits) return "";
  const n = Number(digits);
  if (!Number.isFinite(n)) return "";
  return String(Math.min(PRICE_FILTER_MAX_PKR, Math.max(0, n)));
}

export function formatPKR(amountPkr: number) {
  const value = Number.isFinite(amountPkr) ? amountPkr : 0;
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(value);
}

