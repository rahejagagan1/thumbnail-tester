"use client";

import { useEffect, useState } from "react";

import { getTask, setTaskStatus } from "@/lib/sites/www-thumbnails-gg-41c6aae7/app-f53b52ad/taskDb";
import type { TaskStatus } from "@/types/tasks";

/**
 * The review stages, in the order a test moves through them.
 *
 * `revision` sits third because that is where a rejected review lands; from
 * there a test goes back out for approval rather than onwards. The colours
 * carry the meaning at a glance across a grid of covers: grey is not started,
 * amber is waiting on someone, orange wants work, green is finished.
 */
export const STATUSES: ReadonlyArray<{
  value: TaskStatus;
  label: string;
  hint: string;
  color: string;
  bg: string;
}> = [
  {
    value: "draft",
    label: "First draft",
    hint: "Yours, not shown to anyone yet",
    color: "#a5adbb",
    bg: "rgba(165,173,187,0.14)",
  },
  {
    value: "review",
    label: "For approval",
    hint: "Sent out, waiting on a verdict",
    color: "#f0b429",
    bg: "rgba(240,180,41,0.14)",
  },
  {
    value: "revision",
    label: "Changes needed",
    hint: "Came back with notes to work through",
    color: "#f2704a",
    bg: "rgba(242,112,74,0.15)",
  },
  {
    value: "final",
    label: "Final approval",
    hint: "Last look before it ships",
    color: "#7aa2f7",
    bg: "rgba(122,162,247,0.16)",
  },
  {
    value: "done",
    label: "Completed",
    hint: "Signed off and published",
    color: "#3dd68c",
    bg: "rgba(61,214,140,0.14)",
  },
];

const STATUS_BY_VALUE = new Map(STATUSES.map((s) => [s.value, s]));

/** A stored status that is no longer in the table still has to render. */
export function statusOf(value: TaskStatus) {
  return STATUS_BY_VALUE.get(value) ?? STATUSES[0];
}

/**
 * Reads the stage of the task being edited.
 *
 * The tester holds the test in the feed store, which knows nothing about review
 * stages — they belong to the saved record — so the toolbar reads this one
 * field straight from the database.
 */
export function useTaskStatus(taskId: string | null): [TaskStatus, (s: TaskStatus) => void] {
  // Stamped with the id it was read for, so switching tests shows a first
  // draft while the new one loads rather than the previous test's stage.
  const [loaded, setLoaded] = useState<{ id: string; status: TaskStatus } | null>(null);

  useEffect(() => {
    if (!taskId) return;
    let alive = true;
    void getTask(taskId).then((task) => {
      if (alive && task) setLoaded({ id: taskId, status: task.status });
    });
    return () => {
      alive = false;
    };
  }, [taskId]);

  const status = loaded?.id === taskId ? loaded.status : "draft";
  const set = (next: TaskStatus) => {
    if (taskId) setLoaded({ id: taskId, status: next });
  };
  return [status, set];
}

function IconCaret() {
  return (
    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6 9l6 6 6-6"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * The stage a test is at, and the picker behind it. Writes the choice to the
 * saved record itself, then reports it.
 */
export function TaskStatusChip({
  taskId,
  status,
  onChanged,
  align = "left",
  compact = false,
}: {
  taskId: string;
  status: TaskStatus;
  onChanged?: (next: TaskStatus) => void;
  align?: "left" | "right";
  /** Toolbar sizing: shorter, and the label alone without the hints. */
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const current = statusOf(status);

  const move = async (value: TaskStatus) => {
    setOpen(false);
    if (value === status) return;
    setBusy(true);
    try {
      await setTaskStatus(taskId, value);
      onChanged?.(value);
    } finally {
      setBusy(false);
    }
  };

  return (
    <span style={{ position: "relative", display: "inline-flex" }}>
      <button
        onClick={() => setOpen((v) => !v)}
        disabled={busy}
        className="focus-ring"
        aria-haspopup="menu"
        aria-expanded={open}
        // Named for what the control does, not just what it reads: the visible
        // text is the value, which on its own says nothing about changing it.
        aria-label={`Stage: ${current.label} — change`}
        title={`${current.label} — click to change`}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: compact ? 5 : 6,
          height: compact ? 21 : 24,
          padding: compact ? "0 7px" : "0 9px",
          borderRadius: 999,
          border: `1px solid ${current.color}55`,
          background: current.bg,
          color: current.color,
          fontSize: compact ? 10.5 : 11,
          fontWeight: 600,
          letterSpacing: "0.01em",
          fontFamily: "inherit",
          cursor: "pointer",
          maxWidth: "100%",
        }}
      >
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: 999,
            background: current.color,
            flexShrink: 0,
          }}
        />
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {current.label}
        </span>
        <IconCaret />
      </button>

      {open && (
        <>
          <button
            aria-label="Close"
            onClick={() => setOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 40,
              background: "transparent",
              border: "none",
              cursor: "default",
            }}
          />
          <div
            className="tmenu glass-2 anim-scale"
            role="menu"
            style={{
              width: 234,
              padding: 8,
              ...(align === "left" ? { left: 0, right: "auto" } : {}),
              background: "var(--bg-elevated-2)",
              backdropFilter: "none",
              WebkitBackdropFilter: "none",
            }}
          >
            {STATUSES.map((option) => {
              const active = option.value === status;
              return (
                <button
                  key={option.value}
                  role="menuitemradio"
                  aria-checked={active}
                  onClick={() => void move(option.value)}
                  className="focus-ring"
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 8,
                    width: "100%",
                    padding: "7px 8px",
                    borderRadius: 8,
                    border: "none",
                    background: active ? "var(--glass-1-bg)" : "transparent",
                    color: "var(--text-secondary)",
                    textAlign: "left",
                    fontFamily: "inherit",
                    cursor: "pointer",
                  }}
                >
                  <span
                    style={{
                      width: 7,
                      height: 7,
                      marginTop: 5,
                      borderRadius: 999,
                      background: option.color,
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ minWidth: 0 }}>
                    <span
                      style={{
                        display: "block",
                        fontSize: 12.5,
                        fontWeight: active ? 600 : 500,
                        color: active ? "var(--text-primary)" : "var(--text-secondary)",
                      }}
                    >
                      {option.label}
                    </span>
                    <span style={{ display: "block", fontSize: 10.5, color: "var(--text-faint)" }}>
                      {option.hint}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </>
      )}
    </span>
  );
}
