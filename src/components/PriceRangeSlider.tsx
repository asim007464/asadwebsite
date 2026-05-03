"use client";

import { PRICE_FILTER_MAX_PKR, formatPKR } from "@/lib/money";

const STEP = 1_000;

/** Track h-2 + 18px thumbs; WebKit offset centers thumb on track. */
const rangeInputClass =
  "absolute left-0 right-0 top-1/2 h-2 w-full -translate-y-1/2 cursor-pointer appearance-none bg-transparent " +
  "[&::-webkit-slider-runnable-track]:h-2 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-transparent " +
  "[&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:-mt-[5px] [&::-webkit-slider-thumb]:box-border [&::-webkit-slider-thumb]:h-[18px] [&::-webkit-slider-thumb]:w-[18px] [&::-webkit-slider-thumb]:cursor-grab [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-blue-600 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-[0_2px_10px_rgba(37,99,235,0.22),0_1px_2px_rgba(15,23,42,0.08)] active:[&::-webkit-slider-thumb]:cursor-grabbing " +
  "[&::-moz-range-track]:h-2 [&::-moz-range-track]:rounded-full [&::-moz-range-track]:bg-transparent " +
  "[&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:box-border [&::-moz-range-thumb]:h-[18px] [&::-moz-range-thumb]:w-[18px] [&::-moz-range-thumb]:cursor-grab [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-blue-600 [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:shadow-[0_2px_10px_rgba(37,99,235,0.22)]";

type PriceRangeSliderProps = {
  low: number;
  high: number;
  onChange: (next: { low: number; high: number }) => void;
};

export function PriceRangeSlider({ low, high, onChange }: PriceRangeSliderProps) {
  const max = PRICE_FILTER_MAX_PKR;
  const lowPct = (low / max) * 100;
  const highPct = (high / max) * 100;
  const span = Math.max(0, highPct - lowPct);

  const zLow = low >= high - STEP * 2 ? "z-[5]" : "z-[3]";
  const zHigh = high <= low + STEP * 2 ? "z-[4]" : "z-[5]";
  const isFullRange = low === 0 && high === max;

  return (
    <div className="mt-3 rounded-2xl border border-slate-200/90 bg-gradient-to-b from-slate-50/95 to-white p-4 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.85)] ring-1 ring-slate-900/[0.04]">
      <div className="mb-3 flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
        <span>Range</span>
        <span className="font-medium normal-case tracking-normal text-slate-500">
          {isFullRange ? "Entire catalog" : "Custom band"}
        </span>
      </div>

      <div className="relative isolate h-11 w-full overflow-visible px-0.5">
        <div
          aria-hidden
          className="pointer-events-none absolute left-0 right-0 top-1/2 h-2 -translate-y-1/2 rounded-full bg-slate-200/95 shadow-[inset_0_1px_2px_rgba(15,23,42,0.08)] ring-1 ring-slate-900/[0.05]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute top-1/2 h-2 -translate-y-1/2 rounded-full bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 shadow-[0_0_14px_-2px_rgba(37,99,235,0.45)] ring-1 ring-blue-500/30"
          style={{ left: `${lowPct}%`, width: `${span}%` }}
        />
        <input
          type="range"
          min={0}
          max={max}
          step={STEP}
          value={low}
          aria-label="Minimum price"
          aria-valuemin={0}
          aria-valuemax={high}
          onChange={(e) => {
            const v = Number(e.target.value);
            onChange({ low: Math.min(v, high), high });
          }}
          className={`${rangeInputClass} pointer-events-none ${zLow}`}
        />
        <input
          type="range"
          min={0}
          max={max}
          step={STEP}
          value={high}
          aria-label="Maximum price"
          aria-valuemin={low}
          aria-valuemax={max}
          onChange={(e) => {
            const v = Number(e.target.value);
            onChange({ low, high: Math.max(v, low) });
          }}
          className={`${rangeInputClass} pointer-events-none ${zHigh}`}
        />
      </div>

      <div className="mt-0 flex justify-between px-0.5 text-[10px] tabular-nums text-slate-400">
        <span>0</span>
        <span>{max.toLocaleString("en-PK")}</span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl bg-slate-900/[0.03] p-3 ring-1 ring-slate-200/80">
        <div className="text-center">
          <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Minimum</div>
          <div className="mt-0.5 text-[15px] font-bold tabular-nums leading-tight text-slate-900">{formatPKR(low)}</div>
        </div>
        <div className="relative text-center before:absolute before:left-0 before:top-1/2 before:h-8 before:w-px before:-translate-y-1/2 before:bg-slate-200/90 before:content-['']">
          <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Maximum</div>
          <div className="mt-0.5 text-[15px] font-bold tabular-nums leading-tight text-slate-900">{formatPKR(high)}</div>
        </div>
      </div>

      <p className="mt-3 text-center text-[11px] leading-relaxed text-slate-500">
        Drag the handles to set your budget · Steps of ₨{STEP.toLocaleString("en-PK")}
      </p>
    </div>
  );
}
