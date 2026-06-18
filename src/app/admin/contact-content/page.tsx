import Link from "next/link";
import { updateContactPageContent } from "@/app/admin/actions";
import { StorefrontImageUploadField } from "@/components/admin/StorefrontImageUploadField";
import { getStorefrontPayload } from "@/lib/storefront";

export const dynamic = "force-dynamic";

const inputClass =
  "mt-2 h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100";
const textareaClass =
  "mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100";
const monoInput =
  "mt-2 h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 font-mono text-xs outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100 md:text-sm";

export default async function AdminContactContentPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const error = typeof sp.error === "string" ? sp.error : undefined;
  const s = await getStorefrontPayload();

  return (
    <main className="py-6 lg:py-0">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Contact page content</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Phones, email, support hours, store location, map link, and photos for{" "}
              <Link href="/contact" className="font-semibold text-blue-700 hover:text-blue-800">
                /contact
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

        <form action={updateContactPageContent} className="mt-8 space-y-8 border-t border-slate-100 pt-8">
          <section className="grid gap-5">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Page heading</label>
              <input name="contact_page_title" defaultValue={s.contactPageTitle} className={inputClass} />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Intro paragraph</label>
              <textarea name="contact_page_lead" rows={3} defaultValue={s.contactPageLead} className={textareaClass} />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Email</label>
              <input name="contact_email" type="email" defaultValue={s.contactEmail} className={inputClass} />
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">WhatsApp / phone channels</h2>
            <div className="mt-4 grid gap-6 lg:grid-cols-2">
              {[1, 2].map((n) => (
                <div key={n} className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                  <div className="text-sm font-semibold text-slate-900">Channel {n}</div>
                  <div className="mt-3 grid gap-3">
                    <input
                      name={`contact_channel${n}_label`}
                      defaultValue={n === 1 ? s.contactChannel1Label : s.contactChannel2Label}
                      placeholder="Label"
                      className={inputClass}
                    />
                    <input
                      name={`contact_channel${n}_display`}
                      defaultValue={n === 1 ? s.contactChannel1Display : s.contactChannel2Display}
                      placeholder="Display number"
                      className={inputClass}
                    />
                    <input
                      name={`contact_channel${n}_tel`}
                      defaultValue={n === 1 ? s.contactChannel1Tel : s.contactChannel2Tel}
                      placeholder="tel: link (+923…)"
                      className={monoInput}
                    />
                    <input
                      name={`contact_channel${n}_wa`}
                      defaultValue={n === 1 ? s.contactChannel1Wa : s.contactChannel2Wa}
                      placeholder="WhatsApp URL"
                      className={monoInput}
                    />
                    <textarea
                      name={`contact_channel${n}_notes`}
                      rows={2}
                      defaultValue={n === 1 ? s.contactChannel1Notes : s.contactChannel2Notes}
                      placeholder="Short notes"
                      className={textareaClass}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">Support card & hours</h2>
            <div className="mt-4 grid gap-5 sm:grid-cols-2">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Desk hours</label>
                <input name="support_desk_hours" defaultValue={s.supportDeskHours} className={inputClass} />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Escalations line</label>
                <input name="support_escalations" defaultValue={s.supportEscalations} className={inputClass} />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Support intro</label>
                <textarea name="support_commitments_intro" rows={3} defaultValue={s.supportCommitmentsIntro} className={textareaClass} />
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">Store location & map</h2>
            <div className="mt-4 grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Location name</label>
                <input name="store_location_name" defaultValue={s.storeLocationName} className={inputClass} />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Latitude</label>
                <input name="store_lat" defaultValue={String(s.storeLat ?? "")} className={monoInput} />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Longitude</label>
                <input name="store_lng" defaultValue={String(s.storeLng ?? "")} className={monoInput} />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Google Maps place URL</label>
                <input name="google_maps_place_url" defaultValue={s.googleMapsPlaceUrl} className={monoInput} />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Place feature ref (advanced)</label>
                <input name="google_place_feature_ref" defaultValue={s.googlePlaceFeatureRef} className={monoInput} />
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">Photos</h2>
            <div className="mt-4 grid gap-5 md:grid-cols-2">
              <StorefrontImageUploadField
                label="Storefront photo"
                urlName="contact_primary_image"
                defaultUrl={s.contactPrimaryImage}
              />
              <StorefrontImageUploadField
                label="Inside store photo"
                urlName="contact_secondary_image"
                defaultUrl={s.contactSecondaryImage}
              />
            </div>
          </section>

          <button
            type="submit"
            className="inline-flex h-12 items-center justify-center rounded-full bg-blue-600 px-8 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
          >
            Save contact page
          </button>
        </form>
      </div>
    </main>
  );
}
