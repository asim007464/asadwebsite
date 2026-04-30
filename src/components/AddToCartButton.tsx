"use client";

import { useMemo, useState } from "react";
import { readCart, writeCart } from "@/lib/cart";

export function AddToCartButton({
  variant,
  className = "inline-flex h-10 items-center justify-center rounded-full bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-60",
  label = "Add to cart",
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
      {shownLabel}
    </button>
  );
}

