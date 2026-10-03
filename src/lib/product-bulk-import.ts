/** Spreadsheet bulk import for catalog products (Google Sheets → CSV/TSV export). */

export const BULK_IMPORT_ACCEPTED_EXTENSIONS = [".csv", ".tsv"] as const;

export const BULK_IMPORT_ACCEPT_ATTR =
  ".csv,.tsv,text/csv,text/tab-separated-values,application/vnd.ms-excel";

export const BULK_IMPORT_MAX_BYTES = 2 * 1024 * 1024;

export const BULK_IMPORT_MAX_ROWS = 200;

export const BULK_IMPORT_TEMPLATE_COLUMNS = [
  "name",
  "slug",
  "price_pkr",
  "stock_qty",
  "compare_at_price_pkr",
  "description",
  "catchy_headline",
  "category",
  "brand",
  "sku",
  "is_active",
  "image_url",
  "spec_lists_json",
] as const;

export type ParsedBulkProductRow = {
  rowNumber: number;
  name: string;
  slug: string;
  pricePkr: number;
  stockQty: number;
  compareAtPricePkr: number | null;
  description: string;
  catchyHeadline: string;
  category: string;
  brand: string;
  sku: string;
  isActive: boolean;
  imageUrls: string[];
  specListsJson: string;
  variantTitle: string;
};

export type BulkSpreadsheetParseResult = {
  rows: ParsedBulkProductRow[];
  errors: { row: number; message: string }[];
};

const HEADER_ALIASES: Record<string, string> = {
  name: "name",
  product_name: "name",
  product: "name",
  title: "name",
  slug: "slug",
  price_pkr: "price_pkr",
  price: "price_pkr",
  pricepkr: "price_pkr",
  stock_qty: "stock_qty",
  stock: "stock_qty",
  quantity: "stock_qty",
  qty: "stock_qty",
  compare_at_price_pkr: "compare_at_price_pkr",
  compare_at: "compare_at_price_pkr",
  compare_price: "compare_at_price_pkr",
  mrp: "compare_at_price_pkr",
  description: "description",
  desc: "description",
  catchy_headline: "catchy_headline",
  headline: "catchy_headline",
  catchy: "catchy_headline",
  category: "category",
  category_name: "category",
  category_slug: "category",
  brand: "brand",
  brand_name: "brand",
  sku: "sku",
  stock_code: "sku",
  is_active: "is_active",
  active: "is_active",
  visible: "is_active",
  live: "is_active",
  image_url: "image_url",
  image: "image_url",
  primary_image_url: "image_url",
  image_urls: "image_urls",
  spec_lists_json: "spec_lists_json",
  specs_json: "spec_lists_json",
  spec_lists: "spec_lists_json",
  variant_title: "variant_title",
};

export function slugifyCatalogSlug(name: string, slugInput: string) {
  const raw = slugInput.trim();
  if (raw.length) {
    return raw
      .toLowerCase()
      .replace(/&/g, "and")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }
  return name
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function defaultVariantSkuFromSlug(productSlug: string) {
  const base =
    productSlug
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 48) || "ITEM";
  return base;
}

function normalizeHeader(raw: string) {
  return raw
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^\w_]/g, "");
}

function detectDelimiter(text: string, filename: string) {
  if (filename.toLowerCase().endsWith(".tsv")) return "\t";
  const firstLine = text.split(/\r?\n/, 1)[0] ?? "";
  const tabs = (firstLine.match(/\t/g) ?? []).length;
  const commas = (firstLine.match(/,/g) ?? []).length;
  return tabs > commas ? "\t" : ",";
}

