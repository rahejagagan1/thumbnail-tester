"use client";

import { useEffect, useRef, useState } from "react";
import { Masthead } from "./Masthead";
import { MiniGuide } from "./Guide";
import { ChipBar } from "./ChipBar";
import { VideoCard } from "./VideoCard";
import { useFeed } from "@/lib/sites/www-thumbnails-gg-41c6aae7/app-f53b52ad/store";
import {
  autoColumns,
  useInfiniteScroll,
} from "@/lib/sites/www-thumbnails-gg-41c6aae7/app-f53b52ad/useInfiniteScroll";
import type { CardViewModel, Columns } from "@/types/thumbnails-app";

interface DesktopSurfaceProps {
  cards: CardViewModel[];
  columns: Columns;
  blur: number;
  grayscale: boolean;
  highlight: boolean;
  showSafeArea: boolean;
  guideExpanded?: boolean;
  scrollRootRef: React.RefObject<HTMLDivElement | null>;
  resetKey: string;
}

/** Width available to the cards themselves, with the grid's own padding taken off. */
function contentWidth(el: HTMLElement): number {
  const cs = getComputedStyle(el);
  return (
    el.clientWidth -
    (parseFloat(cs.paddingLeft) || 0) -
    (parseFloat(cs.paddingRight) || 0)
  );
}

/** The desktop YouTube-home surface: masthead, guide rail, chips, and the infinite feed grid. */
export function DesktopSurface({
  cards,
  columns,
  blur,
  grayscale,
  highlight,
  showSafeArea,
  guideExpanded,
  scrollRootRef,
  resetKey,
}: DesktopSurfaceProps) {
  const gridRef = useRef<HTMLDivElement | null>(null);
  const setInspect = useFeed((s) => s.setInspect);
  const uploadHandler = useFeed((s) => s.uploadHandler);
  const dropHandler = useFeed((s) => s.dropHandler);
  const moveCardTo = useFeed((s) => s.moveCardTo);
  const setGuideDefault = useFeed((s) => s.setGuideDefault);
  const guideOverride = useFeed((s) => s.guideOpen);
  const [autoCols, setAutoCols] = useState(4);
  const setGridMetrics = useFeed((s) => s.setGridMetrics);
  // Which test card is in flight, and the slot it would land in.
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const { visible, sentinelRef } = useInfiniteScroll(cards, {
    rootRef: scrollRootRef,
    resetKey,
  });

  // The surface states what it wants; the viewer's menu-button choice wins.
  useEffect(() => {
    setGuideDefault(Boolean(guideExpanded));
  }, [guideExpanded, setGuideDefault]);
  const railExpanded = guideOverride ?? Boolean(guideExpanded);

  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;
    // Published alongside the count so the editor can show the width Auto is
    // working from — it is the feed area, not the window.
    const measure = (width: number) => {
      const cols = autoColumns(width);
      setAutoCols(cols);
      setGridMetrics({ width: Math.round(width), autoCols: cols });
    };
    const ro = new ResizeObserver((entries) => {
      measure(entries[0]?.contentRect.width ?? 0);
    });
    ro.observe(el);
    // Match the observer, which reports the content box. `clientWidth`
    // includes the grid's 24px side padding — enough to show one column too
    // many until the first resize corrects it.
    measure(contentWidth(el));
    return () => ro.disconnect();
  }, [setGridMetrics]);

  // A file drag (dropping a .png onto the test card) and a card drag share the
  // same events, so they are told apart by what the drag is carrying.
  const isFileDrag = (e: React.DragEvent) =>
    Array.from(e.dataTransfer.types).includes("Files");

  const endDrag = () => {
    setDraggingId(null);
    setOverIndex(null);
  };

  const filters: string[] = [];
  if (blur > 0) filters.push(`blur(${blur}px)`);
  if (grayscale) filters.push("grayscale(1)");

  return (
    <>
      <Masthead />
      <div className="yt-body">
        <MiniGuide expanded={railExpanded} />
        <div className="yt-feed">
          <ChipBar />
          <div
            ref={gridRef}
            className="yt-grid"
            style={
              {
                "--yt-cols": columns === "auto" ? autoCols : columns,
                filter: filters.length ? filters.join(" ") : undefined,
                transition: "filter var(--dur-base) var(--ease-out)",
              } as React.CSSProperties
            }
          >
            {visible.map((vm, index) => (
              <VideoCard
                vm={vm}
                highlight={vm.isTest && highlight}
                showSafeArea={showSafeArea}
                onClick={() =>
                  vm.isPlaceholder ? uploadHandler?.() : setInspect(vm)
                }
                draggable={vm.isTest}
                dragging={draggingId === vm.id}
                dropTarget={draggingId !== null && overIndex === index}
                onDragStart={
                  vm.isTest
                    ? (e) => {
                        e.dataTransfer.effectAllowed = "move";
                        // Firefox ignores a drag that carries no payload.
                        e.dataTransfer.setData("text/plain", vm.id);
                        setDraggingId(vm.id);
                      }
                    : undefined
                }
                onDragEnd={vm.isTest ? endDrag : undefined}
                onDragOver={(e) => {
                  if (isFileDrag(e)) {
                    // Leave the existing drop-a-thumbnail path alone.
                    if (vm.isTest) e.preventDefault();
                    return;
                  }
                  if (!draggingId) return;
                  e.preventDefault();
                  e.dataTransfer.dropEffect = "move";
                  setOverIndex(index);
                }}
                onDragLeave={() =>
                  setOverIndex((i) => (i === index ? null : i))
                }
                onDrop={(e) => {
                  if (isFileDrag(e)) {
                    if (!vm.isTest) return;
                    e.preventDefault();
                    dropHandler?.(Array.from(e.dataTransfer.files));
                    return;
                  }
                  if (!draggingId) return;
                  e.preventDefault();
                  moveCardTo(draggingId, index);
                  endDrag();
                }}
                key={vm.id}
              />
            ))}
          </div>
          <div ref={sentinelRef} aria-hidden="true" style={{ height: 1 }} />
        </div>
      </div>
    </>
  );
}
