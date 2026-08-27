"use client";

import { create } from "zustand";
import type { FeedState, TestCard } from "@/types/thumbnails-app";

function uid(): string {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `t${Date.now()}${Math.random()}`;
}

const DEFAULT_TEST_CARD: TestCard = {
  id: "__test__",
  imageSrc: null,
  imageFit: "cover",
  duration: "12:34",
  showDuration: true,
  watchedPercent: 0,
  title: "Your Title Goes Here",
  channelName: "mattos",
  channelAvatarSrc: null,
  verified: false,
  viewCount: "124K",
  uploadedAt: "3d",
};

export const useFeed = create<FeedState>((set) => ({
  theme: "dark",
  viewMode: "desktop",
  columns: "auto",
  placement: "first",
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
              { id: uid(), src: s.testCard.imageSrc, enabled: true },
            ],
          }
        : { thumbMode },
    ),

  addThumbnails: (srcs) =>
    set((s) => ({
      thumbnails: [
        ...s.thumbnails,
        ...srcs.map((src) => ({ id: uid(), src, enabled: true })),
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
  setPlacement: (placement) => set({ placement }),
  reshuffle: () => set({ seed: Math.floor(1e9 * Math.random()) + 1 }),
  setBlur: (blur) => set({ blur }),
  setGrayscale: (grayscale) => set({ grayscale }),
  setShowSafeArea: (showSafeAreaOverlay) => set({ showSafeAreaOverlay }),
  setHighlight: (highlightTestCard) => set({ highlightTestCard }),
  updateTestCard: (patch) =>
    set((s) => ({ testCard: { ...s.testCard, ...patch } })),

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
