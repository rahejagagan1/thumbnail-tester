"use client";

import { useEffect, useRef, useState } from "react";

import { IconKebab } from "@/components/sites/www-thumbnails-gg-41c6aae7/shared/icons";
import { useFeed } from "@/lib/sites/www-thumbnails-gg-41c6aae7/app-f53b52ad/store";
import type { CardFeedback } from "@/types/thumbnails-app";

const EMPTY: CardFeedback = { likes: [], comments: [] };

/** "3 min ago" — comments are short-lived enough that this is all the precision needed. */
function ago(ts: number): string {
  const mins = Math.round((Date.now() - ts) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

function IconHeart({ filled }: { filled: boolean }) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"}>
      <path
        d="M12 20s-7-4.35-7-9.5A4.5 4.5 0 0112 7a4.5 4.5 0 017 3.5c0 5.15-7 9.5-7 9.5z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconSpeech() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <path
        d="M4 5.5h16v10H9l-5 3.5v-13z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const rowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 9,
  width: "100%",
  padding: "8px 10px",
  borderRadius: 7,
  border: "none",
  background: "transparent",
  color: "var(--yt-text-primary, #f1f1f1)",
  font: "inherit",
  fontSize: 13,
  cursor: "pointer",
  textAlign: "left",
};

/**
 * The card's "3 dots" menu, for reacting to a thumbnail.
 *
 * On the target this button is decorative. Here it carries the two things you
 * actually want when weighing four thumbnails against each other — a like and a
 * note — and on a shared link those come back from whoever you sent it to,
 * which is the only way the author ever sees a reviewer's opinion.
 */
export function CardMenu({ cardId, label }: { cardId: string; label?: string }) {
  const [open, setOpen] = useState(false);
  const [composing, setComposing] = useState(false);
  const [draft, setDraft] = useState("");
  const boxRef = useRef<HTMLDivElement>(null);
  const areaRef = useRef<HTMLTextAreaElement>(null);

  const feedback = useFeed((s) => s.feedback[cardId]) ?? EMPTY;
  const viewerId = useFeed((s) => s.viewerId);
  const viewerName = useFeed((s) => s.viewerName);
  const toggleLike = useFeed((s) => s.toggleLike);
  const addComment = useFeed((s) => s.addComment);
  const removeComment = useFeed((s) => s.removeComment);

  const liked = feedback.likes.includes(viewerId);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        setComposing(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (composing) areaRef.current?.focus();
  }, [composing]);

  const post = () => {
    addComment(cardId, draft);
    setDraft("");
    setComposing(false);
  };

  return (
    <span
      style={{ position: "relative", display: "inline-flex" }}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        className="yt-card-menu"
        aria-label={`Rate this thumbnail${label ? ` (${label})` : ""}`}
        aria-expanded={open}
        data-open={open || undefined}
        onClick={() => setOpen((v) => !v)}
      >
        <IconKebab size={20} />
      </button>

      {open && (
        <>
          <div
            onClick={() => {
              setOpen(false);
              setComposing(false);
            }}
            style={{ position: "fixed", inset: 0, zIndex: 60 }}
          />
          <div
            ref={boxRef}
            className="yt-card-popover"
            style={{
              position: "absolute",
              top: 26,
              right: 0,
              zIndex: 61,
              width: 268,
              padding: 6,
              borderRadius: 10,
              background: "var(--yt-bg-elevated, #282828)",
              border: "1px solid rgba(255,255,255,0.12)",
              boxShadow: "0 8px 28px rgba(0,0,0,0.5)",
            }}
          >
            <button
              type="button"
              style={{ ...rowStyle, color: liked ? "#ff6b81" : rowStyle.color }}
              onClick={() => toggleLike(cardId)}
            >
              <IconHeart filled={liked} />
              <span style={{ flex: 1 }}>{liked ? "Liked" : "Like"}</span>
              {feedback.likes.length > 0 && (
                <span style={{ fontSize: 12, opacity: 0.7 }}>
                  {feedback.likes.length}
                </span>
              )}
            </button>

            <button
              type="button"
              style={rowStyle}
              onClick={() => setComposing((v) => !v)}
            >
              <IconSpeech />
              <span style={{ flex: 1 }}>Comment</span>
              {feedback.comments.length > 0 && (
                <span style={{ fontSize: 12, opacity: 0.7 }}>
                  {feedback.comments.length}
                </span>
              )}
            </button>

            {composing && (
              <div style={{ padding: "4px 4px 2px" }}>
                <textarea
                  ref={areaRef}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    // Enter posts; Shift+Enter is a newline.
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      post();
                    }
                  }}
                  rows={3}
                  maxLength={600}
                  placeholder={`Note on this thumbnail — as ${viewerName}`}
                  style={{
                    width: "100%",
                    resize: "vertical",
                    padding: "7px 8px",
                    borderRadius: 7,
                    background: "rgba(0,0,0,0.35)",
                    border: "1px solid rgba(255,255,255,0.14)",
                    color: "inherit",
                    font: "inherit",
                    fontSize: 12.5,
                    outline: "none",
                  }}
                />
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 6, marginTop: 6 }}>
                  <button
                    type="button"
                    onClick={() => {
                      setComposing(false);
                      setDraft("");
                    }}
                    style={{
                      padding: "5px 10px",
                      borderRadius: 999,
                      border: "1px solid rgba(255,255,255,0.16)",
                      background: "transparent",
                      color: "inherit",
                      font: "inherit",
                      fontSize: 12,
                      cursor: "pointer",
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={post}
                    disabled={draft.trim() === ""}
                    style={{
                      padding: "5px 12px",
                      borderRadius: 999,
                      border: "none",
                      background: draft.trim() ? "#3ea6ff" : "rgba(255,255,255,0.12)",
                      color: draft.trim() ? "#0f0f0f" : "rgba(255,255,255,0.4)",
                      font: "inherit",
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: draft.trim() ? "pointer" : "default",
                    }}
                  >
                    Post
                  </button>
                </div>
              </div>
            )}

            {feedback.comments.length > 0 && (
              <div
                style={{
                  marginTop: 4,
                  paddingTop: 6,
                  borderTop: "1px solid rgba(255,255,255,0.1)",
                  maxHeight: 190,
                  overflowY: "auto",
                }}
              >
                {feedback.comments.map((c) => (
                  <div key={c.id} style={{ padding: "6px 8px" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "baseline",
                        gap: 6,
                        fontSize: 11.5,
                        opacity: 0.65,
                      }}
                    >
                      <span style={{ fontWeight: 600 }}>{c.author}</span>
                      <span>{ago(c.at)}</span>
                      {c.author === viewerName && (
                        <button
                          type="button"
                          onClick={() => removeComment(cardId, c.id)}
                          aria-label="Delete comment"
                          style={{
                            marginLeft: "auto",
                            border: "none",
                            background: "transparent",
                            color: "inherit",
                            cursor: "pointer",
                            font: "inherit",
                            padding: 0,
                          }}
                        >
                          ×
                        </button>
                      )}
                    </div>
                    <p
                      style={{
                        margin: "2px 0 0",
                        fontSize: 12.5,
                        lineHeight: 1.45,
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                      }}
                    >
                      {c.text}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </span>
  );
}
