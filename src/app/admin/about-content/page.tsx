import Link from "next/link";
import { updateAboutPageContent } from "@/app/admin/actions";
import { BannerHeightsPair } from "@/components/admin/BannerHeightsPair";
import { StorefrontImageUploadField } from "@/components/admin/StorefrontImageUploadField";
import {
  clampBannerHeightPx,
  DEFAULT_ABOUT_BANNER_HEIGHT_MOBILE_PX,
  DEFAULT_ABOUT_BANNER_HEIGHT_PX,
} from "@/lib/banner-height";
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
  const saved = sp.saved === "1";
  const storefront = await getStorefrontPayload();
  const chipsDefault = (storefront.aboutChips ?? []).join("\n");
  const values = storefront.aboutValues ?? [];
  const steps = storefront.aboutHowSteps ?? [];
  const team = storefront.aboutTeam ?? [];
  const bannerHeight = clampBannerHeightPx(
    storefront.aboutBannerHeightPx,
    DEFAULT_ABOUT_BANNER_HEIGHT_PX,
    280,
    720,
  );
  const bannerHeightMobile = clampBannerHeightPx(
    storefront.aboutBannerHeightMobilePx,
    DEFAULT_ABOUT_BANNER_HEIGHT_MOBILE_PX,
    200,
    720,
  );

  return (
    <main className="py-6 lg:py-0">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">About page content</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Edit the promotional banner (background image + bottom text), value cards, how-we-work steps, and team on{" "}
              <Link href="/about" className="font-semibold text-blue-700 hover:text-blue-800">
                /about
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
        {saved ? (
          <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-900">
            About page saved.
          </div>
        ) : null}

        <form action={updateAboutPageContent} className="mt-8 space-y-10 border-t border-slate-100 pt-8">
          <section className="space-y-5">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">1. Promotional banner</h2>
              <p className="mt-1 text-xs text-slate-500">
                One full-width background image with title, paragraph, chips, and buttons overlaid at the bottom.
              </p>
            </div>
            <StorefrontImageUploadField
              label="Banner background image"
              urlName="about_primary_image"
              defaultUrl={storefront.aboutPrimaryImage}
            />
            <BannerHeightsPair
              desktopName="about_banner_height_px"
              mobileName="about_banner_height_mobile_px"
              desktopDefault={bannerHeight}
              mobileDefault={bannerHeightMobile}
              min={280}
              max={720}
              mobileMin={200}
            />
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Small label</label>
              <input name="about_eyebrow" defaultValue={storefront.aboutEyebrow} className={inputClass} />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Heading</label>
              <input name="about_page_title" defaultValue={storefront.aboutPageTitle} className={inputClass} />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Paragraph</label>
              <textarea name="about_page_lead" rows={4} defaultValue={storefront.aboutPageLead} className={textareaClass} />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Highlight chips (one per line)</label>
              <textarea name="about_chips" rows={4} defaultValue={chipsDefault} className={textareaClass} />
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Primary button label</label>
                <input name="about_cta_primary_label" defaultValue={storefront.aboutCtaPrimaryLabel} className={inputClass} />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Primary button link</label>
                <input name="about_cta_primary_href" defaultValue={storefront.aboutCtaPrimaryHref} className={inputClass} />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Secondary button label</label>
                <input name="about_cta_secondary_label" defaultValue={storefront.aboutCtaSecondaryLabel} className={inputClass} />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Secondary button link</label>
                <input name="about_cta_secondary_href" defaultValue={storefront.aboutCtaSecondaryHref} className={inputClass} />
              </div>
            </div>
          </section>

          <section className="space-y-4 border-t border-slate-100 pt-8">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">2. Value cards (3)</h2>
              <p className="mt-1 text-xs text-slate-500">Cards under the banner (e.g. Genuine products, COD-first).</p>
            </div>
            {[0, 1, 2].map((i) => (
              <div key={i} className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50/60 p-4 sm:grid-cols-2">
                <div className="sm:col-span-2 text-[11px] font-bold uppercase tracking-wide text-slate-500">Card {i + 1}</div>
                <div>
                  <label className="text-xs font-semibold text-slate-500">Title</label>
                  <input name={`about_value_${i}_title`} defaultValue={values[i]?.title ?? ""} className={inputClass} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500">Paragraph</label>
                  <input name={`about_value_${i}_body`} defaultValue={values[i]?.body ?? ""} className={inputClass} />
                </div>
              </div>
            ))}
          </section>

          <section className="space-y-4 border-t border-slate-100 pt-8">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">3. How we work</h2>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Section heading</label>
              <input name="about_how_title" defaultValue={storefront.aboutHowTitle} className={inputClass} />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Section paragraph</label>
              <textarea name="about_how_lead" rows={3} defaultValue={storefront.aboutHowLead} className={textareaClass} />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Badge text</label>
              <input name="about_how_badge" defaultValue={storefront.aboutHowBadge} className={inputClass} />
            </div>
            {[0, 1, 2].map((i) => (
              <div key={i} className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50/60 p-4 sm:grid-cols-3">
                <div className="sm:col-span-3 text-[11px] font-bold uppercase tracking-wide text-slate-500">Step {i + 1}</div>
                <div>
                  <label className="text-xs font-semibold text-slate-500">Step label</label>
                  <input name={`about_how_${i}_step`} defaultValue={steps[i]?.step ?? ""} className={inputClass} placeholder="01" />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-500">Title</label>
                  <input name={`about_how_${i}_title`} defaultValue={steps[i]?.title ?? ""} className={inputClass} />
                </div>
                <div className="sm:col-span-3">
                  <label className="text-xs font-semibold text-slate-500">Paragraph</label>
                  <textarea name={`about_how_${i}_body`} rows={2} defaultValue={steps[i]?.body ?? ""} className={textareaClass} />
                </div>
              </div>
            ))}
          </section>

          <section className="space-y-4 border-t border-slate-100 pt-8">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">4. Team section</h2>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Small label</label>
                <input name="about_team_eyebrow" defaultValue={storefront.aboutTeamEyebrow} className={inputClass} />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">CTA button label</label>
                <input name="about_team_cta_label" defaultValue={storefront.aboutTeamCtaLabel} className={inputClass} />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Heading</label>
              <input name="about_team_title" defaultValue={storefront.aboutTeamTitle} className={inputClass} />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Paragraph</label>
              <textarea name="about_team_lead" rows={3} defaultValue={storefront.aboutTeamLead} className={textareaClass} />
            </div>
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50/60 p-4 sm:grid-cols-2">
                <div className="sm:col-span-2 text-[11px] font-bold uppercase tracking-wide text-slate-500">
                  Team member {i + 1}
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500">Name</label>
                  <input name={`about_team_${i}_name`} defaultValue={team[i]?.name ?? ""} className={inputClass} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500">Initials</label>
                  <input name={`about_team_${i}_initials`} defaultValue={team[i]?.initials ?? ""} className={inputClass} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500">Role</label>
                  <input name={`about_team_${i}_role`} defaultValue={team[i]?.role ?? ""} className={inputClass} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500">Short note</label>
                  <input name={`about_team_${i}_note`} defaultValue={team[i]?.note ?? ""} className={inputClass} />
                </div>
              </div>
            ))}
          </section>

          {/* Keep secondary image field so existing admin uploads are not lost */}
          <input type="hidden" name="about_secondary_image" value={storefront.aboutSecondaryImage ?? ""} />

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
