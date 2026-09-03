"use client";

import { create } from "zustand";
import type { CardFeedback, FeedState, TestCard } from "@/types/thumbnails-app";

const EMPTY_FEEDBACK: CardFeedback = { likes: [], comments: [] };

function uid(): string {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `t${Date.now()}${Math.random()}`;
}

/**
 * Placeholder copy on an untouched test card.
 *
 * Exported because "still the default" is what decides whether a session is
 * worth saving — see `isWorthSaving`. Keeping one definition means a reworded
 * placeholder can never silently start saving empty tests.
 */
export const DEFAULT_CARD_TITLE = "Your Title Goes Here";
export const DEFAULT_CARD_CHANNEL = "Your Channel";

const DEFAULT_TEST_CARD: TestCard = {
  id: "__test__",
  imageSrc: null,
  imageFit: "cover",
  duration: "12:34",
  showDuration: true,
  watchedPercent: 0,
  title: DEFAULT_CARD_TITLE,
  channelName: DEFAULT_CARD_CHANNEL,
  channelAvatarSrc: null,
  verified: false,
  viewCount: "124K",
  uploadedAt: "3d",
};

export const useFeed = create<FeedState>((set) => ({
  theme: "dark",
  viewMode: "desktop",
  columns: "auto",
  gridMetrics: null,
  placement: "first",
  slots: {},
  feedback: {},
  guideDefault: false,
  guideOpen: null,
  // Overwritten on a shared page, where each viewer gets their own id.
  viewerId: "author",
  viewerName: "You",
  seed: 1,
  blur: 0,
  grayscale: false,
  showSafeAreaOverlay: false,
  highlightTestCard: false,
  testCard: DEFAULT_TEST_CARD,
  thumbMode: "single",
  thumbnails: [],
  titleMode: "single",
  titles: [],
  inspect: null,
  uploadHandler: null,
  dropHandler: null,

  feedSource: "random",
  competitors: [],
  competitorsLoading: false,

  setUploadHandler: (fn) => set({ uploadHandler: fn }),
  setDropHandler: (fn) => set({ dropHandler: fn }),
  setTheme: (theme) => set({ theme }),
  setInspect: (inspect) => set({ inspect }),
  setViewMode: (viewMode) => set({ viewMode }),

  setThumbMode: (thumbMode) =>
    set((s) =>
      thumbMode === "multiple" &&
      s.testCard.imageSrc &&
      !s.thumbnails.some((t) => t.src === s.testCard.imageSrc)
        ? {
            thumbMode,
            thumbnails: [
              ...s.thumbnails,
              { id: uid(), src: s.testCard.imageSrc, enabled: true, title: null },
            ],
          }
        : { thumbMode },
    ),

  addThumbnails: (srcs) =>
    set((s) => ({
      thumbnails: [
        ...s.thumbnails,
        ...srcs.map((src) => ({ id: uid(), src, enabled: true, title: null })),
      ],
    })),
  toggleThumbnail: (id) =>
    set((s) => ({
      thumbnails: s.thumbnails.map((t) =>
        t.id === id ? { ...t, enabled: !t.enabled } : t,
      ),
    })),
  removeThumbnail: (id) =>
    set((s) => ({ thumbnails: s.thumbnails.filter((t) => t.id !== id) })),
  // An empty box means "no title of my own", not "an empty title": clearing the
  // field has to hand the card back to the shared title rather than draw blank.
  setThumbnailTitle: (id, title) =>
    set((s) => ({
      thumbnails: s.thumbnails.map((t) =>
        t.id === id ? { ...t, title: title && title.trim() ? title : null } : t,
      ),
    })),

  setTitleMode: (titleMode) => set({ titleMode }),
  addTitle: (text) =>
    set((s) => ({ titles: [...s.titles, { id: uid(), text, enabled: true }] })),
  updateTitle: (id, text) =>
    set((s) => ({
      titles: s.titles.map((t) => (t.id === id ? { ...t, text } : t)),
    })),
  toggleTitle: (id) =>
    set((s) => ({
      titles: s.titles.map((t) =>
        t.id === id ? { ...t, enabled: !t.enabled } : t,
      ),
    })),
  removeTitle: (id) =>
    set((s) => ({ titles: s.titles.filter((t) => t.id !== id) })),

  setColumns: (columns) => set({ columns }),
  // Same numbers in, same object out: the observer re-measures on every layout
  // change, and a fresh object each time would re-render the editor for nothing.
  setGridMetrics: (m) =>
    set((s) =>
      s.gridMetrics?.width === m.width && s.gridMetrics.autoCols === m.autoCols
        ? {}
        : { gridMetrics: m },
    ),
  // Leaving manual placement throws the dragged positions away: keeping them
  // around would make "First" and "Random" silently ignore a later drag.
  setPlacement: (placement) =>
    set(placement === "manual" ? { placement } : { placement, slots: {} }),

  moveCardTo: (cardId, index) =>
    set((s) => ({
      placement: "manual",
      slots: { ...s.slots, [cardId]: Math.max(0, index) },
    })),
  clearSlots: () => set({ slots: {}, placement: "first" }),

  // A changed default means the surface itself moved (the editor opened, say),
  // so an earlier click of the menu button no longer describes what the viewer
  // wants and is dropped rather than fighting it.
  setGuideDefault: (guideDefault) =>
    set((s) =>
      s.guideDefault === guideDefault ? {} : { guideDefault, guideOpen: null },
    ),
  toggleGuide: () =>
    set((s) => ({ guideOpen: !(s.guideOpen ?? s.guideDefault) })),

  setViewer: (viewerId, viewerName) => set({ viewerId, viewerName }),

  toggleLike: (cardId) =>
    set((s) => {
      const cur = s.feedback[cardId] ?? EMPTY_FEEDBACK;
      const liked = cur.likes.includes(s.viewerId);
      const next: CardFeedback = {
        ...cur,
        likes: liked
          ? cur.likes.filter((v) => v !== s.viewerId)
          : [...cur.likes, s.viewerId],
      };
      s.feedbackSink?.(cardId, next);
      return { feedback: { ...s.feedback, [cardId]: next } };
    }),

  addComment: (cardId, text) =>
    set((s) => {
      const body = text.trim();
      if (!body) return {};
      const cur = s.feedback[cardId] ?? EMPTY_FEEDBACK;
      const next: CardFeedback = {
        ...cur,
        comments: [
          ...cur.comments,
          { id: uid(), text: body.slice(0, 600), at: Date.now(), author: s.viewerName },
        ],
      };
      s.feedbackSink?.(cardId, next);
      return { feedback: { ...s.feedback, [cardId]: next } };
    }),

  removeComment: (cardId, commentId) =>
    set((s) => {
      const cur = s.feedback[cardId];
      if (!cur) return {};
      const next: CardFeedback = {
        ...cur,
        comments: cur.comments.filter((c) => c.id !== commentId),
      };
      s.feedbackSink?.(cardId, next);
      return { feedback: { ...s.feedback, [cardId]: next } };
    }),

  feedbackSink: null,
  setFeedbackSink: (feedbackSink) => set({ feedbackSink }),
  reshuffle: () => set({ seed: Math.floor(1e9 * Math.random()) + 1 }),
  setBlur: (blur) => set({ blur }),
  setGrayscale: (grayscale) => set({ grayscale }),
  setShowSafeArea: (showSafeAreaOverlay) => set({ showSafeAreaOverlay }),
  setHighlight: (highlightTestCard) => set({ highlightTestCard }),
  updateTestCard: (patch) =>
    set((s) => ({ testCard: { ...s.testCard, ...patch } })),

  hydrate: (snap) => set(snap),

  resetAll: () =>
    set({
      testCard: DEFAULT_TEST_CARD,
      thumbMode: "single",
      thumbnails: [],
      titleMode: "single",
      titles: [],
      placement: "first",
      slots: {},
      feedback: {},
      theme: "dark",
      viewMode: "desktop",
      columns: "auto",
      blur: 0,
      grayscale: false,
      showSafeAreaOverlay: false,
      highlightTestCard: false,
      inspect: null,
      feedSource: "random",
      competitors: [],
      competitorsLoading: false,
    }),

  setFeedSource: (feedSource) => set({ feedSource }),

  addCompetitor: (url) =>
    set((s) => {
      const trimmed = url.trim();
      if (!trimmed) return {};
      // Re-adding the same channel should be a no-op, not a duplicate row.
      const key = (v: string) => v.trim().toLowerCase().replace(/\/+$/, "");
      if (s.competitors.some((c) => key(c.url) === key(trimmed))) return {};
      return {
        competitors: [
          ...s.competitors,
          {
            id: uid(),
            url: trimmed,
            enabled: true,
            status: "idle",
            channel: null,
            avatar: null,
            subscribers: null,
            sampled: 0,
            videos: [],
            error: null,
          },
        ],
      };
    }),

  removeCompetitor: (id) =>
    set((s) => ({ competitors: s.competitors.filter((c) => c.id !== id) })),

  toggleCompetitor: (id) =>
    set((s) => ({
      competitors: s.competitors.map((c) =>
        c.id === id ? { ...c, enabled: !c.enabled } : c,
      ),
    })),

  patchCompetitor: (id, patch) =>
    set((s) => ({
      competitors: s.competitors.map((c) =>
        c.id === id ? { ...c, ...patch } : c,
      ),
    })),

  setCompetitorsLoading: (competitorsLoading) => set({ competitorsLoading }),

  clearCompetitors: () => set({ competitors: [] }),
}));
