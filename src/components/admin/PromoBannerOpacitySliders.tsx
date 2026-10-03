"use client";

import { useState } from "react";

export function PromoBannerOpacitySliders({
  imageOpacity,
  overlayOpacity,
}: {
  imageOpacity: number;
  overlayOpacity: number;
}) {
  const [image, setImage] = useState(imageOpacity);
  const [overlay, setOverlay] = useState(overlayOpacity);

  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <div>
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Image opacity ({image}%)
        </label>
        <input
          name="image_opacity"
          type="range"
          min={0}
          max={100}
          step={5}
          value={image}
          onChange={(e) => setImage(Number(e.target.value))}
          className="mt-3 w-full accent-blue-600"
        />
        <p className="mt-1 text-[11px] text-slate-500">
          How strong the background photo appears (0 = invisible, 100 = full).
        </p>
      </div>
      <div>
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Dark overlay ({overlay}%)
        </label>
        <input
          name="overlay_opacity"
          type="range"
          min={0}
          max={100}
          step={5}
          value={overlay}
          onChange={(e) => setOverlay(Number(e.target.value))}
          className="mt-3 w-full accent-blue-600"
        />
        <p className="mt-1 text-[11px] text-slate-500">
          Dark wash over the photo for text readability. Lower = brighter products.
        </p>
      </div>
    </div>
  );
}
