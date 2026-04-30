import Link from "next/link";
import { updateProductSeoFields } from "@/app/admin/actions";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

type Row = { id: string; name: string; slug: string; meta_keywords: string | null; meta_description: string | null };

export default async function AdminProductSeoPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const error = typeof sp.error === "string" ? sp.error : undefined;

  const supabase = createSupabaseAdminClient();
  const { data: rows } = await supabase.from("products").select("id,name,slug,meta_keywords,meta_description").order("name");

  const products = ((rows ?? []) as Row[]) ?? [];

  return (
    <main className="py-6 lg:py-0">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Product SEO snippets</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Separate keywords with commas · meta descriptions ideally 120–160 characters for detail-page metadata and social previews downstream.
            </p>
          </div>
          <Link href="/admin" className="text-sm font-semibold text-blue-700 hover:text-blue-800">
            ← Dashboard
          </Link>
        </div>

        {error ? (
          <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">{error}</div>
        ) : null}

        <div className="mt-8 space-y-4">
          {!products.length ? (
            <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-600">No catalog rows detected.</p>
          ) : (
            products.map((p) => (
              <details key={p.id} className="group rounded-3xl border border-slate-200 bg-slate-50/70 p-4 open:bg-white open:shadow-sm">
                <summary className="cursor-pointer list-none font-semibold text-slate-900 marker:content-none">
                  <span className="underline-offset-4 group-open:underline">{p.name}</span>
                  <span className="ml-2 font-mono text-xs font-normal text-slate-500">{p.slug}</span>
                </summary>
                <form action={updateProductSeoFields} className="mt-5 grid gap-4">
                  <input type="hidden" name="id" value={p.id} />
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Meta keywords</label>
                    <input
                      name="meta_keywords"
                      defaultValue={p.meta_keywords ?? ""}
                      className="mt-2 h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 font-mono text-xs outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Meta description</label>
                    <textarea
                      name="meta_description"
                      rows={3}
                      defaultValue={p.meta_description ?? ""}
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
                    />
                  </div>
                  <button
                    type="submit"
                    className="inline-flex h-11 w-fit items-center justify-center rounded-full bg-blue-600 px-8 text-sm font-semibold text-white hover:bg-blue-700"
                  >
                    Save SEO
                  </button>
                </form>
              </details>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
