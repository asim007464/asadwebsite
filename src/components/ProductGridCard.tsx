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
    <article className="group flex h-full flex-col overflow-hidden border border-slate-200 bg-white shadow-sm ring-2 ring-transparent transition-colors duration-200 hover:border-blue-300 hover:ring-blue-100 motion-reduce:transition-none">
      <Link href={href} className="block shrink-0 bg-white">
        <ProductCardMedia
          imageUrl={product.image_url}
          alt={product.name}
          aspectClassName="aspect-square bg-white"
          sizes={sizes}
          tone="catalog"
        />
      </Link>
      <div className="flex min-h-0 flex-1 flex-col px-2.5 pb-2.5 pt-2 sm:px-3 sm:pb-3">
        <Link href={href} className="block shrink-0 transition hover:opacity-90">
          <span className="line-clamp-2 min-h-[2.5rem] text-center text-sm font-medium leading-snug text-blue-800 group-hover:text-blue-900">
            {product.name}
          </span>
          <span
            className={`mt-1 line-clamp-2 block min-h-[2.5rem] text-center text-[11px] leading-snug text-slate-500 sm:text-xs ${catchyLine ? "" : "invisible"}`}
            title={catchyLine || undefined}
            aria-hidden={!catchyLine}
          >
            {catchyLine || "—"}
          </span>
        </Link>
        <div className="mt-auto border-t border-slate-100 pt-2">
          <p className="text-center text-sm font-bold tabular-nums text-blue-900">{formatPKR(product.min_price_pkr)}</p>
          <div className="mt-1.5">
            <AddToCartButton variant={cartVariant} className={gridAddToCartClass} label="Add to cart" />
          </div>
        </div>
      </div>
    </article>
  );
}
