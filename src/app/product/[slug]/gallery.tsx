"use client";

import { useCallback, useState } from "react";
import { SafeRemoteImage } from "@/components/SafeRemoteImage";

type Img = { url: string; alt: string };

export function ProductImageGallery({ images, productName }: { images: Img[]; productName: string }) {
  const [idx, setIdx] = useState(0);

  const main = images[idx]?.url ?? images[0]?.url ?? null;
  const mainAlt = images[idx]?.alt || images[0]?.alt || productName;

  const pick = useCallback(
    (i: number) => {
      const n = Math.max(0, Math.min(i, Math.max(images.length - 1, 0)));
      setIdx(n);
    },
    [images.length],
  );

  if (!images.length) return null;

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm ring-1 ring-white/70 backdrop-blur-sm">
        <div className="relative aspect-[4/3] bg-slate-50">
          {main ? (
            <SafeRemoteImage src={main} alt={mainAlt} fill sizes="(max-width:768px) 100vw, 48vw" className="object-contain object-center p-6" priority />
          ) : null}
        </div>
      </div>
      {images.length > 1 ? (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={`${img.url}-${i}`}
              type="button"
              aria-label={`View image ${i + 1}`}
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
