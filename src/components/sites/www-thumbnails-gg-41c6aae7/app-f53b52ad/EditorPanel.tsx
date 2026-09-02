"use client";

import { useRef, useState } from "react";
import type { CSSProperties, InputHTMLAttributes, ReactNode } from "react";
import { useFeed } from "@/lib/sites/www-thumbnails-gg-41c6aae7/app-f53b52ad/store";
import { AGE_OPTIONS } from "@/lib/sites/www-thumbnails-gg-41c6aae7/app-f53b52ad/format";
import type { Columns } from "@/types/thumbnails-app";
import { AUTO_COLUMN_STEP } from "@/lib/sites/www-thumbnails-gg-41c6aae7/app-f53b52ad/useInfiniteScroll";
import { CompetitorsSection } from "./CompetitorsSection";

/** Line-wrap estimate for the target's fixed-width thumbnail title box (~26 chars/line). */
function lineCount(text: string): number {
  const words = text.split(/\s+/);
  let lines = 1;
  let curLen = 0;
  for (const w of words) {
    if (curLen + w.length + 1 > 26 && curLen > 0) {
      lines++;
      curLen = w.length + 1;
    } else {
      curLen += w.length + 1;
    }
  }
  return lines;
}

function isPresetAge(value: string): boolean {
  return AGE_OPTIONS.some((o) => o.value === value);
}

const baseFieldStyle: CSSProperties = {
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

function Input({ style, ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input {...rest} className="focus-ring fx" style={{ ...baseFieldStyle, ...style }} />
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: ReactNode;
  children: ReactNode;
}) {
  return (
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
        {label}
        {hint && <span style={{ color: "var(--text-faint)" }}>{hint}</span>}
      </span>
      {children}
    </label>
  );
}

interface SegOption<T extends string> {
  value: T;
  label: string;
}

function Seg<T extends string>({
  options,
  value,
  onChange,
}: {
  options: SegOption<T>[];
  value: T;
  onChange: (v: T) => void;
}) {
  const count = options.length;
  const index = Math.max(
    0,
    options.findIndex((o) => o.value === value),
  );
  return (
    <div className="seg" style={{ gridTemplateColumns: `repeat(${count}, 1fr)` }}>
      <span
        className="seg-thumb"
        style={{
          width: `calc((100% - 8px) / ${count})`,
          transform: `translateX(${100 * index}%)`,
        }}
      />
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className="seg-btn focus-ring"
          data-active={o.value === value}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="focus-ring"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
        padding: "8px 0",
        background: "transparent",
        border: "none",
        cursor: "pointer",
        color: "var(--text-secondary)",
        fontSize: 13,
        fontFamily: "inherit",
      }}
    >
      <span>{label}</span>
      <span
        style={{
          width: 38,
          height: 22,
          borderRadius: 999,
          background: checked ? "#fff" : "rgba(255,255,255,0.12)",
          position: "relative",
          transition: "background var(--dur-base)",
          flexShrink: 0,
        }}
      >
        <span
          style={{
            position: "absolute",
            top: 3,
            left: checked ? 19 : 3,
            width: 16,
            height: 16,
            borderRadius: 999,
            background: checked ? "var(--accent-fg)" : "#fff",
            transition: "left var(--dur-base) var(--ease-out)",
          }}
        />
      </span>
    </button>
  );
}

function RangeRow({
  value,
  min,
  max,
  step = 1,
  onChange,
  suffix,
}: {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (n: number) => void;
  suffix?: string;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ flex: 1, accentColor: "#fff" }}
      />
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 12,
          color: "var(--text-muted)",
          minWidth: 44,
          textAlign: "right",
        }}
      >
        {value}
        {suffix}
      </span>
    </div>
  );
}

function Section({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ borderBottom: "1px solid var(--border-subtle)" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          padding: "16px 0",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          color: "var(--text-primary)",
          fontFamily: "inherit",
        }}
      >
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "var(--text-secondary)",
          }}
        >
          {title}
        </span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          style={{
            transform: open ? "rotate(180deg)" : "none",
            transition: "transform var(--dur-base) var(--ease-out)",
            color: "var(--text-muted)",
          }}
        >
          <path
            d="M6 9l6 6 6-6"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <div className="acc-body" data-open={open}>
        <div>
          <div style={{ paddingBottom: 18 }}>{children}</div>
        </div>
      </div>
    </div>
  );
}

