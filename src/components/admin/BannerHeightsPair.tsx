"use client";

import { BannerHeightField } from "@/components/admin/BannerHeightField";

/** Two height sliders: laptop/desktop and mobile. */
export function BannerHeightsPair({
  desktopName = "height_px",
  mobileName = "height_mobile_px",
  desktopDefault,
  mobileDefault,
  min = 140,
  max = 720,
  mobileMin,
  mobileMax,
  step = 10,
}: {
  desktopName?: string;
  mobileName?: string;
  desktopDefault: number;
  mobileDefault: number;
  min?: number;
  max?: number;
  mobileMin?: number;
  mobileMax?: number;
  step?: number;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <BannerHeightField
        name={desktopName}
        defaultValue={desktopDefault}
        min={min}
        max={max}
        step={step}
        label="Laptop / big screen"
        hint="Height on tablets & desktops (md and up)."
      />
      <BannerHeightField
        name={mobileName}
        defaultValue={mobileDefault}
        min={mobileMin ?? Math.max(100, Math.min(min, 140))}
        max={mobileMax ?? max}
        step={step}
        label="Mobile screen"
        hint="Height on phones (below md)."
      />
    </div>
  );
}
