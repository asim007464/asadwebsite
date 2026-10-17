/** Clamp admin sale percent to 0–100. */
export function clampSalePercent(raw: unknown): number {
  const n = typeof raw === "number" ? raw : Number.parseFloat(String(raw ?? "").trim());
  if (!Number.isFinite(n) || n <= 0) return 0;
  if (n >= 100) return 100;
  return Math.round(n * 100) / 100;
}

/** List price after sale % off (whole PKR). */
export function salePricePkr(listPricePkr: number, salePercent: number): number {
  const list = Math.max(0, Math.round(Number(listPricePkr) || 0));
  const pct = clampSalePercent(salePercent);
  if (pct <= 0) return list;
  return Math.max(0, Math.round((list * (100 - pct)) / 100));
}

export function hasActiveSale(salePercent: number | null | undefined): boolean {
  return clampSalePercent(salePercent ?? 0) > 0;
}
