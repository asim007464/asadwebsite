"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import { wishlistToggle, wishlistContains, type WishlistItem } from "@/lib/wishlist";

function HeartIcon({ filled, className }: { filled?: boolean; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="none">
      <path
        d="M12 20.6c-.3 0-.6-.1-.9-.4-6.3-5.8-9-9-9-12.3 0-2.8 2.3-5 5.1-5 1.4 0 2.8.6 3.8 1.6 1-.9 2.4-1.6 3.9-1.6 2.8 0 5.1 2.3 5.1 5.1 0 3.2-2.8 6.6-9 12.4-.3.3-.7.5-1 .5z"
        fill={filled ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={1.6}
      />
    </svg>
  );
}

export type WishlistVariantInput = Omit<WishlistItem, never>;

export function AddToWishlistButton({
  variant,
  className = "inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-800",
}: {
  variant: WishlistVariantInput | null | undefined;
  className?: string;
}) {
  const [mounted, setMounted] = useState(false);
  const [on, setOn] = useState(false);

  const item = variant;

  useEffect(() => {
    setMounted(true);
    if (item?.variantId) setOn(wishlistContains(item.variantId));
  }, [item]);

  useEffect(() => {
    const onStorage = () => {
      if (item?.variantId) setOn(wishlistContains(item.variantId));
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [item?.variantId]);

  const aria = useMemo(() => (item ? (on ? "Remove from wishlist" : "Add to wishlist") : "Wishlist unavailable"), [item, on]);

  const toggle = useCallback(() => {
    if (!item) return;
    const { added } = wishlistToggle(item);
    setOn(added);
    window.dispatchEvent(new Event("storage"));
  }, [item]);

  if (!mounted || !item) {
    return (
      <button type="button" disabled className={`${className} opacity-50`} aria-label="Wishlist">
        <HeartIcon className="h-5 w-5" />
      </button>
    );
  }

  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={aria}
      onClick={toggle}
      className={on ? `${className} border-rose-200 bg-rose-50 text-rose-700` : className}
    >
      <HeartIcon filled={on} className="h-5 w-5" />
      <span className="hidden sm:inline">{on ? "Saved" : "Wishlist"}</span>
    </button>
  );
}
