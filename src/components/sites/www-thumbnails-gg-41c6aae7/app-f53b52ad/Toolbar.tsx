"use client";

import { useState } from "react";
import type { CSSProperties, ReactNode, RefObject } from "react";
import Link from "next/link";
import { toPng } from "html-to-image";
import { useFeed } from "@/lib/sites/www-thumbnails-gg-41c6aae7/app-f53b52ad/store";
import type { SaveState } from "@/lib/sites/www-thumbnails-gg-41c6aae7/app-f53b52ad/useTaskAutosave";
import type { ViewMode } from "@/types/thumbnails-app";

/* ------------------------------------------------------------------ */
/* Icons                                                               */
/* ------------------------------------------------------------------ */

function IconDesktop() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="4" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="1.7" />
      <path d="M9 21h6M12 17v4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function IconMobile() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="7" y="3" width="10" height="18" rx="2.5" stroke="currentColor" strokeWidth="1.7" />
      <path d="M11 18h2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function IconWatch() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="3" stroke="currentColor" strokeWidth="1.7" />
      <path d="M11 9.5l4 2.5-4 2.5v-5z" fill="currentColor" />
    </svg>
  );
}

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

function IconTarget() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="12" cy="12" r="3.2" fill="currentColor" />
    </svg>
  );
}

function IconStopwatch() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="13" r="7.5" stroke="currentColor" strokeWidth="1.7" />
      <path d="M12 13V9M9.5 2.5h5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function IconShuffle() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
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

function IconDownload() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 3v12M8 11l4 4 4-4"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4 17v2a1 1 0 001 1h14a1 1 0 001-1v-2"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconChevron() {
  return (
    <svg className="tchev" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6 9l6 6 6-6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Wordmark                                                             */
/* ------------------------------------------------------------------ */

interface WordmarkProps {
  size?: number;
}

export function Wordmark({ size = 17 }: WordmarkProps) {
  return (
    <span
      style={{
        fontFamily: "var(--font-sans), sans-serif",
        fontWeight: 600,
        letterSpacing: "-0.03em",
        fontSize: size,
        lineHeight: 1,
        color: "var(--text-primary)",
        whiteSpace: "nowrap",
      }}
    >
      thumbnails
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* TSeg — segmented control                                            */
/* ------------------------------------------------------------------ */

interface TSegOption<T extends string> {
  value: T;
  label: string;
  icon?: ReactNode;
}

interface TSegProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: TSegOption<T>[];
  full?: boolean;
  lg?: boolean;
}

export function TSeg<T extends string>({
  value,
  onChange,
  options,
  full = false,
  lg = false,
}: TSegProps<T>) {
  const n = options.length;
  const activeIndex = Math.max(
    0,
    options.findIndex((o) => o.value === value),
  );
  const gridStyle: CSSProperties = full
    ? { display: "grid", gridTemplateColumns: `repeat(${n}, 1fr)`, width: "100%" }
    : lg
      ? { gridTemplateColumns: `repeat(${n}, 106px)` }
      : { gridAutoColumns: "max-content" };

  return (
    <div className={`tseg${lg ? " lg" : ""}`} style={gridStyle}>
      <span
        className="tseg-thumb"
        style={{
          width: `calc((100% - 6px) / ${n})`,
          transform: `translateX(${100 * activeIndex}%)`,
        }}
      />
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className="tseg-btn focus-ring"
          data-active={option.value === value}
        >
          {option.icon}
          {option.label}
        </button>
      ))}
    </div>
  );
}

const VIEW_MODE_OPTIONS: TSegOption<ViewMode>[] = [
  { value: "desktop", label: "Desktop", icon: <IconDesktop /> },
  { value: "mobile", label: "Mobile", icon: <IconMobile /> },
  { value: "watch", label: "Watch", icon: <IconWatch /> },
];

const EXPORT_SCALE_OPTIONS: TSegOption<string>[] = [
  { value: "1", label: "1x" },
  { value: "2", label: "2x" },
  { value: "3", label: "3x" },
];

/* ------------------------------------------------------------------ */
/* SquintMenu                                                          */
/* ------------------------------------------------------------------ */

