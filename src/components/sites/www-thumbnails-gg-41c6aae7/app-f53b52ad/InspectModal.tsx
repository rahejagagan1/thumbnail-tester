"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties, KeyboardEvent, ReactNode } from "react";
import { toPng } from "html-to-image";
import { useFeed } from "@/lib/sites/www-thumbnails-gg-41c6aae7/app-f53b52ad/store";
import { titleVariantForCard } from "@/lib/sites/www-thumbnails-gg-41c6aae7/app-f53b52ad/useFeedCards";
import { genThumb, monogramColor } from "@/lib/sites/www-thumbnails-gg-41c6aae7/app-f53b52ad/format";
import {
  IconKebab,
  IconVerified,
} from "@/components/sites/www-thumbnails-gg-41c6aae7/shared/icons";
import type { CardViewModel, Theme } from "@/types/thumbnails-app";

const YOUTUBE_ID_RE = /ytimg\.com\/vi\/([A-Za-z0-9_-]{6,})\//;

/** Rendered widths shown in the "at feed size" preview row. */
const PREVIEW_SIZES: ReadonlyArray<{ label: string; w: number }> = [
  { label: "Watch", w: 168 },
  { label: "Grid", w: 300 },
  { label: "Mobile", w: 393 },
];

const SECONDARY_BUTTON_STYLE: CSSProperties = {
  height: 38,
  padding: "0 14px",
  borderRadius: 999,
  border: "1px solid var(--border-default)",
  background: "transparent",
  color: "var(--text-secondary)",
  fontSize: 13,
  fontWeight: 500,
  cursor: "pointer",
  fontFamily: "inherit",
};

function extractYouTubeId(thumb: string | null, isTest: boolean): string | null {
  if (isTest || !thumb) return null;
  const match = YOUTUBE_ID_RE.exec(thumb);
  return match ? match[1] : null;
}

/** Lowercase, dash-separated, trimmed filename slug for exported assets. */
function slugify(title: string): string {
  return (
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "thumbnail"
  );
}

function rgbToHex(r: number, g: number, b: number): string {
  const hex = (n: number) => n.toString(16).padStart(2, "0");
  return `#${hex(r)}${hex(g)}${hex(b)}`;
}

async function exportNodeToPng(node: HTMLElement): Promise<string> {
  return toPng(node, { pixelRatio: 2, cacheBust: true });
}

function triggerDownload(href: string, filename: string): void {
  const a = document.createElement("a");
  a.href = href;
  a.download = filename;
  a.click();
}

async function downloadImage(src: string, filename: string): Promise<void> {
  const res = await fetch(src);
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  try {
    triggerDownload(url, filename);
  } finally {
    URL.revokeObjectURL(url);
  }
}

async function copyImageToClipboard(src: string): Promise<boolean> {
  try {
    if (typeof ClipboardItem === "undefined" || !navigator.clipboard?.write) return false;
    const res = await fetch(src);
    const blob = await res.blob();
    await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
    return true;
  } catch {
    return false;
  }
}

/**
 * @param editable Whether the inspected test card can be retitled here. False
 *   on a shared link, where the viewer is reading someone else's test.
 */
