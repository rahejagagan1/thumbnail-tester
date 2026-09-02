"use client";

import { useEffect } from "react";

import { fetchShareFeedback, getViewerId, pushCardFeedback } from "./shareClient";
import { useFeed } from "./store";

/**
 * Keeps a test's likes and comments in step with its share.
 *
 * Reactions are the one part of a test that flows *back* from the people you
 * sent the link to, so they cannot live in the author's IndexedDB alone. When a
 * test has a share id, this pulls the pooled reactions down and pushes every
 * local change up; with no share id it does nothing and reactions stay local.
 *
 * Both sides call this — the tester at `/app` and the read-only shared page —
 * so the author and the reviewer are looking at the same pool.
 *
 * @param shareId  the share to sync against, or null for a purely local test
 * @param viewerName  display name for comments left in this session
 */
export function useShareFeedback(
  shareId: string | null,
  viewerName: string,
): void {
  // Identify this session before anything can be liked, so a like is never
  // attributed to the placeholder "author" id on a shared page.
  // The caller decides the display name — "You" in the tester, the reviewer's
  // own name on a shared page — so this must not second-guess it by re-reading
  // storage, or the author would sign their notes with their guest name.
  useEffect(() => {
    useFeed.getState().setViewer(getViewerId(), viewerName);
  }, [viewerName]);

  useEffect(() => {
    if (!shareId) {
      useFeed.getState().setFeedbackSink(null);
      return;
    }

    let alive = true;

    void (async () => {
      const remote = await fetchShareFeedback(shareId);
      if (!alive) return;
      // The server holds everyone's reactions, so it wins per card; cards it
      // has never heard of keep whatever is local.
      useFeed.setState((s) => ({ feedback: { ...s.feedback, ...remote } }));
    })();

    useFeed.getState().setFeedbackSink((cardId, next) => {
      void pushCardFeedback(shareId, cardId, next).catch(() => {
        /* the reaction still shows locally; the next sync reconciles */
      });
    });

    return () => {
      alive = false;
      useFeed.getState().setFeedbackSink(null);
    };
  }, [shareId]);
}
