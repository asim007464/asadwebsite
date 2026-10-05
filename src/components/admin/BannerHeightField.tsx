"use client";

import { useState } from "react";

export function BannerHeightField({
  name = "height_px",
  defaultValue,
  min = 140,
  max = 720,
  step = 10,
  label = "Banner height",
  hint = "Controls how tall this banner appears on the homepage.",
}: {
  name?: string;
  defaultValue: number;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  hint?: string;
}) {
  const [value, setValue] = useState(defaultValue);

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-4">
      <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label} ({value}px)
      </label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
        className="mt-3 w-full accent-blue-600"
      />
      <div className="mt-2 flex items-center justify-between gap-3">
        <p className="text-[11px] text-slate-500">{hint}</p>
        <input
          type="number"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => {
            const n = Number.parseInt(e.target.value, 10);
            if (Number.isFinite(n)) setValue(Math.min(max, Math.max(min, n)));
          }}
          className="h-9 w-20 rounded-xl border border-slate-200 bg-white px-2 text-center text-sm font-semibold text-slate-800 outline-none focus:border-blue-300"
          aria-label={`${label} in pixels`}
        />
      </div>
      <input type="hidden" name={name} value={value} />
    </div>
  );
}
