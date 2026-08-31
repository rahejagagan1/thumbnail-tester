import type { TaskRecord } from "./tasks";

/**
 * The publicly readable half of a share.
 *
 * It is a saved task with the local-only fields removed. Image blob ids are
 * kept verbatim — the viewer resolves them against
 * `/api/share/<id>/asset/<blobId>` instead of IndexedDB.
 */
export interface SharedTask {
  /** Share id, not the author's local task id. */
  shareId: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  task: Omit<TaskRecord, "id" | "share">;
  /** Every image bundled with the share. */
  assets: ShareAsset[];
}

export interface ShareAsset {
  id: string;
  contentType: string;
  bytes: number;
}

/** What the author keeps locally so they can re-copy or revoke the link. */
export interface ShareInfo {
  id: string;
  /** Bearer token for revoking or updating; never leaves the author's browser. */
  secret: string;
  createdAt: number;
  /**
   * The task's `updatedAt` at the moment it was published. A share is a
   * snapshot, so comparing this against the live task tells the author when the
   * link has fallen behind their edits.
   */
  snapshotOf: number;
}

export interface CreateShareResponse {
  id: string;
  secret: string;
  url: string;
  /**
   * True when the host cannot keep the share (serverless filesystems are wiped
   * between invocations). Surfaced to the author rather than failing silently.
   */
  ephemeral: boolean;
}
