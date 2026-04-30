"use client";

import { AddToCartButton } from "@/components/AddToCartButton";

export function AddToCart({
  variant,
}: {
  variant: {
    id: string;
    sku: string;
    title: string;
    price_pkr: number;
    product_slug: string;
    product_name: string;
    image_url: string | null;
  };
}) {
  return (
    <AddToCartButton
      variant={{
        id: variant.id,
        sku: variant.sku,
        title: variant.title,
        price_pkr: variant.price_pkr,
        product_slug: variant.product_slug,
        product_name: variant.product_name,
        image_url: variant.image_url,
      }}
    />
  );
}

