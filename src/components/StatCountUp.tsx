"use client";

import { useEffect, useMemo, useRef, useState } from "react";

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

function formatCompact(n: number) {
  if (n >= 1_000_000) return `${Math.round(n / 1_000_000)}M`;
  if (n >= 10_000) return `${Math.round(n / 1_000)}k+`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}k+`;
  return String(Math.round(n));
}

export function StatCountUp({
  value,
  format = "compact",
  durationMs = 1100,
  className = "",
}: {
  /** Final numeric value to count to (e.g. 40_000_000). */
  value: number;
  format?: "compact" | "number";
  durationMs?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const [started, setStarted] = useState(false);
  const [display, setDisplay] = useState(0);

  const formatter = useMemo(() => {
    if (format === "number") return (n: number) => String(Math.round(n)).toLocaleString?.() ?? String(Math.round(n));
    return (n: number) => formatCompact(n);
  }, [format]);

  useEffect(() => {
    const el = ref.current;
    if (!el || started) return;

    const obs = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setStarted(true);
          obs.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    let raf = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = easeOutCubic(t);
      setDisplay(value * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [started, value, durationMs]);

  return (
    <span ref={ref} className={className}>
      {formatter(display)}
    </span>
  );
}

