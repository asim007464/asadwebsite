"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AddToCartButton } from "@/components/AddToCartButton";
import { formatPKR } from "@/lib/money";
import { SPEC_LISTS_OPTIONS_KEY, specListsFromOptions } from "@/lib/product-spec-lists";

type VariantRow = {
  id: string;
  sku: string;
  title: string;
  options: Record<string, unknown>;
  price_pkr: number;
  compare_at_price_pkr: number | null;
};

function humanizeKey(key: string) {
  return key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function stockBadge(qty: number | undefined) {
  if (qty === undefined) {
    return (
      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-700 ring-1 ring-slate-200">
        Stock: message us
      </span>
    );
  }
  if (qty <= 0) {
    return (
      <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-900 ring-1 ring-amber-100">
        Awaiting restock
      </span>
    );
  }
  if (qty < 10) {
    return (
      <span className="rounded-full bg-orange-50 px-2.5 py-0.5 text-[11px] font-semibold text-orange-900 ring-1 ring-orange-100">
        Low stock
      </span>
    );
  }
  return (
    <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-900 ring-1 ring-emerald-100">
      In stock
    </span>
  );
}

function VariantSpecs({ options }: { options: Record<string, unknown> }) {
  const lists = specListsFromOptions(options);
  const entries = Object.entries(options).filter(
    ([k, v]) => k !== SPEC_LISTS_OPTIONS_KEY && v != null && String(v).trim() !== "",
  );
  if (!lists.length && !entries.length) return null;

  return (
    <div className="space-y-3">
      {lists.map((list, i) => (
        <div key={`${list.heading}-${i}`}>
          {list.heading ? <h3 className="text-sm font-semibold text-slate-900">{list.heading}</h3> : null}
          {list.points.length ? (
            <ul className={`list-disc space-y-0.5 pl-4 text-sm leading-snug text-slate-600 marker:text-blue-600 ${list.heading ? "mt-1" : ""}`}>
              {list.points.map((point, j) => (
                <li key={j} className="pl-0.5">
                  {point}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ))}
      {entries.length ? (
        <dl className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {entries.map(([k, v]) => (
            <div key={k} className="flex justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2 text-sm">
              <dt className="text-slate-500">{humanizeKey(k)}</dt>
              <dd className="text-right font-semibold text-slate-900">{String(v)}</dd>
            </div>
          ))}
        </dl>
      ) : null}
    </div>
  );
}

export function ProductPurchasePanel({
  productName,
  productSlug,
  imageUrl,
  variants,
  qtyByVariant,
}: {
  productName: string;
  productSlug: string;
  imageUrl: string | null;
  variants: VariantRow[];
  qtyByVariant: Record<string, number>;
}) {
  const [selectedId, setSelectedId] = useState(variants[0]?.id ?? "");
  const selected = useMemo(
    () => variants.find((v) => v.id === selectedId) ?? variants[0] ?? null,
    [selectedId, variants],
  );
  const multiple = variants.length > 1;

  if (!selected) {
    return <p className="mt-4 text-sm text-slate-600">This product is not available for order yet.</p>;
  }

  const compareAt = selected.compare_at_price_pkr;
  const showCompare = compareAt != null && compareAt > selected.price_pkr;
  const optionLabel = (v: VariantRow) => {
    const title = v.title.trim();
    if (title && title.toLowerCase() !== productName.trim().toLowerCase()) return title;
    return formatPKR(v.price_pkr);
  };

  return (
    <div className="mt-5 space-y-4">
      {multiple ? (
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Choose option</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {variants.map((v) => {
              const active = v.id === selected.id;
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setSelectedId(v.id)}
                  className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition ${
                    active
                      ? "bg-blue-600 text-white shadow-sm"
                      : "border border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:bg-blue-50"
                  }`}
                >
                  {optionLabel(v)}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-2xl font-bold tabular-nums tracking-tight text-slate-900">{formatPKR(selected.price_pkr)}</p>
          {showCompare ? (
            <p className="text-sm text-slate-400 line-through tabular-nums">{formatPKR(compareAt)}</p>
          ) : null}
        </div>
        {stockBadge(qtyByVariant[selected.id])}
      </div>

      <VariantSpecs options={selected.options} />

      <div className="flex flex-col gap-2 pt-1 sm:flex-row sm:flex-wrap sm:items-center">
        <AddToCartButton
          className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-blue-600 px-6 text-sm font-semibold text-white shadow-md shadow-blue-600/20 transition hover:bg-blue-700 disabled:opacity-60 sm:w-auto sm:min-w-[11rem]"
          variant={{
            id: selected.id,
            sku: selected.sku,
            title: selected.title,
            price_pkr: selected.price_pkr,
            product_slug: productSlug,
            product_name: productName,
            image_url: imageUrl,
          }}
        />
        <Link
          href="/products"
          className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Continue shopping
        </Link>
        <Link
          href="/cart"
          className="inline-flex h-11 items-center justify-center rounded-xl border border-blue-200 bg-blue-50 px-5 text-sm font-semibold text-blue-800 transition hover:bg-blue-100"
        >
          View cart
        </Link>
      </div>
      <p className="text-xs text-slate-500">Cash on delivery · confirmed before dispatch</p>
    </div>
  );
}
