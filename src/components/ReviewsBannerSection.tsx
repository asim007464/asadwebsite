import Link from "next/link";
import { clampBannerHeightPx, DEFAULT_PROMO_BANNER_HEIGHT_PX } from "@/lib/banner-height";
import type { HomeReviewsBannerRow } from "@/lib/store-types";

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

function clampPct(n: number, fallback: number) {
  if (!Number.isFinite(n)) return fallback;
  return Math.min(100, Math.max(0, n));
}

export function ReviewsBannerSection({
  banner,
  layout = "fullBleed",
  className,
  headingId = "reviews-banner-heading",
}: {
  banner: HomeReviewsBannerRow;
  /** `contained` — inside homepage content column; `fullBleed` — breaks out to viewport width. */
  layout?: "contained" | "fullBleed";
  className?: string;
  headingId?: string;
}) {
  const bg = banner.background_image_url.trim();
  const heading = banner.heading.trim();
  const paragraph = banner.paragraph.trim();
  const label = banner.button_label.trim();
  const href = banner.button_href.trim() || "/products";
  const imageOpacity = clampPct(Number(banner.image_opacity), 100) / 100;
  const overlayOpacity = clampPct(Number(banner.overlay_opacity), 70) / 100;
  const heightPx = clampBannerHeightPx(banner.height_px, DEFAULT_PROMO_BANNER_HEIGHT_PX, 140, 720);

  const showBtn = label.length > 0 && href.length > 0;

  const isExternal = /^https:\/\//i.test(href);

  return (
    <section
      aria-labelledby={heading ? headingId : undefined}
      aria-label={heading ? undefined : "Promotional banner"}
      className={cn(
        "relative isolate overflow-hidden rounded-2xl bg-slate-900 shadow-lg ring-1 ring-slate-200/70 sm:rounded-3xl",
        layout === "fullBleed" && "left-1/2 mt-10 w-[min(100dvw,100%)] max-w-none -translate-x-1/2 sm:mt-12",
        layout === "contained" && "w-full",
        className,
      )}
      style={{ minHeight: heightPx }}
    >
      {/* Background image — opacity / height controlled in Admin → Promo banners / Home banners */}
      <div
        aria-hidden
        className="absolute inset-0 scale-105 bg-center bg-cover bg-no-repeat"
        style={{
          backgroundImage: `url(${JSON.stringify(bg).slice(1, -1)})`,
          opacity: imageOpacity,
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 bg-slate-950 backdrop-blur-[1px]"
        style={{ opacity: overlayOpacity * 0.55 }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-blue-950 via-blue-950/90 to-slate-950/70"
        style={{ opacity: overlayOpacity * 0.85 }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/40"
        style={{ opacity: overlayOpacity * 0.75 }}
        aria-hidden
      />

      <div
        className="relative z-10 mx-auto flex max-w-7xl flex-col justify-end px-4 pb-4 pt-8 sm:justify-center sm:gap-6 sm:px-8 sm:py-12 md:min-h-0 md:flex-row md:items-center md:justify-between md:py-14 lg:px-10"
        style={{ minHeight: heightPx }}
      >
        {(heading || paragraph) ? (
          <div className="mb-14 max-w-2xl space-y-2.5 text-white sm:mb-0 sm:space-y-3">
            {heading ? (
              <h2 id={headingId} className="text-xl font-bold tracking-tight sm:text-3xl lg:text-[1.875rem]">
                {heading}
              </h2>
            ) : null}
            {paragraph ? (
              <p className="text-[13px] leading-relaxed text-blue-50/92 sm:text-[15px] md:max-w-xl">{paragraph}</p>
            ) : null}
          </div>
        ) : null}

        {showBtn ? (
          <div className="absolute bottom-3 right-3 z-10 sm:static sm:shrink-0 md:text-right">
            {isExternal ? (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-10 min-w-[8.5rem] items-center justify-center rounded-full bg-white px-5 text-xs font-bold text-blue-900 shadow-md shadow-blue-950/35 transition hover:bg-blue-50 sm:h-12 sm:min-w-[10.5rem] sm:px-8 sm:text-sm"
              >
                {label}
              </a>
            ) : (
              <Link
                href={href}
                className="inline-flex h-10 min-w-[8.5rem] items-center justify-center rounded-full bg-white px-5 text-xs font-bold text-blue-900 shadow-md shadow-blue-950/35 transition hover:bg-blue-50 sm:h-12 sm:min-w-[10.5rem] sm:px-8 sm:text-sm"
              >
                {label}
              </Link>
            )}
          </div>
        ) : null}
      </div>
    </section>
  );
}
