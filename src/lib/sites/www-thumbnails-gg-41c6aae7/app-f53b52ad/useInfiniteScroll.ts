"use client";

import { useEffect, useRef, useState } from "react";

/** Key that, when changed, rewinds pagination back to the first page. */
type ResetKey = string | undefined;

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

  // Rewind to the first page whenever the feed is recomposed. Adjusting state
  // during render (rather than in an effect) avoids a wasted pass showing the
  // old page count against the new feed.
  const [prev, setPrev] = useState<{ key: ResetKey; initial: number }>({
    key: resetKey,
    initial,
  });
  if (prev.key !== resetKey || prev.initial !== initial) {
    setPrev({ key: resetKey, initial });
    setCount(initial);
  }

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

/**
 * YouTube's own rich-grid metrics, read off a live desktop feed:
 *
 *   --ytd-rich-grid-item-min-width: 326.8px
 *   --ytd-rich-grid-item-margin:     16px
 *
 * The target site assumes a 300px minimum instead, which overshoots by one
 * column across a wide band of widths — a feed showing five cards where YouTube
 * shows four is the wrong test, so we follow YouTube here rather than the clone.
 */
const YT_ITEM_MIN_WIDTH = 326.8;
const YT_ITEM_MARGIN = 16;

/** Grid width one more column costs, rounded for display. */
export const AUTO_COLUMN_STEP = Math.round(YT_ITEM_MIN_WIDTH + YT_ITEM_MARGIN);

/**
 * Cards per row never goes above this, however wide the window gets. YouTube
 * itself keeps growing (6 across on a 2560px screen), but a thumbnail is being
 * judged here, and past four they are too small to judge. Applies to the
 * tester and to a shared link alike — both render through this.
 */
export const MAX_COLUMNS = 4;

/** Desktop grid auto-column count from container width. */
export function autoColumns(width: number): number {
  if (width <= 0) return MAX_COLUMNS;
  const perColumn = YT_ITEM_MIN_WIDTH + YT_ITEM_MARGIN;
  return Math.max(
    1,
    Math.min(MAX_COLUMNS, Math.floor((width + YT_ITEM_MARGIN) / perColumn)),
  );
}
