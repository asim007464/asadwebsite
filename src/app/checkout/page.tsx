"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { CartItem } from "@/lib/cart";
import { cartSubtotal, readCart, writeCart } from "@/lib/cart";
import { formatPKR } from "@/lib/money";
import { createOrder } from "./actions";

export default function CheckoutPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ orderNumber: string; totalPkr: number } | null>(null);
  const [method, setMethod] = useState<"cod" | "card" | "jazzcash">("cod");

  useEffect(() => {
    setItems(readCart());
  }, []);

  const subtotal = useMemo(() => cartSubtotal(items), [items]);

  if (items.length === 0 && !success) {
    return (
      <main className="mx-auto w-full max-w-2xl px-4 py-10">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Checkout</h1>
        <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="text-sm text-slate-600">Your cart is empty.</div>
          <Link href="/products" className="mt-5 inline-flex rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700">
            Browse products
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-10">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Checkout</h1>
          <p className="mt-2 text-sm text-slate-600">Choose payment method, then enter delivery details.</p>
        </div>
        <div className="rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-900">{formatPKR(subtotal)}</div>
      </div>

      {success ? (
        <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="text-sm text-slate-600">Order placed successfully.</div>
          <div className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">{success.orderNumber}</div>
          <div className="mt-2 text-sm text-slate-600">Total: <span className="font-semibold text-blue-900">{formatPKR(success.totalPkr)}</span></div>
          <Link href="/products" className="mt-7 inline-flex rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700">
            Continue shopping
          </Link>
        </div>
      ) : (
        <form
          className="mt-6 space-y-5 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm"
          onSubmit={async (e) => {
            e.preventDefault();
            setSubmitting(true);
            setError(null);
            try {
              const fd = new FormData(e.currentTarget);
              const methodLocal = String(fd.get("payment_method") || "cod") as "cod" | "card" | "jazzcash";
              const cardNumberRaw = String(fd.get("card_number") || "").replace(/\s+/g, "");
              const last4 = cardNumberRaw.replace(/\D/g, "").slice(-4);
              const payload = {
                customer_name: String(fd.get("customer_name") || ""),
                customer_phone: String(fd.get("customer_phone") || ""),
                customer_email: String(fd.get("customer_email") || ""),
                shipping_address1: String(fd.get("shipping_address1") || ""),
                shipping_address2: String(fd.get("shipping_address2") || ""),
                shipping_city: String(fd.get("shipping_city") || ""),
                shipping_province: String(fd.get("shipping_province") || ""),
                shipping_postal_code: String(fd.get("shipping_postal_code") || ""),
                notes: String(fd.get("notes") || ""),
                payment_method: methodLocal,
                card_last4: methodLocal === "card" ? last4 : "",
                card_holder: methodLocal === "card" ? String(fd.get("card_holder") || "") : "",
                jazzcash_phone: methodLocal === "jazzcash" ? String(fd.get("jazzcash_phone") || "") : "",
                jazzcash_reference: methodLocal === "jazzcash" ? String(fd.get("jazzcash_reference") || "") : "",
                items: items.map((it) => ({
                  variantId: it.variantId,
                  productName: it.productName,
                  variantTitle: it.variantTitle,
                  sku: it.sku,
                  unitPricePkr: it.unitPricePkr,
                  quantity: it.quantity,
                })),
              };

              const res = await createOrder(payload);
              writeCart([]);
              window.dispatchEvent(new Event("storage"));
              setSuccess({ orderNumber: res.orderNumber, totalPkr: res.totalPkr });
              setItems([]);
            } catch (err) {
              setError(err instanceof Error ? err.message : "Checkout failed");
            } finally {
              setSubmitting(false);
            }
          }}
        >
          <div>
            <div className="text-sm font-semibold text-slate-900">Payment method</div>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <label className={`flex cursor-pointer items-center justify-between rounded-2xl border px-4 py-3 text-sm font-semibold ${method === "cod" ? "border-blue-200 bg-blue-50/60 text-blue-900" : "border-slate-200 bg-white text-slate-800 hover:bg-slate-50"}`}>
                <span>COD</span>
                <input
                  type="radio"
                  name="payment_method"
                  value="cod"
                  checked={method === "cod"}
                  onChange={() => setMethod("cod")}
                />
              </label>
              <label className={`flex cursor-pointer items-center justify-between rounded-2xl border px-4 py-3 text-sm font-semibold ${method === "card" ? "border-blue-200 bg-blue-50/60 text-blue-900" : "border-slate-200 bg-white text-slate-800 hover:bg-slate-50"}`}>
                <span>Card</span>
                <input
                  type="radio"
                  name="payment_method"
                  value="card"
                  checked={method === "card"}
                  onChange={() => setMethod("card")}
                />
              </label>
              <label className={`flex cursor-pointer items-center justify-between rounded-2xl border px-4 py-3 text-sm font-semibold ${method === "jazzcash" ? "border-blue-200 bg-blue-50/60 text-blue-900" : "border-slate-200 bg-white text-slate-800 hover:bg-slate-50"}`}>
                <span>JazzCash</span>
                <input
                  type="radio"
                  name="payment_method"
                  value="jazzcash"
                  checked={method === "jazzcash"}
                  onChange={() => setMethod("jazzcash")}
                />
              </label>
            </div>

            {method === "card" ? (
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Card holder name" name="card_holder" placeholder="Name on card" required />
                <Field label="Card number" name="card_number" placeholder="1234 5678 9012 3456" required />
                <Field label="Expiry" name="card_expiry" placeholder="MM/YY" required />
                <Field label="CVC" name="card_cvc" placeholder="123" required />
                <div className="sm:col-span-2 text-xs leading-relaxed text-slate-600">
                  We <span className="font-semibold">do not store</span> full card details. Only the <span className="font-semibold">last 4 digits</span> are saved with the order for reference.
                </div>
              </div>
            ) : null}

            {method === "jazzcash" ? (
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="JazzCash phone" name="jazzcash_phone" placeholder="03xx-xxxxxxx" required />
                <Field label="Transaction / reference id" name="jazzcash_reference" placeholder="JC-XXXXXXXX" required />
                <div className="sm:col-span-2 text-xs leading-relaxed text-slate-600">
                  Enter the phone + reference id so we can verify and confirm your order quickly.
                </div>
              </div>
            ) : null}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Full name" name="customer_name" placeholder="Muhammad Ali" required />
            <Field label="Phone" name="customer_phone" placeholder="03xx-xxxxxxx" required />
          </div>
          <Field label="Email (optional)" name="customer_email" placeholder="you@email.com" />
          <Field label="Address line 1" name="shipping_address1" placeholder="House no, street, area" required />
          <Field label="Address line 2 (optional)" name="shipping_address2" placeholder="Near landmark" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="City" name="shipping_city" placeholder="Lahore" required />
            <Field label="Province (optional)" name="shipping_province" placeholder="Punjab" />
          </div>
          <Field label="Postal code (optional)" name="shipping_postal_code" placeholder="54000" />
          <div>
            <label className="text-sm font-semibold text-slate-900">Order notes (optional)</label>
            <textarea
              name="notes"
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
              rows={3}
              placeholder="Any special instructions"
            />
          </div>

          {error ? <div className="text-sm font-semibold text-red-700">{error}</div> : null}

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex h-12 w-full items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-60"
          >
            {submitting ? "Placing order..." : `Place order — ${formatPKR(subtotal)}`}
          </button>
          <div className="text-xs leading-relaxed text-slate-600">
            By placing an order, you agree that we may contact you via phone/WhatsApp for confirmation.
          </div>
        </form>
      )}
    </main>
  );
}

function Field({
  label,
  name,
  placeholder,
  required,
}: {
  label: string;
  name: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="text-sm font-semibold text-slate-900">
        {label} {required ? <span className="text-red-600">*</span> : null}
      </label>
      <input
        name={name}
        required={required}
        placeholder={placeholder}
        className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
      />
    </div>
  );
}

