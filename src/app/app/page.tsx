"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

import { DesktopSurface } from "@/components/sites/www-thumbnails-gg-41c6aae7/app-f53b52ad/DesktopSurface";
import { EditorPanel } from "@/components/sites/www-thumbnails-gg-41c6aae7/app-f53b52ad/EditorPanel";
import { FlashOverlay } from "@/components/sites/www-thumbnails-gg-41c6aae7/app-f53b52ad/FlashOverlay";
import { InspectModal } from "@/components/sites/www-thumbnails-gg-41c6aae7/app-f53b52ad/InspectModal";
import { MobileView } from "@/components/sites/www-thumbnails-gg-41c6aae7/app-f53b52ad/MobileView";
import { Toolbar } from "@/components/sites/www-thumbnails-gg-41c6aae7/app-f53b52ad/Toolbar";
import { WatchView } from "@/components/sites/www-thumbnails-gg-41c6aae7/app-f53b52ad/WatchView";
import { useFeed } from "@/lib/sites/www-thumbnails-gg-41c6aae7/app-f53b52ad/store";
import {
  useFeedCards,
  useVideoPool,
} from "@/lib/sites/www-thumbnails-gg-41c6aae7/app-f53b52ad/useFeedCards";
import { useTaskAutosave } from "@/lib/sites/www-thumbnails-gg-41c6aae7/app-f53b52ad/useTaskAutosave";
import { INITIAL_FLASH, type FlashState } from "@/types/thumbnails-app";

const subscribeNever = () => () => {};
const readTaskIdFromUrl = () =>
  new URLSearchParams(window.location.search).get("task");
const readNoTaskId = () => null;

export default function ThumbnailTesterPage() {
  // Read from the URL rather than via useSearchParams, which would force a
  // Suspense boundary into the server-rendered markup and cost the clone its
  // exact-match SSR output. Task loading is IndexedDB-backed and client-only
  // regardless, so a browser-only snapshot is all that's needed.
  const taskId = useSyncExternalStore(
    subscribeNever,
    readTaskIdFromUrl,
    readNoTaskId,
  );
  const {
    saveState,
    taskName,
    rename,
    taskId: savedTaskId,
    saveNow,
  } = useTaskAutosave(taskId);

  const feed = useFeed();

  const previewRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [editorOpen, setEditorOpen] = useState(true);
  const [flash, setFlash] = useState<FlashState>(INITIAL_FLASH);
  const flashActive = flash.phase !== "idle";
  const pool = useVideoPool();
  const { cards, activePool } = useFeedCards(pool, flash);

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

  const resetKey = `${feed.viewMode}-${feed.seed}-${feed.placement}-${feed.feedSource}-${activePool.length}`;

  return (
    <div className="tool-root">
      <div className="ambient" />
      <header className="tool-topbar">
        <Toolbar
          taskName={taskName}
          saveState={saveState}
          onRename={rename}
          taskId={savedTaskId}
          onBeforeShare={saveNow}
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
