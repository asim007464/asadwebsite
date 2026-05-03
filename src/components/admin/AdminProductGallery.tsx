import {
  addProductGalleryImages,
  deleteProductImage,
  setProductCoverImage,
} from "@/app/admin/actions";
import {
  ADMIN_IMAGE_FILE_INPUT_CLASS,
  ADMIN_IMAGE_UPLOAD_HINT,
} from "@/lib/admin-media-upload";

export type AdminGalleryRow = { id: string; url: string; alt: string; sort_order: number };

type Props = {
  productId: string;
  productName: string;
  images: AdminGalleryRow[];
};

export function AdminProductGallery({ productId, productName, images }: Props) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <h2 className="text-lg font-semibold tracking-tight text-slate-900">Product gallery</h2>
      <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-600">
        Upload multiple images. The <span className="font-semibold text-slate-800">cover</span> image appears first on
        the shop and product page. Use “Set as cover” to choose another photo.
      </p>

      {images.length > 0 ? (
        <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {images.map((img, index) => {
            const isCover = index === 0;
            return (
              <li
                key={img.id}
                className="flex gap-4 rounded-2xl border border-slate-200/90 bg-slate-50/50 p-3 ring-1 ring-slate-900/[0.03]"
              >
                <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-white ring-1 ring-slate-200/80">
                  <img src={img.url} alt={img.alt || productName} className="h-full w-full object-cover" />
                  {isCover ? (
                    <span className="absolute left-1 top-1 rounded-full bg-blue-600 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white shadow-sm">
                      Cover
                    </span>
                  ) : null}
                </div>
                <div className="flex min-w-0 flex-1 flex-col justify-center gap-2">
                  <p className="truncate font-mono text-[10px] text-slate-500" title={img.url}>
                    {img.url.replace(/^https?:\/\/[^/]+/i, "…")}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {!isCover ? (
                      <form action={setProductCoverImage}>
                        <input type="hidden" name="product_id" value={productId} />
                        <input type="hidden" name="image_id" value={img.id} />
                        <button
                          type="submit"
                          className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-800 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-900"
                        >
                          Set as cover
                        </button>
                      </form>
                    ) : null}
                    <form action={deleteProductImage}>
                      <input type="hidden" name="product_id" value={productId} />
                      <input type="hidden" name="image_id" value={img.id} />
                      <button
                        type="submit"
                        className="rounded-full border border-red-100 bg-white px-3 py-1 text-xs font-semibold text-red-700 shadow-sm transition hover:bg-red-50"
                      >
                        Remove
                      </button>
                    </form>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 px-4 py-8 text-center text-sm text-slate-500">
          No images yet — add files below. The first upload becomes the cover.
        </p>
      )}

      <form action={addProductGalleryImages} className="mt-8 border-t border-slate-100 pt-6">
        <input type="hidden" name="product_id" value={productId} />
        <input type="hidden" name="product_name" value={productName} />
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Add images from computer</label>
        <input
          name="gallery_files"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          className={`${ADMIN_IMAGE_FILE_INPUT_CLASS} max-w-2xl`}
        />
        <p className="mt-2 max-w-2xl text-[11px] leading-relaxed text-slate-500">
          {ADMIN_IMAGE_UPLOAD_HINT} Select one or more files (up to 12 per save). Hold Ctrl or ⌘ to pick multiple.
        </p>
        <button
          type="submit"
          className="mt-4 inline-flex h-11 items-center justify-center rounded-full bg-slate-900 px-8 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
        >
          Upload to gallery
        </button>
      </form>
    </div>
  );
}
