import Link from "next/link";
import { updateHomeReviewsBanner } from "@/app/admin/actions";
import { ADMIN_IMAGE_FILE_INPUT_CLASS, ADMIN_IMAGE_UPLOAD_HINT } from "@/lib/admin-media-upload";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { HomeReviewsBannerRow } from "@/lib/store-types";

export const dynamic = "force-dynamic";

const EMPTY_ROW: Omit<HomeReviewsBannerRow, "updated_at"> = {
  id: 1,
  background_image_url: "",
  heading: "",
  paragraph: "",
  button_label: "",
  button_href: "/products",
  is_active: false,
};

export default async function AdminReviewsBannerPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const error = typeof sp.error === "string" ? sp.error : undefined;

  const supabase = createSupabaseAdminClient();
  const { data, error: loadError } = await supabase.from("home_reviews_banner").select("*").eq("id", 1).maybeSingle();

  const row =
    loadError || !data
      ? EMPTY_ROW
      : ({
          id: 1,
          background_image_url: String((data as HomeReviewsBannerRow).background_image_url ?? ""),
          heading: String((data as HomeReviewsBannerRow).heading ?? ""),
          paragraph: String((data as HomeReviewsBannerRow).paragraph ?? ""),
          button_label: String((data as HomeReviewsBannerRow).button_label ?? ""),
          button_href: String((data as HomeReviewsBannerRow).button_href ?? "/products"),
          is_active: Boolean((data as HomeReviewsBannerRow).is_active),
        } satisfies Omit<HomeReviewsBannerRow, "updated_at">);

  return (
    <main className="py-6 lg:py-0">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Reviews banner</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Large background strip <span className="font-semibold">directly above</span> the customer reviews section on the
              homepage. Paste an <span className="font-semibold">https://</span> or <span className="font-semibold">/</span> image URL, or upload a file (same rules as other admin images).
            </p>
          </div>
          <Link href="/admin" className="text-sm font-semibold text-blue-700 hover:text-blue-800">
            ← Dashboard
          </Link>
        </div>

        {loadError ? (
          <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-950">
            Could not load settings ({loadError.message}). Run the{" "}
            <span className="font-mono text-xs">home_reviews_banner</span> block from{" "}
            <span className="font-mono text-xs">supabase/schema.sql</span> in the SQL editor, then refresh.
          </div>
        ) : null}

        {error === "invalid-bg-url" ? (
          <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">
            Background URL must start with{" "}
            <span className="font-mono text-xs">https://</span>, a site path like{" "}
            <span className="font-mono text-xs">/photo.jpg</span>, or be left blank if you upload instead.
          </div>
        ) : null}
        {error === "invalid-button-href" ? (
          <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">
            Button link must be a site path (<span className="font-mono text-xs">/products</span>) or{" "}
            <span className="font-mono text-xs">https://…</span> URL.
          </div>
        ) : null}
        {error && !["invalid-bg-url", "invalid-button-href"].includes(error) ? (
          <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">
            {error}
          </div>
        ) : null}

        <form action={updateHomeReviewsBanner} className="mt-8 grid grid-cols-1 gap-5 border-t border-slate-100 pt-8 md:gap-6">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Background image URL</label>
            <input
              name="background_image_url"
              defaultValue={row.background_image_url}
              placeholder="https://… or /image-in-public.jpg"
              className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 font-mono text-xs outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100 md:text-sm"
            />
            <label className="mt-3 block text-xs font-semibold uppercase tracking-wide text-slate-500">Or upload from computer</label>
            <input
              name="background_image_file"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className={ADMIN_IMAGE_FILE_INPUT_CLASS}
            />
            <p className="mt-1 text-[11px] text-slate-500">{ADMIN_IMAGE_UPLOAD_HINT}</p>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Heading</label>
            <input
              name="heading"
              defaultValue={row.heading}
              placeholder="Tell shoppers why reviews matter…"
              className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Paragraph</label>
            <textarea
              name="paragraph"
              rows={4}
              defaultValue={row.paragraph}
              placeholder="Short supporting message…"
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Button label</label>
              <input
                name="button_label"
                defaultValue={row.button_label}
                placeholder="Shop now"
                className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Button link</label>
              <input
                name="button_href"
                defaultValue={row.button_href}
                placeholder="/products or https://…"
                className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 font-mono text-xs outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100 md:text-sm"
              />
            </div>
          </div>

          <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800">
            <input type="checkbox" name="is_active" defaultChecked={row.is_active} className="h-4 w-4 rounded border-slate-300" />
            Show on storefront (inactive hides the banner even if fields are filled)
          </label>

          <button
            type="submit"
            className="inline-flex h-12 max-w-xs items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
          >
            Save
          </button>
        </form>
      </div>
    </main>
  );
}
