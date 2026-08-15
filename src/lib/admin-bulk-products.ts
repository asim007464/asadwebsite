export const BULK_PRODUCT_MAX_ROWS = 150;

export type BulkProductInput = {
  name: string;
  slug: string;
  catchy_headline: string;
  description: string;
  category: string;
  brand: string;
  sku: string;
  price_pkr: number;
  compare_at_price_pkr: number | null;
  stock_qty: number;
  image_url: string;
  is_active: boolean;
  is_featured: boolean;
  rowNumber?: number;
};

export type BulkProductPreview = BulkProductInput & {
  rowNumber: number;
  issues: string[];
};

const HEADER_ALIASES: Record<string, keyof BulkProductInput | "price_raw" | "compare_raw" | "stock_raw" | "active_raw" | "featured_raw"> = {
  name: "name",
  product: "name",
  product_name: "name",
  slug: "slug",
  catchy_headline: "catchy_headline",
  headline: "catchy_headline",
  description: "description",
  desc: "description",
  category: "category",
  category_name: "category",
  category_slug: "category",
  brand: "brand",
  brand_name: "brand",
  sku: "sku",
  price_pkr: "price_raw",
  price: "price_raw",
  compare_at_price_pkr: "compare_raw",
  compare_price: "compare_raw",
  compare_at: "compare_raw",
  stock_qty: "stock_raw",
  stock: "stock_raw",
  qty: "stock_raw",
  image_url: "image_url",
  image: "image_url",
  is_active: "active_raw",
  active: "active_raw",
  is_featured: "featured_raw",
  featured: "featured_raw",
};

export const BULK_TEMPLATE_HEADERS = [
  "name",
  "slug",
  "catchy_headline",
  "description",
  "category",
  "brand",
  "sku",
  "price_pkr",
  "compare_at_price_pkr",
  "stock_qty",
  "image_url",
  "is_active",
  "is_featured",
] as const;

export const BULK_TEMPLATE_SAMPLE: Record<(typeof BULK_TEMPLATE_HEADERS)[number], string> = {
  name: "Ceiling Fan 56 inch",
  slug: "ceiling-fan-56-inch",
  catchy_headline: "Cool breeze for large rooms",
  description: "Copper winding, high-speed motor, 5-year warranty.",
  category: "Fans",
  brand: "Pak Fan",
  sku: "PF-56-W",
  price_pkr: "8500",
  compare_at_price_pkr: "9999",
  stock_qty: "20",
  image_url: "https://example.com/fan.jpg",
  is_active: "yes",
  is_featured: "no",
};

function normalizeHeader(raw: string) {
  return raw
    .trim()
    .toLowerCase()
    .replace(/^\uFEFF/, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
}

function cellString(value: unknown) {
  if (value == null) return "";
  return String(value).trim();
}

function parseMoney(raw: string): number | null {
  const cleaned = raw.replace(/[, ]/g, "");
  if (!cleaned) return null;
  const n = Number.parseInt(cleaned, 10);
  return Number.isFinite(n) ? n : NaN;
}

function parseBool(raw: string, fallback: boolean) {
  const t = raw.trim().toLowerCase();
  if (!t) return fallback;
  if (["yes", "y", "true", "1", "on", "live"].includes(t)) return true;
  if (["no", "n", "false", "0", "off", "hidden"].includes(t)) return false;
  return fallback;
}

export function normalizeHttpsOrSlashImage(raw: string) {
  const t = raw.trim();
  if (!t) return "";
  if (t.startsWith("/")) return t;
  return /^https:\/\//i.test(t) ? t : null;
}

export function validateBulkProductRow(row: BulkProductInput): string[] {
  const issues: string[] = [];
  if (row.name.trim().length < 2) issues.push("Name is required (min 2 characters).");
  if (!Number.isFinite(row.price_pkr) || row.price_pkr < 0) issues.push("price_pkr must be a number 0 or more.");
  if (row.compare_at_price_pkr != null && (!Number.isFinite(row.compare_at_price_pkr) || row.compare_at_price_pkr < 0)) {
    issues.push("compare_at_price_pkr must be empty or a number 0 or more.");
  }
  if (!Number.isFinite(row.stock_qty) || row.stock_qty < 0) issues.push("stock_qty must be a number 0 or more.");
  if (row.image_url && normalizeHttpsOrSlashImage(row.image_url) === null) {
    issues.push("image_url must start with https:// or /.");
  }
  return issues;
}

function mapSheetRow(raw: Record<string, unknown>, rowNumber: number): BulkProductPreview {
  const mapped: Record<string, string> = {};
  for (const [key, value] of Object.entries(raw)) {
    const alias = HEADER_ALIASES[normalizeHeader(key)];
    if (!alias) continue;
    mapped[alias] = cellString(value);
  }

  const price = parseMoney(mapped.price_raw ?? "");
  const compareRaw = (mapped.compare_raw ?? "").trim();
  const compare = compareRaw ? parseMoney(compareRaw) : null;
  const stockRaw = (mapped.stock_raw ?? "").trim();
  const stock = stockRaw ? parseMoney(stockRaw) : 0;

  const row: BulkProductInput = {
    name: mapped.name ?? "",
    slug: mapped.slug ?? "",
    catchy_headline: mapped.catchy_headline ?? "",
    description: mapped.description ?? "",
    category: mapped.category ?? "",
    brand: mapped.brand ?? "",
    sku: mapped.sku ?? "",
    price_pkr: price ?? NaN,
    compare_at_price_pkr: compareRaw ? compare : null,
    stock_qty: stock ?? NaN,
    image_url: mapped.image_url ?? "",
    is_active: parseBool(mapped.active_raw ?? "", true),
    is_featured: parseBool(mapped.featured_raw ?? "", false),
  };

  return { ...row, rowNumber, issues: validateBulkProductRow(row) };
}

export async function parseBulkProductFile(file: File): Promise<{ rows: BulkProductPreview[]; error?: string }> {
  const name = file.name.toLowerCase();
  if (!/\.(csv|xlsx|xls)$/.test(name)) {
    return { rows: [], error: "Please upload a .csv, .xlsx, or .xls file." };
  }

  const XLSX = await import("xlsx");
  const workbook = XLSX.read(await file.arrayBuffer(), { type: "array" });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) return { rows: [], error: "The file has no worksheets." };

  const sheet = workbook.Sheets[sheetName];
  const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "", raw: false });
  if (json.length === 0) return { rows: [], error: "The first sheet is empty." };
  if (json.length > BULK_PRODUCT_MAX_ROWS) {
    return {
      rows: [],
      error: `Too many rows (${json.length}). Import up to ${BULK_PRODUCT_MAX_ROWS} products at a time.`,
    };
  }

  const rows = json.map((raw, i) => mapSheetRow(raw, i + 2));
  if (!rows.some((r) => r.name || Number.isFinite(r.price_pkr))) {
    return {
      rows: [],
      error: "Could not find a name or price column. Use the template headers (name, price_pkr, …).",
    };
  }

  return { rows };
}

export function downloadBulkProductTemplate(format: "csv" | "xlsx") {
  const headers = [...BULK_TEMPLATE_HEADERS];
  const sample = headers.map((h) => BULK_TEMPLATE_SAMPLE[h]);

  void import("xlsx").then((XLSX) => {
    const workbook = XLSX.utils.book_new();
    const sheet = XLSX.utils.aoa_to_sheet([headers, sample]);
    XLSX.utils.book_append_sheet(workbook, sheet, "Products");
    XLSX.writeFile(workbook, format === "xlsx" ? "product-bulk-template.xlsx" : "product-bulk-template.csv");
  });
}