function Dropzone({
  onFile,
  onFiles,
  multiple = false,
  hasImage,
  label,
  height = 120,
  previewSrc,
}: {
  onFile?: (file: File) => void;
  onFiles?: (files: File[]) => void;
  multiple?: boolean;
  hasImage: boolean;
  label: string;
  height?: number;
  previewSrc?: string | null;
}) {
  const [dragOver, setDragOver] = useState(false);
  const [hovering, setHovering] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const hasPreview = !!previewSrc;

  const pick = (list: FileList | null) => {
    const files = Array.from(list ?? []);
    if (files.length === 0) return;
    if (multiple && onFiles) onFiles(files);
    else onFile?.(files[0]);
  };

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        pick(e.dataTransfer.files);
      }}
      style={{
        position: "relative",
        overflow: "hidden",
        height,
        borderRadius: 10,
        border: `1.5px dashed ${dragOver ? "#fff" : "var(--border-default)"}`,
        background: dragOver ? "rgba(255,255,255,0.04)" : "var(--bg-sunken)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        cursor: "pointer",
        color: "var(--text-muted)",
        fontSize: 13,
        transition: "border-color var(--dur-fast), background var(--dur-fast)",
        textAlign: "center",
        padding: 12,
      }}
    >
      {hasPreview && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={previewSrc ?? undefined}
          alt=""
          draggable={false}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            borderRadius: 10,
          }}
        />
      )}
      {(!hasPreview || hovering || dragOver) && (
        <div
          style={{
            position: hasPreview ? "absolute" : "relative",
            inset: hasPreview ? 0 : undefined,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            padding: 12,
            borderRadius: 10,
            background: hasPreview ? "rgba(0,0,0,0.55)" : "transparent",
            color: hasPreview ? "#fff" : "var(--text-muted)",
            transition: "background var(--dur-fast)",
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 16V4M7 9l5-5 5 5"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M4 16v3a1 1 0 001 1h14a1 1 0 001-1v-3"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
          <span>{hasImage || hasPreview ? `Replace · ${label}` : label}</span>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        multiple={multiple}
        style={{ display: "none" }}
        onChange={(e) => {
          pick(e.target.files);
          e.target.value = "";
        }}
      />
    </div>
  );
}

/** Same alphabet the feed badges use, so the sidebar and the feed agree. */
const LETTERS = "ABCDEFGH".split("");

function ThumbnailGrid() {
  const thumbnails = useFeed((s) => s.thumbnails);
  const toggleThumbnail = useFeed((s) => s.toggleThumbnail);
  const removeThumbnail = useFeed((s) => s.removeThumbnail);

  if (thumbnails.length === 0) {
    return (
      <p style={{ margin: "10px 0 0", fontSize: 11.5, color: "var(--text-faint)", lineHeight: 1.5 }}>
        No thumbnails yet. Add 3–4 and each one gets its own card in the feed,
        badged A, B, C… so you can tell them apart.
      </p>
    );
  }

  const enabledCount = thumbnails.filter((t) => t.enabled).length;

  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ fontSize: 12, fontWeight: 500, color: "var(--text-muted)" }}>
          Thumbnails
        </span>
        <span style={{ fontSize: 11.5, color: "var(--text-faint)" }}>
          {enabledCount}/{thumbnails.length} in feed
        </span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {thumbnails.map((t) => (
          <div
            key={t.id}
            onClick={() => toggleThumbnail(t.id)}
            title={t.enabled ? "Click to hide from feed" : "Click to show in feed"}
            style={{
              position: "relative",
              aspectRatio: "16 / 9",
              borderRadius: 8,
              overflow: "hidden",
              cursor: "pointer",
              border: `2px solid ${t.enabled ? "#fff" : "transparent"}`,
              opacity: t.enabled ? 1 : 0.4,
              transition: "opacity var(--dur-fast), border-color var(--dur-fast)",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={t.src}
              alt=""
              draggable={false}
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
            {/* The letter matches the badge this variant carries in the feed. */}
            {enabledCount > 1 && t.enabled && (
              <span
                style={{
                  position: "absolute",
                  bottom: 6,
                  left: 6,
                  minWidth: 18,
                  height: 18,
                  padding: "0 5px",
                  borderRadius: 5,
                  background: "rgba(0,0,0,0.75)",
                  color: "#fff",
                  fontSize: 11,
                  fontWeight: 700,
                  lineHeight: "18px",
                  textAlign: "center",
                }}
              >
                {LETTERS[thumbnails.filter((x) => x.enabled).indexOf(t)] ?? "?"}
              </span>
            )}
            <span
              style={{
                position: "absolute",
                top: 6,
                left: 6,
                width: 18,
                height: 18,
                borderRadius: 4,
                background: t.enabled ? "#fff" : "rgba(0,0,0,0.5)",
                border: "1px solid rgba(255,255,255,0.6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {t.enabled && (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M5 12.5l4 4 10-10"
                    stroke="#08090b"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeThumbnail(t.id);
              }}
              aria-label="Remove thumbnail"
              style={{
                position: "absolute",
                top: 6,
                right: 6,
                width: 18,
                height: 18,
                borderRadius: 999,
                background: "rgba(0,0,0,0.6)",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 0,
              }}
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                <path d="M6 6l12 12M18 6L6 18" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function TitleList() {
  const titles = useFeed((s) => s.titles);
  const addTitle = useFeed((s) => s.addTitle);
  const updateTitle = useFeed((s) => s.updateTitle);
  const toggleTitle = useFeed((s) => s.toggleTitle);
  const removeTitle = useFeed((s) => s.removeTitle);
  const enabledCount = titles.filter((t) => t.enabled).length;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ fontSize: 12, fontWeight: 500, color: "var(--text-muted)" }}>Titles</span>
        <span style={{ fontSize: 11.5, color: "var(--text-faint)" }}>
          {enabledCount}/{titles.length} in feed
        </span>
      </div>
      {titles.length === 0 ? (
        <p style={{ margin: "0 0 12px", fontSize: 11.5, color: "var(--text-faint)", lineHeight: 1.5 }}>
          No titles yet. Add a few to scatter them across your thumbnails.
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
          {titles.map((t) => {
            const lines = lineCount(t.text);
            return (
              <div key={t.id} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <button
                    onClick={() => toggleTitle(t.id)}
                    aria-label={t.enabled ? "Disable title" : "Enable title"}
                    title={t.enabled ? "Click to remove from feed" : "Click to include in feed"}
                    className="focus-ring"
                    style={{
                      flexShrink: 0,
                      width: 18,
                      height: 18,
                      borderRadius: 4,
                      background: t.enabled ? "#fff" : "rgba(0,0,0,0.5)",
                      border: "1px solid rgba(255,255,255,0.6)",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: 0,
                    }}
                  >
                    {t.enabled && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
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
                  <Input
                    value={t.text}
                    onChange={(e) => updateTitle(t.id, e.target.value)}
                    placeholder="Title variant"
                    style={{
                      flex: 1,
                      opacity: t.enabled ? 1 : 0.5,
                      border: `1px solid ${lines > 2 ? "rgba(255,180,60,0.5)" : "var(--border-default)"}`,
                    }}
                  />
                  <button
                    onClick={() => removeTitle(t.id)}
                    aria-label="Remove title"
                    className="focus-ring"
                    style={{
                      flexShrink: 0,
                      width: 22,
                      height: 22,
                      borderRadius: 999,
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid var(--border-default)",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: 0,
                      color: "var(--text-muted)",
                    }}
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M6 6l12 12M18 6L6 18"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                </div>
                {lines > 2 && (
                  <span style={{ marginLeft: 26, fontSize: 11, color: "rgba(255,180,60,0.85)" }}>
                    &#9888; clips after 2 lines
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
      <button
        onClick={() => addTitle("")}
        className="focus-ring"
        style={{
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
        }}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
          <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
        Add title
      </button>
    </div>
  );
}

type FetchStatus =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "error"; message: string };

interface ChannelLookupResponse {
  name?: string;
  avatar?: string | null;
  verified?: boolean;
  error?: string;
}

function ChannelHandleField() {
  const updateTestCard = useFeed((s) => s.updateTestCard);
  const [handle, setHandle] = useState("");
  const [status, setStatus] = useState<FetchStatus>({ kind: "idle" });

  const fetchChannel = async () => {
    const query = handle.replace(/^@/, "").trim();
    if (!query) return;
    setStatus({ kind: "loading" });
    try {
      const res = await fetch(`/api/channel?handle=${encodeURIComponent(query)}`);
      const data = (await res.json()) as ChannelLookupResponse;
      if (res.ok && data.name) {
        updateTestCard({
          channelName: data.name,
          channelAvatarSrc: data.avatar ?? null,
          verified: !!data.verified,
        });
        setStatus({ kind: "idle" });
      } else {
        setStatus({ kind: "error", message: data.error ?? "Channel not found." });
      }
    } catch {
      setStatus({ kind: "error", message: "Lookup failed." });
    }
  };

  const loading = status.kind === "loading";

  return (
    <Field label="Channel handle" hint="fetches name + avatar">
      <div style={{ display: "flex", gap: 8 }}>
        <div style={{ position: "relative", flex: 1 }}>
          <span
            style={{
              position: "absolute",
              left: 12,
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--text-faint)",
              fontSize: 14,
              pointerEvents: "none",
            }}
          >
            @
          </span>
          <input
            value={handle}
            onChange={(e) => setHandle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                void fetchChannel();
              }
            }}
            placeholder="MrBeast"
            className="focus-ring"
            style={{
              width: "100%",
              height: 36,
              padding: "0 12px 0 26px",
              borderRadius: 8,
              background: "var(--bg-sunken)",
              border: "1px solid var(--border-default)",
              color: "var(--text-primary)",
              fontSize: 14,
              fontFamily: "inherit",
              outline: "none",
            }}
          />
        </div>
        <button
          onClick={() => void fetchChannel()}
          disabled={loading || !handle.trim()}
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
            cursor: handle.trim() ? "pointer" : "not-allowed",
            opacity: !loading && handle.trim() ? 1 : 0.6,
            whiteSpace: "nowrap",
          }}
        >
          {loading ? "…" : "Fetch"}
        </button>
      </div>
      {status.kind === "error" && (
        <span
          style={{
            display: "block",
            marginTop: 6,
            fontSize: 11,
            color: "#ff8f8f",
          }}
        >
          {status.message}
        </span>
      )}
    </Field>
  );
}

export function EditorPanel() {
  const feed = useFeed();
  const card = feed.testCard;
  const titleLines = lineCount(card.title);

  return (
    <aside
      className="glass-dark anim-fade"
      style={{
        width: 360,
        flexShrink: 0,
        height: "100%",
        overflowY: "auto",
        borderRadius: 0,
        borderTop: "none",
        borderRight: "none",
        borderBottom: "none",
        padding: "0 20px 40px",
      }}
    >
      <div
        className="glass-sticky"
        style={{ position: "sticky", top: 0, margin: "0 -20px", padding: "18px 20px 28px", zIndex: 2 }}
      >
        <div className="eyebrow" style={{ marginBottom: 8 }}>
          Editor
        </div>
        <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600, letterSpacing: "-0.02em" }}>
          Set up your test
        </h2>
        <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--text-muted)" }}>
          Every edit lands in the live feed instantly.
        </p>
      </div>

      <Section title="Thumbnail">
        <Field label="Mode" hint="test one or many">
          <Seg
            value={feed.thumbMode}
            onChange={feed.setThumbMode}
            options={[
              { value: "single", label: "Single" },
              { value: "multiple", label: "Multiple" },
            ]}
          />
        </Field>
        {feed.thumbMode === "single" ? (
          <Dropzone
            onFile={(file) => feed.updateTestCard({ imageSrc: URL.createObjectURL(file) })}
            hasImage={!!card.imageSrc}
            previewSrc={card.imageSrc}
            label="Drop a .png (16:9) or click to upload"
            height={132}
          />
        ) : (
          <>
            <Dropzone
              onFiles={(files) => feed.addThumbnails(files.map((f) => URL.createObjectURL(f)))}
              multiple
              hasImage={false}
              label="Drop or click to add thumbnails (multiple)"
              height={92}
            />
            <ThumbnailGrid />
          </>
        )}
        <div style={{ height: 14 }} />
        <Field label="Fit">
          <Seg
            value={card.imageFit}
            onChange={(v) => feed.updateTestCard({ imageFit: v })}
            options={[
              { value: "cover", label: "Cover" },
              { value: "contain", label: "Contain" },
            ]}
          />
        </Field>
        <Field label="Duration badge" hint="e.g. 12:34 or LIVE">
          <Input
            value={card.duration}
            onChange={(e) => feed.updateTestCard({ duration: e.target.value })}
            placeholder="12:34"
          />
        </Field>
        <Toggle
          checked={card.showDuration}
          onChange={(v) => feed.updateTestCard({ showDuration: v })}
          label="Show duration badge"
        />
        <Field label="Watched progress">
          <RangeRow
            value={card.watchedPercent}
            min={0}
            max={100}
            onChange={(v) => feed.updateTestCard({ watchedPercent: v })}
            suffix="%"
          />
        </Field>
      </Section>

      <Section title="Details">
        <Field label="Mode" hint="test one or many">
          <Seg
            value={feed.titleMode}
            onChange={feed.setTitleMode}
            options={[
              { value: "single", label: "Single" },
              { value: "multiple", label: "Multiple" },
            ]}
          />
        </Field>
        {feed.titleMode === "single" ? (
          <Field
            label="Title"
            hint={titleLines > 2 ? "⚠ clips after 2 lines" : `${titleLines} line${titleLines > 1 ? "s" : ""}`}
          >
            <textarea
              value={card.title}
              onChange={(e) => feed.updateTestCard({ title: e.target.value })}
              rows={2}
              className="focus-ring"
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: 8,
                background: "var(--bg-sunken)",
                border: `1px solid ${titleLines > 2 ? "rgba(255,180,60,0.5)" : "var(--border-default)"}`,
                color: "var(--text-primary)",
                fontSize: 14,
                fontFamily: "inherit",
                resize: "vertical",
                outline: "none",
              }}
            />
          </Field>
        ) : (
          <TitleList />
        )}
        <ChannelHandleField />
        <Field label="Channel name" hint="auto-filled from handle">
          <Input
            value={card.channelName}
            onChange={(e) => feed.updateTestCard({ channelName: e.target.value })}
          />
        </Field>
        <Field label="Channel avatar" hint="auto-filled, or override">
          <Dropzone
            onFile={(file) => feed.updateTestCard({ channelAvatarSrc: URL.createObjectURL(file) })}
            hasImage={!!card.channelAvatarSrc}
            previewSrc={card.channelAvatarSrc}
            label="Upload avatar (else auto monogram)"
            height={72}
          />
        </Field>
        <Toggle
          checked={card.verified}
          onChange={(v) => feed.updateTestCard({ verified: v })}
          label="Verified badge"
        />
        <Field label="View count" hint="number auto-formats">
          <Input
            value={String(card.viewCount)}
            onChange={(e) => feed.updateTestCard({ viewCount: e.target.value })}
            placeholder="124K or 1240000"
          />
        </Field>
        <Field label="Upload age">
          <select
            value={isPresetAge(card.uploadedAt) ? card.uploadedAt : "__custom__"}
            onChange={(e) => {
              if (e.target.value !== "__custom__") {
                feed.updateTestCard({ uploadedAt: e.target.value });
              }
            }}
            className="focus-ring"
            style={{
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
            }}
          >
            {AGE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
            <option value="__custom__">Custom…</option>
          </select>
          {!isPresetAge(card.uploadedAt) && (
            <div style={{ marginTop: 8 }}>
              <Input
                value={card.uploadedAt}
                onChange={(e) => feed.updateTestCard({ uploadedAt: e.target.value })}
                placeholder="e.g. 4 days ago"
              />
            </div>
          )}
        </Field>
      </Section>

      <Section title="Competitors">
        <CompetitorsSection />
      </Section>

      <Section title="Placement">
        <Field label="Position" hint={feed.placement === "manual" ? "dragged" : undefined}>
          <Seg
            value={feed.placement}
            onChange={feed.setPlacement}
            options={[
              { value: "first", label: "First" },
              { value: "random", label: "Random" },
              { value: "manual", label: "Manual" },
            ]}
          />
        </Field>
        {feed.placement === "manual" && (
          <p
            style={{
              margin: "8px 0 10px",
              fontSize: 11.5,
              lineHeight: 1.5,
              color: "var(--text-faint)",
            }}
          >
            Drag your card onto any card in the feed to move it there. Pick
            First or Random to drop the arrangement.
          </p>
        )}
        <button
          onClick={() => feed.reshuffle()}
          className="focus-ring"
          style={{
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
          }}
        >
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
          Reshuffle feed
        </button>
      </Section>

      <Section title="View">
        <Field label="Surface" hint="where to test">
          <Seg
            value={feed.viewMode}
            onChange={feed.setViewMode}
            options={[
              { value: "desktop", label: "Desktop" },
              { value: "mobile", label: "Mobile" },
              { value: "watch", label: "Watch" },
            ]}
          />
        </Field>
        <Field label="Theme">
          <Seg
            value={feed.theme}
            onChange={feed.setTheme}
            options={[
              { value: "dark", label: "Dark" },
              { value: "light", label: "Light" },
            ]}
          />
        </Field>
        {feed.viewMode === "desktop" && (
          <Field
            label="Columns"
            hint={
              feed.columns === "auto"
                ? feed.gridMetrics
                  ? `${feed.gridMetrics.width}px → ${feed.gridMetrics.autoCols}`
                  : "auto (responsive)"
                : "pinned — ignores width"
            }
          >
            <Seg
              value={String(feed.columns) as "auto" | "3" | "4"}
              onChange={(v) => feed.setColumns(v === "auto" ? "auto" : (Number(v) as Columns))}
              options={[
                { value: "auto", label: "Auto" },
                { value: "3", label: "3" },
                { value: "4", label: "4" },
              ]}
            />
            {feed.columns === "auto" && (
              <p
                style={{
                  margin: "8px 0 0",
                  fontSize: 11,
                  lineHeight: 1.5,
                  color: "var(--text-faint)",
                }}
              >
                Measured from the feed itself, not the window: this panel and
                the guide rail take about 430px off it, so the count sits below
                what youtube.com shows at the same window size. A column is
                worth {AUTO_COLUMN_STEP}px — hide the guide (☰) or collapse
                this panel to gain one.
              </p>
            )}
            {feed.columns !== "auto" && (
              <p
                style={{
                  margin: "8px 0 0",
                  fontSize: 11,
                  lineHeight: 1.5,
                  color: "var(--text-faint)",
                }}
              >
                The feed is locked to {feed.columns} columns, so resizing the
                window or collapsing the guide will not change it. Pick{" "}
                <strong style={{ fontWeight: 600 }}>Auto</strong> to follow
                YouTube&rsquo;s own sizing.
              </p>
            )}
          </Field>
        )}
        {feed.viewMode === "watch" && (
          <p style={{ margin: "2px 0 0", fontSize: 11, color: "var(--text-faint)", lineHeight: 1.5 }}>
            Your thumbnail appears in the recommendations sidebar. Use Placement to put it at
            the top (First) or further down (Random).
          </p>
        )}
      </Section>

      <Section title="Analyze">
        <Field label="Squint / blur test" hint="readability proxy">
          <RangeRow value={feed.blur} min={0} max={12} onChange={feed.setBlur} suffix="px" />
        </Field>
        <Toggle checked={feed.grayscale} onChange={feed.setGrayscale} label="Grayscale (value contrast)" />
        <Toggle
          checked={feed.showSafeAreaOverlay}
          onChange={feed.setShowSafeArea}
          label="Safe-area / badge occlusion"
        />
        <Toggle
          checked={feed.highlightTestCard}
          onChange={feed.setHighlight}
          label="Highlight my card (editing aid)"
        />
        <p style={{ margin: "8px 0 0", fontSize: 11, color: "var(--text-faint)", lineHeight: 1.5 }}>
          Keep highlight OFF for an honest blind test. Your card should be indistinguishable
          from the rest of the feed.
        </p>
      </Section>

      <div
        style={{
          marginTop: 20,
          padding: "12px 14px",
          borderRadius: 10,
          background: "var(--bg-sunken)",
          border: "1px solid var(--border-default)",
          fontSize: 11.5,
          lineHeight: 1.55,
          color: "var(--text-muted)",
        }}
      >
        <span style={{ color: "var(--text-secondary)", fontWeight: 600 }}>Tip</span> · Click
        any thumbnail in the feed to open it up. You get a closer look plus export and copy
        options.
      </div>
    </aside>
  );
}
