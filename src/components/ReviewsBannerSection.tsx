import Link from "next/link";
import type { HomeReviewsBannerRow } from "@/lib/store-types";

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
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

  const showBtn = label.length > 0 && href.length > 0;

  const isExternal = /^https:\/\//i.test(href);

  return (
    <section
      aria-labelledby={heading ? headingId : undefined}
      aria-label={heading ? undefined : "Promotional banner"}
      className={cn(
        "relative isolate overflow-hidden rounded-2xl shadow-lg ring-1 ring-slate-200/70 sm:rounded-3xl sm:min-h-[240px] md:min-h-[280px] lg:min-h-[300px]",
        layout === "fullBleed" && "mt-8 w-full sm:mt-12",
        layout === "contained" && "w-full",
        className,
      )}
    >
      {/* Background image */}
      <div
        aria-hidden
        className="absolute inset-0 scale-105 bg-center bg-cover"
        style={{ backgroundImage: `url(${JSON.stringify(bg).slice(1, -1)})` }}
      />
      {/* Readability overlays */}
      <div className="pointer-events-none absolute inset-0 bg-slate-950/55 backdrop-blur-[1px]" aria-hidden />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-blue-950/92 via-blue-950/82 to-slate-950/55"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/72 via-transparent to-slate-950/35"
        aria-hidden
      />

      <div className="relative z-10 mx-auto flex max-w-7xl flex-col gap-6 px-5 py-10 sm:px-8 md:flex-row md:items-center md:justify-between md:py-14 lg:px-10">
        <div className="max-w-2xl space-y-3 text-white">
          {heading ? (
            <h2 id={headingId} className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-[1.875rem]">
              {heading}
            </h2>
          ) : null}
          {paragraph ? <p className="text-sm leading-relaxed text-blue-50/92 sm:text-[15px] md:max-w-xl">{paragraph}</p> : null}
        </div>

        <div className="shrink-0 md:text-right">
          {showBtn ? (
            isExternal ? (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 w-full items-center justify-center rounded-full bg-white px-6 text-sm font-bold text-blue-900 shadow-md shadow-blue-950/35 transition hover:bg-blue-50 sm:h-12 sm:w-auto sm:min-w-[10.5rem] sm:px-8"
              >
                {label}
              </a>
            ) : (
              <Link
                href={href}
                className="inline-flex h-11 w-full items-center justify-center rounded-full bg-white px-6 text-sm font-bold text-blue-900 shadow-md shadow-blue-950/35 transition hover:bg-blue-50 sm:h-12 sm:w-auto sm:min-w-[10.5rem] sm:px-8"
              >
                {label}
              </Link>
            )
          ) : null}
        </div>
      </div>
    </section>
  );
}
