import Link from "next/link";
import { createCategory, deleteCategory } from "@/app/admin/actions";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const error = typeof sp.error === "string" ? sp.error : undefined;

  const supabase = createSupabaseAdminClient();
  const { data: categories } = await supabase.from("categories").select("id,name,slug").order("name");

  return (
    <main className="py-6 lg:py-0">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Categories</h1>
            <p className="mt-2 text-sm text-slate-600">
              Shown in the header categories menu and on the home page category slider (sorted by name).
            </p>
          </div>
          <Link href="/admin" className="text-sm font-semibold text-blue-700 hover:text-blue-800">
            ← Dashboard
          </Link>
        </div>

        {error ? (
          <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">
            {error}
          </div>
        ) : null}

        <form action={createCategory} className="mt-6 grid grid-cols-1 gap-3 rounded-3xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-12 sm:p-5">
          <div className="sm:col-span-5">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Name</label>
            <input
              name="name"
              required
              placeholder="e.g. House Wiring"
              className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
            />
          </div>
          <div className="sm:col-span-5">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Slug (optional)</label>
            <input
              name="slug"
              placeholder="auto-generated if empty"
              className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
            />
          </div>
          <div className="flex items-end sm:col-span-2">
            <button
              type="submit"
              className="inline-flex h-12 w-full items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
            >
              Add
            </button>
          </div>
        </form>

        <div className="mt-8 hidden md:block overflow-hidden rounded-3xl border border-slate-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">Slug</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {(categories ?? []).map((c) => (
                <tr key={c.id}>
                  <td className="px-5 py-4 font-semibold text-slate-900">{c.name}</td>
                  <td className="px-5 py-4 font-mono text-xs text-slate-600">{c.slug}</td>
                  <td className="px-5 py-4 text-right">
                    <form action={deleteCategory}>
                      <input type="hidden" name="id" value={c.id} />
                      <button type="submit" className="text-sm font-semibold text-red-700 hover:text-red-800">
                        Delete
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 grid gap-3 md:hidden">
          {(categories ?? []).map((c) => (
            <div key={c.id} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="text-base font-semibold text-slate-900">{c.name}</div>
              <div className="mt-1 font-mono text-xs text-slate-600">{c.slug}</div>
              <form action={deleteCategory} className="mt-3">
                <input type="hidden" name="id" value={c.id} />
                <button type="submit" className="text-sm font-semibold text-red-700">
                  Delete category
                </button>
              </form>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
