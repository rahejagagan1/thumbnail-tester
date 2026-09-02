"use client";

import type { TaskRecord } from "@/types/tasks";
import type { Competitor, FeedState } from "@/types/thumbnails-app";

import { DEFAULT_CARD_CHANNEL, DEFAULT_CARD_TITLE } from "./store";
import { blobUrl, newId, storeObjectUrl } from "./taskDb";
import { MAX_COLUMNS } from "./useInfiniteScroll";

/** State the tester owns that belongs in a saved task. */
export type FeedSnapshot = Pick<
  FeedState,
  | "testCard"
  | "thumbMode"
  | "thumbnails"
  | "titleMode"
  | "titles"
  | "placement"
  | "slots"
  | "feedback"
  | "theme"
  | "viewMode"
  | "columns"
  | "blur"
  | "grayscale"
  | "showSafeAreaOverlay"
  | "highlightTestCard"
  | "feedSource"
  | "competitors"
>;

const isBlobUrl = (s: string | null): s is string =>
  typeof s === "string" && s.startsWith("blob:");

/** A readable default name, so the library isn't a wall of "Untitled". */
export function defaultTaskName(title: string): string {
  const t = title.trim();
  if (!t || t === DEFAULT_CARD_TITLE) return "Untitled test";
  return t.length > 48 ? `${t.slice(0, 47)}…` : t;
}

/**
 * Persists any freshly-uploaded images and returns a storable task record.
 *
 * Images already backed by a blob id (i.e. loaded from a saved task and left
 * untouched) are reused rather than re-stored, so repeated auto-saves do not
 * grow the database.
 */
export async function toTaskRecord(
  snap: FeedSnapshot,
  existing: TaskRecord | null,
  meta: { id?: string; name?: string } = {},
): Promise<TaskRecord> {
  const now = Date.now();
  const id = meta.id ?? existing?.id ?? newId();

  // Re-uploads produce a fresh blob: URL; anything else is already persisted.
  const imageBlobId = isBlobUrl(snap.testCard.imageSrc)
    ? ((await storeObjectUrl(snap.testCard.imageSrc)) ?? existing?.card.imageBlobId ?? null)
    : (existing?.card.imageBlobId ?? null);

  let channelAvatar: string | null = null;
  let channelAvatarIsBlob = false;
  const avatarSrc = snap.testCard.channelAvatarSrc;
  if (isBlobUrl(avatarSrc)) {
    const stored =
      (await storeObjectUrl(avatarSrc)) ??
      (existing?.card.channelAvatarIsBlob ? existing.card.channelAvatar : null);
    channelAvatar = stored;
    channelAvatarIsBlob = Boolean(stored);
  } else if (avatarSrc) {
    channelAvatar = avatarSrc;
  }

  const thumbnails: TaskRecord["thumbnails"] = [];
  for (const t of snap.thumbnails) {
    if (isBlobUrl(t.src)) {
      const prior = existing?.thumbnails.find((p) => p.id === t.id);
      const blobId = prior?.blobId ?? (await storeObjectUrl(t.src));
      if (blobId) thumbnails.push({ id: t.id, blobId, enabled: t.enabled });
    }
  }

  const coverBlobId = imageBlobId ?? thumbnails[0]?.blobId ?? null;

  return {
    id,
    name: meta.name ?? existing?.name ?? defaultTaskName(snap.testCard.title),
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
    coverBlobId,
    // Publishing is tracked separately from editing; carry it through untouched.
    share: existing?.share ?? null,
    card: {
      imageBlobId,
      imageFit: snap.testCard.imageFit,
      duration: snap.testCard.duration,
      showDuration: snap.testCard.showDuration,
      watchedPercent: snap.testCard.watchedPercent,
      title: snap.testCard.title,
      channelName: snap.testCard.channelName,
      channelAvatar,
      channelAvatarIsBlob,
      verified: snap.testCard.verified,
      viewCount: snap.testCard.viewCount,
      uploadedAt: snap.testCard.uploadedAt,
    },
    thumbMode: snap.thumbMode,
    thumbnails,
    titleMode: snap.titleMode,
    titles: snap.titles,
    placement: snap.placement,
    slots: snap.slots,
    feedback: snap.feedback,
    theme: snap.theme,
    viewMode: snap.viewMode,
    columns: snap.columns,
    blur: snap.blur,
    grayscale: snap.grayscale,
    showSafeAreaOverlay: snap.showSafeAreaOverlay,
    highlightTestCard: snap.highlightTestCard,
    feedSource: snap.feedSource,
    competitors: snap.competitors.map((c) => ({
      id: c.id,
      url: c.url,
      enabled: c.enabled,
      channel: c.channel,
      avatar: c.avatar,
      subscribers: c.subscribers,
      sampled: c.sampled,
      videos: c.videos,
    })),
  };
}

