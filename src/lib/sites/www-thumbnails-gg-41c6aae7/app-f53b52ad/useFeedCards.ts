"use client";

import { useEffect, useMemo, useState } from "react";

import { FALLBACK_VIDEOS } from "@/data/sites/www-thumbnails-gg-41c6aae7/app-f53b52ad/fallbackVideos";
import { VIDEO_POOL } from "@/data/sites/www-thumbnails-gg-41c6aae7/app-f53b52ad/videoPool";
import {
  INITIAL_FLASH,
  type CardViewModel,
  type FlashState,
  type PoolVideo,
} from "@/types/thumbnails-app";

import {
  PLACEHOLDER_THUMB,
  formatAge,
  formatViews,
  hashString,
  seededShuffle,
} from "./format";
import { useFeed } from "./store";

/** The bundled pool wins when it has entries; the offline list is the fallback. */
const INITIAL_POOL: PoolVideo[] =
  VIDEO_POOL.length > 0 ? VIDEO_POOL : FALLBACK_VIDEOS;

/**
 * The surrounding videos, refreshed from the live endpoint when one answers.
 * The bundled list stands in until then, so the feed is never empty.
 */
export function useVideoPool(): PoolVideo[] {
  const [pool, setPool] = useState<PoolVideo[]>(INITIAL_POOL);

  useEffect(() => {
    let alive = true;
    fetch("/api/videos")
      .then((r) => r.json())
      .then((data: { videos?: PoolVideo[] }) => {
        if (alive && Array.isArray(data?.videos) && data.videos.length > 0) {
          setPool(data.videos);
        }
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  return pool;
}

/**
 * Builds the feed: the surrounding videos plus the test card(s) placed among
 * them.
 *
 * Lives outside the page component because the tester and the read-only shared
 * view must lay a test out identically — a shared link that arranged the feed
 * differently from what the author saw would defeat the point.
 */
export function useFeedCards(
  pool: PoolVideo[],
  flash: FlashState = INITIAL_FLASH,
): { cards: CardViewModel[]; activePool: PoolVideo[] } {
  const feed = useFeed();
  const testCard = feed.testCard;
  const flashActive = flash.phase !== "idle";

  // Either the random pool, or the top videos pulled from the competitor
  // channels the user pinned.
  const competitorVideos = useMemo<PoolVideo[]>(() => {
    const enabled = feed.competitors.filter((c) => c.enabled);
    const merged: PoolVideo[] = [];
    const seen = new Set<string>();
    for (const c of enabled) {
      for (const v of c.videos) {
        if (seen.has(v.id)) continue;
        seen.add(v.id);
        merged.push(v);
      }
    }
    return merged;
  }, [feed.competitors]);

  // Falls back to the pool while no competitor has loaded, so the feed is
  // never empty.
  const activePool =
    feed.feedSource === "competitors" && competitorVideos.length > 0
      ? competitorVideos
      : pool;

  const cards = useMemo<CardViewModel[]>(() => {
    const shuffled = seededShuffle(
      activePool,
      flashActive ? flash.seed : feed.seed,
    ).map<CardViewModel>((v) => ({
      id: v.id,
      thumb: v.thumb ?? null,
      imageFit: "cover",
      title: v.title,
      channel: v.channel,
      avatar: v.avatar,
      verified: v.verified,
      views: v.views,
      age: v.age,
      duration: v.duration,
      showDuration: true,
      watchedPercent: 0,
      isTest: false,
    }));

    const shared = {
      imageFit: testCard.imageFit,
      channel: testCard.channelName,
      avatar: testCard.channelAvatarSrc,
      verified: testCard.verified,
      views: formatViews(testCard.viewCount),
      age: formatAge(testCard.uploadedAt),
      duration: testCard.duration,
      showDuration: testCard.showDuration,
      watchedPercent: testCard.watchedPercent,
      isTest: true as const,
    };

    const activeTitles =
      feed.titleMode === "multiple" ? feed.titles.filter((t) => t.enabled) : [];
    const titleFor = (key: string) =>
      activeTitles.length
        ? activeTitles[
            hashString(`title${feed.seed}_${key}`) % activeTitles.length
          ].text
        : testCard.title;

    let mine: CardViewModel[];
    if (feed.thumbMode === "multiple") {
      mine =
        feed.thumbnails.length === 0
          ? [
              {
                id: "__test__",
                thumb: PLACEHOLDER_THUMB,
                title: titleFor("__test__"),
                isPlaceholder: true,
                ...shared,
              },
            ]
          : feed.thumbnails
              .filter((t) => t.enabled)
              .map((t) => ({
                id: `__test__${t.id}`,
                thumb: t.src,
                title: titleFor(t.id),
                ...shared,
              }));
    } else {
      mine = [
        {
          id: "__test__",
          thumb: testCard.imageSrc ?? PLACEHOLDER_THUMB,
          title: titleFor("__test__"),
          isPlaceholder: !testCard.imageSrc,
          ...shared,
        },
      ];
    }

    const out = [...shuffled];
    if (flashActive) {
      out.splice(Math.max(0, Math.min(flash.index, out.length)), 0, ...mine);
    } else if (feed.placement === "first") {
      out.unshift(...mine);
    } else {
      mine.forEach((card, i) => {
        const span = Math.min(out.length + 1, 12);
        out.splice(hashString(`pos${feed.seed}_${i}`) % span, 0, card);
      });
    }
    return out;
  }, [
    activePool,
    feed.seed,
    feed.placement,
    testCard,
    feed.thumbMode,
    feed.thumbnails,
    feed.titleMode,
    feed.titles,
    flashActive,
    flash.index,
    flash.seed,
  ]);

  return { cards, activePool };
}
