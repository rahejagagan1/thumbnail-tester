"use client";

import { genThumb } from "@/lib/sites/www-thumbnails-gg-41c6aae7/app-f53b52ad/format";
import { useFeed } from "@/lib/sites/www-thumbnails-gg-41c6aae7/app-f53b52ad/store";
import { useInfiniteScroll } from "@/lib/sites/www-thumbnails-gg-41c6aae7/app-f53b52ad/useInfiniteScroll";
import { WATCH_CHIPS } from "@/data/sites/www-thumbnails-gg-41c6aae7/app-f53b52ad/guideChannels";
import {
  IconBell,
  IconCreate,
  IconKebabVertical,
  IconMenu,
  IconMic,
  IconSearch,
  YouTubeLogo,
} from "@/components/sites/www-thumbnails-gg-41c6aae7/shared/icons";
import type { CardViewModel } from "@/types/thumbnails-app";

/** The "now playing" poster art shown behind the player controls. */
const NOW_PLAYING_POSTER = genThumb("__nowplaying__", "Frontline Review");

/** Player-control glyph wrapper — every control icon is a 24x24 currentColor svg. */
function ControlIcon({ d }: { d: string }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d={d} />
    </svg>
  );
}

/** The sticky top masthead, built locally from the `.yt-masthead*` CSS. */
function Masthead() {
  return (
    <header className="yt-masthead">
      <div className="yt-masthead-start">
        <button className="yt-icon-btn" aria-label="Menu" tabIndex={-1}>
          <IconMenu />
        </button>
        <span
          style={{
            color: "var(--yt-text-primary)",
            display: "flex",
            alignItems: "center",
          }}
        >
          <YouTubeLogo />
        </span>
      </div>
      <div className="yt-masthead-center">
        <form className="yt-search-form" onSubmit={(e) => e.preventDefault()}>
          <input
            className="yt-search-input"
            placeholder="Search"
            aria-label="Search"
          />
          <button className="yt-search-btn" aria-label="Search" tabIndex={-1}>
            <IconSearch size={22} />
          </button>
        </form>
        <button
          className="yt-voice-btn"
          aria-label="Search with your voice"
          tabIndex={-1}
        >
          <IconMic size={22} />
        </button>
      </div>
      <div className="yt-masthead-end">
        <button className="yt-icon-btn" aria-label="Create" tabIndex={-1}>
          <IconCreate />
        </button>
        <span className="yt-bell-wrap">
          <button
            className="yt-icon-btn"
            aria-label="Notifications"
            tabIndex={-1}
          >
            <IconBell />
          </button>
          <span className="yt-bell-badge">9+</span>
        </span>
        <button className="yt-avatar-btn" aria-label="Account" tabIndex={-1}>
          <span
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#3a5",
              color: "#fff",
              fontWeight: 500,
              fontSize: 14,
            }}
          >
            Y
          </span>
        </button>
      </div>
    </header>
  );
}

interface RecoCardProps {
  vm: CardViewModel;
  highlight?: boolean;
  showSafeArea?: boolean;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  onDragOver?: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop?: (e: React.DragEvent<HTMLDivElement>) => void;
}

/** A single row in the watch-page recommendation rail, ported 1:1 from the target's bundle. */
function RecoCard({
  vm,
  highlight = false,
  showSafeArea = false,
  onClick,
  onDragOver,
  onDrop,
}: RecoCardProps) {
  const thumb = vm.thumb ?? genThumb(vm.id, vm.title);
  const isLive = vm.duration.trim().toUpperCase() === "LIVE";

  return (
    <div
      className="ytw-reco"
      data-test={vm.isTest}
      data-highlight={highlight}
      onClick={onClick}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <div className="ytw-reco-thumb">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={thumb}
          alt=""
          style={{ objectFit: vm.imageFit }}
          draggable={false}
        />
        {vm.showDuration && vm.duration.trim() !== "" && (
          <span className="yt-duration" data-live={isLive}>
            {vm.duration}
          </span>
        )}
        {vm.watchedPercent > 0 && (
          <div className="yt-progress-track">
            <div
              className="yt-progress-fill"
              style={{ width: `${Math.min(100, vm.watchedPercent)}%` }}
            />
          </div>
        )}
        {showSafeArea && vm.isTest && (
          <div className="yt-safe-overlay">
            <div className="yt-safe-badge-zone" />
          </div>
        )}
      </div>
      <div className="ytw-reco-text">
        <h3 className="ytw-reco-title">{vm.title}</h3>
        <div className="ytw-reco-channel">{vm.channel}</div>
        <div className="ytw-reco-meta">
          {vm.views} • {vm.age}
        </div>
      </div>
      <span className="ytw-reco-dots">
        <IconKebabVertical />
      </span>
    </div>
  );
}

interface WatchViewProps {
  cards: CardViewModel[];
  blur: number;
  grayscale: boolean;
  highlight: boolean;
  showSafeArea: boolean;
  scrollRootRef: React.RefObject<HTMLDivElement | null>;
  resetKey: string;
}

