"use client";

import { genThumb } from "@/lib/sites/www-thumbnails-gg-41c6aae7/app-f53b52ad/format";
import { IconKebab, IconVerified } from "@/components/sites/www-thumbnails-gg-41c6aae7/shared/icons";
import type { CardViewModel } from "@/types/thumbnails-app";
import { ChannelAvatar } from "./ChannelAvatar";

interface VideoCardProps {
  vm: CardViewModel;
  highlight?: boolean;
  showSafeArea?: boolean;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  onDragOver?: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop?: (e: React.DragEvent<HTMLDivElement>) => void;
}

/** A single YouTube-style feed card, ported 1:1 from the target's bundle. */
export function VideoCard({
  vm,
  highlight = false,
  showSafeArea = false,
  onClick,
  onDragOver,
  onDrop,
}: VideoCardProps) {
  const thumb = vm.thumb ?? genThumb(vm.id, vm.title);
  const isLive = vm.duration.trim().toUpperCase() === "LIVE";

  return (
    <div
      className="yt-card"
      data-test={vm.isTest}
      data-highlight={highlight}
      onClick={onClick}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <div className="yt-thumb-wrap">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="yt-thumb-img"
          src={thumb}
          alt=""
          style={{ objectFit: vm.imageFit }}
          draggable={false}
        />
        {vm.showDuration && vm.duration.trim() !== "" && (
          <span className="yt-duration" data-live={isLive}>
            {vm.duration}
          </span>
        )}
        {vm.watchedPercent > 0 && (
          <div className="yt-progress-track">
            <div
              className="yt-progress-fill"
              style={{ width: `${Math.min(100, vm.watchedPercent)}%` }}
            />
          </div>
        )}
        {showSafeArea && vm.isTest && (
          <div className="yt-safe-overlay">
            <div className="yt-safe-badge-zone" />
          </div>
        )}
      </div>
      <div className="yt-card-details">
        <div className="yt-card-avatar">
          <ChannelAvatar src={vm.avatar} channel={vm.channel} />
        </div>
        <div className="yt-card-text">
          <h3 className="yt-card-title">{vm.title}</h3>
          <div className="yt-card-channel">
            <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
              {vm.channel}
            </span>
            {vm.verified && (
              <IconVerified
                size={14}
                className="yt-verified"
                style={{ color: "var(--yt-text-secondary)" }}
              />
            )}
          </div>
          <div className="yt-card-meta">
            <span>{vm.views}</span>
            <span aria-hidden="true">&bull;</span>
            <span>{vm.age}</span>
          </div>
        </div>
        <button
          className="yt-card-menu"
          aria-label="More"
          tabIndex={-1}
          onClick={(e) => e.stopPropagation()}
        >
          <IconKebab size={20} />
        </button>
      </div>
    </div>
  );
}
