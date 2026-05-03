import Link from "next/link";
import { mergeStorefrontSettings } from "@/app/admin/actions";
import { ADMIN_IMAGE_FILE_INPUT_CLASS, ADMIN_IMAGE_UPLOAD_HINT } from "@/lib/admin-media-upload";
import { getStorefrontPayload } from "@/lib/storefront";
import type { ResolvedStorefront } from "@/lib/storefront";

export const dynamic = "force-dynamic";

function fieldRow(
  id: keyof Pick<
    ResolvedStorefront,
    | "headerAccent"
    | "testimonialsLead"
    | "heroTitle"
    | "heroBadgeCod"
    | "heroBadgeRegion"
    | "heroLeadParagraph"
    | "bankName"
    | "bankIban"
    | "bankAccountTitle"
    | "jazzcashNumber"
    | "jazzcashTitle"
    | "supportDeskHours"
    | "supportEscalations"
    | "supportCommitmentsIntro"
  >,
  label: string,
  hint: string,
  storefront: ResolvedStorefront,
  multiline = false,
  nameMap?: Record<string, string>,
) {
  const inputName = nameMap?.[id] ?? String(id).replace(/([A-Z])/g, "_$1").toLowerCase().replace(/^_/, "");
  const v = storefront[id];
  const val = v == null ? "" : typeof v === "string" ? v : "";

  return (
    <div className="sm:col-span-6 lg:col-span-4">
      <label htmlFor={inputName} className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </label>
      <p className="mt-1 text-xs text-slate-500">{hint}</p>
      {multiline ? (
        <textarea
          id={inputName}
          name={inputName}
          rows={4}
          defaultValue={val}
          className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
        />
      ) : (
        <input
          id={inputName}
          name={inputName}
          defaultValue={val}
          className="mt-2 h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
        />
      )}
    </div>
  );
}

