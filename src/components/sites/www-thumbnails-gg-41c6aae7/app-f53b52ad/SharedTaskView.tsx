"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { DesktopSurface } from "@/components/sites/www-thumbnails-gg-41c6aae7/app-f53b52ad/DesktopSurface";
import { InspectModal } from "@/components/sites/www-thumbnails-gg-41c6aae7/app-f53b52ad/InspectModal";
import { MobileView } from "@/components/sites/www-thumbnails-gg-41c6aae7/app-f53b52ad/MobileView";
import { TSeg, Wordmark } from "@/components/sites/www-thumbnails-gg-41c6aae7/app-f53b52ad/Toolbar";
import { WatchView } from "@/components/sites/www-thumbnails-gg-41c6aae7/app-f53b52ad/WatchView";
import {
  getViewerName,
  importSharedTask,
  setViewerName,
  shareAssetUrl,
} from "@/lib/sites/www-thumbnails-gg-41c6aae7/app-f53b52ad/shareClient";
import { useFeed } from "@/lib/sites/www-thumbnails-gg-41c6aae7/app-f53b52ad/store";
import { fromTaskRecord } from "@/lib/sites/www-thumbnails-gg-41c6aae7/app-f53b52ad/taskSnapshot";
import {
  useFeedCards,
  useVideoPool,
} from "@/lib/sites/www-thumbnails-gg-41c6aae7/app-f53b52ad/useFeedCards";
import { useShareFeedback } from "@/lib/sites/www-thumbnails-gg-41c6aae7/app-f53b52ad/useShareFeedback";
import type { SharedTask } from "@/types/share";
import type { ViewMode } from "@/types/thumbnails-app";

const subscribeNever = () => () => {};

const VIEW_OPTIONS: { value: ViewMode; label: string }[] = [
  { value: "desktop", label: "Desktop" },
  { value: "mobile", label: "Mobile" },
  { value: "watch", label: "Watch" },
];

function IconSun() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="4.2" stroke="currentColor" strokeWidth="1.7" />
      <path
        d="M12 2.5v2.6M12 18.9v2.6M4.3 4.3l1.8 1.8M17.9 17.9l1.8 1.8M2.5 12h2.6M18.9 12h2.6M4.3 19.7l1.8-1.8M17.9 6.1l1.8-1.8"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconMoon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M20 13.5A8 8 0 1110.5 4a6.3 6.3 0 009.5 9.5z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Read-only view of a shared test.
 *
 * It renders through the same feed builder and surfaces as the tester, so a
 * reviewer sees the layout the author saw. What is missing is the editor: the
 * viewer can change how they look at the test (surface, theme, feed order) but
 * cannot change the test itself, and nothing here writes back to the share.
 */
