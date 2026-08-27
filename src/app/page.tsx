"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { DesktopSurface } from "@/components/sites/www-thumbnails-gg-41c6aae7/app-f53b52ad/DesktopSurface";
import { EditorPanel } from "@/components/sites/www-thumbnails-gg-41c6aae7/app-f53b52ad/EditorPanel";
import { FlashOverlay } from "@/components/sites/www-thumbnails-gg-41c6aae7/app-f53b52ad/FlashOverlay";
import { InspectModal } from "@/components/sites/www-thumbnails-gg-41c6aae7/app-f53b52ad/InspectModal";
import { MobileView } from "@/components/sites/www-thumbnails-gg-41c6aae7/app-f53b52ad/MobileView";
import { Toolbar } from "@/components/sites/www-thumbnails-gg-41c6aae7/app-f53b52ad/Toolbar";
import { WatchView } from "@/components/sites/www-thumbnails-gg-41c6aae7/app-f53b52ad/WatchView";
import { FALLBACK_VIDEOS } from "@/data/sites/www-thumbnails-gg-41c6aae7/app-f53b52ad/fallbackVideos";
import { VIDEO_POOL } from "@/data/sites/www-thumbnails-gg-41c6aae7/app-f53b52ad/videoPool";
import {
  PLACEHOLDER_THUMB,
  formatAge,
  formatViews,
  hashString,
  seededShuffle,
} from "@/lib/sites/www-thumbnails-gg-41c6aae7/app-f53b52ad/format";
import { useFeed } from "@/lib/sites/www-thumbnails-gg-41c6aae7/app-f53b52ad/store";
import {
  INITIAL_FLASH,
  type CardViewModel,
  type FlashState,
  type PoolVideo,
} from "@/types/thumbnails-app";

/** The bundled pool wins when it has entries; the offline list is the fallback. */
const INITIAL_POOL: PoolVideo[] =
  VIDEO_POOL.length > 0 ? VIDEO_POOL : FALLBACK_VIDEOS;