export function SquintMenu() {
  const feed = useFeed();
  const [open, setOpen] = useState(false);
  const hasActiveSquint = feed.blur > 0 || feed.grayscale || feed.showSafeAreaOverlay;

  return (
    <div style={{ position: "relative" }}>
      <button
        type="button"
        className="tbtn focus-ring"
        data-active={open || hasActiveSquint}
        onClick={() => setOpen((v) => !v)}
      >
        <IconTarget />
        Squint
        {hasActiveSquint && !open && <span className="tdot" />}
        <IconChevron />
      </button>
      {open && (
        <>
          <div
            onClick={() => setOpen(false)}
            style={{ position: "fixed", inset: 0, zIndex: 40 }}
          />
          <div
            className="tmenu glass-2 anim-scale"
            style={{
              width: 252,
              background: "var(--bg-elevated-2)",
              backdropFilter: "none",
              WebkitBackdropFilter: "none",
            }}
          >
            <div className="eyebrow" style={{ marginBottom: 12 }}>
              Squint tests
            </div>
            <div className="tmenu-row">
              <span className="tmenu-name">Blur</span>
              <span className="tmenu-slider">
                <input
                  type="range"
                  min={0}
                  max={12}
                  value={feed.blur}
                  onChange={(e) => feed.setBlur(Number(e.target.value))}
                  aria-label="Blur amount"
                />
                <span className="tbar-val">{feed.blur}px</span>
              </span>
            </div>
            <div className="tmenu-row">
              <span className="tmenu-name">Grayscale</span>
              <button
                type="button"
                className="tsw focus-ring"
                data-on={feed.grayscale}
                onClick={() => feed.setGrayscale(!feed.grayscale)}
                role="switch"
                aria-checked={feed.grayscale}
                aria-label="Grayscale"
              >
                <i />
              </button>
            </div>
            <div className="tmenu-row">
              <span className="tmenu-name">Safe-area overlay</span>
              <button
                type="button"
                className="tsw focus-ring"
                data-on={feed.showSafeAreaOverlay}
                onClick={() => feed.setShowSafeArea(!feed.showSafeAreaOverlay)}
                role="switch"
                aria-checked={feed.showSafeAreaOverlay}
                aria-label="Safe-area overlay"
              >
                <i />
              </button>
            </div>
            <div className="tmenu-sub">
              Blur the feed and drain color to squint-test readability.
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* ExportMenu                                                          */
/* ------------------------------------------------------------------ */

function downloadDataUrl(dataUrl: string, filename: string): void {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  link.click();
}

async function copyDataUrlToClipboard(dataUrl: string): Promise<boolean> {
  try {
    if (typeof ClipboardItem === "undefined" || !navigator.clipboard?.write) {
      return false;
    }
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
    return true;
  } catch {
    return false;
  }
}

interface ExportMenuProps {
  targetRef: RefObject<HTMLDivElement | null>;
}

export function ExportMenu({ targetRef }: ExportMenuProps) {
  const viewMode = useFeed((s) => s.viewMode);
  const [open, setOpen] = useState(false);
  const [scale, setScale] = useState(2);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const runExport = async (kind: "download" | "copy") => {
    const node = targetRef.current;
    if (!node || busy) return;
    setBusy(true);
    setStatus(null);
    try {
      const dataUrl = await toPng(node, { pixelRatio: scale, cacheBust: true });
      if (kind === "download") {
        downloadDataUrl(dataUrl, `thumbnails_${viewMode}_${Date.now()}.png`);
        setStatus("Saved to downloads");
      } else {
        const copied = await copyDataUrlToClipboard(dataUrl);
        setStatus(copied ? "Copied to clipboard" : "Copy not supported here");
      }
    } catch {
      setStatus("Export failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ position: "relative" }}>
      <button
        type="button"
        className="tprimary focus-ring"
        data-active={open}
        onClick={() => setOpen((v) => !v)}
      >
        <IconDownload />
        Export
      </button>
      {open && (
        <>
          <div
            onClick={() => setOpen(false)}
            style={{ position: "fixed", inset: 0, zIndex: 40 }}
          />
          <div className="tmenu glass-2 anim-scale">
            <div className="eyebrow" style={{ marginBottom: 10 }}>
              Export PNG
            </div>
            <TSeg
              full
              value={String(scale)}
              onChange={(v) => setScale(Number(v))}
              options={EXPORT_SCALE_OPTIONS}
            />
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <button
                type="button"
                onClick={() => void runExport("download")}
                disabled={busy}
                className="btn-primary focus-ring"
                style={{
                  flex: 1,
                  height: 34,
                  fontSize: 13,
                  cursor: busy ? "default" : "pointer",
                  opacity: busy ? 0.7 : 1,
                }}
              >
                {busy ? "Rendering…" : "Download"}
              </button>
              <button
                type="button"
                onClick={() => void runExport("copy")}
                disabled={busy}
                className="tbtn focus-ring"
                style={{ height: 34 }}
              >
                Copy
              </button>
            </div>
            <div style={{ marginTop: 8, fontSize: 11, color: "var(--text-faint)", minHeight: 14 }}>
              {busy ? "Capturing the current surface…" : (status ?? "Captures the visible preview.")}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Toolbar                                                              */
/* ------------------------------------------------------------------ */

interface ToolbarProps {
  targetRef: RefObject<HTMLDivElement | null>;
  onFlash: () => void;
  flashActive: boolean;
  taskName?: string | null;
  saveState?: SaveState;
  onRename?: (name: string) => void;
}

/** Editable test name plus the autosave indicator, shown next to the wordmark. */
function TaskChip({
  taskName,
  saveState,
  onRename,
}: {
  taskName: string | null;
  saveState: SaveState;
  onRename?: (name: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(taskName ?? "");

  const label =
    saveState === "saving"
      ? "Saving…"
      : saveState === "error"
        ? "Not saved"
        : saveState === "saved"
          ? "Saved"
          : "Unsaved";

  const commit = () => {
    setEditing(false);
    const next = draft.trim();
    if (next && next !== taskName) onRename?.(next);
  };

  return (
    <span
      className="tool-by"
      style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
    >
      <span style={{ color: "var(--border-default)" }}>/</span>
      {editing ? (
        <input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") commit();
            if (e.key === "Escape") {
              setDraft(taskName ?? "");
              setEditing(false);
            }
          }}
          className="focus-ring fx"
          style={{
            height: 24,
            width: 180,
            padding: "0 8px",
            borderRadius: 6,
            background: "var(--bg-sunken)",
            border: "1px solid var(--border-default)",
            color: "var(--text-primary)",
            fontSize: 12.5,
            fontFamily: "inherit",
            outline: "none",
          }}
        />
      ) : (
        <button
          onClick={() => {
            setDraft(taskName ?? "");
            setEditing(true);
          }}
          disabled={!onRename || !taskName}
          className="focus-ring"
          title={taskName ? "Rename this test" : undefined}
          style={{
            background: "transparent",
            border: "none",
            padding: 0,
            fontFamily: "inherit",
            fontSize: 12.5,
            fontWeight: 500,
            color: "var(--text-secondary)",
            cursor: onRename && taskName ? "pointer" : "default",
            maxWidth: 200,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {taskName ?? "New test"}
        </button>
      )}
      <span
        style={{
          fontSize: 11,
          color: saveState === "error" ? "#ff8f8f" : "var(--text-faint)",
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </span>
    </span>
  );
}

export function Toolbar({
  targetRef,
  onFlash,
  flashActive,
  taskName = null,
  saveState = "idle",
  onRename,
}: ToolbarProps) {
  const feed = useFeed();
  const isDark = feed.theme === "dark";

  return (
    <div className="tbar">
      <span className="tool-brand">
        <Link href="/" className="tool-wordmark focus-ring" aria-label="thumbnails home">
          <Wordmark size={17} />
        </Link>
        <span className="tool-by">
          by{" "}
          <a
            href="https://x.com/mattos"
            target="_blank"
            rel="noopener noreferrer"
            className="focus-ring"
          >
            mattos
          </a>
        </span>
        <TaskChip taskName={taskName} saveState={saveState} onRename={onRename} />
      </span>
      <span className="tbar-grow" />
      <TSeg lg value={feed.viewMode} onChange={(v) => feed.setViewMode(v)} options={VIEW_MODE_OPTIONS} />
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
        <SquintMenu />
        <button
          type="button"
          className="ticon focus-ring"
          onClick={onFlash}
          disabled={flashActive}
          title="Flash test"
          aria-label="Flash test"
        >
          <IconStopwatch />
        </button>
        <button
          type="button"
          className="ticon focus-ring"
          onClick={() => feed.reshuffle()}
          title="Reshuffle feed"
          aria-label="Reshuffle feed"
        >
          <IconShuffle />
        </button>
        <ExportMenu targetRef={targetRef} />
      </div>
    </div>
  );
}
