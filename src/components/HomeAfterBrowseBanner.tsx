import Link from "next/link";
import {
  BANNER_HEIGHT_FIXED_CLASS,
  bannerHeightStyle,
  clampBannerHeightPx,
  DEFAULT_AFTER_BROWSE_HEIGHT_MOBILE_PX,
  DEFAULT_AFTER_BROWSE_HEIGHT_PX,
} from "@/lib/banner-height";
import { cssUrl, resolveBannerImages } from "@/lib/banner-images";
import type { HomeAfterBrowseBannerRow } from "@/lib/store-types";

export function HomeAfterBrowseBanner({ banner }: { banner: HomeAfterBrowseBannerRow }) {
  const { desktop, mobile } = resolveBannerImages(
    banner.image_url,
    banner.image_mobile_url,
    banner.separate_mobile_image,
  );
  const href = banner.link_href.trim();
  const alt = banner.alt_text.trim() || "Promotional banner";
  const heightDesktop = clampBannerHeightPx(banner.height_px, DEFAULT_AFTER_BROWSE_HEIGHT_PX, 120, 640);
  const heightMobile = clampBannerHeightPx(
    banner.height_mobile_px,
    DEFAULT_AFTER_BROWSE_HEIGHT_MOBILE_PX,
    100,
    640,
  );

  if (!desktop) return null;

  const heightStyle = bannerHeightStyle(heightDesktop, heightMobile);

  const imageBlock = (
    <span className={`relative block w-full ${BANNER_HEIGHT_FIXED_CLASS}`} style={heightStyle}>
      <span
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition duration-300 ease-smooth-out motion-reduce:transition-none group-hover:scale-[1.02] motion-reduce:group-hover:scale-100 md:hidden"
        style={{ backgroundImage: cssUrl(mobile || desktop) }}
        role="img"
        aria-label={alt}
      />
      <span
        className="absolute inset-0 hidden bg-cover bg-center bg-no-repeat transition duration-300 ease-smooth-out motion-reduce:transition-none group-hover:scale-[1.02] motion-reduce:group-hover:scale-100 md:block"
        style={{ backgroundImage: cssUrl(desktop) }}
        role="img"
        aria-hidden
      />
    </span>
  );

  const shellClass =
    "group relative mt-8 block w-full overflow-hidden rounded-2xl shadow-md ring-1 ring-slate-200/60 sm:mt-12 sm:shadow-lg";

  if (!href) {
    return <div className={shellClass}>{imageBlock}</div>;
  }

  const isExternal = /^https:\/\//i.test(href);

  if (isExternal) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={shellClass}>
        {imageBlock}
      </a>
    );
  }

  return (
    <Link href={href} className={shellClass}>
      {imageBlock}
    </Link>
  );
}
