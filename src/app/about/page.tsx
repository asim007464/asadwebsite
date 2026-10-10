import Link from "next/link";
import { SafeRemoteImage } from "@/components/SafeRemoteImage";
import {
  BANNER_HEIGHT_FIXED_CLASS,
  bannerHeightStyle,
  clampBannerHeightPx,
  DEFAULT_ABOUT_BANNER_HEIGHT_MOBILE_PX,
  DEFAULT_ABOUT_BANNER_HEIGHT_PX,
} from "@/lib/banner-height";
import { resolveBannerImages } from "@/lib/banner-images";
import { SITE_SHOP_NAME } from "@/lib/site-brand";
import { splitProseSections } from "@/lib/split-prose";
import { getStorefrontPayload } from "@/lib/storefront";

export const dynamic = "force-dynamic";

const ABOUT_FALLBACK_BANNER = "/20260401_153109.jpg.jpeg";

export default async function AboutPage() {
  const storefront = await getStorefrontPayload();
  const { desktop: bannerDesktop, mobile: bannerMobile } = resolveBannerImages(
    (storefront.aboutPrimaryImage ?? "").trim() || ABOUT_FALLBACK_BANNER,
    storefront.aboutPrimaryImageMobile,
    storefront.aboutSeparateMobileImage,
  );
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
  const bannerHeightCss = bannerHeightStyle(bannerHeight, bannerHeightMobile);
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
  const storyBlocks = storefront.aboutStoryBlocks ?? [];
  const shopImage = (storefront.aboutSecondaryImage ?? "").trim() || ABOUT_FALLBACK_BANNER;
  const teamEyebrow = storefront.aboutTeamEyebrow?.trim() || "The people behind the business";
  const teamTitle = storefront.aboutTeamTitle?.trim() || "Meet Our Leadership";
  const teamLead = storefront.aboutTeamLead?.trim() || "";
  const storyEyebrow = storefront.aboutStoryEyebrow?.trim() || "Our story";
  const storyTitle = storefront.aboutStoryTitle?.trim() || "From the shop floor to your doorstep";
  const storyLead = storefront.aboutStoryLead?.trim() || "";

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <section
        className={`relative isolate overflow-hidden rounded-2xl shadow-lg ring-1 ring-slate-200/70 sm:rounded-3xl ${BANNER_HEIGHT_FIXED_CLASS}`}
        style={bannerHeightCss}
        aria-labelledby="about-banner-heading"
      >
        <div className="absolute inset-0 md:hidden">
          <SafeRemoteImage
            src={bannerMobile || bannerDesktop}
            alt=""
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
        </div>
        <div className="absolute inset-0 hidden md:block">
          <SafeRemoteImage
            src={bannerDesktop}
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

        <div className="relative z-10 flex h-full min-h-0 flex-col justify-end px-5 py-4 sm:px-8 sm:py-6 md:px-10 md:py-8">
          <div className="max-w-3xl overflow-hidden">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-blue-200/95">{eyebrow}</p>
            <h1
              id="about-banner-heading"
              className="mt-1.5 text-xl font-bold tracking-tight text-white sm:mt-2 sm:text-3xl lg:text-4xl lg:leading-tight"
            >
              {title}
            </h1>
            {lead ? (
              <p className="mt-2 line-clamp-3 max-w-2xl text-[13px] leading-relaxed text-blue-50/90 sm:mt-3 sm:line-clamp-none sm:text-sm md:text-[15px]">
                {lead}
              </p>
            ) : null}
            {chips.length ? (
              <div className="mt-3 flex flex-wrap gap-2 sm:mt-4">
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

          <div className="mt-4 flex flex-col gap-2 sm:mt-5 sm:flex-row sm:items-center sm:gap-3">
            <Link
              href={primaryHref}
              className="inline-flex h-10 items-center justify-center rounded-full bg-white px-5 text-sm font-bold text-blue-900 shadow-md transition hover:bg-blue-50 sm:h-12 sm:px-7"
            >
              {primaryLabel}
            </Link>
            <Link
              href={secondaryHref}
              className="inline-flex h-10 items-center justify-center rounded-full border border-white/40 bg-white/10 px-5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20 sm:h-12 sm:px-7"
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

      {/* Leadership — centered heading + circular portraits */}
      <section className="mt-14 sm:mt-16" aria-labelledby="about-leadership-heading">
        <div className="mx-auto max-w-2xl text-center">
          <div className="flex items-center justify-center gap-3">
            <span className="hidden h-px w-10 bg-slate-300 sm:block" aria-hidden />
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">{teamEyebrow}</p>
            <span className="hidden h-px w-10 bg-slate-300 sm:block" aria-hidden />
          </div>
          <h2
            id="about-leadership-heading"
            className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl"
          >
            {teamTitle}
          </h2>
          {teamLead ? (
            <p className="mt-4 text-sm leading-relaxed text-slate-600 sm:text-[15px]">{teamLead}</p>
          ) : null}
        </div>

        {team.length ? (
          <div className="mx-auto mt-10 grid max-w-3xl grid-cols-2 gap-x-8 gap-y-12 sm:mt-12 sm:gap-x-16 sm:gap-y-14">
            {team.map((m) => {
              const photo = (m.imageUrl ?? "").trim();
              const usePhoto =
                photo.startsWith("https://") || (photo.startsWith("/") && photo.length > 1);
              const note = (m.note ?? "").trim();
              return (
                <article key={m.name} className="flex flex-col items-center text-center">
                  <div className="relative h-44 w-44 overflow-hidden rounded-full bg-slate-100 ring-2 ring-amber-200/80 sm:h-56 sm:w-56">
                    {usePhoto ? (
                      <SafeRemoteImage src={photo} alt={m.name} fill className="object-cover" sizes="224px" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-blue-50 text-3xl font-bold text-blue-800 sm:text-4xl">
                        {m.initials}
                      </div>
                    )}
                  </div>
                  <h3 className="mt-5 text-lg font-bold tracking-tight text-slate-900 sm:text-xl">{m.name}</h3>
                  <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                    {m.role}
                  </p>
                  {note ? (
                    <p className="mt-3 max-w-[16rem] text-xs leading-relaxed text-slate-600 sm:text-sm">
                      {note}
                    </p>
                  ) : null}
                </article>
              );
            })}
          </div>
        ) : null}

        {storefront.aboutTeamCtaLabel?.trim() ? (
          <div className="mt-10 flex justify-center">
            <Link
              href={storefront.aboutTeamCtaHref?.trim() || "/contact"}
              className="inline-flex h-11 items-center justify-center rounded-full bg-blue-600 px-6 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
            >
              {storefront.aboutTeamCtaLabel.trim()}
            </Link>
          </div>
        ) : null}
      </section>

      {/* Our story — shop image + repeatable heading/paragraph blocks */}
      <section className="mt-16 sm:mt-20" aria-labelledby="about-story-heading">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-blue-700">{storyEyebrow}</p>
          <h2
            id="about-story-heading"
            className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl"
          >
            {storyTitle}
          </h2>
          {storyLead ? (
            <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-[15px]">{storyLead}</p>
          ) : null}
        </div>

        <div className="relative mt-8 aspect-[21/9] min-h-[180px] overflow-hidden rounded-3xl bg-slate-100 shadow-sm ring-1 ring-slate-200 sm:mt-10 sm:min-h-[240px]">
          <SafeRemoteImage src={shopImage} alt={`${SITE_SHOP_NAME} shop`} fill className="object-cover" sizes="100vw" />
        </div>

        {storyBlocks.length ? (
          <div className="mx-auto mt-10 max-w-3xl space-y-8 text-center sm:mt-12">
            {storyBlocks.map((block, i) => (
              <div key={`${i}-${block.title}`}>
                <h3 className="text-lg font-semibold tracking-tight text-slate-900 sm:text-xl">{block.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-[15px]">{block.body}</p>
              </div>
            ))}
          </div>
        ) : null}
      </section>

      <section className="mt-14 w-full rounded-3xl border border-blue-100 bg-white p-5 shadow-sm sm:mt-16 sm:p-6 lg:p-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
          <h2 className="min-w-0 flex-1 text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl lg:text-3xl lg:leading-snug">
            {storefront.aboutHowTitle?.trim() || "How we work with shoppers"}
          </h2>
          {storefront.aboutHowBadge?.trim() ? (
            <div className="shrink-0 self-start rounded-full bg-blue-50 px-4 py-2 text-xs font-semibold text-blue-900 ring-1 ring-blue-100">
              {storefront.aboutHowBadge.trim()}
            </div>
          ) : null}
        </div>

        {(() => {
          const howBlocks = (storefront.aboutHowBlocks ?? []).filter((b) => b.body?.trim());
          const fromLead = splitProseSections(storefront.aboutHowLead?.trim() || "");
          const fromBlocks = howBlocks.map((b) => {
            const paras = b.body
              .replace(/\r\n/g, "\n")
              .split(/\n{2,}/)
              .map((p) => p.replace(/\n+/g, " ").trim())
              .filter(Boolean);
            return {
              heading: b.title?.trim() || undefined,
              paragraphs: paras.length ? paras : [b.body.trim()],
            };
          });
          // Admin blocks take priority; otherwise use the intro textarea (supports ## headings).
          const sections = fromBlocks.length > 0 ? fromBlocks : fromLead;
          if (!sections.length) return null;
          return (
            <div className="mt-6 w-full space-y-8 sm:mt-8">
              {sections.map((sec, i) => (
                <div key={`how-sec-${i}`} className="w-full border-t border-slate-100 pt-6 first:border-t-0 first:pt-0">
                  {sec.heading ? (
                    <h3 className="text-base font-semibold tracking-tight text-slate-900 sm:text-lg">
                      {sec.heading}
                    </h3>
                  ) : null}
                  <div
                    className={`w-full space-y-3 text-sm leading-relaxed text-slate-600 sm:text-[15px] sm:leading-7 ${
                      sec.heading ? "mt-3" : ""
                    }`}
                  >
                    {sec.paragraphs.map((p, j) => (
                      <p key={j} className="w-full max-w-none">
                        {p}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          );
        })()}

        {howSteps.length ? (
          <ol className="mt-8 grid w-full gap-4 sm:mt-10 sm:grid-cols-2 lg:grid-cols-3">
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
    </main>
  );
}

const DEFAULT_TITLE = "Home appliances & electrical accessories for everyday Pakistan households";
