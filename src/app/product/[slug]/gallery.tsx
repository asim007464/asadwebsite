"use client";

import { useEffect } from "react";
import { SafeRemoteImage } from "@/components/SafeRemoteImage";
import { useSlider } from "@/lib/use-slider";

export type GalleryImg = { id: string; url: string; alt: string };

export function ProductImageGallery({ images, productName }: { images: GalleryImg[]; productName: string }) {
  const n = images.length;
  const { index, go, next, prev, swipe } = useSlider(n, { loop: n > 1 });

  useEffect(() => {
    if (n <= 1) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [n, next, prev]);

  if (!n) return null;

  return (
    <div className="space-y-3">
      <div className="relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_10px_28px_rgba(15,23,42,0.06)] ring-1 ring-slate-900/[0.03]">
        <div className="relative w-full touch-pan-y select-none overflow-hidden" {...(n > 1 ? swipe : {})}>
          <div
            className="flex w-full transition-transform duration-500 ease-smooth-out motion-reduce:transition-none"
            style={{ transform: `translate3d(-${index * 100}%, 0, 0)` }}
          >
            {images.map((img, i) => (
              <div key={img.id} className="product-studio-bg relative aspect-[5/4] w-full min-w-0 shrink-0 basis-full sm:aspect-[4/3]">
                <SafeRemoteImage
                  src={img.url}
                  alt={img.alt || productName}
                  fill
                  sizes="(max-width:768px) 100vw, 48vw"
                  className="object-contain object-center p-4 sm:p-8"
                  priority={i === 0}
                  draggable={false}
                />
              </div>
            ))}
          </div>
        </div>

        {n > 1 ? (
          <>
            <button
              type="button"
              aria-label="Previous image"
              onClick={prev}
              className="absolute left-2 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-lg font-semibold text-slate-800 shadow-md transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-800 sm:left-3 sm:h-11 sm:w-11"
            >
              ‹
            </button>
            <button
              type="button"
              aria-label="Next image"
              onClick={next}
              className="absolute right-2 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-lg font-semibold text-slate-800 shadow-md transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-800 sm:right-3 sm:h-11 sm:w-11"
            >
              ›
            </button>
            <div className="absolute bottom-3 left-0 right-0 z-20 flex justify-center gap-1.5">
              {images.map((img, i) => (
                <button
                  key={img.id}
                  type="button"
                  aria-label={`Show image ${i + 1} of ${n}`}
                  aria-current={i === index ? "true" : undefined}
                  onClick={() => go(i)}
                  className="inline-flex h-8 w-8 items-center justify-center"
                >
                  <span
                    className={`block h-1.5 rounded-full transition-all ${i === index ? "w-6 bg-blue-600" : "w-1.5 bg-slate-300 hover:bg-slate-400"}`}
                  />
                </button>
              ))}
            </div>
          </>
        ) : null}
      </div>

      {n > 1 ? (
        <div className="flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Product images">
          {images.map((img, i) => (
            <button
              key={img.id}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`View image ${i + 1} of ${n}`}
              onClick={() => go(i)}
              className={`relative h-[4.25rem] w-[4.25rem] shrink-0 overflow-hidden rounded-xl ring-2 transition sm:h-20 sm:w-20 ${
                i === index ? "ring-blue-500" : "ring-slate-200 hover:ring-blue-300"
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
