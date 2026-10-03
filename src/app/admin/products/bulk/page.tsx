import Link from "next/link";
import { bulkImportProducts } from "@/app/admin/actions";
import {
  BULK_IMPORT_ACCEPT_ATTR,
  BULK_IMPORT_ACCEPTED_EXTENSIONS,
  BULK_IMPORT_MAX_ROWS,
  BULK_IMPORT_TEMPLATE_COLUMNS,
} from "@/lib/product-bulk-import";

export const dynamic = "force-dynamic";

function errMsg(code: string) {
  if (code === "no-file") return "Choose a spreadsheet file before importing.";
  if (code === "bad-format") {
    return `Accepted formats only: ${BULK_IMPORT_ACCEPTED_EXTENSIONS.join(", ")}. Export from Google Sheets via File → Download.`;
  }
  if (code === "file-too-large") return "File is too large (max 2 MB). Split into smaller sheets.";
  return code.length < 220 ? code : "Import failed. Check your file and try again.";
}

export default async function AdminBulkProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const errorRaw = typeof sp.error === "string" ? sp.error : "";
  const error = errorRaw ? errMsg(decodeURIComponent(errorRaw)) : "";
  const imported = typeof sp.imported === "string" ? Number.parseInt(sp.imported, 10) : 0;
  const failed = typeof sp.failed === "string" ? Number.parseInt(sp.failed, 10) : 0;
  const detail = typeof sp.detail === "string" ? decodeURIComponent(sp.detail) : "";

  return (
    <main className="py-6 lg:py-0">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Catalog</p>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Bulk add products</h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
              Upload a spreadsheet exported from{" "}
              <span className="font-semibold text-slate-800">Google Sheets</span> or Excel. Each row creates one product
              with a default variant, price, and stock — same as adding a single product manually.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:items-end">
            <Link href="/admin/products" className="text-sm font-semibold text-blue-700 hover:text-blue-800">
              ← All products
            </Link>
            <Link href="/admin/products/new" className="text-sm font-semibold text-slate-600 hover:text-slate-900">
              Add one product
            </Link>
          </div>
        </div>

        {error ? (
          <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">
            {error}
          </div>
        ) : null}

        {imported > 0 ? (
          <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-950">
            <span className="font-semibold">{imported} product{imported === 1 ? "" : "s"} imported.</span>
            {failed > 0 ? (
              <span className="mt-1 block font-semibold text-amber-900">
                {failed} row{failed === 1 ? "" : "s"} skipped or failed — see details below.
              </span>
            ) : null}
          </div>
        ) : null}

        {detail ? (
          <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-950">
            {detail.split(" | ").map((line) => (
              <div key={line} className="mt-1 first:mt-0">
                {line}
              </div>
            ))}
          </div>
        ) : null}

        <section className="mt-8 rounded-3xl border border-blue-100 bg-blue-50/50 p-5 sm:p-6">
          <h2 className="text-sm font-bold text-slate-900">Accepted file types</h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-700">
            <li>
              <span className="font-semibold text-slate-900">.csv</span> — Comma-separated values (recommended from Google
              Sheets: <span className="font-mono text-xs">File → Download → Comma Separated Values (.csv)</span>)
            </li>
            <li>
              <span className="font-semibold text-slate-900">.tsv</span> — Tab-separated values (
              <span className="font-mono text-xs">File → Download → Tab Separated Values (.tsv)</span>)
            </li>
          </ul>
          <p className="mt-3 text-xs text-slate-600">
            Excel <span className="font-semibold">.xlsx</span> is not uploaded directly — open the sheet in Google Sheets
            or Excel and export as <span className="font-semibold">.csv</span> first. Max file size 2 MB, up to{" "}
            {BULK_IMPORT_MAX_ROWS} products per upload.
          </p>
          <a
            href="/product-bulk-import-template.csv"
            download="product-bulk-import-template.csv"
            className="mt-4 inline-flex h-10 items-center justify-center rounded-full border border-blue-200 bg-white px-5 text-xs font-semibold text-blue-800 shadow-sm hover:bg-blue-50"
          >
            Download CSV template
          </a>
        </section>

        <section className="mt-8 border-t border-slate-100 pt-8">
          <h2 className="text-sm font-bold text-slate-900">Required columns</h2>
          <p className="mt-2 text-sm text-slate-600">
            Row 1 must be headers. Column names are case-insensitive; spaces become underscores.
          </p>
          <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200 bg-slate-50">
            <table className="min-w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-white font-bold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-2">Column</th>
                  <th className="px-4 py-2">Required</th>
                  <th className="px-4 py-2">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                <tr>
                  <td className="px-4 py-2 font-mono">name</td>
                  <td className="px-4 py-2 font-semibold text-red-700">Yes</td>
                  <td className="px-4 py-2">Product title (min 2 characters)</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-mono">price_pkr</td>
                  <td className="px-4 py-2 font-semibold text-red-700">Yes</td>
                  <td className="px-4 py-2">Whole number ≥ 0 (PKR)</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-mono">slug</td>
                  <td className="px-4 py-2">No</td>
                  <td className="px-4 py-2">URL slug; auto-generated from name if blank</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-mono">stock_qty</td>
                  <td className="px-4 py-2">No</td>
                  <td className="px-4 py-2">Default 0</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-mono">compare_at_price_pkr</td>
                  <td className="px-4 py-2">No</td>
                  <td className="px-4 py-2">Optional “was” price</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-mono">description</td>
                  <td className="px-4 py-2">No</td>
                  <td className="px-4 py-2">Sales copy</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-mono">catchy_headline</td>
                  <td className="px-4 py-2">No</td>
                  <td className="px-4 py-2">Short line under name on storefront</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-mono">category</td>
                  <td className="px-4 py-2">No</td>
                  <td className="px-4 py-2">
                    Category name or slug (must exist). Multiple: separate with{" "}
                    <span className="font-mono">|</span> e.g. <span className="font-mono">Fans|Lighting</span>
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-mono">brand</td>
                  <td className="px-4 py-2">No</td>
                  <td className="px-4 py-2">Brand name; created if new</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-mono">sku</td>
                  <td className="px-4 py-2">No</td>
                  <td className="px-4 py-2">Stock code; auto from slug if blank</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-mono">is_active</td>
                  <td className="px-4 py-2">No</td>
                  <td className="px-4 py-2">true / false (default true)</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-mono">image_url</td>
                  <td className="px-4 py-2">No</td>
                  <td className="px-4 py-2">https://… or /public-path.jpg — invalid URLs are skipped</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-mono">spec_lists_json</td>
                  <td className="px-4 py-2">No</td>
                  <td className="px-4 py-2">JSON bullet lists for product page</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-3 font-mono text-[10px] leading-relaxed text-slate-500">
            Template headers: {BULK_IMPORT_TEMPLATE_COLUMNS.join(", ")}
          </p>
        </section>

        <form action={bulkImportProducts} className="mt-8 border-t border-slate-100 pt-8">
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Spreadsheet file</label>
          <input
            name="spreadsheet_file"
            type="file"
            required
            accept={BULK_IMPORT_ACCEPT_ATTR}
            className="mt-2 block w-full max-w-xl cursor-pointer rounded-2xl border border-dashed border-slate-300 bg-white px-3 py-3 text-xs text-slate-600 file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-slate-800 hover:border-slate-400"
          />
          <p className="mt-2 max-w-2xl text-[11px] leading-relaxed text-slate-500">
            Accepted: {BULK_IMPORT_ACCEPTED_EXTENSIONS.join(", ")} only. First row = column headers. Extra columns such as{" "}
            <span className="font-mono">image_url_2</span> or pipe-separated <span className="font-mono">image_urls</span>{" "}
            are supported for more photos.
          </p>
          <button
            type="submit"
            className="mt-5 inline-flex h-12 items-center justify-center rounded-full bg-blue-600 px-8 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
          >
            Import products
          </button>
        </form>
      </div>
    </main>
  );
}
