"use client";

import type { CreateShareResponse, ShareInfo, SharedTask } from "@/types/share";
import type { TaskRecord } from "@/types/tasks";
import type { CardFeedback } from "@/types/thumbnails-app";

import { getBlob, getTask, newId, putBlob, saveTask } from "./taskDb";

/** Where a viewer loads one of a share's images from. */
export function shareAssetUrl(shareId: string, assetId: string): string {
  return `/api/share/${encodeURIComponent(shareId)}/asset/${encodeURIComponent(assetId)}`;
}

export function shareLink(id: string): string {
  return `${window.location.origin}/s/${id}`;
}

/** Every blob id a task points at, deduplicated. */
function blobIdsOf(task: TaskRecord): string[] {
  const ids = new Set<string>();
  if (task.coverBlobId) ids.add(task.coverBlobId);
  if (task.card.imageBlobId) ids.add(task.card.imageBlobId);
  if (task.card.channelAvatarIsBlob && task.card.channelAvatar) {
    ids.add(task.card.channelAvatar);
  }
  task.thumbnails.forEach((t) => ids.add(t.blobId));
  return [...ids];
}

/** Drops the fields that only mean something inside the author's browser. */
function stripLocalFields(task: TaskRecord): SharedTask["task"] {
  const { id: _id, share: _share, ...rest } = task;
  void _id;
  void _share;
  return rest;
}

/**
 * Packs a saved test into the multipart body the share API expects.
 *
 * Only locally-stored images travel with the share. Competitor thumbnails are
 * already public `i.ytimg.com` URLs and are left as references, which keeps a
 * share with a full competitor feed roughly the size of one PNG.
 */
async function buildShareForm(task: TaskRecord): Promise<FormData> {
  const form = new FormData();

  form.append(
    "manifest",
    JSON.stringify({
      name: task.name,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      task: stripLocalFields(task),
    }),
  );

  for (const id of blobIdsOf(task)) {
    const blob = await getBlob(id);
    if (!blob) continue;
    const type = blob.type || "image/png";
    form.append(`asset:${id}`, new File([blob], id, { type }), id);
  }

  return form;
}

/** Uploads a saved test and returns its public link. */
export async function publishTask(
  task: TaskRecord,
): Promise<CreateShareResponse> {
  const res = await fetch("/api/share", {
    method: "POST",
    body: await buildShareForm(task),
  });
  if (!res.ok) throw new Error(await errorFrom(res, "Could not create the share link."));
  return (await res.json()) as CreateShareResponse;
}

/**
 * Pushes the current state of a test into an existing share.
 *
 * Keeps the same link, so a URL already pasted into a chat keeps working and
 * starts showing the newer version.
 */
export async function republishTask(
  task: TaskRecord,
  share: ShareInfo,
): Promise<void> {
  const res = await fetch(`/api/share/${encodeURIComponent(share.id)}`, {
    method: "PUT",
    headers: { "x-share-secret": share.secret },
    body: await buildShareForm(task),
  });
  if (!res.ok) throw new Error(await errorFrom(res, "Could not update the link."));
}

async function errorFrom(res: Response, fallback: string): Promise<string> {
  const detail = await res.json().catch(() => null);
  return detail?.error ?? fallback;
}

export async function revokeShare(id: string, secret: string): Promise<void> {
  const res = await fetch(`/api/share/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: { "x-share-secret": secret },
  });
  // A share that is already gone is the outcome the caller wanted.
  if (!res.ok && res.status !== 404) {
    throw new Error("Could not revoke the link.");
  }
}

/**
 * Takes down a test's link, if it has one.
 *
 * Called before deleting a task: without it, deleting a shared test would leave
 * the published copy readable by anyone holding the link, with nothing left in
 * the library to revoke it from.
 */
export async function revokeShareForTask(taskId: string): Promise<void> {
  const task = await getTask(taskId);
  if (!task?.share) return;
  try {
    await revokeShare(task.share.id, task.share.secret);
  } catch {
    /* deletion should still proceed if the server is unreachable */
  }
}

export async function fetchShare(id: string): Promise<SharedTask | null> {
  const res = await fetch(`/api/share/${encodeURIComponent(id)}`);
  if (!res.ok) return null;
  return (await res.json()) as SharedTask;
}

/**
 * Copies a shared test into this browser's library.
 *
 * Assets are pulled down and re-stored under fresh blob ids so the copy is
 * fully local: it keeps working after the original share is revoked, and
 * editing it cannot reach back into anyone else's test.
 */
export async function importSharedTask(share: SharedTask): Promise<string> {
  const remap = new Map<string, string>();

  for (const asset of share.assets) {
    try {
      const res = await fetch(shareAssetUrl(share.shareId, asset.id));
      if (!res.ok) continue;
      remap.set(asset.id, await putBlob(await res.blob()));
    } catch {
      /* a missing image should not sink the whole import */
    }
  }

  const src = share.task;
  const now = Date.now();
  const mapped = (id: string | null) => (id ? (remap.get(id) ?? null) : null);

  const record: TaskRecord = {
    ...src,
    id: newId(),
    name: share.name,
    createdAt: now,
    updatedAt: now,
    share: null,
    coverBlobId: mapped(src.coverBlobId),
    card: {
      ...src.card,
      imageBlobId: mapped(src.card.imageBlobId),
      channelAvatar: src.card.channelAvatarIsBlob
        ? mapped(src.card.channelAvatar)
        : src.card.channelAvatar,
    },
    thumbnails: src.thumbnails
      .map((t) => ({ ...t, blobId: remap.get(t.blobId) ?? "" }))
      .filter((t) => t.blobId !== ""),
  };

  await saveTask(record);
  return record.id;
}

/* ------------------------------------------------------------------ */
/* feedback                                                            */
/* ------------------------------------------------------------------ */

const VIEWER_ID_KEY = "thumbnails.viewerId";
const VIEWER_NAME_KEY = "thumbnails.viewerName";

/**
 * A stable id for this browser, so a reviewer can take their own like back
 * without touching anyone else's.
 *
 * Deliberately not an identity: it is random, local, and tells the server
 * nothing about who the person is. If storage is unavailable the id is
 * per-page-load, which costs the ability to un-like after a reload — an
 * acceptable trade for never blocking the page.
 */
export function getViewerId(): string {
  const fresh = () =>
    `v_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
  if (typeof window === "undefined") return fresh();
  try {
    const held = window.localStorage.getItem(VIEWER_ID_KEY);
    if (held) return held;
    const made = fresh();
    window.localStorage.setItem(VIEWER_ID_KEY, made);
    return made;
  } catch {
    return fresh();
  }
}

export function getViewerName(fallback: string): string {
  if (typeof window === "undefined") return fallback;
  try {
    return window.localStorage.getItem(VIEWER_NAME_KEY) || fallback;
  } catch {
    return fallback;
  }
}

export function setViewerName(name: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(VIEWER_NAME_KEY, name);
  } catch {
    /* nothing to do; the name just will not survive a reload */
  }
}

export async function fetchShareFeedback(
  shareId: string,
): Promise<Record<string, CardFeedback>> {
  const res = await fetch(`/api/share/${encodeURIComponent(shareId)}/feedback`, {
    cache: "no-store",
  });
  if (!res.ok) return {};
  const body = (await res.json()) as { feedback?: Record<string, CardFeedback> };
  return body.feedback ?? {};
}

export async function pushCardFeedback(
  shareId: string,
  cardId: string,
  feedback: CardFeedback,
): Promise<void> {
  await fetch(`/api/share/${encodeURIComponent(shareId)}/feedback`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ cardId, feedback }),
  });
}
