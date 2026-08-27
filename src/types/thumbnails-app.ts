/**
 * Types for the thumbnails.gg /app clone.
 * Shapes mirror the target site's runtime data structures exactly.
 */

/** One entry in the YouTube video pool used to fill the fake feed. */
export interface PoolVideo {
  id: string;
  title: string;
  channel: string;
  avatar: string | null;
  verified: boolean;
  views: string;
  age: string;
  duration: string;
  /** Absent on the offline fallback list; a thumbnail is generated instead. */
  thumb?: string;
  subscribers?: string;
}

export type ImageFit = "cover" | "contain";
export type ViewMode = "desktop" | "mobile" | "watch";
export type Theme = "dark" | "light";
export type Columns = "auto" | 3 | 4 | 5;
export type Placement = "first" | "random";
export type TestMode = "single" | "multiple";

/** The user's card under test — everything the editor panel writes to. */
export interface TestCard {
  id: string;
  imageSrc: string | null;
  imageFit: ImageFit;
  duration: string;
  showDuration: boolean;
  watchedPercent: number;
  title: string;
  channelName: string;
  channelAvatarSrc: string | null;
  verified: boolean;
  viewCount: string;
  /** Key into AGE_OPTIONS, or a literal custom string. */
  uploadedAt: string;
}

export interface ThumbnailVariant {
  id: string;
  src: string;
  enabled: boolean;
}

export interface TitleVariant {
  id: string;
  text: string;
  enabled: boolean;
}

/** A card as handed to a surface renderer — pool video and test card unified. */
export interface CardViewModel {
  id: string;
  thumb: string | null;
  imageFit: ImageFit;
  title: string;
  channel: string;
  avatar: string | null;
  verified: boolean;
  views: string;
  age: string;
  duration: string;
  showDuration: boolean;
  watchedPercent: number;
  isTest: boolean;
  /** True while the test card still shows the "Drop your thumbnail" art. */
  isPlaceholder?: boolean;
}

/** Where the surrounding (non-test) cards in the feed come from. */
export type FeedSource = "random" | "competitors";

export type CompetitorStatus = "idle" | "loading" | "ready" | "error";

/** One competitor channel the user has pinned for comparison. */
export interface Competitor {
  id: string;
  /** Exactly what the user pasted. */
  url: string;
  enabled: boolean;
  status: CompetitorStatus;
  channel: string | null;
  avatar: string | null;
  subscribers: string | null;
  /** Videos looked at before ranking by views. */
  sampled: number;
  videos: PoolVideo[];
  error: string | null;
}

/** One entry in the `/api/competitors` response. */
export interface ChannelFetchResult {
  url: string;
  ok: boolean;
  channel?: string;
  channelUrl?: string;
  avatar?: string | null;
  verified?: boolean;
  subscribers?: string | null;
  sampled?: number;
  videos?: PoolVideo[];
  error?: string;
}

export interface GuideChannel {
  name: string;
  avatar: string | null;
  newDot?: boolean;
  live?: boolean;
}

export type FlashPhase = "idle" | "ready" | "show" | "recall" | "result";

export interface FlashPoint {
  x: number;
  y: number;
}

export interface FlashMarker extends FlashPoint {
  hit: boolean;
}

export interface FlashTarget {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface FlashState {
  phase: FlashPhase;
  /** Index the test card is spliced into while a flash test runs. */
  index: number;
  seed: number;
  durationMs: number;
  click: FlashPoint | null;
  markers: FlashMarker[];
  hit: boolean | null;
  /** Pixels from the click to the nearest test-card centre. */
  distance: number | null;
  targets: FlashTarget[];
}

export const INITIAL_FLASH: FlashState = {
  phase: "idle",
  index: 0,
  seed: 1,
  durationMs: 1000,
  click: null,
  markers: [],
  hit: null,
  distance: null,
  targets: [],
};

export interface FeedState {
  theme: Theme;
  viewMode: ViewMode;
  columns: Columns;
  placement: Placement;
  seed: number;
  blur: number;
  grayscale: boolean;
  showSafeAreaOverlay: boolean;
  highlightTestCard: boolean;
  testCard: TestCard;
  thumbMode: TestMode;
  thumbnails: ThumbnailVariant[];
  titleMode: TestMode;
  titles: TitleVariant[];
  inspect: CardViewModel | null;
  uploadHandler: (() => void) | null;
  dropHandler: ((files: File[]) => void) | null;

  feedSource: FeedSource;
  competitors: Competitor[];
  competitorsLoading: boolean;

  setUploadHandler: (fn: (() => void) | null) => void;
  setDropHandler: (fn: ((files: File[]) => void) | null) => void;
  setTheme: (t: Theme) => void;
  setInspect: (c: CardViewModel | null) => void;
  setViewMode: (v: ViewMode) => void;
  setThumbMode: (m: TestMode) => void;
  addThumbnails: (srcs: string[]) => void;
  toggleThumbnail: (id: string) => void;
  removeThumbnail: (id: string) => void;
  setTitleMode: (m: TestMode) => void;
  addTitle: (text: string) => void;
  updateTitle: (id: string, text: string) => void;
  toggleTitle: (id: string) => void;
  removeTitle: (id: string) => void;
  setColumns: (c: Columns) => void;
  setPlacement: (p: Placement) => void;
  reshuffle: () => void;
  setBlur: (n: number) => void;
  setGrayscale: (b: boolean) => void;
  setShowSafeArea: (b: boolean) => void;
  setHighlight: (b: boolean) => void;
  updateTestCard: (patch: Partial<TestCard>) => void;

  /** Replace the saved-task-owned slice of state wholesale. */
  hydrate: (snap: Partial<FeedState>) => void;
  /** Return every task-owned field to its default. */
  resetAll: () => void;

  setFeedSource: (s: FeedSource) => void;
  addCompetitor: (url: string) => void;
  removeCompetitor: (id: string) => void;
  toggleCompetitor: (id: string) => void;
  patchCompetitor: (id: string, patch: Partial<Competitor>) => void;
  setCompetitorsLoading: (loading: boolean) => void;
  clearCompetitors: () => void;
}
