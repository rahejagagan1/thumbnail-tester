"use client";

import { useEffect, useRef } from "react";
import type { CSSProperties, Dispatch, ReactNode, RefObject, SetStateAction } from "react";
import { INITIAL_FLASH } from "@/types/thumbnails-app";
import type { FlashState, FlashTarget, ViewMode } from "@/types/thumbnails-app";

interface FlashOverlayProps {
  flash: FlashState;
  setFlash: Dispatch<SetStateAction<FlashState>>;
  previewRef: RefObject<HTMLDivElement | null>;
  viewMode: ViewMode;
}

const CANCEL_BUTTON_STYLE: CSSProperties = {
  height: 40,
  padding: "0 18px",
  borderRadius: 999,
  border: "1px solid var(--border-default)",
  background: "transparent",
  color: "var(--text-secondary)",
  fontSize: 14,
  fontWeight: 500,
  cursor: "pointer",
  fontFamily: "inherit",
};

const DURATION_OPTIONS: ReadonlyArray<{ ms: number; label: string }> = [
  { ms: 500, label: "0.5s" },
  { ms: 1000, label: "1s" },
  { ms: 2000, label: "2s" },
];

const TARGET_LABEL_STYLE: CSSProperties = {
  fontSize: 10.5,
  fontWeight: 600,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "#fff",
  background: "rgba(8,9,11,0.7)",
  padding: "2px 6px",
  borderRadius: 5,
  whiteSpace: "nowrap",
};

/** Shared full-screen absolutely-positioned layer, optionally centred and blurred. */
function fullScreenLayerStyle(interactive: boolean, background?: string): CSSProperties {
  return {
    position: "absolute",
    inset: 0,
    zIndex: 60,
    pointerEvents: interactive ? "auto" : "none",
    background,
    display: background ? "flex" : undefined,
    alignItems: background ? "center" : undefined,
    justifyContent: background ? "center" : undefined,
    backdropFilter: background ? "blur(4px)" : undefined,
    WebkitBackdropFilter: background ? "blur(4px)" : undefined,
  };
}

