"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  publishTask,
  republishTask,
  revokeShare,
  shareLink,
} from "@/lib/sites/www-thumbnails-gg-41c6aae7/app-f53b52ad/shareClient";
import {
  getTask,
  setTaskShare,
} from "@/lib/sites/www-thumbnails-gg-41c6aae7/app-f53b52ad/taskDb";
import type { ShareInfo } from "@/types/share";

function IconLink() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" width="14" height="14">
      <path
        d="M10 13.5a3.5 3.5 0 005 0l3-3a3.5 3.5 0 00-5-5l-1 1M14 10.5a3.5 3.5 0 00-5 0l-3 3a3.5 3.5 0 005 5l1-1"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Clipboard API needs a secure context; selecting the text always works. */
async function copyText(text: string, input: HTMLInputElement | null) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    input?.select();
    return false;
  }
}

interface SharePopoverProps {
  /** The saved test to publish. Null until a new test has been saved once. */
  taskId: string | null;
  /** Flushes any pending edits so the share reflects what is on screen. */
  beforeShare?: () => Promise<void>;
  /** Anchor the panel to the button's left or right edge. */
  align?: "left" | "right";
  /** Compact styling for the library grid. */
  compact?: boolean;
  onChanged?: () => void;
}

/**
 * Publishes a saved test to a link, and manages that link afterwards.
 *
 * A share is a snapshot, not a live mirror: the viewer sees the test as it was
 * when it was published. Rather than hide that, the panel compares the test's
 * `updatedAt` against the snapshot and offers to refresh the same link when the
 * author has since edited.
 */
