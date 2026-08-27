"use client";

import { useRef } from "react";
import {
  IconAccount,
  IconBell,
  IconCast,
  IconHome,
  IconKebabVertical,
  IconSearch,
  IconShorts,
  IconSubscriptions,
  YouTubeLogo,
} from "@/components/sites/www-thumbnails-gg-41c6aae7/shared/icons";
import { MOBILE_CHIPS } from "@/data/sites/www-thumbnails-gg-41c6aae7/app-f53b52ad/guideChannels";
import { genThumb } from "@/lib/sites/www-thumbnails-gg-41c6aae7/app-f53b52ad/format";
import { useFeed } from "@/lib/sites/www-thumbnails-gg-41c6aae7/app-f53b52ad/store";
import { useInfiniteScroll } from "@/lib/sites/www-thumbnails-gg-41c6aae7/app-f53b52ad/useInfiniteScroll";
import type { CardViewModel } from "@/types/thumbnails-app";
import { ChannelAvatar } from "./ChannelAvatar";

interface MobileViewProps {
  cards: CardViewModel[];
  blur: number;
  grayscale: boolean;
  highlight: boolean;
  showSafeArea: boolean;
  resetKey: string;
}

function SignalBarsIcon() {
  return (
    <svg width="18" height="12" viewBox="0 0 18 12" fill="currentColor">
      <rect x="0" y="8" width="3" height="4" rx="1" />
      <rect x="5" y="5" width="3" height="7" rx="1" />
      <rect x="10" y="2.5" width="3" height="9.5" rx="1" />
      <rect x="15" y="0" width="3" height="12" rx="1" />
    </svg>
  );
}

function WifiIcon() {
  return (
    <svg width="17" height="12" viewBox="0 0 17 12" fill="currentColor">
      <path d="M8.5 2.2c2.7 0 5.2 1 7 2.8l-1.5 1.6A7.6 7.6 0 008.5 4.4 7.6 7.6 0 003 6.6L1.5 5C3.3 3.2 5.8 2.2 8.5 2.2z" />
      <path d="M8.5 6c1.5 0 2.9.6 3.9 1.6L8.5 11 4.6 7.6A5.4 5.4 0 018.5 6z" />
    </svg>
  );
}

function BatteryIcon() {
  return (
    <svg width="26" height="13" viewBox="0 0 26 13" fill="none">
      <rect x="0.5" y="0.5" width="22" height="12" rx="3.5" stroke="currentColor" opacity="0.5" />
      <rect x="2" y="2" width="16" height="9" rx="2" fill="currentColor" />
      <rect x="24" y="4" width="1.5" height="5" rx="0.75" fill="currentColor" opacity="0.5" />
    </svg>
  );
}

function ExploreIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
      <path d="M15.5 8.5l-2 5-5 2 2-5 5-2z" fill="currentColor" />
    </svg>
  );
}

function CreateIcon() {
  return (
    <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
      <circle cx="17" cy="17" r="16" stroke="currentColor" strokeWidth="1.4" opacity="0.5" />
      <path d="M17 11v12M11 17h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

interface MobileVideoCardProps {
  vm: CardViewModel;
  highlight: boolean;
  showSafeArea: boolean;
  onClick: () => void;
  onDragOver?: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop?: (e: React.DragEvent<HTMLDivElement>) => void;
}

function MobileVideoCard({
  vm,
  highlight,
  showSafeArea,
  onClick,
  onDragOver,
  onDrop,
}: MobileVideoCardProps) {
  const thumb = vm.thumb ?? genThumb(vm.id, vm.title);
  const isLive = vm.duration.trim().toUpperCase() === "LIVE";

  return (
    <div
      className="ytm-card"
      data-test={vm.isTest}
      data-highlight={highlight}
      onClick={onClick}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <div className="ytm-thumb-wrap">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="ytm-thumb-img"
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
      <div className="ytm-info">
        <div className="ytm-avatar">
          <ChannelAvatar src={vm.avatar} channel={vm.channel} />
        </div>
        <div className="ytm-text">
          <h3 className="ytm-title">{vm.title}</h3>
          <div className="ytm-meta">{`${vm.channel} \xb7 ${vm.views} \xb7 ${vm.age}`}</div>
        </div>
        <span className="ytm-dots">
          <IconKebabVertical size={18} />
        </span>
      </div>
    </div>
  );
}

export function MobileView({
  cards,
  blur,
  grayscale,
  highlight,
  showSafeArea,
  resetKey,
}: MobileViewProps) {
  const setInspect = useFeed((s) => s.setInspect);
  const uploadHandler = useFeed((s) => s.uploadHandler);
  const dropHandler = useFeed((s) => s.dropHandler);
  const rootRef = useRef<HTMLDivElement>(null);
  const { visible, sentinelRef } = useInfiniteScroll(cards, {
    rootRef,
    resetKey,
  });

  const filterParts: string[] = [];
  if (blur > 0) filterParts.push(`blur(${blur}px)`);
  if (grayscale) filterParts.push("grayscale(1)");
  const filter = filterParts.length ? filterParts.join(" ") : undefined;

  return (
    <div className="ios-frame">
      <div className="ios-screen">
        <div className="ios-island" />
        <div className="ytm-statusbar">
          <span>9:41</span>
          <span
            className="ytm-status-icons"
            style={{ color: "var(--yt-text-primary)" }}
          >
            <SignalBarsIcon />
            <WifiIcon />
            <BatteryIcon />
          </span>
        </div>
        <div className="ytm-masthead">
          <span className="ytm-logo">
            <YouTubeLogo height={20} />
          </span>
          <span className="ytm-mast-icons">
            <IconCast size={24} />
            <span className="ytm-bell">
              <IconBell size={22} />
              <span className="ytm-bell-badge">9+</span>
            </span>
            <IconSearch size={22} />
          </span>
        </div>
        <div className="ytm-chipbar">
          <span className="ytm-explore">
            <ExploreIcon />
          </span>
          {MOBILE_CHIPS.map((chip, index) => (
            <span key={chip} className="ytm-chip" data-selected={index === 0}>
              {chip}
            </span>
          ))}
        </div>
        <div
          ref={rootRef}
          className="ytm-feed"
          style={{ filter, transition: "filter var(--dur-base) var(--ease-out)" }}
        >
          {visible.map((vm) => (
            <MobileVideoCard
              key={vm.id}
              vm={vm}
              highlight={vm.isTest && highlight}
              showSafeArea={showSafeArea}
              onClick={() => (vm.isPlaceholder ? uploadHandler?.() : setInspect(vm))}
              onDragOver={vm.isTest ? (e) => e.preventDefault() : undefined}
              onDrop={
                vm.isTest
                  ? (e) => {
                      e.preventDefault();
                      dropHandler?.(Array.from(e.dataTransfer.files));
                    }
                  : undefined
              }
            />
          ))}
          <div ref={sentinelRef} aria-hidden style={{ height: 1 }} />
        </div>
        <div className="ytm-tabbar">
          <span className="ytm-tab">
            <IconHome size={24} />
            Home
          </span>
          <span className="ytm-tab" style={{ color: "var(--yt-text-secondary)" }}>
            <IconShorts size={24} />
            Shorts
          </span>
          <span className="ytm-tab">
            <CreateIcon />
          </span>
          <span className="ytm-tab" style={{ color: "var(--yt-text-secondary)" }}>
            <IconSubscriptions size={24} />
            Subscriptions
          </span>
          <span className="ytm-tab" style={{ color: "var(--yt-text-secondary)" }}>
            <IconAccount size={24} />
            You
          </span>
        </div>
      </div>
    </div>
  );
}
