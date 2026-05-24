import Link from "next/link";
import { createCategory, deleteCategory, updateCategory } from "@/app/admin/actions";
import { ADMIN_IMAGE_FILE_INPUT_CLASS, ADMIN_IMAGE_UPLOAD_HINT } from "@/lib/admin-media-upload";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

type CatRow = {
  id: string;
  name: string;
  slug: string;
  thumbnail_url: string | null;
};

function errMsg(code: string) {
  if (code === "name") return "Category name must be at least 2 characters.";
  if (code === "slug")
    return "Enter a valid slug (letters, numbers, hyphens) or leave blank to derive from the name.";
  if (code === "id") return "Missing category id.";
  return code.length < 260 ? code : "Something went wrong.";
}

function noticeMsg(code: string) {
  if (code === "category-saved") return "Category saved.";
  if (code === "category-created") return "Category added.";
  return "";
}

export default async function AdminCategoriesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const errorRaw = typeof sp.error === "string" ? sp.error : "";
  const noticeRaw = typeof sp.notice === "string" ? sp.notice : "";
  const error = errorRaw ? errMsg(decodeURIComponent(errorRaw)) : "";
  const notice = noticeRaw ? noticeMsg(noticeRaw) : "";

  const supabase = createSupabaseAdminClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("id,name,slug,thumbnail_url")
    .order("name");

  const rows = ((categories ?? []) as CatRow[]) ?? [];

  const inputClass =
    "mt-2 h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100";
  const monoInput = `${inputClass} font-mono text-[11px]`;

  return (
    <main className="py-6 lg:py-0">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Categories</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Each category needs a name, URL slug, and image. Upload a photo from your computer — it appears in Browse
              categories on the homepage.
            </p>
          </div>
          <Link href="/admin" className="text-sm font-semibold text-blue-700 hover:text-blue-800">
            ← Dashboard
          </Link>
        </div>

        {notice ? (
          <div className="mt-5 rounded-2xl border border-emerald-200/80 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-950">
            {notice}
          </div>
        ) : null}
        {error ? (
          <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">
            {error}
          </div>
        ) : null}

        <form
          action={createCategory}
          className="mt-6 grid grid-cols-1 gap-4 rounded-3xl border border-dashed border-blue-200 bg-blue-50/40 p-4 sm:grid-cols-2 sm:p-5"
        >
          <div className="sm:col-span-2">
            <div className="text-xs font-bold uppercase tracking-wide text-blue-900">Add a category</div>
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Name</label>
            <input name="name" required placeholder="e.g. House wiring" className={inputClass} />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Slug (optional)</label>
            <input name="slug" placeholder="auto from name if empty" className={monoInput} />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Image</label>
            <input
              name="thumbnail_file"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className={ADMIN_IMAGE_FILE_INPUT_CLASS}
            />
            <p className="mt-1 text-[11px] text-slate-500">{ADMIN_IMAGE_UPLOAD_HINT}</p>
          </div>
          <div className="sm:col-span-2">
            <button
              type="submit"
              className="inline-flex h-11 items-center justify-center rounded-full bg-blue-600 px-8 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
            >
              Add category
            </button>
          </div>
        </form>

        <div className="mt-10 space-y-5">
          {rows.length === 0 ? (
            <p className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-600">
              No categories yet. Add one above.
            </p>
          ) : null}
          {rows.map((c) => {
            const thumb = (c.thumbnail_url ?? "").trim();
            const canPreview = /^https:\/\//i.test(thumb) || thumb.startsWith("/");

            return (
              <div key={c.id} className="rounded-3xl border border-slate-200 bg-slate-50/80 p-4 sm:p-5">
                <form action={updateCategory} className="flex flex-col gap-5 lg:flex-row lg:items-start">
                  <input type="hidden" name="id" value={c.id} />
                  <div className="relative h-24 w-32 shrink-0 overflow-hidden rounded-2xl border border-white bg-white shadow-sm ring-1 ring-slate-200">
                    {canPreview ? (
                      // eslint-disable-next-line @next/next/no-img-element -- admin preview
                      <img src={thumb} alt="" className="block h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center px-2 text-center text-[11px] font-semibold text-slate-500">
                        No image
                      </div>
                    )}
                  </div>
                  <div className="grid min-w-0 flex-1 grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Name</label>
                      <input name="name" required defaultValue={c.name} className={inputClass} />
                    </div>
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Slug</label>
                      <input name="slug" defaultValue={c.slug} className={monoInput} />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Replace image (optional)
                      </label>
                      <input
                        name="thumbnail_file"
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        className={ADMIN_IMAGE_FILE_INPUT_CLASS}
                      />
                      <p className="mt-1 text-[11px] text-slate-500">
                        {ADMIN_IMAGE_UPLOAD_HINT} Leave empty to keep the current image.
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
                      <button
                        type="submit"
                        className="inline-flex h-10 items-center justify-center rounded-full bg-blue-600 px-6 text-xs font-semibold text-white hover:bg-blue-700"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                </form>
                <form action={deleteCategory} className="mt-3 border-t border-slate-200/80 pt-3">
                  <input type="hidden" name="id" value={c.id} />
                  <button type="submit" className="text-xs font-semibold text-red-700 hover:text-red-800">
                    Delete category
                  </button>
                </form>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
