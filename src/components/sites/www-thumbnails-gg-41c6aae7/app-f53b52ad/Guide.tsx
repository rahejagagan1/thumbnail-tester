"use client";

import { monogramColor } from "@/lib/sites/www-thumbnails-gg-41c6aae7/app-f53b52ad/format";
import {
  IconAccount,
  IconChevronDown,
  IconChevronRight,
  IconDownloads,
  IconExploreLive,
  IconExploreMusic,
  IconHistory,
  IconHome,
  IconLiked,
  IconLive,
  IconMovies,
  IconPlaylists,
  IconReportHistory,
  IconSettings,
  IconShorts,
  IconSubscriptions,
  IconWatchLater,
  IconYouTubeKids,
  IconYouTubeMusic,
  IconYourChannel,
  IconYourVideos,
} from "@/components/sites/www-thumbnails-gg-41c6aae7/shared/icons";
import { GUIDE_CHANNELS } from "@/data/sites/www-thumbnails-gg-41c6aae7/app-f53b52ad/guideChannels";
import type { GuideChannel } from "@/types/thumbnails-app";

const MINI_ITEMS = [
  { label: "Home", Icon: IconHome, active: true },
  { label: "Shorts", Icon: IconShorts, active: false },
  { label: "Subscriptions", Icon: IconSubscriptions, active: false },
  { label: "You", Icon: IconAccount, active: false },
] as const;

interface GuideRowProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}

function GuideRow({ icon, label, active }: GuideRowProps) {
  return (
    <div className="yt-guide-row" data-active={active}>
      <span className="yt-guide-icon">{icon}</span>
      <span className="yt-guide-label">{label}</span>
    </div>
  );
}

interface GuideHeaderProps {
  label: string;
  chevron?: boolean;
}

function GuideHeader({ label, chevron }: GuideHeaderProps) {
  return (
    <div className="yt-guide-header">
      <span>{label}</span>
      {chevron && (
        <span className="yt-guide-header-chevron">
          <IconChevronRight size={22} />
        </span>
      )}
    </div>
  );
}

function GuideChannelRow({ ch }: { ch: GuideChannel }) {
  return (
    <div className="yt-guide-row">
      <span className="yt-guide-avatar">
        {ch.avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={ch.avatar} alt="" draggable={false} />
        ) : (
          <span
            className="yt-guide-monogram"
            style={{ background: monogramColor(ch.name) }}
          >
            {ch.name.trim().charAt(0).toUpperCase()}
          </span>
        )}
      </span>
      <span className="yt-guide-label">{ch.name}</span>
      {ch.live && (
        <span className="yt-guide-live" aria-label="Live now">
          <IconLive size={18} />
        </span>
      )}
      {ch.newDot && !ch.live && (
        <span className="yt-guide-dot" aria-label="New videos" />
      )}
    </div>
  );
}

function GuideDivider() {
  return <div className="yt-guide-divider" />;
}

interface MiniGuideProps {
  expanded?: boolean;
}

/** The left navigation rail: a 4-item mini rail, or the full expanded guide. */
export function MiniGuide({ expanded = false }: MiniGuideProps) {
  if (!expanded) {
    return (
      <nav className="yt-mini-guide">
        {MINI_ITEMS.map(({ label, Icon, active }) => (
          <div className="yt-mini-item" data-active={active} key={label}>
            <Icon />
            <span className="yt-mini-label">{label}</span>
          </div>
        ))}
      </nav>
    );
  }

  return (
    <nav className="yt-guide">
      <div className="yt-guide-section">
        <GuideRow icon={<IconHome />} label="Home" active />
        <GuideRow icon={<IconShorts />} label="Shorts" />
      </div>
      <GuideDivider />
      <div className="yt-guide-section">
        <GuideHeader label="Subscriptions" chevron />
        {GUIDE_CHANNELS.map((ch) => (
          <GuideChannelRow ch={ch} key={ch.name} />
        ))}
        <GuideRow icon={<IconChevronDown />} label="Show more" />
      </div>
      <GuideDivider />
      <div className="yt-guide-section">
        <GuideHeader label="You" chevron />
        <GuideRow icon={<IconYourChannel />} label="Your channel" />
        <GuideRow icon={<IconHistory />} label="History" />
        <GuideRow icon={<IconPlaylists />} label="Playlists" />
        <GuideRow icon={<IconWatchLater />} label="Watch later" />
        <GuideRow icon={<IconLiked />} label="Liked videos" />
        <GuideRow icon={<IconYourVideos />} label="Your videos" />
        <GuideRow icon={<IconDownloads />} label="Downloads" />
        <GuideRow icon={<IconChevronDown />} label="Show more" />
      </div>
      <GuideDivider />
      <div className="yt-guide-section">
        <GuideHeader label="Explore" />
        <GuideRow icon={<IconExploreMusic />} label="Music" />
        <GuideRow icon={<IconMovies />} label="Movies" />
        <GuideRow icon={<IconExploreLive />} label="Live" />
      </div>
      <GuideDivider />
      <div className="yt-guide-section">
        <GuideHeader label="More from YouTube" />
        <GuideRow icon={<IconYouTubeMusic />} label="YouTube Music" />
        <GuideRow icon={<IconYouTubeKids />} label="YouTube Kids" />
      </div>
      <GuideDivider />
      <div className="yt-guide-section">
        <GuideRow icon={<IconReportHistory />} label="Report history" />
        <GuideRow icon={<IconSettings />} label="Settings" />
      </div>
    </nav>
  );
}
