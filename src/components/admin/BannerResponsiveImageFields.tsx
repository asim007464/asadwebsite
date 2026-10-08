"use client";

import { useState } from "react";
import { ADMIN_IMAGE_FILE_INPUT_CLASS, ADMIN_IMAGE_UPLOAD_HINT } from "@/lib/admin-media-upload";

function ImageSlot({
  label,
  urlName,
  fileName,
  defaultUrl,
  hint,
}: {
  label: string;
  urlName: string;
  fileName: string;
  defaultUrl: string;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</div>
      {hint ? <p className="mt-1 text-[11px] text-slate-500">{hint}</p> : null}
      <input
        name={urlName}
        defaultValue={defaultUrl}
        placeholder="https://… or /image-in-public.jpg"
        className="mt-3 h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 font-mono text-xs outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100 md:text-sm"
      />
      <label className="mt-3 block text-[11px] font-semibold uppercase tracking-wide text-slate-500">Or upload</label>
      <input
        name={fileName}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,.jpg,.jpeg,.png,.webp,.gif"
        className={ADMIN_IMAGE_FILE_INPUT_CLASS}
      />
      <p className="mt-1 text-[11px] text-slate-500">{ADMIN_IMAGE_UPLOAD_HINT}</p>
    </div>
  );
}

/** Toggle: one image for both screens, or separate laptop + mobile images. */
export function BannerResponsiveImageFields({
  modeName = "separate_mobile_image",
  separateDefault = false,
  desktopUrlName,
  desktopFileName,
  desktopDefault = "",
  mobileUrlName,
  mobileFileName,
  mobileDefault = "",
  sharedLabel = "Banner image (all screens)",
  desktopLabel = "Laptop / big screen image",
  mobileLabel = "Mobile screen image",
}: {
  modeName?: string;
  separateDefault?: boolean;
  desktopUrlName: string;
  desktopFileName: string;
  desktopDefault?: string;
  mobileUrlName: string;
  mobileFileName: string;
  mobileDefault?: string;
  sharedLabel?: string;
  desktopLabel?: string;
  mobileLabel?: string;
}) {
  const [separate, setSeparate] = useState(Boolean(separateDefault));

  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
      <div>
        <div className="text-sm font-semibold text-slate-900">Banner images</div>
        <p className="mt-1 text-xs text-slate-500">
          Use one image everywhere, or upload different crops for laptop and phone.
        </p>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <label
          className={`flex cursor-pointer items-start gap-3 rounded-2xl border px-4 py-3 text-sm font-semibold ${
            !separate ? "border-blue-300 bg-blue-50 text-blue-950" : "border-slate-200 bg-white text-slate-800"
          }`}
        >
          <input
            type="radio"
            name={modeName}
            value="shared"
            checked={!separate}
            onChange={() => setSeparate(false)}
            className="mt-0.5 h-4 w-4 border-slate-300 text-blue-600 focus:ring-blue-500"
          />
          <span>
            One image for both screens
            <span className="mt-0.5 block text-xs font-medium text-slate-600">Same photo on laptop and mobile.</span>
          </span>
        </label>
        <label
          className={`flex cursor-pointer items-start gap-3 rounded-2xl border px-4 py-3 text-sm font-semibold ${
            separate ? "border-blue-300 bg-blue-50 text-blue-950" : "border-slate-200 bg-white text-slate-800"
          }`}
        >
          <input
            type="radio"
            name={modeName}
            value="separate"
            checked={separate}
            onChange={() => setSeparate(true)}
            className="mt-0.5 h-4 w-4 border-slate-300 text-blue-600 focus:ring-blue-500"
          />
          <span>
            Separate laptop + mobile images
            <span className="mt-0.5 block text-xs font-medium text-slate-600">Best for different crops/sizes.</span>
          </span>
        </label>
      </div>

      {!separate ? (
        <ImageSlot
          label={sharedLabel}
          urlName={desktopUrlName}
          fileName={desktopFileName}
          defaultUrl={desktopDefault}
        />
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          <ImageSlot
            label={desktopLabel}
            urlName={desktopUrlName}
            fileName={desktopFileName}
            defaultUrl={desktopDefault}
            hint="Shown from tablet/desktop (md and up)."
          />
          <ImageSlot
            label={mobileLabel}
            urlName={mobileUrlName}
            fileName={mobileFileName}
            defaultUrl={mobileDefault || desktopDefault}
            hint="Shown on phones. Falls back to laptop image if empty."
          />
        </div>
      )}

      {/* Keep mobile URL in the form when shared so we don't wipe stored mobile assets unintentionally */}
      {!separate ? <input type="hidden" name={mobileUrlName} defaultValue={mobileDefault} /> : null}
    </div>
  );
}
