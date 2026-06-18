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
  return (
    <div>
      <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</label>
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
        accept="image/jpeg,image/png,image/webp,image/gif"
        className={ADMIN_IMAGE_FILE_INPUT_CLASS}
      />
      <p className="mt-1 text-[11px] text-slate-500">{ADMIN_IMAGE_UPLOAD_HINT}</p>
    </div>
  );
}
