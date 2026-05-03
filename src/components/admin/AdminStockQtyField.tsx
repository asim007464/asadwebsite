"use client";

import { useId, useState } from "react";

export function AdminStockQtyField({
  name,
  label,
  defaultQty = 0,
  inputClassName,
}: {
  name: string;
  label: string;
  defaultQty?: number;
  inputClassName: string;
}) {
  const id = useId();
  const [qty, setQty] = useState(() => {
    const n = Number(defaultQty);
    return Number.isFinite(n) && n >= 0 ? Math.trunc(n) : 0;
  });

  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={id} className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          {label}
        </label>
        <span
          className={
            qty > 0
              ? "shrink-0 text-[10px] font-semibold uppercase tracking-wide text-emerald-700 sm:text-xs"
              : "shrink-0 text-[10px] font-semibold uppercase tracking-wide text-red-600 sm:text-xs"
          }
          aria-live="polite"
        >
          {qty > 0 ? "In Stock" : "Out of Stock"}
        </span>
      </div>
      <input
        id={id}
        name={name}
        type="number"
        min={0}
        step={1}
        value={qty}
        onChange={(e) => {
          const raw = e.target.value;
          if (raw === "") {
            setQty(0);
            return;
          }
          const n = Number.parseInt(raw, 10);
          setQty(Number.isFinite(n) && n >= 0 ? n : 0);
        }}
        className={inputClassName}
      />
    </div>
  );
}
