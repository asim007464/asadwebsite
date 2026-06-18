import Link from "next/link";
import { AddToCartButton } from "@/components/AddToCartButton";
import { ProductCardMedia } from "@/components/ProductCardMedia";
import { formatPKR } from "@/lib/money";
import type { ProductListing } from "@/lib/store-types";

const gridAddToCartClass =
  "inline-flex h-9 w-full items-center justify-center rounded-md bg-blue-600 px-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 sm:text-sm";

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
    <article className="group flex flex-col overflow-hidden border border-slate-200 bg-white shadow-sm transition duration-200 hover:border-blue-200 hover:shadow-md motion-reduce:transition-none">
      <Link href={href} className="block bg-white">
        <ProductCardMedia
          imageUrl={product.image_url}
          alt={product.name}
          aspectClassName="aspect-[4/5] bg-white sm:aspect-square"
          sizes={sizes}
          tone="catalog"
        />
      </Link>
      <div className="flex flex-col gap-2 px-2.5 pb-2.5 pt-2 sm:px-3 sm:pb-3">
        <Link href={href} className="block min-h-0 transition hover:opacity-90">
          <span className="line-clamp-2 text-center text-sm font-medium leading-snug text-blue-800 group-hover:text-blue-900">
            {product.name}
          </span>
          {catchyLine ? (
            <span className="mt-1 line-clamp-2 block text-center text-[11px] leading-snug text-slate-500 sm:text-xs" title={catchyLine}>
              {catchyLine}
            </span>
          ) : null}
        </Link>
        <div className="mt-0.5 border-t border-slate-100 pt-2">
          <p className="text-center text-sm font-bold tabular-nums text-blue-900">{formatPKR(product.min_price_pkr)}</p>
          <div className="mt-1.5">
            <AddToCartButton variant={cartVariant} className={gridAddToCartClass} label="Add to cart" />
          </div>
        </div>
      </div>
    </article>
  );
}