export function SharedTaskView({ share }: { share: SharedTask }) {
  const router = useRouter();
  const feed = useFeed();
  const previewRef = useRef<HTMLDivElement>(null);

  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pool = useVideoPool();
  const { cards, activePool } = useFeedCards(pool);

  // Reviewing is the point of opening someone else's link: likes and comments
  // left here go back to the share, where the author will see them.
  // Same browser-only-read idiom the tester uses for its task id: reading
  // localStorage during render would not match the server-rendered markup.
  const storedName = useSyncExternalStore(
    subscribeNever,
    () => getViewerName("Guest"),
    () => "Guest",
  );
  const [typedName, setTypedName] = useState<string | null>(null);
  const name = typedName ?? storedName;
  useShareFeedback(share.shareId, name);

  // Load the shared test into the store, resolving its images to the share's
  // asset endpoint rather than to this browser's IndexedDB.
  useEffect(() => {
    let alive = true;
    void (async () => {
      const snap = await fromTaskRecord(share.task, async (blobId) =>
        shareAssetUrl(share.shareId, blobId),
      );
      if (!alive) return;
      useFeed.getState().hydrate(snap);
      useFeed.getState().reshuffle();
      setReady(true);
    })();
    return () => {
      alive = false;
    };
  }, [share]);

  const saveCopy = async () => {
    setSaving(true);
    setError(null);
    try {
      const id = await importSharedTask(share);
      router.push(`/app?task=${encodeURIComponent(id)}`);
    } catch {
      setError("Could not save a copy — this browser may be blocking storage.");
      setSaving(false);
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable; the URL bar still has it */
    }
  };

  const isDark = feed.theme === "dark";
  const resetKey = `${feed.viewMode}-${feed.seed}-${feed.placement}-${activePool.length}`;

  return (
    <div className="tool-root">
      <div className="ambient" />
      <header className="tool-topbar">
        <div className="tbar">
          <span className="tool-brand">
            <Link href="/" className="tool-wordmark focus-ring" aria-label="thumbnails home">
              <Wordmark size={17} />
            </Link>
            <span
              className="tool-by"
              style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
            >
              <span style={{ color: "var(--border-default)" }}>/</span>
              <span
                style={{
                  fontSize: 12.5,
                  fontWeight: 500,
                  color: "var(--text-secondary)",
                  maxWidth: 240,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {share.name}
              </span>
              <span
                style={{
                  fontSize: 10.5,
                  fontWeight: 500,
                  letterSpacing: "0.04em",
                  color: "var(--text-muted)",
                  background: "var(--glass-1-bg)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: 999,
                  padding: "2px 8px",
                  whiteSpace: "nowrap",
                }}
              >
                Shared · read-only
              </span>
            </span>
          </span>
          <span className="tbar-grow" />
          <TSeg
            lg
            value={feed.viewMode}
            onChange={(v) => feed.setViewMode(v)}
            options={VIEW_OPTIONS}
          />
          <span className="tbar-grow" />
          <div className="tbar-right">
            <button
              type="button"
              className="ticon focus-ring"
              onClick={() => feed.setTheme(isDark ? "light" : "dark")}
              title={`Theme: ${isDark ? "Dark" : "Light"}`}
              aria-label={`Switch to ${isDark ? "light" : "dark"} theme`}
            >
              {isDark ? <IconMoon /> : <IconSun />}
            </button>
            <input
              value={name}
              onChange={(e) => {
                setTypedName(e.target.value);
                setViewerName(e.target.value);
              }}
              placeholder="Your name"
              aria-label="Your name, shown on comments you leave"
              maxLength={40}
              className="focus-ring"
              style={{
                width: 116,
                height: 26,
                padding: "0 9px",
                borderRadius: 999,
                background: "var(--bg-sunken)",
                border: "1px solid var(--border-default)",
                color: "var(--text-secondary)",
                font: "inherit",
                fontSize: 11.5,
                outline: "none",
              }}
            />
            <button type="button" className="tbtn focus-ring" onClick={copyLink}>
              {copied ? "Copied" : "Copy link"}
            </button>
            <button
              type="button"
              className="tprimary focus-ring"
              onClick={saveCopy}
              disabled={saving}
            >
              {saving ? "Saving…" : "Save a copy"}
            </button>
          </div>
        </div>
      </header>

      {error && (
        <div
          style={{
            padding: "8px 20px",
            fontSize: 12,
            color: "#ff8f8f",
            background: "var(--bg-sunken)",
          }}
        >
          {error}
        </div>
      )}

      <div className="tool-body">
        <div className="tool-preview">
          <div
            ref={previewRef}
            style={{
              position: "absolute",
              inset: 0,
              overflowY: feed.viewMode === "mobile" ? "hidden" : "auto",
              background: feed.viewMode === "mobile" ? "var(--bg-base)" : undefined,
              opacity: ready ? 1 : 0,
              transition: "opacity var(--dur-med) var(--ease-out)",
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
                guideExpanded
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
        </div>
        <InspectModal editable={false} />
      </div>
    </div>
  );
}
