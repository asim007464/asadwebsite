"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { DEMO_TESTIMONIALS } from "@/lib/testimonials";

function QuoteGlyph({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 40 32" fill="none" aria-hidden>
      <path
        d="M8 18c0-5 2.5-9 7-11l2 4c-3 1.5-4.5 4-4.5 7h5v12H8V18zm22 0c0-5 2.5-9 7-11l2 4c-3 1.5-4.5 4-4.5 7h5v12H30V18z"
        fill="currentColor"
        opacity={0.92}
      />
    </svg>
  );
}

function StarRow({ className = "" }: { className?: string }) {
  return (
    <div className={`flex gap-0.5 ${className}`} aria-hidden>
      {Array.from({ length: 5 }, (_, i) => (
        <svg key={i} className="h-4 w-4 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10 1.5l2.6 5.3 5.9.9-4.3 4.2 1 5.9L10 15.9 4.8 17.8l1-5.9L1.5 7.7l5.9-.9L10 1.5z" />
        </svg>
      ))}
    </div>
  );
}

function GoogleGlyph({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

export function TestimonialsSection() {
  const items = DEMO_TESTIMONIALS;
  const [perPage, setPerPage] = useState(2);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const sync = () => setPerPage(mq.matches ? 2 : 1);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const pageCount = Math.max(1, Math.ceil(items.length / perPage));
  const [page, setPage] = useState(0);

  useEffect(() => {
    setPage((p) => Math.min(p, pageCount - 1));
  }, [pageCount]);

  const sliceStart = page * perPage;
  const visible = useMemo(() => items.slice(sliceStart, sliceStart + perPage), [items, sliceStart, perPage]);

  const goPrev = useCallback(() => {
    setPage((p) => (p - 1 + pageCount) % pageCount);
  }, [pageCount]);

  const goNext = useCallback(() => {
    setPage((p) => (p + 1) % pageCount);
  }, [pageCount]);

  return (
    <div className="relative" aria-labelledby="testimonials-heading">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between lg:gap-12">
        <div className="max-w-xl">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-blue-700">Reviews</p>
          <h2 id="testimonials-heading" className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            What customers say
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
            COD orders with phone confirmation — shoppers tell us when specs, delivery, and pricing line up. Quotes below are sample stories you can replace with live feedback.
          </p>
        </div>

        <div className="flex shrink-0 flex-col gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm ring-1 ring-slate-100 sm:flex-row sm:items-center sm:gap-5">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">5.0</span>
            <span className="text-sm font-medium text-slate-500">/5</span>
          </div>
          <div className="hidden h-10 w-px bg-slate-200 sm:block" aria-hidden />
          <div className="flex flex-wrap items-center gap-3">
            <GoogleGlyph className="h-7 w-7 shrink-0" />
            <StarRow />
          </div>
          <p className="text-xs font-medium text-slate-500 sm:max-w-[11rem]">
            Illustrative rating · swap for real Google / Trustpilot embed when ready.
          </p>
        </div>
      </div>

      <div className="relative mt-12 md:px-14">
        <div className="mb-5 flex justify-center gap-3 md:hidden">
          <button
            type="button"
            onClick={goPrev}
            aria-label="Previous reviews"
            className="inline-flex h-11 min-w-[5.5rem] items-center justify-center rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm hover:border-blue-200 hover:bg-blue-50 hover:text-blue-800"
          >
            ‹ Prev
          </button>
          <button
            type="button"
            onClick={goNext}
            aria-label="Next reviews"
            className="inline-flex h-11 min-w-[5.5rem] items-center justify-center rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm hover:border-blue-200 hover:bg-blue-50 hover:text-blue-800"
          >
            Next ›
          </button>
        </div>

        <button
          type="button"
          onClick={goPrev}
          aria-label="Previous reviews"
          className="absolute left-0 top-[42%] z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-md transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 md:flex"
        >
          <span className="text-lg leading-none" aria-hidden>
            ‹
          </span>
        </button>
        <button
          type="button"
          onClick={goNext}
          aria-label="Next reviews"
          className="absolute right-0 top-[42%] z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-md transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 md:flex"
        >
          <span className="text-lg leading-none" aria-hidden>
            ›
          </span>
        </button>

        <div
          className="grid gap-5 md:grid-cols-2 md:gap-6"
          aria-live="polite"
          aria-label={`Customer reviews, page ${page + 1} of ${pageCount}`}
        >
          {visible.map((t, i) => (
            <article
              key={`${sliceStart + i}-${t.initials}`}
              className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <QuoteGlyph className="h-8 w-10 text-blue-600/80" />
              <blockquote className="mt-4 flex-1 text-[15px] leading-relaxed text-slate-800 sm:text-base">{t.quote}</blockquote>
              <footer className="mt-6 flex flex-wrap items-center gap-3 border-t border-slate-200 pt-5">
                <div
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-blue-800 ring-2 ring-blue-100"
                  aria-hidden
                >
                  {t.initials}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-slate-900">{t.name}</div>
                  <div className="text-xs text-slate-500">{t.meta}</div>
                </div>
                <StarRow className="shrink-0" />
              </footer>
            </article>
          ))}
        </div>

        {pageCount > 1 ? (
          <div className="mt-10 flex justify-center gap-2" role="tablist" aria-label="Review pages">
            {Array.from({ length: pageCount }, (_, i) => (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={i === page}
                aria-label={`Go to review page ${i + 1}`}
                onClick={() => setPage(i)}
                className={`h-2 rounded-full transition-[width,background-color] duration-300 ${
                  i === page ? "w-8 bg-blue-600" : "w-2 bg-slate-300 hover:bg-slate-400"
                }`}
              />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
