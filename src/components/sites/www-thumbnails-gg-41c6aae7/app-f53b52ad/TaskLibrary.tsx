"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";

import { PLACEHOLDER_THUMB } from "@/lib/sites/www-thumbnails-gg-41c6aae7/app-f53b52ad/format";
import {
  blobUrl,
  deleteTask,
  duplicateTask,
  listTasks,
  renameTask,
} from "@/lib/sites/www-thumbnails-gg-41c6aae7/app-f53b52ad/taskDb";
import type { TaskSummary } from "@/types/tasks";

function relativeTime(ts: number): string {
  const secs = Math.max(0, Math.round((Date.now() - ts) / 1000));
  if (secs < 60) return "just now";
  const mins = Math.round(secs / 60);
  if (mins < 60) return `${mins} min${mins === 1 ? "" : "s"} ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;
  const months = Math.round(days / 30);
  if (months < 12) return `${months} month${months === 1 ? "" : "s"} ago`;
  const years = Math.round(months / 12);
  return `${years} year${years === 1 ? "" : "s"} ago`;
}

const SURFACE_LABEL: Record<string, string> = {
  desktop: "Desktop",
  mobile: "Mobile",
  watch: "Watch",
};

function Pill({ children }: { children: React.ReactNode }) {
  return (
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
      {children}
    </span>
  );
}

/** The cover image for one task, resolved from IndexedDB. */
function Cover({ blobId, alt }: { blobId: string | null; alt: string }) {
  // Keyed by blobId so a changed id derives back to the placeholder during
  // render rather than needing a synchronous setState inside the effect.
  const [resolved, setResolved] = useState<{
    id: string | null;
    url: string | null;
  }>({ id: null, url: null });
  const src = resolved.id === blobId ? resolved.url : null;

  useEffect(() => {
    if (!blobId) return;
    let alive = true;
    let created: string | null = null;
    void blobUrl(blobId).then((url) => {
      if (!alive) {
        if (url) URL.revokeObjectURL(url);
        return;
      }
      created = url;
      setResolved({ id: blobId, url });
    });
    return () => {
      alive = false;
      if (created) URL.revokeObjectURL(created);
    };
  }, [blobId]);

  return (
    <div
      style={{
        aspectRatio: "16 / 9",
        background: "var(--bg-sunken)",
        borderRadius: 10,
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src ?? PLACEHOLDER_THUMB}
        alt={alt}
        draggable={false}
        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
      />
    </div>
  );
}

function IconPlus() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
    </svg>
  );
}

function TaskCard({
  task,
  onChanged,
}: {
  task: TaskSummary;
  onChanged: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(task.name);

  const commitRename = async () => {
    setEditing(false);
    const next = draft.trim();
    if (!next || next === task.name) return;
    await renameTask(task.id, next);
    onChanged();
  };

  const badges = [
    SURFACE_LABEL[task.viewMode] ?? task.viewMode,
    task.thumbMode === "multiple" && task.thumbnailCount > 0
      ? `${task.thumbnailCount} thumbnails`
      : null,
    task.titleCount > 0 ? `${task.titleCount} titles` : null,
    task.competitorCount > 0
      ? `${task.competitorCount} competitor${task.competitorCount === 1 ? "" : "s"}`
      : null,
  ].filter(Boolean) as string[];

  return (
    <div
      className="tool-card glass-1"
      style={{
        borderRadius: 14,
        padding: 12,
        display: "flex",
        flexDirection: "column",
        gap: 10,
        position: "relative",
      }}
    >
      <Link
        href={`/app?task=${encodeURIComponent(task.id)}`}
        className="focus-ring"
        style={{ display: "block", borderRadius: 10, textDecoration: "none" }}
        aria-label={`Open ${task.name}`}
      >
        <Cover blobId={task.coverBlobId} alt="" />
      </Link>

      <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}>
        {editing ? (
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={() => void commitRename()}
            onKeyDown={(e) => {
              if (e.key === "Enter") void commitRename();
              if (e.key === "Escape") {
                setDraft(task.name);
                setEditing(false);
              }
            }}
            className="focus-ring fx"
            style={{
              height: 30,
              padding: "0 8px",
              borderRadius: 7,
              background: "var(--bg-sunken)",
              border: "1px solid var(--border-default)",
              color: "var(--text-primary)",
              fontSize: 14,
              fontFamily: "inherit",
              outline: "none",
            }}
          />
        ) : (
          <button
            onClick={() => {
              setDraft(task.name);
              setEditing(true);
            }}
            className="focus-ring"
            title="Rename"
            style={{
              background: "transparent",
              border: "none",
              padding: 0,
              textAlign: "left",
              fontFamily: "inherit",
              fontSize: 14,
              fontWeight: 600,
              letterSpacing: "-0.01em",
              color: "var(--text-primary)",
              cursor: "pointer",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {task.name}
          </button>
        )}

        {/* The default task name is the video title, so only show the title
            when the user has renamed the test to something different. */}
        {task.title !== task.name && (
          <span
            style={{
              fontSize: 12,
              color: "var(--text-muted)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {task.title}
          </span>
        )}
        <span style={{ fontSize: 11, color: "var(--text-faint)" }}>
          {task.channelName} · {relativeTime(task.updatedAt)}
        </span>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
        {badges.map((b) => (
          <Pill key={b}>{b}</Pill>
        ))}
      </div>

      <div style={{ display: "flex", gap: 6, marginTop: "auto", paddingTop: 4 }}>
        <Link
          href={`/app?task=${encodeURIComponent(task.id)}`}
          className="focus-ring"
          style={{
            flex: 1,
            height: 32,
            borderRadius: 8,
            border: "1px solid var(--border-default)",
            background: "var(--glass-1-bg)",
            color: "var(--text-secondary)",
            fontSize: 12.5,
            fontWeight: 500,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            textDecoration: "none",
          }}
        >
          Open
        </Link>
        <button
          onClick={async () => {
            setBusy(true);
            await duplicateTask(task.id);
            setBusy(false);
            onChanged();
          }}
          disabled={busy}
          className="focus-ring"
          title="Duplicate"
          aria-label={`Duplicate ${task.name}`}
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            border: "1px solid var(--border-default)",
            background: "transparent",
            color: "var(--text-muted)",
            cursor: busy ? "default" : "pointer",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <rect
              x="9"
              y="9"
              width="11"
              height="11"
              rx="2"
              stroke="currentColor"
              strokeWidth="1.8"
            />
            <path
              d="M5 15V6a1 1 0 011-1h9"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        </button>
        <button
          onClick={async () => {
            if (!confirming) {
              setConfirming(true);
              return;
            }
            setBusy(true);
            await deleteTask(task.id);
            setBusy(false);
            onChanged();
          }}
          onBlur={() => setConfirming(false)}
          disabled={busy}
          className="focus-ring"
          title={confirming ? "Click again to delete" : "Delete"}
          aria-label={`Delete ${task.name}`}
          style={{
            width: confirming ? 72 : 32,
            height: 32,
            borderRadius: 8,
            border: `1px solid ${confirming ? "#ff6b6b" : "var(--border-default)"}`,
            background: confirming ? "rgba(255,107,107,0.12)" : "transparent",
            color: confirming ? "#ff8f8f" : "var(--text-muted)",
            cursor: busy ? "default" : "pointer",
            fontSize: 11.5,
            fontWeight: 600,
            fontFamily: "inherit",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "width var(--dur-fast) var(--ease-out)",
          }}
        >
          {confirming ? (
            "Sure?"
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path
                d="M5 7h14M9 7V5h6v2M7 7l1 12h8l1-12"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}

export function TaskLibrary() {
  const [tasks, setTasks] = useState<TaskSummary[] | null>(null);
  const [failed, setFailed] = useState(false);
  const mounted = useRef(true);

  const refresh = useCallback(() => {
    listTasks()
      .then((t) => {
        if (mounted.current) setTasks(t);
      })
      .catch(() => {
        if (mounted.current) {
          setFailed(true);
          setTasks([]);
        }
      });
  }, []);

  useEffect(() => {
    mounted.current = true;
    refresh();
    return () => {
      mounted.current = false;
    };
  }, [refresh]);

  return (
    <main
      style={{
        minHeight: "100dvh",
        position: "relative",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div className="ambient" />

      <header
        className="tool-topbar"
        style={{ position: "sticky", top: 0, justifyContent: "space-between" }}
      >
        <span className="tool-brand">
          <span className="tool-wordmark">
            <span
              style={{
                fontFamily: "var(--font-sans), sans-serif",
                fontWeight: 600,
                letterSpacing: "-0.03em",
                fontSize: 17,
                lineHeight: 1,
                color: "var(--text-primary)",
                whiteSpace: "nowrap",
              }}
            >
              thumbnails
            </span>
          </span>
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
        </span>
        <Link href="/app" className="tprimary focus-ring" style={{ textDecoration: "none" }}>
          <IconPlus />
          New test
        </Link>
      </header>

      <section
        style={{
          flex: 1,
          width: "100%",
          maxWidth: "var(--page-max)",
          margin: "0 auto",
          padding: "40px 24px 80px",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div className="eyebrow" style={{ marginBottom: 10 }}>
          Library
        </div>
        <h1
          style={{
            margin: "0 0 6px",
            fontSize: 30,
            fontWeight: 600,
            letterSpacing: "-0.02em",
            color: "var(--text-primary)",
          }}
        >
          Your tests
        </h1>
        <p style={{ margin: "0 0 28px", fontSize: 13.5, color: "var(--text-muted)" }}>
          Every test you run is saved here automatically, thumbnail and all.
        </p>

        {failed && (
          <p style={{ fontSize: 12.5, color: "#ff8f8f", marginBottom: 20 }}>
            Saved tests are unavailable — this browser is blocking local storage
            (private windows often do). Testing still works, but nothing will be kept.
          </p>
        )}

        {tasks === null ? (
          <p style={{ fontSize: 13, color: "var(--text-faint)" }}>Loading…</p>
        ) : tasks.length === 0 ? (
          <div
            className="glass-1"
            style={{
              borderRadius: 14,
              padding: "48px 24px",
              textAlign: "center",
            }}
          >
            <h2
              style={{
                margin: "0 0 6px",
                fontSize: 17,
                fontWeight: 600,
                letterSpacing: "-0.01em",
                color: "var(--text-primary)",
              }}
            >
              No tests yet
            </h2>
            <p
              style={{
                margin: "0 0 20px",
                fontSize: 13,
                color: "var(--text-muted)",
                lineHeight: 1.55,
              }}
            >
              Drop a thumbnail into a pixel-accurate YouTube feed and see how it
              reads before you publish.
            </p>
            <Link
              href="/app"
              className="tprimary focus-ring"
              style={{ textDecoration: "none" }}
            >
              <IconPlus />
              Create your first test
            </Link>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(268px, 1fr))",
              gap: 16,
            }}
          >
            {tasks.map((t) => (
              <TaskCard key={t.id} task={t} onChanged={refresh} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
