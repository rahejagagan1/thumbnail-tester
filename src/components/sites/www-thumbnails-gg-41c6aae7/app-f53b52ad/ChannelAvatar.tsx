"use client";

import { useState } from "react";

import { monogramColor } from "@/lib/sites/www-thumbnails-gg-41c6aae7/app-f53b52ad/format";

interface ChannelAvatarProps {
  src: string | null;
  channel: string;
  /** Class for the monogram fallback — `yt-monogram` on the feed surfaces. */
  monogramClassName?: string;
  style?: React.CSSProperties;
}

/**
 * A channel avatar that falls back to the target's coloured monogram when the
 * image fails to load.
 *
 * The target itself only falls back when `avatar` is null, so a dead or
 * rate-limited CDN URL leaves a broken-image glyph in the card. Competitor
 * avatars are fetched live and can transiently 429, so the fallback is handled
 * here as well as for the null case.
 *
 * The rendered markup is byte-identical to the target's on the happy path —
 * `onError` is a client-side handler and is not serialised into the HTML.
 */
export function ChannelAvatar({
  src,
  channel,
  monogramClassName = "yt-monogram",
  style,
}: ChannelAvatarProps) {
  const [failed, setFailed] = useState(false);

  if (src && !failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt=""
        draggable={false}
        style={style}
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <span
      className={monogramClassName}
      style={{ background: monogramColor(channel), ...style }}
    >
      {channel.trim().charAt(0).toUpperCase() || "?"}
    </span>
  );
}