export function FlashOverlay({ flash, setFlash, previewRef, viewMode }: FlashOverlayProps) {
  const layerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (flash.phase !== "show") return;
    const id = setTimeout(() => {
      setFlash((f) => (f.phase === "show" ? { ...f, phase: "recall" } : f));
    }, flash.durationMs);
    return () => clearTimeout(id);
  }, [flash.phase, flash.durationMs, setFlash]);

  const startFlash = (durationMs: number) => {
    if (previewRef.current) previewRef.current.scrollTop = 0;
    setFlash((f) => ({
      ...f,
      phase: "show",
      durationMs,
      index: Math.floor(Math.random() * (viewMode === "mobile" ? 2 : viewMode === "watch" ? 5 : 6)),
      seed: Math.floor(1e6 * Math.random()) + 1,
      click: null,
      hit: null,
      distance: null,
      targets: [],
    }));
  };

  const cancelFlash = () => setFlash(() => ({ ...INITIAL_FLASH }));

  if (flash.phase === "ready") {
    return (
      <div ref={layerRef} style={fullScreenLayerStyle(true, "rgba(5,6,8,0.78)")}>
        <div
          className="glass-2 anim-scale"
          style={{ width: 392, maxWidth: "88%", padding: 26, borderRadius: 16, textAlign: "center" }}
        >
          <div className="eyebrow" style={{ marginBottom: 12 }}>
            First-impression test
          </div>
          <h3 style={{ margin: "0 0 8px", fontSize: 21, fontWeight: 600, letterSpacing: "-0.02em" }}>
            One second. Where does your eye go?
          </h3>
          <p style={{ margin: "0 0 18px", fontSize: 13.5, lineHeight: 1.55, color: "var(--text-secondary)" }}>
            The feed flashes for {(flash.durationMs / 1000).toString()}s, then hides. Click the spot
            your eye landed on first. We reveal whether it was your thumbnail.
          </p>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 18 }}>
            <DurationSeg
              value={flash.durationMs}
              onChange={(ms) => setFlash((f) => ({ ...f, durationMs: ms }))}
            />
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
            <button
              onClick={() => startFlash(flash.durationMs)}
              className="btn-primary focus-ring"
              style={{ height: 40, padding: "0 22px", fontSize: 14 }}
            >
              Start flash
            </button>
            <button onClick={cancelFlash} className="focus-ring" style={CANCEL_BUTTON_STYLE}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (flash.phase === "show") {
    return (
      <div ref={layerRef} style={fullScreenLayerStyle(false)}>
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            background: "rgba(255,255,255,0.14)",
          }}
        >
          <div
            style={{
              height: "100%",
              background: "#fff",
              transformOrigin: "left",
              animation: `flash-count ${flash.durationMs}ms linear forwards`,
            }}
          />
        </div>
      </div>
    );
  }

  if (flash.phase === "recall") {
    return (
      <div
        ref={layerRef}
        onClick={(e) => {
          const layer = layerRef.current;
          const preview = previewRef.current;
          if (!layer || !preview) return;
          const layerRect = layer.getBoundingClientRect();
          const clickX = e.clientX - layerRect.left;
          const clickY = e.clientY - layerRect.top;
          const testNodes = Array.from(
            preview.querySelectorAll<HTMLElement>('[data-test="true"]'),
          );
          let hit = false;
          let nearestDistance = Infinity;
          const targets: FlashTarget[] = [];
          for (const node of testNodes) {
            const thumbNode =
              node.querySelector<HTMLElement>(".yt-thumb-wrap, .ytm-thumb-wrap, .ytw-reco-thumb") ??
              node;
            const rect = thumbNode.getBoundingClientRect();
            targets.push({
              x: rect.left - layerRect.left,
              y: rect.top - layerRect.top,
              w: rect.width,
              h: rect.height,
            });
            if (
              e.clientX >= rect.left &&
              e.clientX <= rect.right &&
              e.clientY >= rect.top &&
              e.clientY <= rect.bottom
            ) {
              hit = true;
            }
            const dx = rect.left + rect.width / 2 - layerRect.left - clickX;
            const dy = rect.top + rect.height / 2 - layerRect.top - clickY;
            nearestDistance = Math.min(nearestDistance, Math.hypot(dx, dy));
          }
          setFlash((f) => ({
            ...f,
            phase: "result",
            click: { x: clickX, y: clickY },
            hit,
            distance: Number.isFinite(nearestDistance) ? Math.round(nearestDistance) : null,
            markers: [...f.markers, { x: clickX, y: clickY, hit }],
            targets,
          }));
        }}
        style={{ ...fullScreenLayerStyle(true, "rgba(6,7,9,0.975)"), cursor: "crosshair" }}
      >
        <div style={{ textAlign: "center", pointerEvents: "none", padding: 24 }}>
          <div className="eyebrow" style={{ marginBottom: 10 }}>
            Recall
          </div>
          <h3 style={{ margin: "0 0 8px", fontSize: 22, fontWeight: 600, letterSpacing: "-0.02em" }}>
            Click where your eye landed first
          </h3>
          <p style={{ margin: 0, fontSize: 13.5, color: "var(--text-muted)" }}>
            Trust your gut. Click anywhere on the screen.
          </p>
        </div>
      </div>
    );
  }

  const verdict =
    flash.targets.length === 0
      ? { tone: "muted" as const, text: "No thumbnail was in the feed for this run." }
      : flash.hit
        ? { tone: "good" as const, text: "Direct hit. Your thumbnail caught the eye first." }
        : flash.distance != null && flash.distance < 260
          ? {
              tone: "near" as const,
              text: `Close. Your eye landed ${flash.distance}px from your thumbnail.`,
            }
          : { tone: "miss" as const, text: "Your eye went elsewhere. Your thumbnail is outlined below." };

  return (
    <div ref={layerRef} style={{ ...fullScreenLayerStyle(false), pointerEvents: "none" }}>
      {flash.markers.slice(0, -1).map((marker, i) => (
        <span
          key={i}
          style={{
            position: "absolute",
            left: marker.x,
            top: marker.y,
            width: 10,
            height: 10,
            borderRadius: 999,
            transform: "translate(-50%,-50%)",
            background: marker.hit ? "rgba(61,214,140,0.5)" : "rgba(255,255,255,0.4)",
            border: "1px solid rgba(255,255,255,0.5)",
          }}
        />
      ))}
      {flash.targets.map((target, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: target.x,
            top: target.y,
            width: target.w,
            height: target.h,
            border: "2px solid #fff",
            borderRadius: 10,
            boxShadow: "0 0 0 4px rgba(255,255,255,0.22), 0 0 22px rgba(255,255,255,0.35)",
            animation: "flash-target 0.4s var(--ease-out) both",
          }}
        >
          <span style={{ ...TARGET_LABEL_STYLE, position: "absolute", top: -22, left: 0 }}>
            Your thumbnail
          </span>
        </div>
      ))}
      {flash.click && (
        <div style={{ position: "absolute", left: flash.click.x, top: flash.click.y }}>
          <span
            style={{
              position: "absolute",
              width: 54,
              height: 54,
              borderRadius: 999,
              border: `2px solid ${flash.hit ? "#3dd68c" : "#fff"}`,
              animation: "flash-ping 0.9s var(--ease-out) infinite",
            }}
          />
          <span
            style={{
              position: "absolute",
              width: 14,
              height: 14,
              borderRadius: 999,
              transform: "translate(-50%,-50%)",
              background: flash.hit ? "#3dd68c" : "#fff",
              boxShadow: "0 0 0 3px rgba(8,9,11,0.6)",
            }}
          />
          <span style={{ ...TARGET_LABEL_STYLE, position: "absolute", top: 14, left: 12 }}>
            You looked here
          </span>
        </div>
      )}
      <div
        className="glass-2 anim-in"
        style={{
          position: "absolute",
          left: "50%",
          bottom: 22,
          transform: "translateX(-50%)",
          width: 460,
          maxWidth: "92%",
          padding: "14px 16px",
          borderRadius: 14,
          pointerEvents: "auto",
          display: "flex",
          alignItems: "center",
          gap: 14,
        }}
      >
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: 999,
            flexShrink: 0,
            background:
              verdict.tone === "good" ? "#3dd68c" : verdict.tone === "near" ? "#fff" : "var(--text-muted)",
            boxShadow: verdict.tone === "good" ? "0 0 10px rgba(61,214,140,0.8)" : undefined,
          }}
        />
        <span style={{ flex: 1, fontSize: 13.5, fontWeight: 500, color: "var(--text-primary)" }}>
          {verdict.text}
        </span>
        <button
          onClick={() => startFlash(flash.durationMs)}
          className="btn-primary focus-ring"
          style={{ height: 32, padding: "0 14px", fontSize: 12.5 }}
        >
          Run again
        </button>
        <button
          onClick={cancelFlash}
          className="focus-ring"
          style={{ ...CANCEL_BUTTON_STYLE, height: 32, padding: "0 12px", fontSize: 12.5 }}
        >
          Exit
        </button>
      </div>
    </div>
  );
}

function DurationSeg({
  value,
  onChange,
}: {
  value: number;
  onChange: (ms: number) => void;
}): ReactNode {
  const activeIndex = Math.max(0, DURATION_OPTIONS.findIndex((o) => o.ms === value));
  return (
    <div
      className="seg"
      style={{ gridTemplateColumns: `repeat(${DURATION_OPTIONS.length}, 1fr)`, width: 200 }}
    >
      <span
        className="seg-thumb"
        style={{
          width: `calc((100% - 8px) / ${DURATION_OPTIONS.length})`,
          transform: `translateX(${100 * activeIndex}%)`,
        }}
      />
      {DURATION_OPTIONS.map((option) => (
        <button
          key={option.ms}
          onClick={() => onChange(option.ms)}
          className="seg-btn focus-ring"
          data-active={option.ms === value}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
