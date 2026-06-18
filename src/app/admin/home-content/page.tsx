import Link from "next/link";
import { updateHomePageContent } from "@/app/admin/actions";
import { getStorefrontPayload } from "@/lib/storefront";

export const dynamic = "force-dynamic";

const inputClass =
  "mt-2 h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100";
const textareaClass =
  "mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100";

export default async function AdminHomeContentPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const error = typeof sp.error === "string" ? sp.error : undefined;
  const storefront = await getStorefrontPayload();
  const testimonialsDefault =
    storefront.testimonials && storefront.testimonials.length > 0
      ? JSON.stringify(storefront.testimonials, null, 2)
      : "";

  return (
    <main className="py-6 lg:py-0">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Home page content</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Edit the trust/stats block and customer reviews section on the homepage. Hero images are managed under{" "}
              <Link href="/admin/hero" className="font-semibold text-blue-700 hover:text-blue-800">
                Hero slides
              </Link>
              ; promo strips under{" "}
              <Link href="/admin/reviews-banner" className="font-semibold text-blue-700 hover:text-blue-800">
                Promo banners
              </Link>
              .
            </p>
          </div>
          <Link href="/admin" className="text-sm font-semibold text-blue-700 hover:text-blue-800">
            ← Dashboard
          </Link>
        </div>

        {error ? (
          <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">
            Could not save ({error.replace(/-/g, " ")}).
          </div>
        ) : null}

        <form action={updateHomePageContent} className="mt-8 space-y-8 border-t border-slate-100 pt-8">
          <section>
            <h2 className="text-lg font-semibold text-slate-900">Trust & stats section</h2>
            <div className="mt-4 grid gap-5">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Section heading</label>
                <input name="home_stats_title" defaultValue={storefront.homeStatsTitle} className={inputClass} />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Section paragraph</label>
                <textarea name="home_stats_lead" rows={3} defaultValue={storefront.homeStatsLead} className={textareaClass} />
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">Customer reviews</h2>
            <p className="mt-1 text-xs text-slate-500">
              Intro appears above the review carousel. JSON is optional — leave blank to keep existing reviews.
            </p>
            <div className="mt-4 grid gap-5">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Reviews intro</label>
                <textarea name="testimonials_lead" rows={3} defaultValue={storefront.testimonialsLead} className={textareaClass} />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Reviews JSON (optional)</label>
                <textarea
                  name="testimonials_json"
                  rows={8}
                  defaultValue={testimonialsDefault}
                  placeholder={'[\n  { "quote": "…", "name": "…", "meta": "Verified · City", "initials": "AB" }\n]'}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-mono text-xs outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
                />
              </div>
            </div>
          </section>

          <button
            type="submit"
            className="inline-flex h-12 items-center justify-center rounded-full bg-blue-600 px-8 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
          >
            Save home content
          </button>
        </form>
      </div>
    </main>
  );
}
