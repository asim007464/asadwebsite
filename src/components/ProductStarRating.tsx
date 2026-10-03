/** Display-only star rating (admin sets avg + count for now). */

function clampRating(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.min(5, Math.max(0, value));
}

function Star({ fill }: { fill: number }) {
  const pct = Math.round(clampRating(fill) * 100);
  return (
    <span className="relative inline-block h-[1.05em] w-[1.05em]" aria-hidden>
      <svg viewBox="0 0 24 24" className="absolute inset-0 h-full w-full text-slate-300" fill="currentColor">
        <path d="M12 2.5l2.9 6.1 6.7.9-4.9 4.6 1.2 6.6L12 17.8 6.1 20.7l1.2-6.6L2.4 9.5l6.7-.9L12 2.5z" />
      </svg>
      <span className="absolute inset-0 overflow-hidden" style={{ width: `${pct}%` }}>
        <svg viewBox="0 0 24 24" className="h-full w-[1.05em] text-amber-500" fill="currentColor">
          <path d="M12 2.5l2.9 6.1 6.7.9-4.9 4.6 1.2 6.6L12 17.8 6.1 20.7l1.2-6.6L2.4 9.5l6.7-.9L12 2.5z" />
        </svg>
      </span>
    </span>
  );
}

export function ProductStarRating({
  ratingAvg,
  ratingCount,
  className = "",
  size = "md",
}: {
  ratingAvg: number;
  ratingCount: number;
  className?: string;
  size?: "sm" | "md";
}) {
  const avg = clampRating(Number(ratingAvg));
  const count = Number.isFinite(ratingCount) && ratingCount > 0 ? Math.floor(ratingCount) : 0;
  if (avg <= 0 && count <= 0) return null;

  const textSize = size === "sm" ? "text-xs" : "text-sm";
  const starSize = size === "sm" ? "text-[13px]" : "text-[15px]";

  return (
    <div className={`flex flex-wrap items-center gap-1.5 ${textSize} ${className}`}>
      <span className="font-semibold tabular-nums text-slate-900">{avg.toFixed(1)}</span>
      <span className={`inline-flex items-center gap-0.5 leading-none ${starSize}`} title={`${avg.toFixed(1)} out of 5`}>
        {[0, 1, 2, 3, 4].map((i) => (
          <Star key={i} fill={Math.min(1, Math.max(0, avg - i))} />
        ))}
      </span>
      {count > 0 ? (
        <span className="font-medium text-slate-500">({count.toLocaleString("en-US")})</span>
      ) : null}
    </div>
  );
}