/** The YouTube watch-page surface: masthead, player, owner row, and the recommendation rail. */
export function WatchView({
  cards,
  blur,
  grayscale,
  highlight,
  showSafeArea,
  scrollRootRef,
  resetKey,
}: WatchViewProps) {
  const setInspect = useFeed((s) => s.setInspect);
  const uploadHandler = useFeed((s) => s.uploadHandler);
  const dropHandler = useFeed((s) => s.dropHandler);
  const { visible, sentinelRef } = useInfiniteScroll(cards, {
    rootRef: scrollRootRef,
    resetKey,
  });

  const filters: string[] = [];
  if (blur > 0) filters.push(`blur(${blur}px)`);
  if (grayscale) filters.push("grayscale(1)");

  return (
    <>
      <Masthead />
      <div className="ytw-page">
        <div className="ytw-main">
          <div className="ytw-player">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="ytw-player-poster"
              src={NOW_PLAYING_POSTER}
              alt=""
              draggable={false}
            />
            <span className="ytw-caption">
              Please just stay behind the vehicles.
            </span>
            <div className="ytw-controls">
              <div className="ytw-scrub">
                <div className="ytw-scrub-fill" style={{ width: "26%" }} />
                <div className="ytw-scrub-knob" style={{ left: "26%" }} />
              </div>
              <div className="ytw-ctl-row">
                <ControlIcon d="M8 5v14l11-7z" />
                <ControlIcon d="M6 6l6 6-6 6V6zm8 0h2v12h-2z" />
                <ControlIcon d="M3 9v6h4l5 5V4L7 9H3zm13 3a4 4 0 00-2.5-3.7v7.4A4 4 0 0016 12z" />
                <span className="ytw-time">7:24 / 28:07</span>
                <span className="ytw-ctl-spacer" />
                <ControlIcon d="M4 9h4v2H6v2h2v2H4V9zm6 0h6v2h-4v.5h4V16h-6v-2h4v-.5h-4V9z" />
                <ControlIcon d="M12 8a4 4 0 100 8 4 4 0 000-8zm0 6a2 2 0 110-4 2 2 0 010 4zm9-2l-2-1.5.3-2.5-2.5-.5L15.5 5 12 6 8.5 5 7.2 7.5l-2.5.5L5 10.5 3 12l2 1.5-.3 2.5 2.5.5L8.5 19 12 18l3.5 1 1.3-2.5 2.5-.5-.3-2.5L21 12z" />
                <ControlIcon d="M3 5h18v14H3V5zm2 4v6h14V9H5z" />
                <ControlIcon d="M3 3h7v2H5v5H3V3zm11 0h7v7h-2V5h-5V3zM3 14h2v5h5v2H3v-7zm16 0h2v7h-7v-2h5v-5z" />
              </div>
            </div>
          </div>
          <h1 className="ytw-title">
            Bodycam Footage Breakdown — The Full Analysis Nobody Expected
          </h1>
          <div className="ytw-owner">
            <span className="ytw-owner-avatar">
              <span
                style={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "#b3261e",
                  color: "#fff",
                  fontWeight: 600,
                }}
              >
                F
              </span>
            </span>
            <span>
              <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <span className="ytw-owner-name">Frontline</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" fill="var(--yt-text-secondary)" />
                  <path
                    d="M9.5 12.5l1.8 1.8 3.6-3.8"
                    stroke="var(--yt-bg)"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <span className="ytw-owner-subs">2.7M subscribers</span>
            </span>
            <button className="ytw-subscribe" tabIndex={-1}>
              Subscribe
            </button>
            <div className="ytw-actions">
              <span className="ytw-action-split">
                <span>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3 11h3v10H3V11zm5 0l4-8a2 2 0 012 2v4h5a2 2 0 012 2l-2 7a2 2 0 01-2 1H8V11z" />
                  </svg>
                  18K
                </span>
                <span>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M21 13h-3V3h3v10zm-5 0l-4 8a2 2 0 01-2-2v-4H5a2 2 0 01-2-2l2-7a2 2 0 012-1h8v8z" />
                  </svg>
                </span>
              </span>
              <span className="ytw-action">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M14 9V5l7 7-7 7v-4.1c-5 0-8.5 1.6-11 5.1 1-5 4-10 11-11z" />
                </svg>
                Share
              </span>
              <span className="ytw-action">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 4v11m0 0l-4.5-4.5M12 15l4.5-4.5M5 19h14"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Download
              </span>
              <span className="ytw-action">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M5 5h14M5 5l1.5 9a2 2 0 002 1.7h5a2 2 0 002-1.7L17 5M9 9v3m6-3v3"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                </svg>
                Save
              </span>
            </div>
          </div>
        </div>
        <aside>
          <div className="ytw-reco-chips">
            {WATCH_CHIPS.map((label, i) => (
              <span key={label} className="yt-chip" data-selected={i === 0}>
                {label}
              </span>
            ))}
          </div>
          <div
            className="ytw-reco-list"
            style={{
              filter: filters.length ? filters.join(" ") : undefined,
              transition: "filter var(--dur-base) var(--ease-out)",
            }}
          >
            {visible.map((vm) => (
              <RecoCard
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
            <div ref={sentinelRef} aria-hidden="true" style={{ height: 1 }} />
          </div>
        </aside>
      </div>
    </>
  );
}
