"use client";

import { useCallback, useEffect, useState } from "react";
import { SafeRemoteImage } from "@/components/SafeRemoteImage";

export type GalleryImg = { id: string; url: string; alt: string };

export function ProductImageGallery({ images, productName }: { images: GalleryImg[]; productName: string }) {
  const [idx, setIdx] = useState(0);
  const n = images.length;

  const pick = useCallback(
    (i: number) => {
      const next = Math.max(0, Math.min(i, Math.max(n - 1, 0)));
      setIdx(next);
    },
    [n],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (n <= 1) return;
      if (e.key === "ArrowLeft") pick(idx - 1);
      if (e.key === "ArrowRight") pick(idx + 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [idx, n, pick]);

  if (!n) return null;

  const current = images[idx] ?? images[0];
  const main = current?.url ?? null;
  const mainAlt = current?.alt || productName;

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm ring-1 ring-white/70 backdrop-blur-sm">
        <div className="relative aspect-[4/3] bg-slate-50">
          {main ? (
            <SafeRemoteImage
              key={current.id}
              src={main}
              alt={mainAlt}
              fill
              sizes="(max-width:768px) 100vw, 48vw"
              className="object-contain object-center p-6 transition-opacity duration-300"
              priority={idx === 0}
            />
          ) : null}

          {n > 1 ? (
            <>
              <button
                type="button"
                aria-label="Previous image"
                onClick={() => pick(idx - 1)}
                className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200/90 bg-white/95 text-lg font-semibold text-slate-800 shadow-md backdrop-blur-sm transition hover:bg-white disabled:pointer-events-none disabled:opacity-35"
                disabled={idx <= 0}
              >
                ‹
              </button>
              <button
                type="button"
                aria-label="Next image"
                onClick={() => pick(idx + 1)}
                className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200/90 bg-white/95 text-lg font-semibold text-slate-800 shadow-md backdrop-blur-sm transition hover:bg-white disabled:pointer-events-none disabled:opacity-35"
                disabled={idx >= n - 1}
              >
                ›
              </button>
              <div className="pointer-events-none absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
                {images.map((img, i) => (
                  <span
                    key={img.id}
                    className={`h-1.5 rounded-full transition-all ${i === idx ? "w-6 bg-blue-600" : "w-1.5 bg-slate-300"}`}
                    aria-hidden
                  />
                ))}
              </div>
            </>
          ) : null}
        </div>
      </div>

      {n > 1 ? (
        <div className="flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Product images">
          {images.map((img, i) => (
            <button
              key={img.id}
              type="button"
              role="tab"
              aria-selected={i === idx}
              aria-label={`View image ${i + 1} of ${n}`}
              onClick={() => pick(i)}
              className={`relative h-[4.25rem] w-[4.25rem] shrink-0 overflow-hidden rounded-xl ring-2 transition sm:h-20 sm:w-20 ${
                i === idx ? "ring-blue-500" : "ring-slate-200 hover:ring-blue-300"
              }`}
            >
              <SafeRemoteImage src={img.url} alt={img.alt || `${productName} ${i + 1}`} fill className="object-cover" sizes="80px" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
