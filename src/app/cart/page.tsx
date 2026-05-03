"use client";

import Link from "next/link";
import { SafeRemoteImage } from "@/components/SafeRemoteImage";
import { useEffect, useMemo, useState } from "react";
import type { CartItem } from "@/lib/cart";
import { cartSubtotal, readCart, writeCart } from "@/lib/cart";
import { formatPKR } from "@/lib/money";

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const sync = () => setItems(readCart());
    sync();
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  const subtotal = useMemo(() => cartSubtotal(items), [items]);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Cart</h1>
          <p className="mt-2 text-sm text-slate-600">Review your items, then continue to checkout.</p>
        </div>
        {items.length > 0 ? (
          <button
            type="button"
            className="text-sm font-semibold text-blue-700 hover:text-blue-800"
            onClick={() => {
              writeCart([]);
              setItems([]);
              window.dispatchEvent(new Event("storage"));
            }}
          >
            Clear cart
          </button>
        ) : null}
      </div>

      {items.length === 0 ? (
        <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="text-sm text-slate-600">Your cart is empty.</div>
          <Link href="/products" className="mt-5 inline-flex rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700">
            Browse products
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="divide-y divide-slate-100">
                {items.map((it) => (
                  <div key={it.variantId} className="flex gap-4 p-5">
                    <div className="relative h-24 w-32 overflow-hidden rounded-2xl bg-slate-50 ring-1 ring-slate-200">
                      {it.imageUrl ? (
                        <SafeRemoteImage src={it.imageUrl} alt={it.productName} fill className="object-cover" sizes="128px" />
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <Link href={`/product/${it.productSlug}`} className="truncate text-base font-semibold text-slate-900 hover:text-blue-800 hover:underline">
                        {it.productName}
                      </Link>
                      <div className="mt-1 text-sm text-slate-600">{it.variantTitle}</div>
                      <div className="mt-1 text-xs text-slate-500">SKU: {it.sku}</div>
                      <div className="mt-3 flex items-center gap-2">
                        <button
                          type="button"
                          className="h-10 w-10 rounded-full border border-slate-200 bg-white text-lg leading-none text-slate-800 hover:bg-slate-50"
                          onClick={() => {
                            const next = readCart();
                            const x = next.find((x) => x.variantId === it.variantId);
                            if (!x) return;
                            x.quantity = Math.max(1, x.quantity - 1);
                            writeCart(next);
                            setItems(next);
                            window.dispatchEvent(new Event("storage"));
                          }}
                        >
                          −
                        </button>
                        <div className="w-12 text-center text-sm font-semibold">{it.quantity}</div>
                        <button
                          type="button"
                          className="h-10 w-10 rounded-full border border-slate-200 bg-white text-lg leading-none text-slate-800 hover:bg-slate-50"
                          onClick={() => {
                            const next = readCart();
                            const x = next.find((x) => x.variantId === it.variantId);
                            if (!x) return;
                            x.quantity += 1;
                            writeCart(next);
                            setItems(next);
                            window.dispatchEvent(new Event("storage"));
                          }}
                        >
                          +
                        </button>
                        <button
                          type="button"
                          className="ml-auto text-sm font-semibold text-blue-700 hover:text-blue-800"
                          onClick={() => {
                            const next = readCart().filter((x) => x.variantId !== it.variantId);
                            writeCart(next);
                            setItems(next);
                            window.dispatchEvent(new Event("storage"));
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="text-sm font-semibold text-blue-900">{formatPKR(it.unitPricePkr * it.quantity)}</div>
                      <div className="mt-1 text-xs text-slate-500">{formatPKR(it.unitPricePkr)} each</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="text-sm font-semibold text-slate-900">Order summary</div>
            <div className="mt-4 flex items-center justify-between text-sm">
              <div className="text-slate-600">Subtotal</div>
              <div className="font-semibold text-slate-900">{formatPKR(subtotal)}</div>
            </div>
            <div className="mt-2 flex items-start justify-between gap-3 text-sm">
              <div className="text-slate-600">Shipping</div>
              <div className="text-right">
                <div className="font-semibold text-slate-900">Free if you pay first</div>
                <div className="text-xs text-slate-500">Rs 250 on cash on delivery</div>
              </div>
            </div>
            <Link
              href="/checkout"
              className="mt-5 inline-flex h-12 w-full items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
            >
              Checkout
            </Link>
            <div className="mt-4 text-xs leading-relaxed text-slate-600">Final amount is calculated at checkout from your payment choice.</div>
          </div>
        </div>
      )}
    </main>
  );
}