export default async function AdminSitePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const error =
    typeof sp.error === "string"
      ? sp.error.replace(/-/g, " ").replace(/^bad image url$/i, "Bad image URL (use https:// or a path beginning with /)")
      : undefined;

  const storefront = await getStorefrontPayload();
  const socialDefault = JSON.stringify(storefront.socialLinks, null, 2);
  const testimonialsDefault =
    storefront.testimonials && storefront.testimonials.length > 0 ? JSON.stringify(storefront.testimonials, null, 2) : "";

  const imgNames = {
    aboutPrimaryImage: "about_primary_image",
    aboutSecondaryImage: "about_secondary_image",
    contactPrimaryImage: "contact_primary_image",
    contactSecondaryImage: "contact_secondary_image",
  } as const;

  return (
    <main className="py-6 lg:py-0">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Site content & checkout copy</h1>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600">
              Homepage hero ribbons, testimonials intro paragraph, WhatsApp/footer social URLs, SEO-friendly bank & JazzCash wording for checkout, optional About/
              Contact photos (<span className="font-semibold">URL or upload</span> — HTTPS, <code className="text-xs">/</code>-rooted paths, or files into Supabase{" "}
              <code className="text-xs">admin-media</code>), and structured reviews JSON consumed on the testimonials strip. Leave JSON fields blank to keep whatever is saved now.
            </p>
          </div>
          <Link href="/admin" className="text-sm font-semibold text-blue-700 hover:text-blue-800">
            ← Dashboard
          </Link>
        </div>

        {error ? (
          <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">
            Could not save: {decodeURIComponent(error)}
          </div>
        ) : null}

        <form action={mergeStorefrontSettings} className="mt-8 space-y-10">
          <section className="rounded-3xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5">
            <h2 className="text-lg font-semibold text-slate-900">Hero & header copy</h2>
            <div className="mt-5 grid gap-5 sm:grid-cols-6">
              {fieldRow("headerAccent", "Hero accent line", "Blue text beneath the badges — replaces the shorter brand tagline on the carousel.", storefront, false, {
                headerAccent: "header_accent",
              })}
              {fieldRow("heroTitle", "Full hero headline (optional)", "Leave blank to keep default gradient headline.", storefront, false, {
                heroTitle: "hero_title",
              })}
              {fieldRow(
                "heroBadgeCod",
                "Emerald pill text",
                "First lifestyle chip beside the logo on the carousel (usually COD wording).",
                storefront,
                false,
                { heroBadgeCod: "hero_badge_cod" },
              )}
              {fieldRow(
                "heroBadgeRegion",
                "Secondary chip text (optional)",
                "Adds a translucent chip when filled — omit to hide.",
                storefront,
                false,
                { heroBadgeRegion: "hero_badge_region" },
              )}
              {fieldRow(
                "heroLeadParagraph",
                "Hero paragraph",
                "Long supporting copy under the main headline.",
                storefront,
                true,
                { heroLeadParagraph: "hero_lead" },
              )}
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5">
            <h2 className="text-lg font-semibold text-slate-900">Testimonials & social</h2>
            <p className="mt-2 max-w-2xl text-xs text-slate-600">
              Reviews JSON must mirror <code className="font-mono">quote</code>, <code className="font-mono">name</code>,{" "}
              <code className="font-mono">meta</code>, <code className="font-mono">initials</code>. Leave textarea empty to keep existing testimonials in the database unchanged.
              Social JSON accepts up to twelve HTTPS links (<code className="font-mono">label</code>, <code className="font-mono">url</code>, optional{" "}
              <code className="font-mono">platform</code> hints for footer icons).
            </p>

            <div className="mt-5 grid gap-5 lg:grid-cols-6">
              {fieldRow("testimonialsLead", "Intro above reviews", "Short paragraph framing the carousel.", storefront, false, {
                testimonialsLead: "testimonials_lead",
              })}
              <div className="lg:col-span-3">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Reviews JSON (optional)</label>
                <textarea
                  name="testimonials_json"
                  rows={9}
                  defaultValue={testimonialsDefault}
                  placeholder={`[\n  { "quote": "…", "name": "…", "meta": "Verified · City", "initials": "AB" }\n]`}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-mono text-xs outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
                />
              </div>
              <div className="lg:col-span-3">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Social links JSON (optional)</label>
                <textarea
                  name="social_links_json"
                  rows={9}
                  defaultValue={socialDefault}
                  placeholder="Paste JSON to replace social URLs; clear and save does not auto-revert."
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-mono text-xs outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
                />
                <p className="mt-2 text-[11px] text-slate-500">Replace only when intentionally updating footer links.</p>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5">
            <h2 className="text-lg font-semibold text-slate-900">About / contact imagery</h2>
            <p className="mt-2 max-w-2xl text-xs text-slate-600">
              Supabase CDN HTTPS URLs, rooted paths (<code>/photo.jpg</code> in <code>/public</code>), or upload — file wins over the URL on save.{" "}
              {ADMIN_IMAGE_UPLOAD_HINT}
            </p>
            <div className="mt-5 grid gap-5 md:grid-cols-6">
              {(["aboutPrimaryImage", "aboutSecondaryImage", "contactPrimaryImage", "contactSecondaryImage"] as const).map((k) => {
                const urlName = imgNames[k];
                return (
                  <div key={k} className="md:col-span-3">
                    <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      {k.replace(/([A-Z])/g, " $1").trim()}
                    </label>
                    <input
                      name={urlName}
                      defaultValue={(storefront[k] as string)?.trim?.() ?? ""}
                      placeholder="https://… or /file-in-public-folder.jpg"
                      className="mt-2 h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 font-mono text-[11px] outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
                    />
                    <label className="mt-3 block text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      Upload
                    </label>
                    <input
                      name={`${urlName}_file`}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      className={ADMIN_IMAGE_FILE_INPUT_CLASS}
                    />
                  </div>
                );
              })}
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5">
            <h2 className="text-lg font-semibold text-slate-900">Contact page — support hours &amp; SLA lines</h2>
            <p className="mt-2 max-w-2xl text-xs text-slate-600">
              These strings appear in the dashed “Support commitments” card on <span className="font-semibold">/contact</span>, the visit section hours line, and{" "}
              <span className="font-semibold">desk hours in the footer</span>. Use 24-hour times (e.g. 08:00–20:00) for an 8-to-8 day.
            </p>
            <div className="mt-5 grid gap-5 sm:grid-cols-6">
              {fieldRow("supportDeskHours", "Desk hours", "e.g. 08:00–20:00 PKT · Mon–Sat", storefront, false, {
                supportDeskHours: "support_desk_hours",
              })}
              {fieldRow("supportEscalations", "Escalations", "Second row in the support card.", storefront, false, {
                supportEscalations: "support_escalations",
              })}
              {fieldRow(
                "supportCommitmentsIntro",
                "Support card intro paragraph",
                "Grey paragraph above the two rows.",
                storefront,
                true,
                { supportCommitmentsIntro: "support_commitments_intro" },
              )}
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5">
            <h2 className="text-lg font-semibold text-slate-900">Manual payment wording (shown on checkout)</h2>
            <div className="mt-5 grid gap-5 sm:grid-cols-6">
              {fieldRow("bankName", "Bank label", "Short title above IBAN helper text.", storefront, false, {
                bankName: "bank_name",
              })}
              {fieldRow("bankIban", "IBAN / account details", "Shown to shoppers copying bank-transfer notes.", storefront, true, {
                bankIban: "bank_iban",
              })}
              {fieldRow("bankAccountTitle", "Account title", "Displayed under IBAN chips.", storefront, false, {
                bankAccountTitle: "bank_account_title",
              })}
              {fieldRow("jazzcashNumber", "JazzCash number", "", storefront, false, { jazzcashNumber: "jazzcash_number" })}
              {fieldRow("jazzcashTitle", "Wallet label", "", storefront, false, { jazzcashTitle: "jazzcash_title" })}
            </div>
          </section>

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              className="inline-flex h-12 items-center justify-center rounded-full bg-blue-600 px-8 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
            >
              Save settings
            </button>
            <Link href="/" className="inline-flex h-12 items-center justify-center rounded-full border border-slate-200 px-8 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              View storefront
            </Link>
          </div>
        </form>

        <div className="mt-10 space-y-4">
          <details className="rounded-2xl border border-slate-200 bg-white p-4 text-xs text-slate-600">
            <summary className="cursor-pointer font-semibold text-slate-900">Backup snippet · testimonials</summary>
            <pre className="mt-3 max-h-40 overflow-auto rounded-xl bg-slate-50 p-3 font-mono text-[11px] ring-1 ring-slate-100">
              {testimonialsDefault || "// empty — storefront falls back to built-in demos"}
            </pre>
          </details>
          <details className="rounded-2xl border border-slate-200 bg-white p-4 text-xs text-slate-600">
            <summary className="cursor-pointer font-semibold text-slate-900">Backup snippet · social</summary>
            <pre className="mt-3 max-h-60 overflow-auto rounded-xl bg-slate-50 p-3 font-mono text-[11px] ring-1 ring-slate-100">{socialDefault}</pre>
          </details>
        </div>
      </div>
    </main>
  );
}
