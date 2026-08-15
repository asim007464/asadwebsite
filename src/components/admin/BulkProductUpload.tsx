"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { bulkCreateProducts } from "@/app/admin/actions";
import {
  downloadBulkProductTemplate,
  parseBulkProductFile,
  type BulkProductPreview,
} from "@/lib/admin-bulk-products";

const pill =
  "inline-flex h-11 min-w-[9rem] items-center justify-center rounded-full px-5 text-sm font-semibold shadow-sm transition";

export function BulkProductUpload({ categoryNames }: { categoryNames: string[] }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [fileName, setFileName] = useState("");
  const [rows, setRows] = useState<BulkProductPreview[]>([]);
  const [parseError, setParseError] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ created: number; errors: { row: number; message: string }[] } | null>(
    null,
  );

  const validRows = rows.filter((r) => r.issues.length === 0);
  const invalidCount = rows.length - validRows.length;

  async function onFile(file: File | undefined) {
    setResult(null);
    setParseError("");
    setRows([]);
    setFileName(file?.name ?? "");
    if (!file) return;
    const parsed = await parseBulkProductFile(file);
    if (parsed.error) {
      setParseError(parsed.error);
      return;
    }
    setRows(parsed.rows);
  }

  async function onImport() {
    if (validRows.length === 0 || busy) return;
    setBusy(true);
    setResult(null);
    try {
      const res = await bulkCreateProducts(
        validRows.map(({ issues: _issues, ...row }) => row),
      );
      setResult(res);
      if (res.created > 0) router.refresh();
    } catch (err) {
      setParseError(err instanceof Error ? err.message : "Import failed.");
    } finally {
      setBusy(false);
    }
  }

  function close() {
    if (busy) return;
    setOpen(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`${pill} w-full flex-1 border border-blue-200 bg-white text-blue-800 hover:bg-blue-50 sm:w-auto sm:flex-none`}
      >
        Bulk upload
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-3 sm:items-center sm:p-6">
          <button
            type="button"
            aria-label="Close bulk upload"
            className="absolute inset-0 bg-slate-900/40"
            onClick={close}
          />
          <div className="relative z-10 flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4 sm:px-6">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-600">Catalog</p>
                <h2 className="mt-1 text-lg font-bold text-slate-900">Bulk upload products</h2>
                <p className="mt-1 text-sm text-slate-600">
                  Import a CSV or Excel sheet. Each row creates a product with one SKU, price, and stock.
                </p>
              </div>
              <button
                type="button"
                onClick={close}
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 text-lg text-slate-500 hover:bg-slate-50"
              >
                ×
              </button>
            </div>

            <div className="space-y-5 overflow-y-auto px-5 py-5 sm:px-6">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                Required columns: <code className="font-semibold">name</code>,{" "}
                <code className="font-semibold">price_pkr</code>. Optional: slug, catchy_headline, description,
                category, brand, sku, compare_at_price_pkr, stock_qty, image_url, is_active, is_featured.
                {categoryNames.length > 0 ? (
                  <span className="mt-2 block text-xs text-slate-500">
                    Category must match an existing name or slug: {categoryNames.slice(0, 12).join(", ")}
                    {categoryNames.length > 12 ? "…" : ""}.
                  </span>
                ) : (
                  <span className="mt-2 block text-xs text-amber-800">
                    No categories yet — leave category blank or add categories first.
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => downloadBulkProductTemplate("csv")}
                  className={`${pill} border border-slate-200 bg-white text-slate-800 hover:bg-slate-50`}
                >
                  Download CSV template
                </button>
                <button
                  type="button"
                  onClick={() => downloadBulkProductTemplate("xlsx")}
                  className={`${pill} border border-slate-200 bg-white text-slate-800 hover:bg-slate-50`}
                >
                  Download Excel template
                </button>
              </div>

              <div>
                <input
                  ref={inputRef}
                  type="file"
                  accept=".csv,.xlsx,.xls,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                  className="hidden"
                  onChange={(e) => void onFile(e.target.files?.[0])}
                />
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className={`${pill} w-full border border-dashed border-blue-300 bg-blue-50 text-blue-800 hover:bg-blue-100 sm:w-auto`}
                >
                  Choose CSV or Excel file
                </button>
                {fileName ? <p className="mt-2 text-xs font-medium text-slate-500">{fileName}</p> : null}
              </div>

              {parseError ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">
                  {parseError}
                </div>
              ) : null}

              {result ? (
                <div
                  className={`rounded-2xl border px-4 py-3 text-sm ${
                    result.errors.length
                      ? "border-amber-200 bg-amber-50 text-amber-950"
                      : "border-emerald-200 bg-emerald-50 text-emerald-900"
                  }`}
                >
                  <p className="font-semibold">
                    Created {result.created} product{result.created === 1 ? "" : "s"}
                    {result.errors.length ? ` · ${result.errors.length} row${result.errors.length === 1 ? "" : "s"} failed` : "."}
                  </p>
                  {result.errors.length > 0 ? (
                    <ul className="mt-2 max-h-32 space-y-1 overflow-y-auto text-xs">
                      {result.errors.map((e) => (
                        <li key={`${e.row}-${e.message}`}>
                          Row {e.row}: {e.message}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              ) : null}

              {rows.length > 0 ? (
                <div>
                  <p className="mb-2 text-sm font-semibold text-slate-800">
                    Preview · {validRows.length} ready
                    {invalidCount > 0 ? ` · ${invalidCount} need fixes` : ""}
                  </p>
                  <div className="max-h-64 overflow-auto rounded-2xl border border-slate-200">
                    <table className="min-w-[40rem] w-full text-left text-xs">
                      <thead className="sticky top-0 border-b border-slate-200 bg-slate-50 font-bold uppercase tracking-wider text-slate-500">
                        <tr>
                          <th className="px-3 py-2">Row</th>
                          <th className="px-3 py-2">Name</th>
                          <th className="px-3 py-2">Category</th>
                          <th className="px-3 py-2">Price</th>
                          <th className="px-3 py-2">Stock</th>
                          <th className="px-3 py-2">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {rows.map((r) => (
                          <tr key={r.rowNumber} className={r.issues.length ? "bg-red-50/70" : "bg-white"}>
                            <td className="px-3 py-2 font-mono text-slate-500">{r.rowNumber}</td>
                            <td className="px-3 py-2 font-semibold text-slate-900">{r.name || "—"}</td>
                            <td className="px-3 py-2 text-slate-600">{r.category || "—"}</td>
                            <td className="px-3 py-2 tabular-nums text-slate-800">
                              {Number.isFinite(r.price_pkr) ? r.price_pkr : "—"}
                            </td>
                            <td className="px-3 py-2 tabular-nums text-slate-800">
                              {Number.isFinite(r.stock_qty) ? r.stock_qty : "—"}
                            </td>
                            <td className="px-3 py-2">
                              {r.issues.length ? (
                                <span className="font-semibold text-red-700">{r.issues[0]}</span>
                              ) : (
                                <span className="font-semibold text-emerald-700">Ready</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2 border-t border-slate-100 px-5 py-4 sm:px-6">
              <button
                type="button"
                onClick={close}
                className={`${pill} border border-slate-200 bg-white text-slate-700 hover:bg-slate-50`}
              >
                Close
              </button>
              <button
                type="button"
                disabled={busy || validRows.length === 0}
                onClick={() => void onImport()}
                className={`${pill} bg-blue-600 text-white shadow-md shadow-blue-600/20 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50`}
              >
                {busy ? "Importing…" : `Import ${validRows.length || ""} product${validRows.length === 1 ? "" : "s"}`.trim()}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
