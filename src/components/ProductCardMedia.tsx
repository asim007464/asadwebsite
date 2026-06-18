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
  /** `catalog` — clean white product grid (minimal overlay). */
  tone?: "default" | "catalog";
}) {
  const bg = imageUrl ?? SITE_PRODUCT_BACKDROP_URL;
  const catalog = tone === "catalog";

  return (
    <div className={`relative w-full shrink-0 overflow-hidden ${catalog ? "bg-white" : "bg-slate-100"} ${aspectClassName}`}>
      {!catalog ? (
        <>
          <div
            aria-hidden
            className="absolute inset-0 scale-110 bg-cover bg-center opacity-40 blur-[2px]"
            style={{ backgroundImage: `url(${bg})` }}
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-900/30 via-slate-900/5 to-transparent" />
        </>
      ) : null}
      {imageUrl ? (
        <SafeRemoteImage
          src={imageUrl}
          alt={alt}
          fill
          className={`z-10 object-contain p-3 ${catalog ? "object-center" : "object-cover transition-transform duration-200 ease-smooth-out motion-reduce:transition-none group-hover:scale-[1.03] motion-reduce:group-hover:scale-100"}`}
          sizes={sizes}
        />
      ) : (
        <div
          className={`relative z-10 flex h-full flex-col items-center justify-center gap-1 px-4 text-center ${catalog ? "bg-slate-50" : "bg-white/35 backdrop-blur-[2px]"}`}
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
