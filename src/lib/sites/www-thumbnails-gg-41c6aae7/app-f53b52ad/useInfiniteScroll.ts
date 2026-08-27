"use client";

import { useEffect, useRef, useState } from "react";

interface Options {
  initial?: number;
  step?: number;
  rootRef?: React.RefObject<HTMLElement | null>;
  resetKey?: string;
}

/**
 * Reveals `initial` items, then `step` more each time a sentinel enters the
 * scroll root (800px lookahead). Ported from the target site.
 */
export function useInfiniteScroll<T>(
  items: T[],
  { initial = 12, step = 9, rootRef, resetKey }: Options = {},
) {
  const [count, setCount] = useState(initial);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const total = items.length;

  useEffect(() => {
    setCount(initial);
  }, [resetKey, initial]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setCount((c) => (c < total ? Math.min(total, c + step) : c));
        }
      },
      { root: rootRef?.current ?? null, rootMargin: "800px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [total, step, rootRef]);

  return { visible: items.slice(0, count), sentinelRef, hasMore: count < total };
}

/** Desktop grid auto-column count from container width. */
export function autoColumns(width: number): number {
  if (width <= 0) return 4;
  return Math.max(1, Math.min(6, Math.floor((width + 16) / 316)));
}