/** Turns an image reference into something an `<img>` can load. */
export type ImageResolver = (blobId: string) => Promise<string | null>;

/**
 * Rehydrates a saved task into store state.
 *
 * The resolver decides where images come from: object URLs minted from
 * IndexedDB for the author's own tests, or `/api/share/...` URLs when the same
 * record arrives over the wire as a shared test.
 */
export async function fromTaskRecord(
  task: Omit<TaskRecord, "id" | "share">,
  resolve: ImageResolver = blobUrl,
): Promise<FeedSnapshot> {
  const imageSrc = task.card.imageBlobId
    ? await resolve(task.card.imageBlobId)
    : null;

  const channelAvatarSrc = task.card.channelAvatar
    ? task.card.channelAvatarIsBlob
      ? await resolve(task.card.channelAvatar)
      : task.card.channelAvatar
    : null;

  const thumbnails = [];
  for (const t of task.thumbnails) {
    const src = await resolve(t.blobId);
    if (src) thumbnails.push({ id: t.id, src, enabled: t.enabled });
  }

  const competitors: Competitor[] = task.competitors.map((c) => ({
    id: c.id,
    url: c.url,
    enabled: c.enabled,
    status: c.videos.length > 0 ? "ready" : "idle",
    channel: c.channel,
    avatar: c.avatar,
    subscribers: c.subscribers,
    sampled: c.sampled,
    videos: c.videos,
    error: null,
  }));

  return {
    testCard: {
      id: "__test__",
      imageSrc,
      imageFit: task.card.imageFit,
      duration: task.card.duration,
      showDuration: task.card.showDuration,
      watchedPercent: task.card.watchedPercent,
      title: task.card.title,
      channelName: task.card.channelName,
      channelAvatarSrc,
      verified: task.card.verified,
      viewCount: task.card.viewCount,
      uploadedAt: task.card.uploadedAt,
    },
    thumbMode: task.thumbMode,
    thumbnails,
    titleMode: task.titleMode,
    titles: task.titles,
    placement: task.placement,
    // Saved before drag-to-place existed: fall back to no manual slots.
    slots: task.slots ?? {},
    feedback: task.feedback ?? {},
    theme: task.theme,
    viewMode: task.viewMode,
    // Tests saved when 5 was on offer, and shared links published then, would
    // otherwise reinstate a count the app no longer allows.
    columns: task.columns === "auto" || task.columns <= MAX_COLUMNS ? task.columns : MAX_COLUMNS,
    blur: task.blur,
    grayscale: task.grayscale,
    showSafeAreaOverlay: task.showSafeAreaOverlay,
    highlightTestCard: task.highlightTestCard,
    feedSource: task.feedSource,
    competitors,
  };
}

/** True once the user has done something worth persisting. */
export function isWorthSaving(snap: FeedSnapshot): boolean {
  return (
    snap.testCard.imageSrc !== null ||
    snap.thumbnails.length > 0 ||
    snap.titles.length > 0 ||
    snap.competitors.length > 0 ||
    snap.testCard.title !== DEFAULT_CARD_TITLE ||
    snap.testCard.channelName !== DEFAULT_CARD_CHANNEL
  );
}
