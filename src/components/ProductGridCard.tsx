import Link from "next/link";
import { AddToCartButton } from "@/components/AddToCartButton";
import { ProductCardMedia } from "@/components/ProductCardMedia";
import { formatPKR } from "@/lib/money";
import type { ProductListing } from "@/lib/store-types";

const gridAddToCartClass =
  "inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-3 text-xs font-semibold tracking-wide text-white shadow-[0_6px_14px_rgba(33,82,209,0.25)] transition duration-200 hover:bg-blue-700 hover:shadow-[0_8px_18px_rgba(33,82,209,0.32)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none sm:text-[13px]";

export function ProductGridCard({
  product,
  sizes = "(max-width:640px) 50vw, (max-width:1024px) 33vw, 25vw",
}: {
  product: ProductListing;
  sizes?: string;
}) {
  const href = `/product/${product.slug}`;
  const catchyLine = (product.catchy_headline ?? "").trim();
  const defaultVariantId = product.default_variant_id?.trim();
  const cartVariant =
    defaultVariantId && product.default_variant_sku
      ? {
          id: defaultVariantId,
          sku: product.default_variant_sku,
          title: product.default_variant_title ?? product.name,
          price_pkr: product.default_variant_price_pkr ?? product.min_price_pkr,
          product_slug: product.slug,
          product_name: product.name,
          image_url: product.image_url,
        }
      : null;

  return (
    <article className="group flex h-full flex-col rounded-2xl border border-slate-200/90 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.06)] ring-1 ring-slate-900/[0.03] transition duration-300 ease-smooth-out hover:border-blue-200 hover:shadow-[0_18px_40px_rgba(15,23,42,0.12)] motion-reduce:transition-none">
      <Link href={href} className="relative block shrink-0 overflow-hidden rounded-t-2xl">
        <ProductCardMedia
          imageUrl={product.image_url}
          alt={product.name}
          aspectClassName="aspect-[4/3]"
          sizes={sizes}
          tone="catalog"
        />
        {product.is_featured ? (
          <span className="absolute left-3 top-3 z-20 rounded-full bg-blue-600 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white shadow-sm">
            Featured
          </span>
        ) : null}
        <span className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex justify-center pb-3 opacity-0 transition duration-300 group-hover:opacity-100 motion-reduce:hidden">
          <span className="rounded-full bg-white/95 px-3 py-1 text-[11px] font-semibold text-slate-800 shadow-md ring-1 ring-slate-200/80 backdrop-blur-sm">
            View product
          </span>
        </span>
      </Link>
      <div className="flex min-h-0 flex-1 flex-col px-2 pb-2.5 pt-2 sm:px-3.5 sm:pb-3.5">
        <Link href={href} className="block transition hover:opacity-90">
          <h3 className="line-clamp-2 min-h-[2.5rem] text-[13px] font-semibold leading-snug tracking-tight text-slate-900 group-hover:text-blue-800 sm:text-sm">
            {product.name}
          </h3>
          <p
            className={`mt-0.5 line-clamp-1 min-h-[1.25rem] text-[11px] leading-snug text-slate-500 sm:text-xs ${catchyLine ? "" : "invisible"}`}
            title={catchyLine || undefined}
            aria-hidden={!catchyLine}
          >
            {catchyLine || "—"}
          </p>
        </Link>
        <div className="mt-auto pt-2">
          <div className="mb-2 flex items-end justify-between gap-2">
            <p className="text-sm font-bold tabular-nums tracking-tight text-slate-900 sm:text-base">
              {formatPKR(product.min_price_pkr)}
            </p>
            <span className="mb-0.5 hidden text-[10px] font-medium uppercase tracking-wider text-emerald-700 sm:inline">
              COD
            </span>
          </div>
          <AddToCartButton variant={cartVariant} className={gridAddToCartClass} label="Add to cart" withIcon />
        </div>
      </div>
    </article>
  );
}
