"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { TaskRecord } from "@/types/tasks";

import { getTask, saveTask } from "./taskDb";
import {
  fromTaskRecord,
  isWorthSaving,
  toTaskRecord,
  type FeedSnapshot,
} from "./taskSnapshot";
import { useFeed } from "./store";

export type SaveState = "idle" | "saving" | "saved" | "error";

const DEBOUNCE_MS = 900;

/** The slice of store state a saved task owns. */
function snapshot(): FeedSnapshot {
  const s = useFeed.getState();
  return {
    testCard: s.testCard,
    thumbMode: s.thumbMode,
    thumbnails: s.thumbnails,
    titleMode: s.titleMode,
    titles: s.titles,
    placement: s.placement,
    theme: s.theme,
    viewMode: s.viewMode,
    columns: s.columns,
    blur: s.blur,
    grayscale: s.grayscale,
    showSafeAreaOverlay: s.showSafeAreaOverlay,
    highlightTestCard: s.highlightTestCard,
    feedSource: s.feedSource,
    competitors: s.competitors,
  };
}

/**
 * Loads a task into the store on mount and persists edits back to IndexedDB.
 *
 * Saves are debounced and only start once the user has actually changed
 * something, so opening the tester and leaving does not litter the library with
 * empty tests.
 */
export function useTaskAutosave(taskId: string | null) {
  const [state, setState] = useState<SaveState>("idle");
  const [name, setName] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  // Mirrors idRef as state so consumers re-render when a brand-new test is
  // first assigned an id (sharing needs a stable one to point at).
  const [savedId, setSavedId] = useState<string | null>(taskId);

  // The last persisted record, so re-saves can reuse existing blob ids.
  const recordRef = useRef<TaskRecord | null>(null);
  const idRef = useRef<string | null>(taskId);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inFlightRef = useRef(false);
  const dirtyRef = useRef(false);

  // ---- load -------------------------------------------------------------
  useEffect(() => {
    let alive = true;
    idRef.current = taskId;
    recordRef.current = null;
    setSavedId(taskId);
    setLoaded(false);

    const run = async () => {
      if (!taskId) {
        useFeed.getState().resetAll();
        if (alive) {
          setName(null);
          setLoaded(true);
        }
        return;
      }
      try {
        const task = await getTask(taskId);
        if (!alive) return;
        if (!task) {
          useFeed.getState().resetAll();
          setName(null);
          setLoaded(true);
          return;
        }
        recordRef.current = task;
        useFeed.getState().hydrate(await fromTaskRecord(task));
        if (!alive) return;
        setName(task.name);
        setState("saved");
      } catch {
        if (alive) setState("error");
      } finally {
        if (alive) setLoaded(true);
      }
    };

    void run();
    return () => {
      alive = false;
    };
  }, [taskId]);

  // ---- save -------------------------------------------------------------
  const flush = useCallback(async () => {
    if (inFlightRef.current) {
      dirtyRef.current = true;
      return;
    }
    const snap = snapshot();
    if (!isWorthSaving(snap) && !recordRef.current) return;

    inFlightRef.current = true;
    setState("saving");
    try {
      // Re-read rather than trusting the cached record: fields this hook does
      // not own — `share`, above all — are written straight to the database by
      // other components, and a stale base would silently revert them.
      const existing = idRef.current
        ? ((await getTask(idRef.current)) ?? recordRef.current)
        : recordRef.current;
      const record = await toTaskRecord(snap, existing, {
        id: idRef.current ?? undefined,
        name: name ?? undefined,
      });
      await saveTask(record);
      recordRef.current = record;
      idRef.current = record.id;
      setSavedId(record.id);
      // A test created from scratch has no `?task=` yet. Put it in the address
      // bar without a navigation, so reloading (or sharing the tab) reopens the
      // same test rather than starting an empty one.
      if (typeof window !== "undefined") {
        const url = new URL(window.location.href);
        if (url.searchParams.get("task") !== record.id) {
          url.searchParams.set("task", record.id);
          window.history.replaceState(null, "", url);
        }
      }
      setName((n) => n ?? record.name);
      setState("saved");
    } catch {
      setState("error");
    } finally {
      inFlightRef.current = false;
      if (dirtyRef.current) {
        dirtyRef.current = false;
        void flush();
      }
    }
  }, [name]);

  // Subscribe to the store and debounce a save on any task-owned change.
  useEffect(() => {
    if (!loaded) return;
    const unsub = useFeed.subscribe(() => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => void flush(), DEBOUNCE_MS);
    });
    return () => {
      unsub();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [loaded, flush]);

  const rename = useCallback(
    async (next: string) => {
      const trimmed = next.trim();
      if (!trimmed) return;
      setName(trimmed);
      const current = idRef.current
        ? ((await getTask(idRef.current)) ?? recordRef.current)
        : recordRef.current;
      if (current) {
        const updated = { ...current, name: trimmed, updatedAt: Date.now() };
        recordRef.current = updated;
        try {
          await saveTask(updated);
          setState("saved");
        } catch {
          setState("error");
        }
      }
    },
    [],
  );

  return {
    saveState: state,
    taskName: name,
    taskId: savedId,
    loaded,
    rename,
    saveNow: flush,
  };
}
