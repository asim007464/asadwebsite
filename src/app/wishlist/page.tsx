"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { SafeRemoteImage } from "@/components/SafeRemoteImage";
import { AddToCartButton } from "@/components/AddToCartButton";
import { AddToWishlistButton } from "@/components/AddToWishlistButton";
import { formatPKR } from "@/lib/money";
import { SITE_PRODUCT_BACKDROP_URL } from "@/lib/site-visuals";
import { readWishlist, writeWishlist, type WishlistItem } from "@/lib/wishlist";

export default function WishlistPage() {
  const [items, setItems] = useState<WishlistItem[]>([]);

  const sync = useCallback(() => setItems(readWishlist()), []);

  useEffect(() => {
    sync();
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, [sync]);

  const subtotal = useMemo(() => items.reduce((sum, x) => sum + x.unitPricePkr, 0), [items]);

  function removeVariant(id: string) {
    const next = items.filter((x) => x.variantId !== id);
    writeWishlist(next);
    setItems(next);
    window.dispatchEvent(new Event("storage"));
  }

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Wishlist</h1>
      <p className="mt-2 text-sm text-slate-600">
        Saved variants on this device only. Add to cart when you&apos;re ready — totals below are illustrative for one piece each (
        {formatPKR(subtotal)}).
      </p>

      {!items.length ? (
        <div className="mt-8 rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center text-sm text-slate-600">
          Nothing saved yet — tap <span className="font-semibold text-rose-700">Wishlist</span> on any product row.
          <div className="mt-6">
            <Link href="/products" className="rounded-full bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">
              Browse shop
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-8 space-y-5">
          {items.map((w) => (
            <article
              key={w.variantId}
              className="flex flex-wrap items-center gap-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm ring-1 ring-white/60"
            >
              <Link href={`/product/${w.productSlug}`} className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-slate-100 ring-1 ring-slate-200">
                <SafeRemoteImage
                  src={w.imageUrl || SITE_PRODUCT_BACKDROP_URL}
                  alt={w.productName}
                  fill
                  className="object-cover"
                  sizes="96px"
                />
              </Link>
              <div className="min-w-0 flex-1">
                <Link href={`/product/${w.productSlug}`} className="text-base font-semibold text-slate-900 hover:text-blue-800">
                  {w.productName}
                </Link>
                <div className="mt-1 text-sm text-slate-600">{w.variantTitle}</div>
                <div className="mt-1 text-xs font-mono text-slate-500">{w.sku}</div>
                <div className="mt-2 text-sm font-semibold text-blue-800">{formatPKR(w.unitPricePkr)}</div>
              </div>
              <div className="flex flex-wrap gap-2">
                <AddToWishlistButton
                  variant={w}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm hover:border-rose-200 hover:bg-rose-50"
                />
                <AddToCartButton
                  variant={{
                    id: w.variantId,
                    sku: w.sku,
                    title: w.variantTitle,
                    price_pkr: w.unitPricePkr,
                    product_slug: w.productSlug,
                    product_name: w.productName,
                    image_url: w.imageUrl,
                  }}
                />
                <button
                  type="button"
                  onClick={() => removeVariant(w.variantId)}
                  className="inline-flex h-10 items-center justify-center rounded-full border border-red-100 bg-red-50 px-4 text-sm font-semibold text-red-800 hover:bg-red-100"
                >
                  Remove
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
