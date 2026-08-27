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
  const [autoCols, setAutoCols] = useState(4);
  const { visible, sentinelRef } = useInfiniteScroll(cards, {
    rootRef: scrollRootRef,
    resetKey,
  });

  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      setAutoCols(autoColumns(entries[0]?.contentRect.width ?? 0));
    });
    ro.observe(el);
    setAutoCols(autoColumns(el.clientWidth));
    return () => ro.disconnect();
  }, []);

  const filters: string[] = [];
  if (blur > 0) filters.push(`blur(${blur}px)`);
  if (grayscale) filters.push("grayscale(1)");

  return (
    <>
      <Masthead />
      <div className="yt-body">
        <MiniGuide expanded={guideExpanded} />
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
            {visible.map((vm) => (
              <VideoCard
                vm={vm}
                highlight={vm.isTest && highlight}
                showSafeArea={showSafeArea}
                onClick={() =>
                  vm.isPlaceholder ? uploadHandler?.() : setInspect(vm)
                }
                onDragOver={vm.isTest ? (e) => e.preventDefault() : undefined}
                onDrop={
                  vm.isTest
                    ? (e) => {
                        e.preventDefault();
                        dropHandler?.(Array.from(e.dataTransfer.files));
                      }
                    : undefined
                }
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
