import Link from "next/link";
import { createCategory, deleteCategory, updateCategoryAppearance } from "@/app/admin/actions";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

type CatRow = { id: string; name: string; slug: string; thumbnail_url: string | null; hero_icon_hint: string | null };

export default async function AdminCategoriesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const error = typeof sp.error === "string" ? sp.error : undefined;

  const supabase = createSupabaseAdminClient();
  const { data: categories } = await supabase.from("categories").select("id,name,slug,thumbnail_url,hero_icon_hint").order("name");

  const rows = ((categories ?? []) as CatRow[]) ?? [];

  return (
    <main className="py-6 lg:py-0">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Categories</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Names sort alphabetically in the marquee and browse grids — upload squared HTTPS thumbnails (or rooted <code>/public</code> paths) for richer cards. Provide a lightweight{" "}
              <span className="font-semibold">hero_icon_hint</span> keyword (<code className="text-xs">fan</code>,{" "}
              <code className="text-xs">kitchen</code>, <code className="text-xs">led</code>…) only when no artwork is available so the glyphs stay on-brand.
            </p>
          </div>
          <Link href="/admin" className="text-sm font-semibold text-blue-700 hover:text-blue-800">
            ← Dashboard
          </Link>
        </div>

        {error ? (
          <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">
            {decodeURIComponent(error)}
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

        <div className="mt-10 space-y-6">
          {rows.map((c) => {
            const thumb = (c.thumbnail_url ?? "").trim();
            const canPreview = /^https:\/\//i.test(thumb) || thumb.startsWith("/");
            return (
              <div key={c.id} className="rounded-3xl border border-slate-200 bg-slate-50/80 p-4 sm:p-5">
                <div className="flex flex-wrap items-start gap-6">
                  <div className="flex items-start gap-4">
                    <div className="relative h-20 w-28 overflow-hidden rounded-2xl border border-white bg-white shadow-sm ring-1 ring-slate-200">
                      {canPreview ? (
                        // eslint-disable-next-line @next/next/no-img-element -- admin preview arbitrary hosts
                        <img src={thumb} alt="" className="block h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center px-3 text-[11px] font-semibold text-slate-500">No visual</div>
                      )}
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-slate-900">{c.name}</div>
                      <div className="mt-1 font-mono text-xs text-slate-600">{c.slug}</div>
                      <form action={deleteCategory} className="mt-3 inline">
                        <input type="hidden" name="id" value={c.id} />
                        <button type="submit" className="text-xs font-semibold text-red-700 hover:text-red-800">
                          Delete category
                        </button>
                      </form>
                    </div>
                  </div>
                  <form action={updateCategoryAppearance} className="grid min-w-0 flex-1 gap-4 sm:grid-cols-12">
                    <input type="hidden" name="id" value={c.id} />
                    <div className="sm:col-span-8">
                      <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Thumbnail URL</label>
                      <input
                        name="thumbnail_url"
                        defaultValue={thumb}
                        placeholder="https://… or /local-file.jpg"
                        className="mt-2 h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 font-mono text-[11px] outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
                      />
                    </div>
                    <div className="sm:col-span-4">
                      <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Hero icon keyword</label>
                      <input
                        name="hero_icon_hint"
                        defaultValue={(c.hero_icon_hint ?? "").trim()}
                        placeholder="fan, led, kitchen…"
                        className="mt-2 h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
                      />
                    </div>
                    <div className="sm:col-span-12">
                      <button
                        type="submit"
                        className="inline-flex h-10 items-center justify-center rounded-full bg-blue-600 px-8 text-xs font-semibold text-white hover:bg-blue-700"
                      >
                        Save visuals
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