export function SharePopover({
  taskId,
  beforeShare,
  align = "left",
  compact = false,
  onChanged,
}: SharePopoverProps) {
  const [open, setOpen] = useState(false);
  const [share, setShare] = useState<ShareInfo | null>(null);
  const [staleSince, setStaleSince] = useState(false);
  const [busy, setBusy] = useState<null | "create" | "update" | "revoke">(null);
  const [error, setError] = useState<string | null>(null);
  const [ephemeral, setEphemeral] = useState(false);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    if (!taskId) return;
    const task = await getTask(taskId);
    setShare(task?.share ?? null);
    setStaleSince(
      Boolean(task?.share && task.updatedAt > task.share.snapshotOf),
    );
  }, [taskId]);

  // Escape closes the panel, matching the rest of the toolbar's popovers.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    setError(null);
    setCopied(false);
    void (async () => {
      await beforeShare?.();
      await load();
    })();
    // `beforeShare` is a stable callback from the autosave hook.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, load]);

  const run = async (
    kind: "create" | "update" | "revoke",
    fn: () => Promise<void>,
  ) => {
    setBusy(kind);
    setError(null);
    try {
      await fn();
      onChanged?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy(null);
    }
  };

  const create = () =>
    run("create", async () => {
      await beforeShare?.();
      if (!taskId) throw new Error("Save the test before sharing it.");
      const task = await getTask(taskId);
      if (!task) throw new Error("This test is no longer saved.");

      const result = await publishTask(task);
      const info: ShareInfo = {
        id: result.id,
        secret: result.secret,
        createdAt: Date.now(),
        snapshotOf: task.updatedAt,
      };
      await setTaskShare(taskId, info);
      setShare(info);
      setStaleSince(false);
      setEphemeral(result.ephemeral);
    });

  const update = () =>
    run("update", async () => {
      await beforeShare?.();
      if (!taskId || !share) return;
      const task = await getTask(taskId);
      if (!task) throw new Error("This test is no longer saved.");

      await republishTask(task, share);
      const info: ShareInfo = { ...share, snapshotOf: task.updatedAt };
      await setTaskShare(taskId, info);
      setShare(info);
      setStaleSince(false);
    });

  const revoke = () =>
    run("revoke", async () => {
      if (!taskId || !share) return;
      await revokeShare(share.id, share.secret);
      await setTaskShare(taskId, null);
      setShare(null);
      setStaleSince(false);
    });

  const link = share ? shareLink(share.id) : "";
  const label = share ? "Shared" : "Share";

  return (
    <span style={{ position: "relative", display: "inline-flex" }}>
      <button
        type="button"
        className={compact ? "focus-ring" : "tbtn focus-ring"}
        data-active={open || Boolean(share)}
        disabled={!taskId}
        onClick={() => setOpen((v) => !v)}
        title={
          taskId
            ? share
              ? "Manage the share link"
              : "Create a link to this test"
            : "Add a thumbnail or a title first"
        }
        style={
          compact
            ? {
                width: 32,
                height: 32,
                borderRadius: 8,
                border: `1px solid ${share ? "var(--border-strong)" : "var(--border-default)"}`,
                background: share ? "var(--glass-1-bg)" : "transparent",
                color: share ? "var(--text-secondary)" : "var(--text-muted)",
                cursor: taskId ? "pointer" : "default",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              }
            : { height: 26, padding: "0 9px", fontSize: 11.5, gap: 5 }
        }
        aria-label={compact ? "Share this test" : undefined}
      >
        <IconLink />
        {!compact && label}
        {!compact && share && <span className="tdot" />}
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
              width: 306,
              background: "var(--bg-elevated-2)",
              backdropFilter: "none",
              WebkitBackdropFilter: "none",
              ...(align === "left" ? { left: 0, right: "auto" } : {}),
            }}
          >
            <div className="eyebrow" style={{ marginBottom: 10 }}>
              Share this test
            </div>

            {!share ? (
              <>
                <p
                  style={{
                    margin: "0 0 12px",
                    fontSize: 12,
                    lineHeight: 1.55,
                    color: "var(--text-muted)",
                  }}
                >
                  Publish a copy to a link. Anyone who opens it sees the feed
                  exactly as you set it up — thumbnail, titles and competitors —
                  without needing an account.
                </p>
                <button
                  type="button"
                  className="tprimary focus-ring"
                  onClick={create}
                  disabled={busy !== null}
                  style={{ width: "100%", justifyContent: "center" }}
                >
                  {busy === "create" ? "Creating link…" : "Create link"}
                </button>
              </>
            ) : (
              <>
                <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
                  <input
                    ref={inputRef}
                    readOnly
                    value={link}
                    onFocus={(e) => e.currentTarget.select()}
                    className="focus-ring fx"
                    style={{
                      flex: 1,
                      minWidth: 0,
                      height: 30,
                      padding: "0 8px",
                      borderRadius: 7,
                      background: "var(--bg-sunken)",
                      border: "1px solid var(--border-default)",
                      color: "var(--text-secondary)",
                      fontSize: 11.5,
                      fontFamily: "var(--font-mono), monospace",
                      outline: "none",
                    }}
                  />
                  <button
                    type="button"
                    className="tbtn focus-ring"
                    onClick={async () => {
                      await copyText(link, inputRef.current);
                      setCopied(true);
                      window.setTimeout(() => setCopied(false), 1600);
                    }}
                    style={{ height: 30, padding: "0 10px", fontSize: 11.5 }}
                  >
                    {copied ? "Copied" : "Copy"}
                  </button>
                </div>

                {staleSince && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 8,
                      padding: "8px 9px",
                      marginBottom: 10,
                      borderRadius: 8,
                      border: "1px solid var(--border-default)",
                      background: "var(--glass-1-bg)",
                    }}
                  >
                    <span style={{ fontSize: 11.5, color: "var(--text-muted)" }}>
                      Edited since you shared.
                    </span>
                    <button
                      type="button"
                      className="tbtn focus-ring"
                      onClick={update}
                      disabled={busy !== null}
                      style={{ height: 26, padding: "0 9px", fontSize: 11.5 }}
                    >
                      {busy === "update" ? "Updating…" : "Update link"}
                    </button>
                  </div>
                )}

                <div className="tmenu-sub" style={{ marginBottom: 10 }}>
                  Anyone with this link can view the test and save their own
                  copy. They cannot change yours.
                </div>

                <button
                  type="button"
                  className="tbtn focus-ring"
                  onClick={revoke}
                  disabled={busy !== null}
                  style={{
                    width: "100%",
                    justifyContent: "center",
                    height: 30,
                    fontSize: 11.5,
                  }}
                >
                  {busy === "revoke" ? "Revoking…" : "Revoke link"}
                </button>
              </>
            )}

            {ephemeral && (
              <div
                style={{
                  marginTop: 10,
                  fontSize: 11,
                  lineHeight: 1.5,
                  color: "#ffcf8f",
                }}
              >
                This host stores shares on a temporary disk, so the link may stop
                working after a while.
              </div>
            )}
            {error && (
              <div
                style={{
                  marginTop: 10,
                  fontSize: 11.5,
                  lineHeight: 1.5,
                  color: "#ff8f8f",
                }}
              >
                {error}
              </div>
            )}
          </div>
        </>
      )}
    </span>
  );
}
