import type { SupabaseClient } from "@supabase/supabase-js";

/** Single public bucket for admin uploads (products, site, hero, reviews, categories). */
export const ADMIN_MEDIA_BUCKET = "admin-media";

export const ADMIN_IMAGE_MAX_BYTES = 5 * 1024 * 1024;

export const ADMIN_IMAGE_MIME = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export function extForAdminImageMime(mime: string): string | null {
  if (mime === "image/jpeg") return "jpg";
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  if (mime === "image/gif") return "gif";
  return null;
}

export function adminMediaUploadErrorMessage(message: string): string {
  if (message.includes("Bucket not found")) {
    return "Storage bucket missing. Run the Supabase migration for admin-media (see supabase/migrations).";
  }
  return message;
}

/**
 * Upload a validated image; returns public HTTPS URL for Supabase Storage.
 */
export async function uploadAdminMediaImage(
  supabase: SupabaseClient,
  pathPrefix: string,
  file: File,
): Promise<{ publicUrl: string } | { error: string }> {
  if (!ADMIN_IMAGE_MIME.has(file.type)) {
    return { error: "Image must be JPEG, PNG, WebP, or GIF." };
  }
  if (file.size > ADMIN_IMAGE_MAX_BYTES) {
    return { error: "Image is too large (max 5 MB)." };
  }
  const ext = extForAdminImageMime(file.type);
  if (!ext) {
    return { error: "Unsupported image type." };
  }

  const safePrefix = pathPrefix.replace(/^\/+|\/+$/g, "");
  const token =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().slice(0, 12)
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const objectPath = `${safePrefix}/${Date.now()}-${token}.${ext}`;
  const buf = Buffer.from(await file.arrayBuffer());
  const { error: upErr } = await supabase.storage.from(ADMIN_MEDIA_BUCKET).upload(objectPath, buf, {
    contentType: file.type,
    upsert: false,
  });
  if (upErr) {
    return { error: adminMediaUploadErrorMessage(upErr.message) };
  }
  const { data } = supabase.storage.from(ADMIN_MEDIA_BUCKET).getPublicUrl(objectPath);
  return { publicUrl: data.publicUrl };
}

/** Shared admin UI classes for optional image file inputs (match categories). */
export const ADMIN_IMAGE_FILE_INPUT_CLASS =
  "mt-2 block w-full max-w-xl cursor-pointer rounded-2xl border border-dashed border-slate-300 bg-white px-3 py-2 text-xs text-slate-600 file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-slate-800 hover:border-slate-400";

export const ADMIN_IMAGE_UPLOAD_HINT =
  "JPEG, PNG, WebP, or GIF · max 5 MB. If you pick a file, it is used instead of the URL when you save (stored in Supabase — run the admin-media migration if uploads fail).";
