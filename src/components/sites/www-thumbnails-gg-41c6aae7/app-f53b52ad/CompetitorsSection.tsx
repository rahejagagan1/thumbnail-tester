"use client";

import { useState } from "react";
import type { CSSProperties } from "react";

import { useFeed } from "@/lib/sites/www-thumbnails-gg-41c6aae7/app-f53b52ad/store";
import type { ChannelFetchResult, Competitor } from "@/types/thumbnails-app";

const fieldStyle: CSSProperties = {
  width: "100%",
  height: 36,
  padding: "0 12px",
  borderRadius: 8,
  background: "var(--bg-sunken)",
  border: "1px solid var(--border-default)",
  color: "var(--text-primary)",
  fontSize: 14,
  fontFamily: "inherit",
  outline: "none",
};

const outlineButtonStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  width: "100%",
  height: 36,
  borderRadius: 8,
  border: "1px solid var(--border-default)",
  background: "var(--glass-1-bg)",
  color: "var(--text-secondary)",
  fontSize: 13,
  fontWeight: 500,
  cursor: "pointer",
  fontFamily: "inherit",
};

function IconRefresh() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <path
        d="M21 4v5h-5M3 20v-5h5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M19 9a8 8 0 00-14-1M5 15a8 8 0 0014 1"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function StatusDot({ competitor }: { competitor: Competitor }) {
  const color =
    competitor.status === "ready"
      ? "#3dd68c"
      : competitor.status === "error"
        ? "#ff6b6b"
        : competitor.status === "loading"
          ? "var(--text-muted)"
          : "var(--text-faint)";
  return (
    <span
      aria-hidden
      style={{
        width: 6,
        height: 6,
        borderRadius: 999,
        background: color,
        flexShrink: 0,
      }}
    />
  );
}

