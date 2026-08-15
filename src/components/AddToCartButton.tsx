"use client";

import { useMemo, useState } from "react";
import { readCart, writeCart } from "@/lib/cart";

function CartIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
      />
    </svg>
  );
}

export function AddToCartButton({
  variant,
  className = "inline-flex h-10 items-center justify-center rounded-full bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-60",
  label = "Add to cart",
  withIcon = false,
}: {
  variant:
    | {
        id: string;
        sku: string;
        title: string;
        price_pkr: number;
        product_slug: string;
        product_name: string;
        image_url?: string | null;
      }
    | null
    | undefined;
  className?: string;
  label?: string;
  withIcon?: boolean;
}) {
  const [adding, setAdding] = useState(false);
  const [addedTick, setAddedTick] = useState(0);

  const canAdd = !!variant?.id;
  const shownLabel = useMemo(() => {
    if (!canAdd) return "Select options";
    if (adding) return "Adding...";
    if (addedTick > 0) return "Added";
    return label;
  }, [addedTick, adding, canAdd, label]);

  return (
    <button
      type="button"
      disabled={adding || !canAdd}
      onClick={() => {
        if (!variant) return;
        setAdding(true);
        try {
          const items = readCart();
          const existing = items.find((i) => i.variantId === variant.id);
          if (existing) {
            existing.quantity += 1;
          } else {
            items.push({
              variantId: variant.id,
              productSlug: variant.product_slug,
              productName: variant.product_name,
              variantTitle: variant.title,
              sku: variant.sku,
              unitPricePkr: variant.price_pkr,
              quantity: 1,
              imageUrl: variant.image_url ?? null,
            });
          }
          writeCart(items);
          window.dispatchEvent(new Event("storage"));
          setAddedTick((x) => x + 1);
          window.setTimeout(() => setAddedTick(0), 900);
        } finally {
          setAdding(false);
        }
      }}
      className={className}
    >
      {withIcon && canAdd && addedTick === 0 && !adding ? <CartIcon /> : null}
      {shownLabel}
    </button>
  );
}

