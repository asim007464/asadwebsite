"use client";

import type { CSSProperties } from "react";
import { SafeRemoteImage } from "@/components/SafeRemoteImage";

export type BrandLogoItem = {
  name: string;
  imageUrl?: string;
};

const ACCENTS = [
  "bg-blue-50 text-blue-800 ring-blue-100",
  "bg-sky-50 text-sky-800 ring-sky-100",
  "bg-indigo-50 text-indigo-800 ring-indigo-100",
  "bg-cyan-50 text-cyan-800 ring-cyan-100",
  "bg-slate-50 text-slate-800 ring-slate-200",
  "bg-emerald-50 text-emerald-800 ring-emerald-100",
] as const;

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

function LogoDisk({ item, index }: { item: BrandLogoItem; index: number }) {
  const url = (item.imageUrl ?? "").trim();
  const useImg = url.startsWith("https://") || (url.startsWith("/") && url.length > 1);
  const accent = ACCENTS[index % ACCENTS.length];

  return (
    <div className="flex w-[5.5rem] shrink-0 flex-col items-center gap-2 sm:w-24">
      <div
        className={`relative flex h-[4.5rem] w-[4.5rem] items-center justify-center overflow-hidden rounded-full bg-white shadow-sm ring-2 sm:h-24 sm:w-24 ${
          useImg ? "ring-slate-200" : accent
        }`}
      >
        {useImg ? (
          <SafeRemoteImage src={url} alt={item.name} fill className="object-contain p-2.5" sizes="96px" />
        ) : (
          <span className="text-sm font-bold tracking-tight sm:text-base">{initials(item.name)}</span>
        )}
      </div>
      <span className="line-clamp-2 text-center text-[11px] font-semibold leading-tight text-slate-600 sm:text-xs">
        {item.name}
      </span>
    </div>
  );
}

export function BrandLogosMarquee({
  eyebrow,
  heading,
  lead,
  logos,
}: {
  eyebrow?: string;
  heading?: string;
  lead?: string;
  logos?: readonly BrandLogoItem[];
}) {
  const items = (logos ?? []).filter((l) => l.name?.trim());
  if (!items.length) return null;

  const eyebrowText = eyebrow?.trim() || "Brands";
  const headingText = heading?.trim() || "Brands we carry";
  const leadText =
    lead?.trim() ||
    "Popular appliance and electrical brands stocked for everyday homes — fans, lighting, wiring, and kitchen helpers.";

  const durationSec = Math.max(28, Math.min(70, items.length * 5));
  const loop = items.length < 6 ? [...items, ...items, ...items] : [...items, ...items];

  return (
    <section className="mt-10 sm:mt-12" aria-labelledby="brand-logos-heading">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-blue-700">{eyebrowText}</p>
        <h2
          id="brand-logos-heading"
          className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl"
        >
          {headingText}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-[15px]">{leadText}</p>
      </div>

      <div className="relative mt-8">
        <div
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-white to-transparent sm:w-16"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-white to-transparent sm:w-16"
          aria-hidden
        />

        <div className="hidden motion-reduce:block overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex w-max gap-6 px-4 sm:gap-8">
            {items.map((item, i) => (
              <LogoDisk key={`${item.name}-${i}`} item={item} index={i} />
            ))}
          </div>
        </div>

        <div className="motion-reduce:hidden overflow-hidden py-1">
          <div
            className="category-marquee-track flex w-max gap-6 sm:gap-8"
            style={{ "--marquee-duration": `${durationSec}s` } as CSSProperties}
          >
            {loop.map((item, i) => (
              <LogoDisk key={`${item.name}-loop-${i}`} item={item} index={i % items.length} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
