import Link from "next/link";
import type { HomeAfterBrowseBannerRow } from "@/lib/store-types";

export function HomeAfterBrowseBanner({ banner }: { banner: HomeAfterBrowseBannerRow }) {
  const imageUrl = banner.image_url.trim();
  const href = banner.link_href.trim();
  const alt = banner.alt_text.trim() || "Promotional banner";

  if (!imageUrl) return null;

  const imageBlock = (
    <span
      className="block aspect-[2.2/1] w-full bg-cover bg-center transition duration-300 ease-smooth-out motion-reduce:transition-none sm:aspect-[2.8/1] md:aspect-[3.2/1] lg:aspect-[3.5/1] group-hover:scale-[1.02] motion-reduce:group-hover:scale-100"
      style={{ backgroundImage: `url(${JSON.stringify(imageUrl).slice(1, -1)})` }}
      role="img"
      aria-label={alt}
    />
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
