import Link from "next/link";
import { updateHomePageContent } from "@/app/admin/actions";
import { DEMO_TESTIMONIALS } from "@/lib/testimonials";
import { getStorefrontPayload } from "@/lib/storefront";

export const dynamic = "force-dynamic";

const inputClass =
  "mt-2 h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100";
const textareaClass =
  "mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100";

const REVIEW_SLOTS = 8;
const FAQ_SLOTS = 8;
const BRAND_LOGO_SLOTS = 12;

export default async function AdminHomeContentPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const error = typeof sp.error === "string" ? sp.error : undefined;
  const saved = sp.saved === "1";
  const storefront = await getStorefrontPayload();
  const reviews =
    storefront.testimonials && storefront.testimonials.length > 0
      ? storefront.testimonials
      : [...DEMO_TESTIMONIALS];
  const faqs = storefront.faqs ?? [];
  const brandLogos = storefront.brandLogos ?? [];

  return (
    <main className="py-6 lg:py-0">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Home page content</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Edit headings, paragraphs, brand logos strip, customer reviews, and FAQs on the homepage.
            </p>
          </div>
          <Link href="/admin" className="text-sm font-semibold text-blue-700 hover:text-blue-800">
            ← Dashboard
          </Link>
        </div>

        {saved ? (
          <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-900">
            Home content saved.
          </div>
        ) : null}

        {error ? (
          <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">
            Could not save ({error.replace(/-/g, " ")}).
          </div>
        ) : null}

        <form action={updateHomePageContent} className="mt-8 space-y-8 border-t border-slate-100 pt-8">
          <section>
            <h2 className="text-lg font-semibold text-slate-900">Browse categories section</h2>
            <p className="mt-1 text-xs text-slate-500">
              Heading and paragraph above the category cards on the homepage (when the curated browse grid is off).
            </p>
            <div className="mt-4 grid gap-5">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Heading</label>
                <input
                  name="browse_categories_title"
                  defaultValue={storefront.browseCategoriesTitle}
                  className={inputClass}
                  placeholder="Browse categories"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Paragraph</label>
                <textarea
                  name="browse_categories_lead"
                  rows={2}
                  defaultValue={storefront.browseCategoriesLead}
                  className={textareaClass}
                  placeholder="Quick links to the same categories in the navbar dropdown."
                />
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">Featured picks section</h2>
            <p className="mt-1 text-xs text-slate-500">Heading and paragraph above the Featured picks carousel.</p>
            <div className="mt-4 grid gap-5">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Heading</label>
                <input
                  name="featured_section_title"
                  defaultValue={storefront.featuredSectionTitle}
                  className={inputClass}
                  placeholder="Featured picks"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Paragraph</label>
                <textarea
                  name="featured_section_lead"
                  rows={3}
                  defaultValue={storefront.featuredSectionLead}
                  className={textareaClass}
                  placeholder="Hot-selling highlights chosen by admin…"
                />
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">Gadget section</h2>
            <p className="mt-1 text-xs text-slate-500">Heading and paragraph above the Gadget carousel.</p>
            <div className="mt-4 grid gap-5">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Heading</label>
                <input
                  name="gadgets_section_title"
                  defaultValue={storefront.gadgetsSectionTitle}
                  className={inputClass}
                  placeholder="Gadget section"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Paragraph</label>
                <textarea
                  name="gadgets_section_lead"
                  rows={3}
                  defaultValue={storefront.gadgetsSectionLead}
                  className={textareaClass}
                  placeholder="More popular items — same layout as Featured picks."
                />
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">Trust &amp; stats section</h2>
            <div className="mt-4 grid gap-5">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Section heading</label>
                <input name="home_stats_title" defaultValue={storefront.homeStatsTitle} className={inputClass} />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Section paragraph</label>
                <textarea
                  name="home_stats_lead"
                  rows={3}
                  defaultValue={storefront.homeStatsLead}
                  className={textareaClass}
                />
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">Brands logo strip</h2>
            <p className="mt-1 text-xs text-slate-500">
              Heading, description, and round logos that slide continuously above the reviews section. Leave image blank
              to show initials.
            </p>
            <div className="mt-4 grid gap-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Small label</label>
                  <input
                    name="brands_section_eyebrow"
                    defaultValue={storefront.brandsSectionEyebrow}
                    className={inputClass}
                    placeholder="Brands"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Heading</label>
                  <input
                    name="brands_section_title"
                    defaultValue={storefront.brandsSectionTitle}
                    className={inputClass}
                    placeholder="Brands we carry"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Paragraph</label>
                <textarea
                  name="brands_section_lead"
                  rows={2}
                  defaultValue={storefront.brandsSectionLead}
                  className={textareaClass}
                />
              </div>
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Logos</p>
                {Array.from({ length: BRAND_LOGO_SLOTS }, (_, i) => {
                  const row = brandLogos[i];
                  return (
                    <div
                      key={i}
                      className="grid gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-4 sm:grid-cols-2"
                    >
                      <div>
                        <label className="text-[11px] font-semibold text-slate-500">Brand name {i + 1}</label>
                        <input
                          name={`brand_logo_${i}_name`}
                          defaultValue={row?.name ?? ""}
                          className={inputClass}
                          placeholder="Philips"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-500">
                          Logo image URL (optional)
                        </label>
                        <input
                          name={`brand_logo_${i}_image`}
                          defaultValue={row?.imageUrl ?? ""}
                          className={inputClass}
                          placeholder="https://… or /logo.png"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">Customer reviews</h2>
            <p className="mt-1 text-xs text-slate-500">
              Section copy, rating card, and up to {REVIEW_SLOTS} quotes shown in the reviews carousel. Leave a row blank
              to skip it.
            </p>
            <div className="mt-4 grid gap-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Small label</label>
                  <input
                    name="testimonials_eyebrow"
                    defaultValue={storefront.testimonialsEyebrow}
                    className={inputClass}
                    placeholder="Reviews"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Main heading</label>
                  <input
                    name="testimonials_heading"
                    defaultValue={storefront.testimonialsHeading}
                    className={inputClass}
                    placeholder="What customers say"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Intro paragraph</label>
                <textarea
                  name="testimonials_lead"
                  rows={3}
                  defaultValue={storefront.testimonialsLead}
                  className={textareaClass}
                />
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Rating score</label>
                  <input
                    name="reviews_rating_score"
                    defaultValue={storefront.reviewsRatingScore}
                    className={inputClass}
                    placeholder="5.0"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Rating card note</label>
                  <textarea
                    name="reviews_rating_note"
                    rows={2}
                    defaultValue={storefront.reviewsRatingNote}
                    className={textareaClass}
                    placeholder="Illustrative rating · swap for real Google / Trustpilot embed when ready."
                  />
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Review quotes</p>
                {Array.from({ length: REVIEW_SLOTS }, (_, i) => {
                  const row = reviews[i];
                  return (
                    <div
                      key={i}
                      className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 sm:p-5"
                    >
                      <p className="text-xs font-semibold text-slate-500">Review {i + 1}</p>
                      <div className="mt-3 grid gap-4">
                        <div>
                          <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Quote
                          </label>
                          <textarea
                            name={`review_${i}_quote`}
                            rows={3}
                            defaultValue={row?.quote ?? ""}
                            className={textareaClass}
                            placeholder="Customer quote…"
                          />
                        </div>
                        <div className="grid gap-4 sm:grid-cols-3">
                          <div>
                            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                              Name
                            </label>
                            <input
                              name={`review_${i}_name`}
                              defaultValue={row?.name ?? ""}
                              className={inputClass}
                              placeholder="Hassan R."
                            />
                          </div>
                          <div>
                            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                              Meta
                            </label>
                            <input
                              name={`review_${i}_meta`}
                              defaultValue={row?.meta ?? ""}
                              className={inputClass}
                              placeholder="Verified buyer · Lahore"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                              Initials
                            </label>
                            <input
                              name={`review_${i}_initials`}
                              defaultValue={row?.initials ?? ""}
                              className={inputClass}
                              placeholder="HR"
                              maxLength={4}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">FAQs</h2>
            <p className="mt-1 text-xs text-slate-500">
              Heading, contact link, and up to {FAQ_SLOTS} question/answer pairs under the reviews section. Leave a row
              blank to skip it.
            </p>
            <div className="mt-4 grid gap-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Small label</label>
                  <input
                    name="faq_eyebrow"
                    defaultValue={storefront.faqEyebrow}
                    className={inputClass}
                    placeholder="FAQs"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Main heading</label>
                  <input
                    name="faq_heading"
                    defaultValue={storefront.faqHeading}
                    className={inputClass}
                    placeholder="Frequently asked questions"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Intro paragraph</label>
                <textarea
                  name="faq_lead"
                  rows={2}
                  defaultValue={storefront.faqLead}
                  className={textareaClass}
                  placeholder="Quick answers about delivery, authenticity, wholesale, and support."
                />
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Contact link label
                  </label>
                  <input
                    name="faq_contact_label"
                    defaultValue={storefront.faqContactLabel}
                    className={inputClass}
                    placeholder="Contact us →"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Contact link URL
                  </label>
                  <input
                    name="faq_contact_href"
                    defaultValue={storefront.faqContactHref}
                    className={inputClass}
                    placeholder="/contact"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Questions &amp; answers</p>
                {Array.from({ length: FAQ_SLOTS }, (_, i) => {
                  const row = faqs[i];
                  return (
                    <div
                      key={i}
                      className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 sm:p-5"
                    >
                      <p className="text-xs font-semibold text-slate-500">FAQ {i + 1}</p>
                      <div className="mt-3 grid gap-4">
                        <div>
                          <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Question
                          </label>
                          <input
                            name={`faq_${i}_q`}
                            defaultValue={row?.q ?? ""}
                            className={inputClass}
                            placeholder="Do you offer delivery services?"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Answer
                          </label>
                          <textarea
                            name={`faq_${i}_a`}
                            rows={3}
                            defaultValue={row?.a ?? ""}
                            className={textareaClass}
                            placeholder="Yes — we offer fast and reliable delivery…"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          <button
            type="submit"
            className="inline-flex h-12 items-center justify-center rounded-full bg-blue-600 px-8 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Save home content
          </button>
        </form>
      </div>
    </main>
  );
}