export function InspectModal({ editable = true }: { editable?: boolean } = {}) {
  const inspect = useFeed((s) => s.inspect);
  const setInspect = useFeed((s) => s.setInspect);
  const testCard = useFeed((s) => s.testCard);
  const titleMode = useFeed((s) => s.titleMode);
  const titles = useFeed((s) => s.titles);
  const seed = useFeed((s) => s.seed);
  const updateTestCard = useFeed((s) => s.updateTestCard);
  const updateTitle = useFeed((s) => s.updateTitle);

  const [blurAmount, setBlurAmount] = useState(0);
  const [grayscale, setGrayscale] = useState(false);
  const [showSafeArea, setShowSafeArea] = useState(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [swatches, setSwatches] = useState<string[]>([]);
  const [cardTheme, setCardTheme] = useState<Theme>("dark");
  const cardRef = useRef<HTMLDivElement>(null);

  // `inspect` is the snapshot taken when the card was clicked. For a test card
  // the title and channel are editable from here, so those two are read live
  // from the store instead — otherwise the panel, the exportable card and the
  // feed-size previews would all keep showing the pre-edit text.
  const titleVariant = inspect?.isTest
    ? titleVariantForCard(inspect.id, titleMode, titles, seed)
    : null;
  const card = inspect?.isTest
    ? {
        ...inspect,
        title: titleVariant?.text ?? testCard.title,
        channel: testCard.channelName,
      }
    : inspect;

  const thumbSrc = card ? (card.thumb ?? genThumb(card.id, card.title)) : "";

  useEffect(() => {
    setSwatches([]);
    if (!thumbSrc) return;
    let cancelled = false;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      if (cancelled) return;
      try {
        const w = 32;
        const h = 18;
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.drawImage(img, 0, 0, w, h);
        const { data } = ctx.getImageData(0, 0, w, h);
        const buckets = new Map<string, { r: number; g: number; b: number; count: number }>();
        for (let i = 0; i < data.length; i += 4) {
          const alpha = data[i + 3];
          if (alpha < 200) continue;
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const key = `${r >> 5}-${g >> 5}-${b >> 5}`;
          const bucket = buckets.get(key) ?? { r: 0, g: 0, b: 0, count: 0 };
          bucket.r += r;
          bucket.g += g;
          bucket.b += b;
          bucket.count += 1;
          buckets.set(key, bucket);
        }
        const dominant = Array.from(buckets.values())
          .sort((a, b) => b.count - a.count)
          .slice(0, 6)
          .map((bucket) =>
            rgbToHex(
              Math.round(bucket.r / bucket.count),
              Math.round(bucket.g / bucket.count),
              Math.round(bucket.b / bucket.count),
            ),
          );
        if (!cancelled) setSwatches(dominant);
      } catch {
        if (!cancelled) setSwatches([]);
      }
    };
    img.onerror = () => {
      if (!cancelled) setSwatches([]);
    };
    img.src = thumbSrc;
    return () => {
      cancelled = true;
    };
  }, [thumbSrc]);

  if (!card) return null;

  const canEdit = editable && card.isTest;

  // In multiple-titles mode the card shows one variant from the list, so the
  // edit belongs to that variant; otherwise it is the test card's own title.
  const writeTitle = (text: string) => {
    if (titleVariant) updateTitle(titleVariant.id, text);
    else updateTestCard({ title: text });
  };

  const youtubeId = extractYouTubeId(card.thumb, card.isTest);

  const filterParts: string[] = [];
  if (blurAmount > 0) filterParts.push(`blur(${blurAmount}px)`);
  if (grayscale) filterParts.push("grayscale(1)");
  const previewFilter = filterParts.length ? filterParts.join(" ") : undefined;

  const saveCard = async () => {
    if (!cardRef.current || busy) return;
    setBusy(true);
    try {
      const dataUrl = await exportNodeToPng(cardRef.current);
      triggerDownload(dataUrl, `card_${slugify(card.title)}.png`);
      setStatus("Card saved");
    } catch {
      setStatus("Export failed");
    } finally {
      setBusy(false);
    }
  };

  const saveThumbnail = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await downloadImage(thumbSrc, `thumbnail_${slugify(card.title)}.png`);
      setStatus("Thumbnail saved");
    } catch {
      setStatus("Export failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="inspect-scrim"
      onClick={(e) => {
        if (e.target === e.currentTarget) setInspect(null);
      }}
    >
      <div className="inspect-panel glass-dark anim-scale" role="dialog" aria-modal="true">
        <button
          className="inspect-close focus-ring"
          onClick={() => setInspect(null)}
          aria-label="Close"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
              d="M6 6l12 12M18 6L6 18"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        </button>
        <div className="inspect-body">
          <div className="inspect-left">
            <div className="inspect-preview" style={{ filter: previewFilter }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={thumbSrc}
                alt=""
                draggable={false}
                style={{ objectFit: card.imageFit }}
              />
              {card.showDuration && card.duration.trim() !== "" && (
                <span className="inspect-duration">{card.duration}</span>
              )}
              {showSafeArea && (
                <div className="inspect-safe">
                  <div className="inspect-safe-badge" />
                </div>
              )}
            </div>
            <div className="inspect-tools">
              <div className="inspect-squint">
                <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Squint</span>
                <input
                  type="range"
                  min={0}
                  max={12}
                  value={blurAmount}
                  onChange={(e) => setBlurAmount(Number(e.target.value))}
                  style={{ flex: 1, accentColor: "#fff" }}
                />
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    color: "var(--text-faint)",
                    minWidth: 28,
                  }}
                >
                  {blurAmount}px
                </span>
              </div>
              <ToggleChip active={grayscale} onClick={() => setGrayscale((v) => !v)}>
                Grayscale
              </ToggleChip>
              <ToggleChip active={showSafeArea} onClick={() => setShowSafeArea((v) => !v)}>
                Safe-area
              </ToggleChip>
            </div>
            <div className="inspect-eyebrow">At feed size</div>
            <div className="inspect-sizes">
              {PREVIEW_SIZES.map((size) => (
                <div
                  key={size.label}
                  style={{ display: "flex", flexDirection: "column", gap: 5, alignItems: "center" }}
                >
                  <div
                    style={{
                      width: size.w,
                      aspectRatio: "16 / 9",
                      borderRadius: 8,
                      overflow: "hidden",
                      background: "var(--bg-elevated)",
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={thumbSrc}
                      alt=""
                      draggable={false}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: card.imageFit,
                        filter: grayscale ? "grayscale(1)" : undefined,
                      }}
                    />
                  </div>
                  <span style={{ fontSize: 10.5, color: "var(--text-faint)" }}>
                    {size.label} · {size.w}px
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="inspect-right">
            <div>
              <div className="inspect-eyebrow" style={{ marginBottom: 8 }}>
                {card.isTest ? "Your thumbnail" : "Competitor"}
              </div>
              {canEdit ? (
                <EditableText
                  value={card.title}
                  onChange={writeTitle}
                  label="title"
                  multiline
                  textStyle={TITLE_TEXT_STYLE}
                />
              ) : (
                <h2 className="inspect-title">{card.title}</h2>
              )}
              <div className="inspect-meta">
                {canEdit ? (
                  <EditableText
                    value={card.channel}
                    onChange={(text) => updateTestCard({ channelName: text })}
                    label="channel name"
                    textStyle={CHANNEL_TEXT_STYLE}
                    suffix={card.verified ? " · verified" : ""}
                  />
                ) : (
                  <>
                    {card.channel}
                    {card.verified ? " · verified" : ""}
                  </>
                )}
              </div>
              <div className="inspect-meta">
                {card.views} · {card.age}
                {card.duration ? ` · ${card.duration}` : ""}
              </div>
              {youtubeId && (
                <a
                  className="inspect-yt focus-ring"
                  href={`https://www.youtube.com/watch?v=${youtubeId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open on YouTube
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M7 17L17 7M9 7h8v8"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </a>
              )}
            </div>
            <div>
              <div className="inspect-eyebrow" style={{ marginBottom: 8 }}>
                Palette
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                {swatches.length === 0 && (
                  <span style={{ fontSize: 12, color: "var(--text-faint)" }}>reading colors…</span>
                )}
                {swatches.map((color) => (
                  <button
                    key={color}
                    className="inspect-swatch focus-ring"
                    style={{ background: color }}
                    title={`${color} — click to copy`}
                    onClick={() => {
                      navigator.clipboard?.writeText(color);
                      setStatus(`Copied ${color}`);
                    }}
                  />
                ))}
              </div>
            </div>
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                <span className="inspect-eyebrow">Exportable card</span>
                <ThemeToggle value={cardTheme} onChange={setCardTheme} />
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  padding: "14px 0",
                  background: "var(--bg-sunken)",
                  borderRadius: 12,
                  border: "1px solid var(--border-subtle)",
                }}
              >
                <div
                  ref={cardRef}
                  className="yt-root"
                  data-theme={cardTheme}
                  style={{ width: 320, padding: 12 }}
                >
                  <ExportCardPreview vm={card} />
                </div>
              </div>
            </div>
            <div className="inspect-actions">
              <button
                onClick={saveThumbnail}
                disabled={busy}
                className="btn-primary focus-ring"
                style={{ height: 38, fontSize: 13, padding: "0 14px" }}
              >
                Export thumbnail
              </button>
              <button
                onClick={saveCard}
                disabled={busy}
                className="focus-ring"
                style={SECONDARY_BUTTON_STYLE}
              >
                Export card
              </button>
              <button
                onClick={async () =>
                  setStatus((await copyImageToClipboard(thumbSrc)) ? "Image copied" : "Copy not supported")
                }
                disabled={busy}
                className="focus-ring"
                style={SECONDARY_BUTTON_STYLE}
              >
                Copy image
              </button>
              <button
                onClick={() => {
                  navigator.clipboard?.writeText(card.title);
                  setStatus("Title copied");
                }}
                className="focus-ring"
                style={SECONDARY_BUTTON_STYLE}
              >
                Copy title
              </button>
            </div>
            <div
              style={{
                minHeight: 16,
                fontSize: 11.5,
                color: status ? "#3dd68c" : "var(--text-faint)",
              }}
            >
              {busy ? "Working…" : (status ?? "Click a swatch to copy its hex.")}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** `.inspect-title` as a plain object, so the editor field matches the heading. */
const TITLE_TEXT_STYLE: CSSProperties = {
  fontSize: 19,
  fontWeight: 600,
  lineHeight: 1.25,
  letterSpacing: "-0.01em",
  color: "var(--text-primary)",
};

/** Matches `.inspect-meta`. */
const CHANNEL_TEXT_STYLE: CSSProperties = {
  fontSize: 13,
  lineHeight: 1.5,
  color: "var(--text-secondary)",
};

function IconPencil() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 20h4L19 9a2.1 2.1 0 10-3-3L5 17v3z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * A line of the panel's header that can be rewritten in place.
 *
 * Edits are written straight through on every keystroke, the way the editor
 * panel's fields are, so the exportable card and the feed-size previews track
 * what is being typed.
 */
function EditableText({
  value,
  onChange,
  label,
  textStyle,
  multiline = false,
  suffix = "",
}: {
  value: string;
  onChange: (text: string) => void;
  /** Named in the control's accessible label: "Edit title". */
  label: string;
  textStyle: CSSProperties;
  multiline?: boolean;
  /** Trailing text that is not part of the edited value (" · verified"). */
  suffix?: string;
}) {
  const [editing, setEditing] = useState(false);

  const fieldStyle: CSSProperties = {
    ...textStyle,
    display: "block",
    width: "100%",
    margin: 0,
    padding: "5px 8px",
    borderRadius: 8,
    background: "var(--bg-sunken)",
    border: "1px solid var(--border-default)",
    fontFamily: "inherit",
    outline: "none",
  };

  // Enter is "done" rather than a newline: a YouTube title is one line of text,
  // and Escape backs out the same way. Neither key does anything else here.
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter" || e.key === "Escape") {
      e.preventDefault();
      setEditing(false);
    }
  };

  return (
    <div style={{ marginBottom: multiline ? 8 : 0 }}>
      {editing ? (
        multiline ? (
          <textarea
            // Focus follows the click that opened the field; blur closes it.
            autoFocus
            rows={2}
            className="focus-ring"
            aria-label={`Edit ${label}`}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={(e) => e.currentTarget.setSelectionRange(value.length, value.length)}
            onBlur={() => setEditing(false)}
            onKeyDown={onKeyDown}
            style={{ ...fieldStyle, resize: "vertical" }}
          />
        ) : (
          <input
            autoFocus
            className="focus-ring"
            aria-label={`Edit ${label}`}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={(e) => e.currentTarget.setSelectionRange(value.length, value.length)}
            onBlur={() => setEditing(false)}
            onKeyDown={onKeyDown}
            style={fieldStyle}
          />
        )
      ) : (
        <div style={{ display: "flex", alignItems: "flex-start", gap: 6, minWidth: 0 }}>
          <span
            onClick={() => setEditing(true)}
            style={{ ...textStyle, cursor: "text", minWidth: 0, wordBreak: "break-word" }}
          >
            {value.trim() === "" ? (
              <span style={{ color: "var(--text-faint)" }}>Add a {label}</span>
            ) : (
              value
            )}
            {suffix}
          </span>
          <button
            onClick={() => setEditing(true)}
            className="focus-ring"
            aria-label={`Edit ${label}`}
            title={`Edit ${label}`}
            style={{
              flexShrink: 0,
              display: "grid",
              placeItems: "center",
              width: 22,
              height: 22,
              marginTop: 1,
              borderRadius: 6,
              border: "1px solid var(--border-default)",
              background: "transparent",
              color: "var(--text-muted)",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            <IconPencil />
          </button>
        </div>
      )}
    </div>
  );
}

function ToggleChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="focus-ring"
      style={{
        height: 30,
        padding: "0 12px",
        borderRadius: 8,
        border: `1px solid ${active ? "rgba(255,255,255,0.4)" : "var(--border-default)"}`,
        background: active ? "rgba(255,255,255,0.1)" : "transparent",
        color: active ? "var(--text-primary)" : "var(--text-muted)",
        fontSize: 12.5,
        fontWeight: 500,
        cursor: "pointer",
        fontFamily: "inherit",
        transition: "background var(--dur-fast), border-color var(--dur-fast), color var(--dur-fast)",
      }}
    >
      {children}
    </button>
  );
}

function ThemeToggle({ value, onChange }: { value: Theme; onChange: (t: Theme) => void }) {
  const options: Theme[] = ["dark", "light"];
  return (
    <div
      style={{
        display: "flex",
        gap: 2,
        padding: 2,
        borderRadius: 8,
        border: "1px solid var(--border-default)",
      }}
    >
      {options.map((option) => (
        <button
          key={option}
          onClick={() => onChange(option)}
          style={{
            height: 22,
            padding: "0 10px",
            borderRadius: 6,
            border: "none",
            cursor: "pointer",
            fontSize: 11.5,
            fontWeight: 500,
            fontFamily: "inherit",
            textTransform: "capitalize",
            background: value === option ? "#fff" : "transparent",
            color: value === option ? "var(--accent-fg)" : "var(--text-secondary)",
          }}
        >
          {option}
        </button>
      ))}
    </div>
  );
}

/**
 * Faithful local reconstruction of the site's shared VideoCard component
 * (imported in the original bundle as `eQ.VideoCard`, not present in this
 * codebase yet), used only for the "Exportable card" preview.
 */
function ExportCardPreview({ vm }: { vm: CardViewModel }) {
  const src = vm.thumb ?? genThumb(vm.id, vm.title);
  const isLive = vm.duration.trim().toUpperCase() === "LIVE";
  return (
    <div className="yt-card" data-test={vm.isTest}>
      <div className="yt-thumb-wrap">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="yt-thumb-img"
          src={src}
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
      </div>
      <div className="yt-card-details">
        <div className="yt-card-avatar">
          {vm.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={vm.avatar} alt="" draggable={false} />
          ) : (
            <span className="yt-monogram" style={{ background: monogramColor(vm.channel) }}>
              {vm.channel.trim().charAt(0).toUpperCase() || "?"}
            </span>
          )}
        </div>
        <div className="yt-card-text">
          <h3 className="yt-card-title">{vm.title}</h3>
          <div className="yt-card-channel">
            <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{vm.channel}</span>
            {vm.verified && (
              <IconVerified size={14} className="yt-verified" style={{ color: "var(--yt-text-secondary)" }} />
            )}
          </div>
          <div className="yt-card-meta">
            <span>{vm.views}</span>
            <span aria-hidden="true">•</span>
            <span>{vm.age}</span>
          </div>
        </div>
        <button
          className="yt-card-menu"
          aria-label="More"
          tabIndex={-1}
          onClick={(e) => e.stopPropagation()}
        >
          <IconKebab size={20} />
        </button>
      </div>
    </div>
  );
}
