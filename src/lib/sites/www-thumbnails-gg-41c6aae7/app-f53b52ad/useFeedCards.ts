"use client";

import { useEffect, useMemo, useState } from "react";

import { FALLBACK_VIDEOS } from "@/data/sites/www-thumbnails-gg-41c6aae7/app-f53b52ad/fallbackVideos";
import { VIDEO_POOL } from "@/data/sites/www-thumbnails-gg-41c6aae7/app-f53b52ad/videoPool";
import {
  INITIAL_FLASH,
  type CardViewModel,
  type FlashState,
  type PoolVideo,
  type TestMode,
  type TitleVariant,
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
/** Badge letters for multi-variant tests; more than this and letters stop helping. */
const VARIANT_LABELS = "ABCDEFGH".split("");

/** Id of the test card in single-thumbnail mode; the prefix of every variant's. */
export const TEST_CARD_ID = "__test__";

/** The key a card's title was drawn with: its thumbnail variant, or the card itself. */
function titleKey(cardId: string): string {
  return cardId === TEST_CARD_ID ? TEST_CARD_ID : cardId.slice(TEST_CARD_ID.length);
}

/**
 * The title variant a test card is showing, or null when the single title is
 * in use.
 *
 * Exported so an editor writing back to an inspected card patches the variant
 * the feed actually drew, instead of guessing by matching the text it reads.
 */
export function titleVariantForCard(
  cardId: string,
  titleMode: TestMode,
  titles: TitleVariant[],
  seed: number,
): TitleVariant | null {
  if (titleMode !== "multiple") return null;
  const active = titles.filter((t) => t.enabled);
  if (active.length === 0) return null;
  return active[hashString(`title${seed}_${titleKey(cardId)}`) % active.length];
}

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

    const titleFor = (cardId: string) =>
      titleVariantForCard(cardId, feed.titleMode, feed.titles, feed.seed)?.text ??
      testCard.title;

    let mine: CardViewModel[];
    if (feed.thumbMode === "multiple") {
      mine =
        feed.thumbnails.length === 0
          ? [
              {
                id: TEST_CARD_ID,
                thumb: PLACEHOLDER_THUMB,
                title: titleFor(TEST_CARD_ID),
                isPlaceholder: true,
                ...shared,
              },
            ]
          : (() => {
              const active = feed.thumbnails.filter((t) => t.enabled);
              // With several variants in one feed the cards are otherwise
              // indistinguishable — the whole point is telling them apart.
              const labelled = active.length > 1;
              return active.map((t, i) => ({
                id: `${TEST_CARD_ID}${t.id}`,
                thumb: t.src,
                title: titleFor(`${TEST_CARD_ID}${t.id}`),
                label: labelled ? VARIANT_LABELS[i] : undefined,
                ...shared,
              }));
            })();
    } else {
      mine = [
        {
          id: TEST_CARD_ID,
          thumb: testCard.imageSrc ?? PLACEHOLDER_THUMB,
          title: titleFor(TEST_CARD_ID),
          isPlaceholder: !testCard.imageSrc,
          ...shared,
        },
      ];
    }

    const out = [...shuffled];
    if (flashActive) {
      out.splice(Math.max(0, Math.min(flash.index, out.length)), 0, ...mine);
    } else if (feed.placement === "manual") {
      // Insert low indices first so each card lands where it was dropped
      // rather than being pushed along by the ones inserted after it.
      const placed = mine
        .map((card, i) => ({ card, slot: feed.slots[card.id] ?? i }))
        .sort((a, b) => a.slot - b.slot);
      for (const { card, slot } of placed) {
        out.splice(Math.max(0, Math.min(slot, out.length)), 0, card);
      }
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
    feed.slots,
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
