import { SITE_PRODUCT_BACKDROP_URL } from "@/lib/site-visuals";
import { SafeRemoteImage } from "@/components/SafeRemoteImage";

export function ProductCardMedia({
  imageUrl,
  alt,
  aspectClassName = "aspect-[16/10]",
  sizes = "(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw",
  tone = "default",
}: {
  imageUrl: string | null;
  alt: string;
  aspectClassName?: string;
  /** Passed to next/image when fill — tune per layout (e.g. featured rail vs dense grids). */
  sizes?: string;
  /** `catalog` — studio lightbox product grid. */
  tone?: "default" | "catalog";
}) {
  const bg = imageUrl ?? SITE_PRODUCT_BACKDROP_URL;
  const catalog = tone === "catalog";

  return (
    <div
      className={`relative w-full shrink-0 overflow-hidden ${catalog ? "product-studio-bg" : "bg-slate-100"} ${aspectClassName}`}
    >
      {!catalog ? (
        <>
          <div
            aria-hidden
            className="absolute inset-0 scale-110 bg-cover bg-center opacity-40 blur-[2px]"
            style={{ backgroundImage: `url(${bg})` }}
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-900/30 via-slate-900/5 to-transparent" />
        </>
      ) : (
        <>
          <div
            aria-hidden
            className="product-studio-sheen pointer-events-none absolute inset-0 z-20 opacity-0 transition-opacity duration-300 group-hover:opacity-100 motion-reduce:hidden"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-6 bottom-3 z-[1] h-8 rounded-[100%] bg-slate-900/10 blur-md"
          />
        </>
      )}
      {imageUrl ? (
        <SafeRemoteImage
          src={imageUrl}
          alt={alt}
          fill
          className={`z-10 object-contain ${
            catalog
              ? "object-center p-3 drop-shadow-[0_12px_20px_rgba(15,23,42,0.14)] transition-transform duration-500 ease-smooth-out motion-reduce:transition-none group-hover:scale-[1.06] motion-reduce:group-hover:scale-100 sm:p-3.5"
              : "object-cover transition-transform duration-200 ease-smooth-out motion-reduce:transition-none group-hover:scale-[1.03] motion-reduce:group-hover:scale-100"
          }`}
          sizes={sizes}
        />
      ) : (
        <div
          className={`relative z-10 flex h-full flex-col items-center justify-center gap-1 px-4 text-center ${catalog ? "" : "bg-white/35 backdrop-blur-[2px]"}`}
        >
          <span className="text-sm font-semibold text-slate-700">Photo coming soon</span>
          {!catalog ? (
            <span className="text-xs text-slate-500">Soft appliance-style backdrop shows until you upload real photos.</span>
          ) : null}
        </div>
      )}
    </div>
  );
}
