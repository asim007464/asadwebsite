"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { CartItem } from "@/lib/cart";
import { cartSubtotal, readCart, writeCart } from "@/lib/cart";
import { shippingPkrForPaymentMethod } from "@/lib/checkout-shipping";
import { formatPKR } from "@/lib/money";
import type { ResolvedStorefront } from "@/lib/storefront";
import { createOrder } from "./actions";

type Method = "cod" | "jazzcash" | "bank_transfer";

export function CheckoutClient({ storefront }: { storefront: ResolvedStorefront }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ orderNumber: string; totalPkr: number } | null>(null);
  const [method, setMethod] = useState<Method>("cod");

  useEffect(() => {
    setItems(readCart());
  }, []);

  const subtotal = useMemo(() => cartSubtotal(items), [items]);
  const shippingPkr = useMemo(() => shippingPkrForPaymentMethod(method), [method]);
  const orderTotal = subtotal + shippingPkr;

  if (items.length === 0 && !success) {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 py-10">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Checkout</h1>
        <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="text-sm text-slate-600">Your cart is empty.</div>
          <Link
            href="/products"
            className="mt-5 inline-flex rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
          >
            Browse products
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Checkout &amp; payment</h1>
          <p className="mt-2 text-sm text-slate-600">Choose how you pay, then share delivery details. Payments are verified manually before dispatch.</p>
        </div>
        <div className="rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-900 ring-1 ring-blue-100">{formatPKR(orderTotal)}</div>
      </div>

      {success ? (
        <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="text-sm text-slate-600">Order placed successfully.</div>
          <div className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">{success.orderNumber}</div>
          <div className="mt-2 text-sm text-slate-600">
            Total: <span className="font-semibold text-blue-900">{formatPKR(success.totalPkr)}</span>
          </div>
          <Link
            href="/products"
            className="mt-7 inline-flex rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
          >
            Continue shopping
          </Link>
        </div>
      ) : (
        <form
          className="mt-6 space-y-6"
          onSubmit={async (e) => {
            e.preventDefault();
            setSubmitting(true);
            setError(null);
            try {
              const fd = new FormData(e.currentTarget);
              const methodLocal = String(fd.get("payment_method") || "cod") as Method;
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
                jazzcash_phone: methodLocal === "jazzcash" ? String(fd.get("jazzcash_phone") || "") : "",
                jazzcash_reference: methodLocal === "jazzcash" ? String(fd.get("jazzcash_reference") || "") : "",
                bank_reference: methodLocal === "bank_transfer" ? String(fd.get("bank_reference") || "") : "",
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
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="text-sm font-semibold text-slate-900">How would you like to pay?</div>
            <p className="mt-1 text-xs text-slate-500">No card numbers are collected on this site — JazzCash / bank transfer details are for reference only.</p>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <label
                className={`flex cursor-pointer flex-col gap-1 rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                  method === "cod" ? "border-blue-300 bg-blue-50/80 text-blue-950 ring-2 ring-blue-100" : "border-slate-200 bg-white text-slate-800 hover:bg-slate-50"
                }`}
              >
                <span className="flex items-center justify-between gap-2">
                  Cash on delivery
                  <input type="radio" name="payment_method" value="cod" checked={method === "cod"} onChange={() => setMethod("cod")} />
                </span>
                <span className="text-xs font-medium text-slate-600">Pay the courier when your parcel arrives. Delivery fee applies.</span>
              </label>

              <label
                className={`flex cursor-pointer flex-col gap-1 rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                  method === "jazzcash" ? "border-blue-300 bg-blue-50/80 text-blue-950 ring-2 ring-blue-100" : "border-slate-200 bg-white text-slate-800 hover:bg-slate-50"
                }`}
              >
                <span className="flex items-center justify-between gap-2">
                  JazzCash
                  <input type="radio" name="payment_method" value="jazzcash" checked={method === "jazzcash"} onChange={() => setMethod("jazzcash")} />
                </span>
                <span className="text-xs font-medium text-slate-600">Free shipping once payment is confirmed. Send to the wallet below, then paste your TXN id.</span>
              </label>

              <label
                className={`flex cursor-pointer flex-col gap-1 rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                  method === "bank_transfer" ? "border-blue-300 bg-blue-50/80 text-blue-950 ring-2 ring-blue-100" : "border-slate-200 bg-white text-slate-800 hover:bg-slate-50"
                }`}
              >
                <span className="flex items-center justify-between gap-2">
                  Bank transfer
                  <input
                    type="radio"
                    name="payment_method"
                    value="bank_transfer"
                    checked={method === "bank_transfer"}
                    onChange={() => setMethod("bank_transfer")}
                  />
                </span>
                <span className="text-xs font-medium text-slate-600">Free shipping once payment is confirmed. IBAN transfer — add your reference in the form.</span>
              </label>
            </div>

            {method === "jazzcash" ? (
              <div className="mt-5 grid gap-4 rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <div className="text-xs font-bold uppercase tracking-wide text-blue-800">Send to JazzCash wallet</div>
                  <dl className="mt-3 grid gap-2 text-sm text-slate-800">
                    <div className="flex justify-between gap-3 rounded-xl bg-white/80 px-3 py-2 ring-1 ring-blue-100">
                      <dt className="text-slate-500">Number</dt>
                      <dd className="font-mono font-semibold text-blue-900">{storefront.jazzcashNumber}</dd>
                    </div>
                    <div className="flex justify-between gap-3 rounded-xl bg-white/80 px-3 py-2 ring-1 ring-blue-100">
                      <dt className="text-slate-500">Title</dt>
                      <dd className="text-right font-semibold text-slate-900">{storefront.jazzcashTitle}</dd>
                    </div>
                  </dl>
                </div>
                <Field label="Your JazzCash number" name="jazzcash_phone" placeholder="03xx-xxxxxxx" required />
                <Field label="Transaction / reference id" name="jazzcash_reference" placeholder="e.g. T1234567890" required />
              </div>
            ) : null}

            {method === "bank_transfer" ? (
              <div className="mt-5 grid gap-4 rounded-2xl border border-slate-200 bg-slate-50/80 p-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <div className="text-xs font-bold uppercase tracking-wide text-slate-600">Bank details</div>
                  <dl className="mt-3 grid gap-2 text-sm text-slate-800">
                    <div className="flex justify-between gap-3 rounded-xl bg-white px-3 py-2 ring-1 ring-slate-200">
                      <dt className="text-slate-500">Bank</dt>
                      <dd className="text-right font-semibold">{storefront.bankName}</dd>
                    </div>
                    <div className="flex flex-col gap-1 rounded-xl bg-white px-3 py-2 ring-1 ring-slate-200 sm:flex-row sm:justify-between">
                      <dt className="text-slate-500">IBAN / account</dt>
                      <dd className="break-all text-right font-mono text-xs font-semibold text-slate-900 sm:text-sm">{storefront.bankIban}</dd>
                    </div>
                    <div className="flex justify-between gap-3 rounded-xl bg-white px-3 py-2 ring-1 ring-slate-200">
                      <dt className="text-slate-500">Title</dt>
                      <dd className="text-right font-semibold">{storefront.bankAccountTitle}</dd>
                    </div>
                  </dl>
                </div>
                <div className="sm:col-span-2">
                  <Field
                    label="Your transfer reference / receipt note (optional)"
                    name="bank_reference"
                    placeholder="e.g. FTN-998877 / screenshot sent on WhatsApp"
                  />
                  <p className="mt-2 text-xs text-slate-600">
                    After transfer, our team matches your payment to this order total. Keep the bank receipt handy — we may ask for it on WhatsApp.
                  </p>
                </div>
              </div>
            ) : null}
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="text-sm font-semibold text-slate-900">Delivery</div>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
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
          </div>

          {error ? <div className="text-sm font-semibold text-red-700">{error}</div> : null}

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="text-sm font-semibold text-slate-900">Order summary</div>
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-slate-600">Subtotal</span>
              <span className="font-semibold text-slate-900">{formatPKR(subtotal)}</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-sm">
              <span className="text-slate-600">Shipping</span>
              <span className="font-semibold text-slate-900">{shippingPkr === 0 ? "Free" : formatPKR(shippingPkr)}</span>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 text-sm">
              <span className="font-semibold text-slate-900">Total</span>
              <span className="font-semibold text-blue-900">{formatPKR(orderTotal)}</span>
            </div>
            {method === "cod" ? (
              <p className="mt-3 text-xs leading-relaxed text-slate-500">COD orders include a flat delivery charge. Switch to JazzCash or bank transfer for free shipping.</p>
            ) : (
              <p className="mt-3 text-xs leading-relaxed text-slate-500">No delivery charge for prepaid orders — we ship after payment is matched.</p>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex h-12 w-full items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-60"
          >
            {submitting ? "Placing order..." : `Place order — ${formatPKR(orderTotal)}`}
          </button>

          <p className="text-center text-xs leading-relaxed text-slate-600">
            By placing an order you agree we may phone or WhatsApp you to confirm specs, payment, and dispatch timing.
          </p>
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
        {label} {required ? <span className="text-blue-800">*</span> : null}
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
