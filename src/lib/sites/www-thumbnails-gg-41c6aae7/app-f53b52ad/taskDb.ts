"use client";

import type { ShareInfo } from "@/types/share";
import type { TaskRecord, TaskStatus, TaskSummary } from "@/types/tasks";

import { DEFAULT_CARD_CHANNEL } from "./store";

/**
 * IndexedDB persistence for saved tests.
 *
 * Two stores:
 *   `tasks` — small JSON-clonable records, indexed by `updatedAt`
 *   `blobs` — the actual image Blobs, referenced by id from a task
 *
 * Blobs are kept out of the task record so the library grid can list tasks
 * without pulling megabytes of image data, and so a single oversized upload
 * can't bloat every read.
 *
 * localStorage was not an option here: a 1280x720 PNG is comfortably over 1MB,
 * and base64 adds another third on top of a ~5MB total budget.
 */

const DB_NAME = "thumbnails-tester";
const DB_VERSION = 1;
const TASKS = "tasks";
const BLOBS = "blobs";

let dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
  if (typeof indexedDB === "undefined") {
    return Promise.reject(new Error("IndexedDB is not available."));
  }
  if (dbPromise) return dbPromise;

  dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(TASKS)) {
        const store = db.createObjectStore(TASKS, { keyPath: "id" });
        store.createIndex("updatedAt", "updatedAt");
      }
      if (!db.objectStoreNames.contains(BLOBS)) {
        db.createObjectStore(BLOBS);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error("Could not open the database."));
  });

  // A failed open should not poison every later call.
  dbPromise.catch(() => {
    dbPromise = null;
  });
  return dbPromise;
}

function tx<T>(
  store: string,
  mode: IDBTransactionMode,
  run: (s: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const t = db.transaction(store, mode);
        const req = run(t.objectStore(store));
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error ?? new Error("Database request failed."));
      }),
  );
}

export function newId(): string {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `t${Date.now()}${Math.random().toString(36).slice(2)}`;
}

/* ------------------------------------------------------------------ */
/* blobs                                                               */
/* ------------------------------------------------------------------ */

export async function putBlob(blob: Blob, id = newId()): Promise<string> {
  await tx(BLOBS, "readwrite", (s) => s.put(blob, id));
  return id;
}

export async function getBlob(id: string): Promise<Blob | null> {
  const b = await tx<Blob | undefined>(BLOBS, "readonly", (s) => s.get(id));
  return b ?? null;
}

export async function deleteBlob(id: string): Promise<void> {
  await tx(BLOBS, "readwrite", (s) => s.delete(id));
}

/** Resolves a blob id to an object URL the browser can render. */
export async function blobUrl(id: string): Promise<string | null> {
  const b = await getBlob(id);
  return b ? URL.createObjectURL(b) : null;
}

/** Turns a `blob:` object URL back into a stored Blob. */
export async function storeObjectUrl(url: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return await putBlob(await res.blob());
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------ */
/* tasks                                                               */
/* ------------------------------------------------------------------ */

export async function saveTask(task: TaskRecord): Promise<void> {
  await tx(TASKS, "readwrite", (s) => s.put(task));
}

/**
 * The placeholder channel name shipped before the clone's author credit was
 * stripped. Tests saved back then still carry it, so it is swapped for the
 * current placeholder on the way out and persisted by the next autosave.
 *
 * Only an untouched card matches, so a channel name the user actually typed is
 * never rewritten. Delete this once no old tests are left in the wild.
 */
const RETIRED_DEFAULT_CHANNEL = "mattos";

/** Brings a stored record up to the current shape. */
function normalize(t: TaskRecord): TaskRecord {
  return {
    ...t,
    // `share` post-dates the first release, so records written before it exist
    // without the field.
    share: t.share ?? null,
    // Same for `status`: everything saved before review stages existed is a
    // first draft.
    status: t.status ?? "draft",
    card:
      t.card.channelName === RETIRED_DEFAULT_CHANNEL
        ? { ...t.card, channelName: DEFAULT_CARD_CHANNEL }
        : t.card,
  };
}

export async function getTask(id: string): Promise<TaskRecord | null> {
  const t = await tx<TaskRecord | undefined>(TASKS, "readonly", (s) => s.get(id));
  return t ? normalize(t) : null;
}

export async function listTasks(): Promise<TaskSummary[]> {
  const all = await tx<TaskRecord[]>(TASKS, "readonly", (s) => s.getAll());
  return all
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .map(normalize)
    .map((t) => ({
      id: t.id,
      name: t.name,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
      coverBlobId: t.coverBlobId,
      shareId: t.share?.id ?? null,
      status: t.status,
      title: t.card.title,
      channelName: t.card.channelName,
      viewMode: t.viewMode,
      thumbMode: t.thumbMode,
      thumbnailCount: t.thumbnails.length,
      titleCount: t.titles.length,
      competitorCount: t.competitors.length,
    }));
}

/** Removes the task and every blob only it referenced. */
export async function deleteTask(id: string): Promise<void> {
  const task = await getTask(id);
  if (task) {
    const ids = new Set<string>();
    if (task.coverBlobId) ids.add(task.coverBlobId);
    if (task.card.imageBlobId) ids.add(task.card.imageBlobId);
    if (task.card.channelAvatarIsBlob && task.card.channelAvatar) {
      ids.add(task.card.channelAvatar);
    }
    task.thumbnails.forEach((t) => ids.add(t.blobId));

    // Never delete a blob another task still points at.
    const others = await tx<TaskRecord[]>(TASKS, "readonly", (s) => s.getAll());
    for (const other of others) {
      if (other.id === id) continue;
      if (other.coverBlobId) ids.delete(other.coverBlobId);
      if (other.card.imageBlobId) ids.delete(other.card.imageBlobId);
      if (other.card.channelAvatarIsBlob && other.card.channelAvatar) {
        ids.delete(other.card.channelAvatar);
      }
      other.thumbnails.forEach((t) => ids.delete(t.blobId));
    }
    await Promise.all([...ids].map((b) => deleteBlob(b).catch(() => {})));
  }
  await tx(TASKS, "readwrite", (s) => s.delete(id));
}

export async function duplicateTask(id: string): Promise<string | null> {
  const task = await getTask(id);
  if (!task) return null;
  const now = Date.now();
  const copy: TaskRecord = {
    ...task,
    id: newId(),
    name: `${task.name} copy`,
    createdAt: now,
    updatedAt: now,
    // A copy is a new test; it must not inherit the original's public link.
    share: null,
  };
  await saveTask(copy);
  return copy.id;
}

export async function renameTask(id: string, name: string): Promise<void> {
  const task = await getTask(id);
  if (!task) return;
  await saveTask({ ...task, name, updatedAt: Date.now() });
}

/**
 * Moves a test to another review stage.
 *
 * Like `setTaskShare`, this leaves `updatedAt` alone: the library is ordered by
 * when a test was last *edited*, and having it jump to the front because
 * someone ticked it off would lose that ordering.
 */
export async function setTaskStatus(
  id: string,
  status: TaskStatus,
): Promise<void> {
  const task = await getTask(id);
  if (!task) return;
  await saveTask({ ...task, status });
}

/** Records (or clears) the share link a test has been published under. */
export async function setTaskShare(
  id: string,
  share: ShareInfo | null,
): Promise<void> {
  const task = await getTask(id);
  if (!task) return;
  // Deliberately does not bump `updatedAt`: publishing is not an edit, and
  // re-ordering the library on share would be surprising.
  await saveTask({ ...task, share });
}
