export function formatPKR(amountPkr: number) {
  const value = Number.isFinite(amountPkr) ? amountPkr : 0;
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(value);
}

