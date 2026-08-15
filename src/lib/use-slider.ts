"use client";

import { useCallback, useEffect, useRef, useState, type PointerEvent } from "react";

export function useSlider(count: number, { loop = true }: { loop?: boolean } = {}) {
  const [index, setIndex] = useState(0);
  const drag = useRef({ x: 0, active: false });

  const go = useCallback(
    (next: number) => {
      if (count <= 0) return;
      if (loop) {
        setIndex(((next % count) + count) % count);
        return;
      }
      setIndex(Math.max(0, Math.min(count - 1, next)));
    },
    [count, loop],
  );

  const next = useCallback(() => {
    setIndex((i) => {
      if (count <= 0) return 0;
      if (loop) return (i + 1) % count;
      return Math.min(count - 1, i + 1);
    });
  }, [count, loop]);

  const prev = useCallback(() => {
    setIndex((i) => {
      if (count <= 0) return 0;
      if (loop) return (i - 1 + count) % count;
      return Math.max(0, i - 1);
    });
  }, [count, loop]);

  useEffect(() => {
    setIndex((i) => (count <= 0 ? 0 : Math.min(i, count - 1)));
  }, [count]);

  const onPointerDown = useCallback((e: PointerEvent<HTMLElement>) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    drag.current = { x: e.clientX, active: true };
  }, []);

  const onPointerUp = useCallback(
    (e: PointerEvent<HTMLElement>) => {
      if (!drag.current.active) return;
      const dx = e.clientX - drag.current.x;
      drag.current.active = false;
      if (dx > 48) prev();
      else if (dx < -48) next();
    },
    [next, prev],
  );

  const onPointerCancel = useCallback(() => {
    drag.current.active = false;
  }, []);

  return {
    index,
    go,
    next,
    prev,
    swipe: {
      onPointerDown,
      onPointerUp,
      onPointerCancel,
    },
  };
}
