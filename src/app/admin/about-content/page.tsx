import Link from "next/link";
import { updateAboutPageContent } from "@/app/admin/actions";
import { BannerHeightsPair } from "@/components/admin/BannerHeightsPair";
import { BannerResponsiveImageFields } from "@/components/admin/BannerResponsiveImageFields";
import { StorefrontImageUploadField } from "@/components/admin/StorefrontImageUploadField";
import {
  clampBannerHeightPx,
  DEFAULT_ABOUT_BANNER_HEIGHT_MOBILE_PX,
  DEFAULT_ABOUT_BANNER_HEIGHT_PX,
} from "@/lib/banner-height";
import { ADMIN_IMAGE_FILE_INPUT_CLASS, ADMIN_IMAGE_UPLOAD_HINT } from "@/lib/admin-media-upload";
import { getStorefrontPayload } from "@/lib/storefront";

export const dynamic = "force-dynamic";

const inputClass =
  "mt-2 h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100";
const textareaClass =
  "mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100";

const CHIP_SLOTS = 6;

export default async function AdminAboutContentPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const error = typeof sp.error === "string" ? sp.error : undefined;
  const saved = sp.saved === "1";
  const storefront = await getStorefrontPayload();
  const chips = storefront.aboutChips ?? [];
  const values = storefront.aboutValues ?? [];
  const steps = storefront.aboutHowSteps ?? [];
  const team = storefront.aboutTeam ?? [];
  const storyBlocks = storefront.aboutStoryBlocks ?? [];
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
              Edit everything on{" "}
              <Link href="/about" className="font-semibold text-blue-700 hover:text-blue-800">
                /about
              </Link>
              : banner, trust cards, leadership photos, Our story (shop image + text blocks), and how-we-work.
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

        <form
          action={updateAboutPageContent}
          encType="multipart/form-data"
          className="mt-8 space-y-10 border-t border-slate-100 pt-8"
        >
          <section className="space-y-5">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">1. Banner image &amp; height</h2>
              <p className="mt-1 text-xs text-slate-500">Background photo behind the overlay text on /about.</p>
            </div>
            <BannerResponsiveImageFields
              separateDefault={Boolean(storefront.aboutSeparateMobileImage)}
              desktopUrlName="about_primary_image"
              desktopFileName="about_primary_image_file"
              desktopDefault={storefront.aboutPrimaryImage ?? ""}
              mobileUrlName="about_primary_image_mobile"
              mobileFileName="about_primary_image_mobile_file"
              mobileDefault={storefront.aboutPrimaryImageMobile ?? ""}
              sharedLabel="Banner background (all screens)"
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
            <p className="text-[11px] text-slate-500">
              Mobile height only applies on phones (browser width under 768px). Use phone view or narrow the window to
              check it on{" "}
              <Link href="/about" className="font-semibold text-blue-700 hover:text-blue-800">
                /about
              </Link>
              .
            </p>
          </section>

          <section className="space-y-5 border-t border-slate-100 pt-8">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">2. Banner overlay text</h2>
              <p className="mt-1 text-xs text-slate-500">
                Small label, main heading, paragraph, highlight chips, and the two buttons at the bottom of the banner.
              </p>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Small label</label>
              <input
                name="about_eyebrow"
                defaultValue={storefront.aboutEyebrow}
                className={inputClass}
                placeholder="About Al Makkah Electric Traders"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Main heading</label>
              <input
                name="about_page_title"
                defaultValue={storefront.aboutPageTitle}
                className={inputClass}
                placeholder="Home appliances & electrical accessories…"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Paragraph (under the heading)
              </label>
              <textarea
                name="about_page_lead"
                rows={4}
                defaultValue={storefront.aboutPageLead}
                className={textareaClass}
              />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Highlight chips</p>
              <p className="mt-1 text-[11px] text-slate-500">
                Rounded tags under the heading (e.g. COD with confirmation). Leave a slot blank to skip it.
              </p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {Array.from({ length: CHIP_SLOTS }, (_, i) => (
                  <div key={i}>
                    <label className="text-[11px] font-semibold text-slate-500">Chip {i + 1}</label>
                    <input
                      name={`about_chip_${i}`}
                      defaultValue={chips[i] ?? ""}
                      className={inputClass}
                      placeholder={i === 0 ? "Genuine brands" : i === 1 ? "COD with confirmation" : ""}
                    />
                  </div>
                ))}
              </div>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Primary button label
                </label>
                <input
                  name="about_cta_primary_label"
                  defaultValue={storefront.aboutCtaPrimaryLabel}
                  className={inputClass}
                  placeholder="Browse catalog"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Primary button link
                </label>
                <input
                  name="about_cta_primary_href"
                  defaultValue={storefront.aboutCtaPrimaryHref}
                  className={inputClass}
                  placeholder="/products"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Secondary button label
                </label>
                <input
                  name="about_cta_secondary_label"
                  defaultValue={storefront.aboutCtaSecondaryLabel}
                  className={inputClass}
                  placeholder="Contact sales"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Secondary button link
                </label>
                <input
                  name="about_cta_secondary_href"
                  defaultValue={storefront.aboutCtaSecondaryHref}
                  className={inputClass}
                  placeholder="/contact"
                />
              </div>
            </div>
          </section>

          <section className="space-y-4 border-t border-slate-100 pt-8">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">3. Trust / value cards (3)</h2>
              <p className="mt-1 text-xs text-slate-500">
                The three cards directly under the banner (e.g. Genuine products, COD, Fast support).
              </p>
            </div>
            {[0, 1, 2].map((i) => (
              <div key={i} className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
                <div className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Card {i + 1}</div>
                <div>
                  <label className="text-xs font-semibold text-slate-500">Title</label>
                  <input
                    name={`about_value_${i}_title`}
                    defaultValue={values[i]?.title ?? ""}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500">Paragraph</label>
                  <textarea
                    name={`about_value_${i}_body`}
                    rows={3}
                    defaultValue={values[i]?.body ?? ""}
                    className={textareaClass}
                  />
                </div>
              </div>
            ))}
          </section>

          <section className="space-y-4 border-t border-slate-100 pt-8">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">4. How we work</h2>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Section heading</label>
              <input name="about_how_title" defaultValue={storefront.aboutHowTitle} className={inputClass} />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Section paragraph</label>
              <textarea
                name="about_how_lead"
                rows={3}
                defaultValue={storefront.aboutHowLead}
                className={textareaClass}
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Badge text</label>
              <input name="about_how_badge" defaultValue={storefront.aboutHowBadge} className={inputClass} />
            </div>
            {[0, 1, 2].map((i) => (
              <div key={i} className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50/60 p-4 sm:grid-cols-3">
                <div className="sm:col-span-3 text-[11px] font-bold uppercase tracking-wide text-slate-500">
                  Step {i + 1}
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500">Step label</label>
                  <input
                    name={`about_how_${i}_step`}
                    defaultValue={steps[i]?.step ?? ""}
                    className={inputClass}
                    placeholder="01"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-500">Title</label>
                  <input name={`about_how_${i}_title`} defaultValue={steps[i]?.title ?? ""} className={inputClass} />
                </div>
                <div className="sm:col-span-3">
                  <label className="text-xs font-semibold text-slate-500">Paragraph</label>
                  <textarea
                    name={`about_how_${i}_body`}
                    rows={2}
                    defaultValue={steps[i]?.body ?? ""}
                    className={textareaClass}
                  />
                </div>
              </div>
            ))}
          </section>

          <section className="space-y-4 border-t border-slate-100 pt-8">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">5. Leadership / team</h2>
              <p className="mt-1 text-xs text-slate-500">
                Centered heading + circular photos with name, role, and short description (leave a slot blank to skip).
              </p>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Small label</label>
              <input
                name="about_team_eyebrow"
                defaultValue={storefront.aboutTeamEyebrow}
                className={inputClass}
                placeholder="The people behind the business"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Heading</label>
              <input
                name="about_team_title"
                defaultValue={storefront.aboutTeamTitle}
                className={inputClass}
                placeholder="Meet Our Leadership"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Paragraph</label>
              <textarea
                name="about_team_lead"
                rows={3}
                defaultValue={storefront.aboutTeamLead}
                className={textareaClass}
              />
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  CTA button label (optional)
                </label>
                <input name="about_team_cta_label" defaultValue={storefront.aboutTeamCtaLabel} className={inputClass} />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">CTA button link</label>
                <input
                  name="about_team_cta_href"
                  defaultValue={storefront.aboutTeamCtaHref}
                  className={inputClass}
                  placeholder="/contact"
                />
              </div>
            </div>
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50/60 p-4 sm:grid-cols-2">
                <div className="sm:col-span-2 text-[11px] font-bold uppercase tracking-wide text-slate-500">
                  Person {i + 1}
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500">Name</label>
                  <input name={`about_team_${i}_name`} defaultValue={team[i]?.name ?? ""} className={inputClass} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500">Initials (fallback)</label>
                  <input
                    name={`about_team_${i}_initials`}
                    defaultValue={team[i]?.initials ?? ""}
                    className={inputClass}
                    maxLength={4}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500">Role</label>
                  <input name={`about_team_${i}_role`} defaultValue={team[i]?.role ?? ""} className={inputClass} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500">Short description</label>
                  <textarea
                    name={`about_team_${i}_note`}
                    rows={2}
                    defaultValue={team[i]?.note ?? ""}
                    className={textareaClass}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-500">Photo URL</label>
                  <input
                    name={`about_team_${i}_image`}
                    defaultValue={team[i]?.imageUrl ?? ""}
                    className={inputClass}
                    placeholder="https://… or /photo.jpg"
                  />
                  <label className="mt-3 block text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    Or upload photo
                  </label>
                  <input
                    name={`about_team_${i}_image_file`}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif,.jpg,.jpeg,.png,.webp,.gif"
                    className={ADMIN_IMAGE_FILE_INPUT_CLASS}
                  />
                  <p className="mt-1 text-[11px] text-slate-500">{ADMIN_IMAGE_UPLOAD_HINT}</p>
                </div>
              </div>
            ))}
          </section>

          <section className="space-y-4 border-t border-slate-100 pt-8">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">6. Our story</h2>
              <p className="mt-1 text-xs text-slate-500">
                Shop photo under the leadership section, then as many heading + paragraph blocks as you need.
              </p>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Small label</label>
              <input
                name="about_story_eyebrow"
                defaultValue={storefront.aboutStoryEyebrow}
                className={inputClass}
                placeholder="Our story"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Heading</label>
              <input
                name="about_story_title"
                defaultValue={storefront.aboutStoryTitle}
                className={inputClass}
                placeholder="From the shop floor to your doorstep"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Intro paragraph</label>
              <textarea
                name="about_story_lead"
                rows={3}
                defaultValue={storefront.aboutStoryLead}
                className={textareaClass}
              />
            </div>
            <StorefrontImageUploadField
              label="Shop image (under Our story)"
              urlName="about_secondary_image"
              defaultUrl={storefront.aboutSecondaryImage ?? ""}
            />
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Extra heading + paragraph blocks
              </p>
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
                  <div className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Block {i + 1}</div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500">Heading</label>
                    <input
                      name={`about_story_block_${i}_title`}
                      defaultValue={storyBlocks[i]?.title ?? ""}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500">Paragraph</label>
                    <textarea
                      name={`about_story_block_${i}_body`}
                      rows={3}
                      defaultValue={storyBlocks[i]?.body ?? ""}
                      className={textareaClass}
                    />
                  </div>
                </div>
              ))}
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
