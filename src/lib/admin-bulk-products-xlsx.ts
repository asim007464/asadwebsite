/**
 * Client-only Excel helpers. Keep `xlsx` out of server-action bundles.
 */
import {
  BULK_PRODUCT_MAX_ROWS,
  BULK_TEMPLATE_HEADERS,
  BULK_TEMPLATE_SAMPLE,
  mapSheetRow,
  type BulkProductPreview,
} from "@/lib/admin-bulk-products";

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

export async function downloadBulkProductTemplate(format: "csv" | "xlsx") {
  const headers = [...BULK_TEMPLATE_HEADERS];
  const sample = headers.map((h) => BULK_TEMPLATE_SAMPLE[h]);
  const XLSX = await import("xlsx");
  const workbook = XLSX.utils.book_new();
  const sheet = XLSX.utils.aoa_to_sheet([headers, sample]);
  XLSX.utils.book_append_sheet(workbook, sheet, "Products");
  XLSX.writeFile(workbook, format === "xlsx" ? "product-bulk-template.xlsx" : "product-bulk-template.csv");
}