function CompetitorRow({ competitor }: { competitor: Competitor }) {
  const toggleCompetitor = useFeed((s) => s.toggleCompetitor);
  const removeCompetitor = useFeed((s) => s.removeCompetitor);
  const [avatarFailed, setAvatarFailed] = useState(false);

  const label = competitor.channel ?? competitor.url;
  const detail =
    competitor.status === "error"
      ? competitor.error
      : competitor.status === "loading"
        ? "Fetching…"
        : competitor.status === "ready"
          ? [
              `${competitor.videos.length} video${competitor.videos.length === 1 ? "" : "s"}`,
              competitor.subscribers,
              `top of ${competitor.sampled}`,
            ]
              .filter(Boolean)
              .join(" · ")
          : "Not fetched yet";

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "8px 10px",
        borderRadius: 8,
        background: "var(--bg-sunken)",
        border: "1px solid var(--border-default)",
        opacity: competitor.enabled ? 1 : 0.5,
        transition: "opacity var(--dur-fast) var(--ease-out)",
      }}
    >
      <button
        onClick={() => toggleCompetitor(competitor.id)}
        className="focus-ring"
        role="switch"
        aria-checked={competitor.enabled}
        aria-label={`${competitor.enabled ? "Exclude" : "Include"} ${label}`}
        style={{
          width: 16,
          height: 16,
          flexShrink: 0,
          borderRadius: 4,
          padding: 0,
          cursor: "pointer",
          background: competitor.enabled ? "#fff" : "transparent",
          border: "1px solid rgba(255,255,255,0.4)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {competitor.enabled && (
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
            <path
              d="M5 12.5l4 4 10-10"
              stroke="#08090b"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>

      {competitor.avatar && !avatarFailed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={competitor.avatar}
          alt=""
          draggable={false}
          onError={() => setAvatarFailed(true)}
          style={{
            width: 22,
            height: 22,
            borderRadius: 999,
            flexShrink: 0,
            objectFit: "cover",
          }}
        />
      ) : (
        <StatusDot competitor={competitor} />
      )}

      <span style={{ flex: 1, minWidth: 0 }}>
        <span
          style={{
            display: "block",
            fontSize: 13,
            fontWeight: 500,
            color: "var(--text-primary)",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {label}
        </span>
        <span
          style={{
            display: "block",
            fontSize: 11,
            color:
              competitor.status === "error"
                ? "#ff8f8f"
                : "var(--text-faint)",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {detail}
        </span>
      </span>

      <button
        onClick={() => removeCompetitor(competitor.id)}
        className="focus-ring"
        aria-label={`Remove ${label}`}
        style={{
          width: 18,
          height: 18,
          flexShrink: 0,
          borderRadius: 999,
          border: "none",
          padding: 0,
          cursor: "pointer",
          background: "rgba(255,255,255,0.08)",
          color: "var(--text-muted)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
          <path
            d="M6 6l12 12M18 6L6 18"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </div>
  );
}

/**
 * Lets the user pin real competitor channels and fill the feed with those
 * channels' highest-viewed videos instead of the random pool.
 */
export function CompetitorsSection() {
  const feed = useFeed();
  const [draft, setDraft] = useState("");

  const competitors = feed.competitors;
  const readyCount = competitors.filter(
    (c) => c.status === "ready" && c.enabled,
  ).length;
  const videoCount = competitors
    .filter((c) => c.enabled)
    .reduce((n, c) => n + c.videos.length, 0);

  const submitDraft = () => {
    const parts = draft
      .split(/[\s,]+/)
      .map((p) => p.trim())
      .filter(Boolean);
    if (parts.length === 0) return;
    parts.forEach((p) => feed.addCompetitor(p));
    setDraft("");
  };

  const fetchAll = async (only?: Competitor[]) => {
    const targets = only ?? competitors;
    if (targets.length === 0 || feed.competitorsLoading) return;

    feed.setCompetitorsLoading(true);
    targets.forEach((c) =>
      feed.patchCompetitor(c.id, { status: "loading", error: null }),
    );

    try {
      const res = await fetch("/api/competitors", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ urls: targets.map((c) => c.url), take: 24 }),
      });
      const data = (await res.json()) as {
        results?: ChannelFetchResult[];
        error?: string;
      };

      if (!res.ok || !data.results) {
        const message = data.error ?? `Request failed (${res.status}).`;
        targets.forEach((c) =>
          feed.patchCompetitor(c.id, { status: "error", error: message }),
        );
        return;
      }

      // Results come back in request order.
      targets.forEach((c, i) => {
        const r = data.results?.[i];
        if (!r) {
          feed.patchCompetitor(c.id, {
            status: "error",
            error: "No response for this channel.",
          });
          return;
        }
        if (!r.ok) {
          feed.patchCompetitor(c.id, {
            status: "error",
            error: r.error ?? "Could not load this channel.",
            channel: r.channel ?? null,
          });
          return;
        }
        feed.patchCompetitor(c.id, {
          status: "ready",
          error: null,
          channel: r.channel ?? null,
          avatar: r.avatar ?? null,
          subscribers: r.subscribers ?? null,
          sampled: r.sampled ?? 0,
          videos: r.videos ?? [],
        });
      });

      feed.setFeedSource("competitors");
      feed.reshuffle();
    } catch {
      targets.forEach((c) =>
        feed.patchCompetitor(c.id, {
          status: "error",
          error: "Network error.",
        }),
      );
    } finally {
      feed.setCompetitorsLoading(false);
    }
  };

  return (
    <>
      <label style={{ display: "block", marginBottom: 14 }}>
        <span
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 12,
            fontWeight: 500,
            color: "var(--text-muted)",
            marginBottom: 6,
          }}
        >
          Feed
          <span style={{ color: "var(--text-faint)" }}>what you sit next to</span>
        </span>
        <div className="seg" style={{ gridTemplateColumns: "repeat(2, 1fr)" }}>
          <span
            className="seg-thumb"
            style={{
              width: "calc((100% - 8px) / 2)",
              transform: `translateX(${feed.feedSource === "random" ? 0 : 100}%)`,
            }}
          />
          <button
            className="seg-btn focus-ring"
            data-active={feed.feedSource === "random"}
            onClick={() => feed.setFeedSource("random")}
          >
            Random
          </button>
          <button
            className="seg-btn focus-ring"
            data-active={feed.feedSource === "competitors"}
            onClick={() => feed.setFeedSource("competitors")}
          >
            Competitors
          </button>
        </div>
      </label>

      {feed.feedSource === "competitors" && videoCount === 0 && (
        <p
          style={{
            margin: "-6px 0 12px",
            fontSize: 11,
            lineHeight: 1.5,
            color: "var(--text-faint)",
          }}
        >
          No competitor videos loaded yet — showing the random feed until you
          add a channel and fetch.
        </p>
      )}

      <label style={{ display: "block", marginBottom: 14 }}>
        <span
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 12,
            fontWeight: 500,
            color: "var(--text-muted)",
            marginBottom: 6,
          }}
        >
          Add channel
          <span style={{ color: "var(--text-faint)" }}>handle, channel or video link</span>
        </span>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                submitDraft();
              }
            }}
            placeholder="@MrBeast"
            className="focus-ring fx"
            style={{ ...fieldStyle, flex: 1 }}
          />
          <button
            onClick={submitDraft}
            disabled={draft.trim() === ""}
            className="focus-ring"
            style={{
              height: 36,
              padding: "0 14px",
              borderRadius: 8,
              border: "none",
              background: "#fff",
              color: "var(--accent-fg)",
              fontSize: 13,
              fontWeight: 600,
              fontFamily: "inherit",
              cursor: draft.trim() === "" ? "not-allowed" : "pointer",
              opacity: draft.trim() === "" ? 0.6 : 1,
              whiteSpace: "nowrap",
            }}
          >
            Add
          </button>
        </div>
      </label>

      {competitors.length > 0 && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 6,
            marginBottom: 14,
          }}
        >
          {competitors.map((c) => (
            <CompetitorRow key={c.id} competitor={c} />
          ))}
        </div>
      )}

      <button
        onClick={() => void fetchAll()}
        disabled={competitors.length === 0 || feed.competitorsLoading}
        className="focus-ring"
        style={{
          ...outlineButtonStyle,
          marginBottom: 8,
          cursor:
            competitors.length === 0 || feed.competitorsLoading
              ? "not-allowed"
              : "pointer",
          opacity:
            competitors.length === 0 || feed.competitorsLoading ? 0.55 : 1,
        }}
      >
        <IconRefresh />
        {feed.competitorsLoading ? "Fetching top videos…" : "Fetch top videos"}
      </button>

      {competitors.length > 0 && (
        <button
          onClick={() => feed.clearCompetitors()}
          disabled={feed.competitorsLoading}
          className="focus-ring"
          style={{
            ...outlineButtonStyle,
            background: "transparent",
            color: "var(--text-faint)",
          }}
        >
          Remove all
        </button>
      )}

      <p
        style={{
          margin: "12px 0 0",
          fontSize: 11,
          color: "var(--text-faint)",
          lineHeight: 1.5,
        }}
      >
        {readyCount > 0
          ? `${videoCount} videos from ${readyCount} channel${readyCount === 1 ? "" : "s"}, ranked by view count.`
          : "Paste competitor channels to test your thumbnail against the videos it will actually sit beside."}
      </p>
    </>
  );
}
