import type { ShareInfo } from "./share";
import type {
  CardFeedback,
  Columns,
  FeedSource,
  ImageFit,
  Placement,
  PoolVideo,
  TestMode,
  Theme,
  TitleVariant,
  ViewMode,
} from "@/types/thumbnails-app";

/**
 * A saved test.
 *
 * Images are NOT inlined here — they live in a separate IndexedDB store as real
 * Blobs and are referenced by id, so a task record stays small and JSON-clonable.
 */
export interface TaskRecord {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;

  /** Blob id for the card shown in the library grid. */
  coverBlobId: string | null;

  /**
   * Set once the test has been published with a link. Holds the revoke secret,
   * so it is stripped before the task is uploaded.
   */
  share: ShareInfo | null;

  card: {
    imageBlobId: string | null;
    imageFit: ImageFit;
    duration: string;
    showDuration: boolean;
    watchedPercent: number;
    title: string;
    channelName: string;
    /** A blob id for an uploaded avatar, or an http(s) URL from a lookup. */
    channelAvatar: string | null;
    channelAvatarIsBlob: boolean;
    verified: boolean;
    viewCount: string;
    uploadedAt: string;
  };

  thumbMode: TestMode;
  /** Multiple-mode thumbnail variants. */
  thumbnails: { id: string; blobId: string; enabled: boolean }[];
  titleMode: TestMode;
  titles: TitleVariant[];

  placement: Placement;
  /** Feed index each test card was dragged to; only meaningful when placement is manual. */
  slots: Record<string, number>;
  /** Likes and comments per card id, the author's own plus anything pulled back from a share. */
  feedback: Record<string, CardFeedback>;
  theme: Theme;
  viewMode: ViewMode;
  columns: Columns;

  blur: number;
  grayscale: boolean;
  showSafeAreaOverlay: boolean;
  highlightTestCard: boolean;

  feedSource: FeedSource;
  /** Competitors are cached with their videos so reopening is instant. */
  competitors: {
    id: string;
    url: string;
    enabled: boolean;
    channel: string | null;
    avatar: string | null;
    subscribers: string | null;
    sampled: number;
    videos: PoolVideo[];
  }[];
}

/** What the library grid needs, without loading every blob. */
export interface TaskSummary {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  coverBlobId: string | null;
  /** Present when this test currently has a live share link. */
  shareId: string | null;
  title: string;
  channelName: string;
  viewMode: ViewMode;
  thumbMode: TestMode;
  thumbnailCount: number;
  titleCount: number;
  competitorCount: number;
}