/** Minimal RFC-style CSV/TSV parser (quoted fields, escaped quotes). */
export function parseDelimitedSpreadsheet(text: string, delimiter: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  const pushField = () => {
    row.push(field);
    field = "";
  };

  const pushRow = () => {
    if (row.length === 1 && row[0] === "" && rows.length > 0) return;
    rows.push(row);
    row = [];
  };

  const src = text.replace(/^\uFEFF/, "");

  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (inQuotes) {
      if (c === '"') {
        if (src[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
      continue;
    }

    if (c === '"') {
      inQuotes = true;
    } else if (c === delimiter) {
      pushField();
    } else if (c === "\n") {
      pushField();
      pushRow();
    } else if (c === "\r") {
      if (src[i + 1] === "\n") i++;
      pushField();
      pushRow();
    } else {
      field += c;
    }
  }

  if (field.length > 0 || row.length > 0) {
    pushField();
    pushRow();
  }

  return rows.filter((r) => r.some((cell) => cell.trim().length > 0));
}

function parseBool(raw: string, fallback = true) {
  const t = raw.trim().toLowerCase();
  if (!t) return fallback;
  if (["1", "true", "yes", "y", "live", "active", "on"].includes(t)) return true;
  if (["0", "false", "no", "n", "hidden", "inactive", "off"].includes(t)) return false;
  return fallback;
}

function parseOptionalInt(raw: string): number | null {
  const t = raw.trim();
  if (!t) return null;
  const n = Number.parseInt(t, 10);
  if (!Number.isFinite(n) || n < 0) return null;
  return n;
}

function splitImageUrls(raw: string): string[] {
  const t = raw.trim();
  if (!t) return [];
  return t
    .split(/[|;]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function parseProductBulkSpreadsheet(text: string, filename: string): BulkSpreadsheetParseResult {
  const delimiter = detectDelimiter(text, filename);
  const grid = parseDelimitedSpreadsheet(text, delimiter);
  const errors: { row: number; message: string }[] = [];

  if (grid.length < 2) {
    return {
      rows: [],
      errors: [{ row: 1, message: "Spreadsheet must have a header row and at least one product row." }],
    };
  }

  const headerRow = grid[0];
  const columnKeys = headerRow.map((h) => {
    const norm = normalizeHeader(h);
    return HEADER_ALIASES[norm] ?? norm;
  });

  const imageUrlColumns: number[] = [];
  for (let i = 0; i < columnKeys.length; i++) {
    const key = columnKeys[i];
    if (key === "image_url" || /^image_url_\d+$/.test(key)) {
      imageUrlColumns.push(i);
    }
  }

  const hasNameCol = columnKeys.includes("name");
  const hasPriceCol = columnKeys.includes("price_pkr");
  if (!hasNameCol || !hasPriceCol) {
    return {
      rows: [],
      errors: [
        {
          row: 1,
          message: 'Header row must include at least "name" and "price_pkr" columns (see template).',
        },
      ],
    };
  }

  const dataRows = grid.slice(1);
  if (dataRows.length > BULK_IMPORT_MAX_ROWS) {
    return {
      rows: [],
      errors: [
        {
          row: 0,
          message: `Too many rows (${dataRows.length}). Maximum ${BULK_IMPORT_MAX_ROWS} products per upload.`,
        },
      ],
    };
  }

  const rows: ParsedBulkProductRow[] = [];

  for (let r = 0; r < dataRows.length; r++) {
    const cells = dataRows[r];
    const rowNumber = r + 2;
    const record: Record<string, string> = {};
    for (let c = 0; c < columnKeys.length; c++) {
      record[columnKeys[c]] = (cells[c] ?? "").trim();
    }

    const name = record.name ?? "";
    if (!name) {
      errors.push({ row: rowNumber, message: "Missing product name." });
      continue;
    }
    if (name.length < 2) {
      errors.push({ row: rowNumber, message: "Product name must be at least 2 characters." });
      continue;
    }

    const pricePkr = parseOptionalInt(record.price_pkr ?? "");
    if (pricePkr === null) {
      errors.push({ row: rowNumber, message: "price_pkr must be a whole number ≥ 0." });
      continue;
    }

    const compareRaw = record.compare_at_price_pkr ?? "";
    const compareAtPricePkr = compareRaw ? parseOptionalInt(compareRaw) : null;
    if (compareRaw && compareAtPricePkr === null) {
      errors.push({ row: rowNumber, message: "compare_at_price_pkr must be empty or a whole number ≥ 0." });
      continue;
    }

    const slugInput = record.slug ?? "";
    const slug = slugifyCatalogSlug(name, slugInput);
    if (slug.length < 2) {
      errors.push({ row: rowNumber, message: "Could not derive a valid slug from name/slug." });
      continue;
    }

    const imageUrls: string[] = [];
    if (record.image_urls) imageUrls.push(...splitImageUrls(record.image_urls));
    for (const idx of imageUrlColumns) {
      const url = (cells[idx] ?? "").trim();
      if (url) imageUrls.push(url);
    }

    rows.push({
      rowNumber,
      name,
      slug,
      pricePkr,
      stockQty: parseOptionalInt(record.stock_qty ?? "") ?? 0,
      compareAtPricePkr,
      description: record.description ?? "",
      catchyHeadline: record.catchy_headline ?? "",
      category: record.category ?? "",
      brand: record.brand ?? "",
      sku: record.sku ?? "",
      isActive: parseBool(record.is_active ?? "", true),
      imageUrls,
      specListsJson: record.spec_lists_json ?? "",
      variantTitle: record.variant_title ?? "",
    });
  }

  return { rows, errors };
}

export function bulkImportTemplateCsv(): string {
  return [
    BULK_IMPORT_TEMPLATE_COLUMNS.join(","),
    [
      '"Sample ceiling fan 56 inch"',
      "sample-ceiling-fan",
      "17800",
      "10",
      "19500",
      '"Brief sales description"',
      '"Stay cool all summer"',
      "Fans",
      "Philips",
      "",
      "true",
      "https://example.com/fan.jpg",
      '"[{""heading"":""Specs"",""points"":[""220V"",""Remote included""]}]"',
    ].join(","),
  ].join("\n");
}
