import Link from "next/link";
import { updateAboutPageContent } from "@/app/admin/actions";
import { StorefrontImageUploadField } from "@/components/admin/StorefrontImageUploadField";
import { getStorefrontPayload } from "@/lib/storefront";

export const dynamic = "force-dynamic";

const inputClass =
  "mt-2 h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100";
const textareaClass =
  "mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100";

export default async function AdminAboutContentPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const error = typeof sp.error === "string" ? sp.error : undefined;
  const storefront = await getStorefrontPayload();
  const chipsDefault = (storefront.aboutChips ?? []).join("\n");

  return (
    <main className="py-6 lg:py-0">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">About page content</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Headline, intro, highlight chips, and hero photos shown on the public{" "}
              <Link href="/about" className="font-semibold text-blue-700 hover:text-blue-800">
                /about
              </Link>{" "}
              page.
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

        <form action={updateAboutPageContent} className="mt-8 space-y-8 border-t border-slate-100 pt-8">
          <section className="grid gap-5">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Page heading</label>
              <input name="about_page_title" defaultValue={storefront.aboutPageTitle} className={inputClass} />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Intro paragraph</label>
              <textarea name="about_page_lead" rows={4} defaultValue={storefront.aboutPageLead} className={textareaClass} />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Highlight chips (one per line)</label>
              <textarea name="about_chips" rows={4} defaultValue={chipsDefault} className={textareaClass} />
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">Photos</h2>
            <div className="mt-4 grid gap-5 md:grid-cols-2">
              <StorefrontImageUploadField
                label="Primary photo (large)"
                urlName="about_primary_image"
                defaultUrl={storefront.aboutPrimaryImage}
              />
              <StorefrontImageUploadField
                label="Secondary photo (overlay)"
                urlName="about_secondary_image"
                defaultUrl={storefront.aboutSecondaryImage}
              />
            </div>
          </section>

          <button
            type="submit"
            className="inline-flex h-12 items-center justify-center rounded-full bg-blue-600 px-8 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
          >
            Save about page
          </button>
        </form>
      </div>
    </main>
  );
}
