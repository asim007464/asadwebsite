import Link from "next/link";
import { SafeRemoteImage } from "@/components/SafeRemoteImage";
import { clampBannerHeightPx } from "@/lib/banner-height";
import { SITE_SHOP_NAME } from "@/lib/site-brand";
import { getStorefrontPayload } from "@/lib/storefront";

export const dynamic = "force-dynamic";

const ABOUT_FALLBACK_BANNER = "/20260401_153109.jpg.jpeg";

export default async function AboutPage() {
  const storefront = await getStorefrontPayload();
  const bannerImage = (storefront.aboutPrimaryImage ?? "").trim() || ABOUT_FALLBACK_BANNER;
  const bannerHeight = clampBannerHeightPx(storefront.aboutBannerHeightPx, 420, 280, 720);
  const eyebrow = storefront.aboutEyebrow?.trim() || `About ${SITE_SHOP_NAME}`;
  const title = storefront.aboutPageTitle?.trim() || DEFAULT_TITLE;
  const lead = storefront.aboutPageLead?.trim() || "";
  const chips = storefront.aboutChips ?? [];
  const primaryLabel = storefront.aboutCtaPrimaryLabel?.trim() || "Browse catalog";
  const primaryHref = storefront.aboutCtaPrimaryHref?.trim() || "/products";
  const secondaryLabel = storefront.aboutCtaSecondaryLabel?.trim() || "Contact sales";
  const secondaryHref = storefront.aboutCtaSecondaryHref?.trim() || "/contact";
  const values = storefront.aboutValues ?? [];
  const howSteps = storefront.aboutHowSteps ?? [];
  const team = storefront.aboutTeam ?? [];

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      {/* Full-bleed promotional banner — editable in Admin → About page */}
      <section
        className="relative isolate overflow-hidden rounded-2xl shadow-lg ring-1 ring-slate-200/70 sm:rounded-3xl"
        style={{ minHeight: bannerHeight }}
        aria-labelledby="about-banner-heading"
      >
        <div className="absolute inset-0">
          <SafeRemoteImage
            src={bannerImage}
            alt=""
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
        </div>
        <div className="pointer-events-none absolute inset-0 bg-slate-950/35" aria-hidden />
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/55 to-slate-950/10"
          aria-hidden
        />

        <div
          className="relative z-10 flex flex-col justify-end px-5 pb-5 pt-16 sm:px-8 sm:pb-8 sm:pt-20 md:px-10 md:pb-10"
          style={{ minHeight: bannerHeight }}
        >
          <div className="max-w-3xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-blue-200/95">{eyebrow}</p>
            <h1
              id="about-banner-heading"
              className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl lg:leading-tight"
            >
              {title}
            </h1>
            {lead ? (
              <p className="mt-3 max-w-2xl text-[13px] leading-relaxed text-blue-50/90 sm:text-sm md:text-[15px]">
                {lead}
              </p>
            ) : null}
            {chips.length ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {chips.map((chip) => (
                  <span
                    key={chip}
                    className="rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur-sm sm:text-xs"
                  >
                    {chip}
                  </span>
                ))}
              </div>
            ) : null}
          </div>

          <div className="mt-5 flex flex-col gap-2.5 sm:mt-6 sm:flex-row sm:items-center sm:gap-3">
            <Link
              href={primaryHref}
              className="inline-flex h-11 items-center justify-center rounded-full bg-white px-6 text-sm font-bold text-blue-900 shadow-md transition hover:bg-blue-50 sm:h-12 sm:px-7"
            >
              {primaryLabel}
            </Link>
            <Link
              href={secondaryHref}
              className="inline-flex h-11 items-center justify-center rounded-full border border-white/40 bg-white/10 px-6 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20 sm:h-12 sm:px-7"
            >
              {secondaryLabel}
            </Link>
          </div>
        </div>
      </section>

      {values.length ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {values.map((item) => (
            <div key={item.title} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="text-sm font-semibold text-slate-900">{item.title}</div>
              <div className="mt-2 text-sm leading-relaxed text-slate-600">{item.body}</div>
            </div>
          ))}
        </div>
      ) : null}

      <section className="mt-10 rounded-3xl border border-blue-100 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-slate-900">
              {storefront.aboutHowTitle?.trim() || "How we work with shoppers"}
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600">
              {storefront.aboutHowLead?.trim() || ""}
            </p>
          </div>
          {storefront.aboutHowBadge?.trim() ? (
            <div className="rounded-full bg-blue-50 px-4 py-2 text-xs font-semibold text-blue-900 ring-1 ring-blue-100">
              {storefront.aboutHowBadge.trim()}
            </div>
          ) : null}
        </div>

        {howSteps.length ? (
          <ol className="mt-8 grid gap-4 md:grid-cols-3">
            {howSteps.map((item) => (
              <li key={`${item.step}-${item.title}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <div className="text-xs font-semibold uppercase tracking-wide text-blue-700">{item.step}</div>
                <div className="mt-2 text-sm font-semibold text-slate-900">{item.title}</div>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.body}</p>
              </li>
            ))}
          </ol>
        ) : null}
      </section>

      <section className="mt-10 rounded-3xl border border-slate-200 bg-gradient-to-br from-blue-50/70 via-white to-white p-8 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-blue-700">
              {storefront.aboutTeamEyebrow?.trim() || "Team"}
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              {storefront.aboutTeamTitle?.trim() || "Meet our team"}
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600">
              {storefront.aboutTeamLead?.trim() || ""}
            </p>
          </div>
          <Link
            href="/contact"
            className="inline-flex h-11 items-center justify-center rounded-full bg-blue-600 px-6 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
          >
            {storefront.aboutTeamCtaLabel?.trim() || "Talk to us"}
          </Link>
        </div>

        {team.length ? (
          <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {team.map((m) => (
              <div key={m.name} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-sm font-bold text-blue-800 ring-1 ring-blue-100">
                    {m.initials}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-slate-900">{m.name}</div>
                    <div className="text-xs font-medium text-slate-500">{m.role}</div>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-slate-600">{m.note}</p>
              </div>
            ))}
          </div>
        ) : null}
      </section>
    </main>
  );
}

const DEFAULT_TITLE = "Home appliances & electrical accessories for everyday Pakistan households";
