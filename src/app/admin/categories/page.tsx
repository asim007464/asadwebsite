import Link from "next/link";
import {
  createCategory,
  deleteCategory,
  updateCategory,
  updateCategoryAppearance,
} from "@/app/admin/actions";
import {
  ADMIN_IMAGE_FILE_INPUT_CLASS,
  ADMIN_IMAGE_UPLOAD_HINT,
} from "@/lib/admin-media-upload";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

type CatRow = {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  thumbnail_url: string | null;
  hero_icon_hint: string | null;
};

function errMsg(code: string) {
  if (code === "name") return "Category name must be at least 2 characters.";
  if (code === "slug")
    return "Enter a valid slug (letters, numbers, hyphens) or leave blank to derive from the name.";
  if (code === "id") return "Missing category id.";
  return code.length < 260 ? code : "Something went wrong.";
}

function noticeMsg(code: string) {
  if (code === "category-saved")
    return "Category name and URL slug were saved.";
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
    .select("id,name,slug,parent_id,thumbnail_url,hero_icon_hint")
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
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              Categories
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              <span className="font-semibold text-slate-800">Add</span> new
              categories,{" "}
              <span className="font-semibold text-slate-800">edit</span> their
              name, URL slug, and optional parent,{" "}
              <span className="font-semibold text-slate-800">delete</span> ones
              you no longer need (products keep working — their category is
              cleared). Thumbnails and{" "}
              <span className="font-semibold">hero icon hints</span> are for the
              storefront carousel and grids.
            </p>
            <p className="mt-2 text-xs text-slate-500">
              Slugs must stay unique — they appear in URLs like{" "}
              <code className="rounded bg-slate-100 px-1">
                /products?category=your-slug
              </code>
              .
            </p>
          </div>
          <Link
            href="/admin"
            className="text-sm font-semibold text-blue-700 hover:text-blue-800"
          >
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
          className="mt-6 grid grid-cols-1 gap-3 rounded-3xl border border-dashed border-blue-200 bg-blue-50/40 p-4 sm:grid-cols-12 sm:p-5"
        >
          <div className="sm:col-span-12">
            <div className="text-xs font-bold uppercase tracking-wide text-blue-900">
              Add a category
            </div>
          </div>
          <div className="sm:col-span-5">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Name
            </label>
            <input
              name="name"
              required
              placeholder="e.g. House wiring"
              className={inputClass}
            />
          </div>
          <div className="sm:col-span-5">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Slug (optional)
            </label>
            <input
              name="slug"
              placeholder="auto-generated if empty"
              className={inputClass}
            />
          </div>
          <div className="flex items-end sm:col-span-2">
            <button
              type="submit"
              className="inline-flex h-11 w-full items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
            >
              Add
            </button>
          </div>
        </form>

        <div className="mt-10 space-y-6">
          {rows.length === 0 ? (
            <p className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-600">
              No categories yet. Add one above, or run seed SQL for demo data.
            </p>
          ) : null}
          {rows.map((c) => {
            const thumb = (c.thumbnail_url ?? "").trim();
            const canPreview =
              /^https:\/\//i.test(thumb) || thumb.startsWith("/");
            const parentOptions = rows.filter((x) => x.id !== c.id);

            return (
              <div
                key={c.id}
                className="rounded-3xl border border-slate-200 bg-slate-50/80 p-4 sm:p-5"
              >
                <div className="flex flex-wrap items-start gap-6">
                  <div className="flex items-start gap-4">
                    <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-2xl border border-white bg-white shadow-sm ring-1 ring-slate-200">
                      {canPreview ? (
                        // eslint-disable-next-line @next/next/no-img-element -- admin preview arbitrary hosts
                        <img
                          src={thumb}
                          alt=""
                          className="block h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center px-3 text-center text-[11px] font-semibold text-slate-500">
                          No visual
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid min-w-0 flex-1 gap-6 lg:grid-cols-2">
                    <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm">
                      <div className="text-xs font-bold uppercase tracking-wide text-slate-700">
                        Details — name &amp; URL
                      </div>
                      <form action={updateCategory} className="mt-4 space-y-3">
                        <input type="hidden" name="id" value={c.id} />
                        <div>
                          <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Name
                          </label>
                          <input
                            name="name"
                            required
                            defaultValue={c.name}
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Slug
                          </label>
                          <input
                            name="slug"
                            defaultValue={c.slug}
                            className={monoInput}
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Parent category (optional)
                          </label>
                          <select
                            name="parent_id"
                            defaultValue={c.parent_id ?? ""}
                            className={inputClass}
                          >
                            <option value="">— Top level —</option>
                            {parentOptions.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 pt-1">
                          <button
                            type="submit"
                            className="inline-flex h-10 items-center justify-center rounded-full bg-blue-600 px-6 text-xs font-semibold text-white hover:bg-blue-700"
                          >
                            Save details
                          </button>
                        </div>
                      </form>
                      <form action={deleteCategory} className="pt-2">
                        <input type="hidden" name="id" value={c.id} />
                        <button
                          type="submit"
                          className="text-xs font-semibold text-red-700 hover:text-red-800"
                          title="Removes this category; products using it will have category cleared."
                        >
                          Delete category
                        </button>
                      </form>
                    </div>

                    <form
                      action={updateCategoryAppearance}
                      className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm"
                    >
                      <input type="hidden" name="id" value={c.id} />
                      <div className="text-xs font-bold uppercase tracking-wide text-slate-700">
                        Storefront visuals
                      </div>
                      <div className="mt-4 space-y-3">
                        <div>
                          <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Thumbnail URL
                          </label>
                          <input
                            name="thumbnail_url"
                            defaultValue={thumb}
                            placeholder="https://… or /path-in-public.jpg"
                            className={monoInput}
                          />
                          <label className="mt-3 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Upload from computer
                          </label>
                          <input
                            name="thumbnail_file"
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/gif"
                            className={ADMIN_IMAGE_FILE_INPUT_CLASS}
                          />
                          <p className="mt-1 text-[11px] text-slate-500">
                            {ADMIN_IMAGE_UPLOAD_HINT}
                          </p>
                        </div>
                        <div>
                          <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Hero icon keyword
                          </label>
                          <input
                            name="hero_icon_hint"
                            defaultValue={(c.hero_icon_hint ?? "").trim()}
                            placeholder="fan, led, kitchen…"
                            className={inputClass}
                          />
                        </div>
                        <button
                          type="submit"
                          className="inline-flex h-10 items-center justify-center rounded-full bg-slate-900 px-6 text-xs font-semibold text-white hover:bg-slate-800"
                        >
                          Save visuals
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
