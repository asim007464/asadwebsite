"use client";

import { useEffect, useState } from "react";
import { SafeRemoteImage } from "@/components/SafeRemoteImage";
import { ADMIN_IMAGE_FILE_INPUT_CLASS, ADMIN_IMAGE_UPLOAD_HINT } from "@/lib/admin-media-upload";

export function StorefrontImageUploadField({
  label,
  urlName,
  defaultUrl,
}: {
  label: string;
  urlName: string;
  defaultUrl?: string;
}) {
  const savedUrl = (defaultUrl ?? "").trim();
  const [previewUrl, setPreviewUrl] = useState(savedUrl);
  const [pickedName, setPickedName] = useState<string | null>(null);

  useEffect(() => {
    setPreviewUrl(savedUrl);
    setPickedName(null);
  }, [savedUrl]);

  useEffect(() => {
    if (!previewUrl.startsWith("blob:")) return;
    return () => URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) {
      setPreviewUrl(savedUrl);
      setPickedName(null);
      return;
    }
    setPreviewUrl(URL.createObjectURL(file));
    setPickedName(file.name);
  }

  return (
    <div>
      <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</label>
      {previewUrl ? (
        <div
          className={`relative mt-2 aspect-[16/10] w-full overflow-hidden rounded-2xl border bg-slate-100 ${
            pickedName ? "border-blue-400 ring-4 ring-blue-100" : "border-slate-200"
          }`}
        >
          <SafeRemoteImage src={previewUrl} alt="" fill className="object-cover" sizes="320px" />
        </div>
      ) : (
        <div className="mt-2 flex aspect-[16/10] w-full items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-xs text-slate-500">
          No image saved yet
        </div>
      )}
      {pickedName ? (
        <p className="mt-2 text-[11px] font-semibold text-blue-800">
          Ready to upload: {pickedName} — click Save to store this image.
        </p>
      ) : null}
      <input
        name={urlName}
        defaultValue={defaultUrl ?? ""}
        placeholder="https://… or /image-in-public.jpg"
        className="mt-2 h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 font-mono text-[11px] outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
      />
      <label className="mt-3 block text-[11px] font-semibold uppercase tracking-wide text-slate-500">Or upload</label>
      <input
        name={`${urlName}_file`}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,.jpg,.jpeg,.png,.webp,.gif"
        className={ADMIN_IMAGE_FILE_INPUT_CLASS}
        onChange={onFileChange}
      />
      <p className="mt-1 text-[11px] text-slate-500">{ADMIN_IMAGE_UPLOAD_HINT}</p>
    </div>
  );
}
