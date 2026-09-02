"use client";

import { genThumb } from "@/lib/sites/www-thumbnails-gg-41c6aae7/app-f53b52ad/format";
import { IconKebab, IconVerified } from "@/components/sites/www-thumbnails-gg-41c6aae7/shared/icons";
import { useFeed } from "@/lib/sites/www-thumbnails-gg-41c6aae7/app-f53b52ad/store";
import type { CardViewModel } from "@/types/thumbnails-app";
import { CardMenu } from "./CardMenu";
import { ChannelAvatar } from "./ChannelAvatar";

interface VideoCardProps {
  vm: CardViewModel;
  highlight?: boolean;
  showSafeArea?: boolean;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  onDragOver?: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragLeave?: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop?: (e: React.DragEvent<HTMLDivElement>) => void;
  /** Test cards can be dragged to a new slot in the feed. */
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragEnd?: (e: React.DragEvent<HTMLDivElement>) => void;
  /** The card currently being dragged, dimmed while it moves. */
  dragging?: boolean;
  /** This card's slot is where a drop would land. */
  dropTarget?: boolean;
}

/** A single YouTube-style feed card, ported 1:1 from the target's bundle. */
export function VideoCard({
  vm,
  highlight = false,
  showSafeArea = false,
  onClick,
  onDragOver,
  onDragLeave,
  onDrop,
  draggable = false,
  onDragStart,
  onDragEnd,
  dragging = false,
  dropTarget = false,
}: VideoCardProps) {
  const thumb = vm.thumb ?? genThumb(vm.id, vm.title);
  const isLive = vm.duration.trim().toUpperCase() === "LIVE";
  // Only the card under test is reactable; pool cards keep the target's inert kebab.
  const feedback = useFeed((s) => (vm.isTest ? s.feedback[vm.id] : undefined));
  const likes = feedback?.likes.length ?? 0;
  const comments = feedback?.comments.length ?? 0;

  return (
    <div
      className="yt-card"
      data-test={vm.isTest}
      data-highlight={highlight}
      data-dragging={dragging || undefined}
      data-drop-target={dropTarget || undefined}
      draggable={draggable || undefined}
      onClick={onClick}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      title={draggable ? "Drag to move this card anywhere in the feed" : undefined}
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
        {vm.label && <span className="yt-variant-badge">{vm.label}</span>}
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
        {(likes > 0 || comments > 0) && (
          <span className="yt-feedback-badge">
            {likes > 0 && (
              <span>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 20s-7-4.35-7-9.5A4.5 4.5 0 0112 7a4.5 4.5 0 017 3.5c0 5.15-7 9.5-7 9.5z" />
                </svg>
                {likes}
              </span>
            )}
            {comments > 0 && (
              <span>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M4 5.5h16v10H9l-5 3.5v-13z" />
                </svg>
                {comments}
              </span>
            )}
          </span>
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
        {vm.isTest ? (
          <CardMenu cardId={vm.id} label={vm.label} />
        ) : (
          <button
            className="yt-card-menu"
            aria-label="More"
            tabIndex={-1}
            onClick={(e) => e.stopPropagation()}
          >
            <IconKebab size={20} />
          </button>
        )}
      </div>
    </div>
  );
}