export default function ThumbnailTesterPage() {
  const feed = useFeed();
  const testCard = feed.testCard;

  const previewRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [editorOpen, setEditorOpen] = useState(true);
  const [flash, setFlash] = useState<FlashState>(INITIAL_FLASH);
  const flashActive = flash.phase !== "idle";
  const [pool, setPool] = useState<PoolVideo[]>(INITIAL_POOL);

  // Refresh the pool from the live endpoint when one is available; the bundled
  // list stands in otherwise.
  useEffect(() => {
    let alive = true;
    fetch("/api/videos")
      .then((r) => r.json())
      .then((data: { videos?: PoolVideo[] }) => {
        if (alive && Array.isArray(data?.videos) && data.videos.length > 0) {
          setPool(data.videos);
        }
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  // Fresh feed order on every visit.
  useEffect(() => {
    useFeed.getState().reshuffle();
  }, []);

  const handleFiles = useCallback((files: File[]) => {
    const images = files.filter((f) => f.type.startsWith("image/"));
    if (images.length === 0) return;
    const state = useFeed.getState();
    if (state.thumbMode === "multiple") {
      state.addThumbnails(images.map((f) => URL.createObjectURL(f)));
    } else {
      state.updateTestCard({ imageSrc: URL.createObjectURL(images[0]) });
    }
  }, []);

  useEffect(() => {
    const state = useFeed.getState();
    state.setUploadHandler(() => fileInputRef.current?.click());
    state.setDropHandler(handleFiles);
    return () => {
      const s = useFeed.getState();
      s.setUploadHandler(null);
      s.setDropHandler(null);
    };
  }, [handleFiles]);

  // The surrounding cards: either the random pool, or the top videos pulled
  // from the competitor channels the user pinned. Falls back to the pool while
  // no competitor has loaded, so the feed is never empty.
  const competitorVideos = useMemo<PoolVideo[]>(() => {
    const enabled = feed.competitors.filter((c) => c.enabled);
    const merged: PoolVideo[] = [];
    const seen = new Set<string>();
    for (const c of enabled) {
      for (const v of c.videos) {
        if (seen.has(v.id)) continue;
        seen.add(v.id);
        merged.push(v);
      }
    }
    return merged;
  }, [feed.competitors]);

  const activePool =
    feed.feedSource === "competitors" && competitorVideos.length > 0
      ? competitorVideos
      : pool;

  const cards = useMemo<CardViewModel[]>(() => {
    const shuffled = seededShuffle(
      activePool,
      flashActive ? flash.seed : feed.seed,
    ).map<CardViewModel>((v) => ({
      id: v.id,
      thumb: v.thumb ?? null,
      imageFit: "cover",
      title: v.title,
      channel: v.channel,
      avatar: v.avatar,
      verified: v.verified,
      views: v.views,
      age: v.age,
      duration: v.duration,
      showDuration: true,
      watchedPercent: 0,
      isTest: false,
    }));

    const shared = {
      imageFit: testCard.imageFit,
      channel: testCard.channelName,
      avatar: testCard.channelAvatarSrc,
      verified: testCard.verified,
      views: formatViews(testCard.viewCount),
      age: formatAge(testCard.uploadedAt),
      duration: testCard.duration,
      showDuration: testCard.showDuration,
      watchedPercent: testCard.watchedPercent,
      isTest: true as const,
    };

    const activeTitles =
      feed.titleMode === "multiple" ? feed.titles.filter((t) => t.enabled) : [];
    const titleFor = (key: string) =>
      activeTitles.length
        ? activeTitles[
            hashString(`title${feed.seed}_${key}`) % activeTitles.length
          ].text
        : testCard.title;

    let mine: CardViewModel[];
    if (feed.thumbMode === "multiple") {
      mine =
        feed.thumbnails.length === 0
          ? [
              {
                id: "__test__",
                thumb: PLACEHOLDER_THUMB,
                title: titleFor("__test__"),
                isPlaceholder: true,
                ...shared,
              },
            ]
          : feed.thumbnails
              .filter((t) => t.enabled)
              .map((t) => ({
                id: `__test__${t.id}`,
                thumb: t.src,
                title: titleFor(t.id),
                ...shared,
              }));
    } else {
      mine = [
        {
          id: "__test__",
          thumb: testCard.imageSrc ?? PLACEHOLDER_THUMB,
          title: titleFor("__test__"),
          isPlaceholder: !testCard.imageSrc,
          ...shared,
        },
      ];
    }

    const out = [...shuffled];
    if (flashActive) {
      out.splice(Math.max(0, Math.min(flash.index, out.length)), 0, ...mine);
    } else if (feed.placement === "first") {
      out.unshift(...mine);
    } else {
      mine.forEach((card, i) => {
        const span = Math.min(out.length + 1, 12);
        out.splice(hashString(`pos${feed.seed}_${i}`) % span, 0, card);
      });
    }
    return out;
  }, [
    activePool,
    feed.seed,
    feed.placement,
    testCard,
    feed.thumbMode,
    feed.thumbnails,
    feed.titleMode,
    feed.titles,
    flashActive,
    flash.index,
    flash.seed,
  ]);

  const resetKey = `${feed.viewMode}-${feed.seed}-${feed.placement}-${feed.feedSource}-${activePool.length}`;

  return (
    <div className="tool-root">
      <div className="ambient" />
      <header className="tool-topbar">
        <Toolbar
          targetRef={previewRef}
          onFlash={() =>
            setFlash((f) => ({
              ...INITIAL_FLASH,
              phase: "ready",
              durationMs: f.durationMs,
            }))
          }
          flashActive={flashActive}
        />
      </header>
      <div className="tool-body">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/*"
          multiple={feed.thumbMode === "multiple"}
          onChange={(e) => {
            handleFiles(Array.from(e.target.files ?? []));
            e.target.value = "";
          }}
          style={{ display: "none" }}
        />
        <div className="tool-preview">
          <div
            ref={previewRef}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => e.preventDefault()}
            style={{
              position: "absolute",
              inset: 0,
              overflowY:
                flashActive || feed.viewMode === "mobile" ? "hidden" : "auto",
              background:
                feed.viewMode === "mobile" ? "var(--bg-base)" : undefined,
            }}
            className="yt-root"
            data-theme={feed.theme}
          >
            {feed.viewMode === "desktop" && (
              <DesktopSurface
                cards={cards}
                columns={feed.columns}
                blur={feed.blur}
                grayscale={feed.grayscale}
                highlight={feed.highlightTestCard}
                showSafeArea={feed.showSafeAreaOverlay}
                guideExpanded={!editorOpen}
                scrollRootRef={previewRef}
                resetKey={resetKey}
              />
            )}
            {feed.viewMode === "mobile" && (
              <div
                style={{
                  height: "100%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  overflow: "hidden",
                  padding: "20px 24px",
                }}
              >
                <MobileView
                  cards={cards}
                  blur={feed.blur}
                  grayscale={feed.grayscale}
                  highlight={feed.highlightTestCard}
                  showSafeArea={feed.showSafeAreaOverlay}
                  resetKey={resetKey}
                />
              </div>
            )}
            {feed.viewMode === "watch" && (
              <WatchView
                cards={cards}
                blur={feed.blur}
                grayscale={feed.grayscale}
                highlight={feed.highlightTestCard}
                showSafeArea={feed.showSafeAreaOverlay}
                scrollRootRef={previewRef}
                resetKey={resetKey}
              />
            )}
          </div>
          {flashActive && (
            <FlashOverlay
              flash={flash}
              setFlash={setFlash}
              previewRef={previewRef}
              viewMode={feed.viewMode}
            />
          )}
        </div>
        <button
          className={`editor-toggle focus-ring${editorOpen ? "" : " is-collapsed"}`}
          onClick={() => setEditorOpen((v) => !v)}
          title={editorOpen ? "Hide editor" : "Show editor"}
          aria-label={editorOpen ? "Hide editor" : "Show editor"}
        >
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M9 6l6 6-6 6"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <div className={`tool-editor${editorOpen ? "" : " is-collapsed"}`}>
          <EditorPanel />
        </div>
        <InspectModal />
      </div>
    </div>
  );
}
