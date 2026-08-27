"use client";

import {
  IconBell,
  IconCreate,
  IconMenu,
  IconMic,
  IconSearch,
  YouTubeLogo,
} from "@/components/sites/www-thumbnails-gg-41c6aae7/shared/icons";

/** The sticky top masthead, ported 1:1 from the target's bundle. */
export function Masthead() {
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
