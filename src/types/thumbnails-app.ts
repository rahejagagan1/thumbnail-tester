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
/**
 * Cards per row. Four is the ceiling, pinned or automatic: a thumbnail shown
 * five-across is narrower than it will ever be on a YouTube feed, which
 * flatters small text and tight crops — the opposite of what a tester is for.
 */
export type Columns = "auto" | 3 | 4;
/**
 * Where the test cards sit in the feed. `manual` is ours, not the target's: it
 * means the user has dragged at least one card and their positions win.
 */
export type Placement = "first" | "random" | "manual";
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
  /**
   * A title belonging to this image alone. `null` means "use the shared title"
   * — the one in Details, or a variant drawn from the title list — so a test
   * only diverges once someone actually types a per-image title.
   */
  title: string | null;
}

/** One note left on a thumbnail, by the author or by someone they shared with. */
export interface CardComment {
  id: string;
  text: string;
  at: number;
  /** Display name. "You" for the author's own notes. */
  author: string;
}

/**
 * Reactions on one card.
 *
 * Likes are stored as viewer ids rather than a count so a reviewer can take
 * their own like back without being able to clear anyone else's.
 */
export interface CardFeedback {
  likes: string[];
  comments: CardComment[];
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
  /** A, B, C… shown on the card when several variants are in the feed at once. */
  label?: string;
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
  /**
   * What the desktop grid last measured itself as: its content width, and the
   * column count `autoColumns` derives from it. Published by the surface so the
   * editor can show why Auto settled where it did — a count that will not budge
   * on a maximized window otherwise looks broken. Not part of a saved task.
   */
  gridMetrics: { width: number; autoCols: number } | null;
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
  /**
   * Feed index each test card has been dragged to, keyed by card id. Only read
   * when `placement` is `manual`.
   */
  slots: Record<string, number>;
  /** Likes and comments per card id. */
  feedback: Record<string, CardFeedback>;
  /**
   * Guide rail state. `guideDefault` is what the surface asks for; `guideOpen`
   * is the viewer's own choice from the masthead menu button, and wins until
   * the surface's default changes under it. Not part of a saved task — it is a
   * way of looking at the feed, not part of the test.
   */
  guideDefault: boolean;
  guideOpen: boolean | null;
  /** Who the current session counts as when liking. */
  viewerId: string;
  /** Name attached to comments this session leaves. */
  viewerName: string;
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
  /** Sets this image's own title; blank hands it back to the shared title. */
  setThumbnailTitle: (id: string, title: string | null) => void;
  removeThumbnail: (id: string) => void;
  setTitleMode: (m: TestMode) => void;
  addTitle: (text: string) => void;
  updateTitle: (id: string, text: string) => void;
  toggleTitle: (id: string) => void;
  removeTitle: (id: string) => void;
  setColumns: (c: Columns) => void;
  setGridMetrics: (m: { width: number; autoCols: number }) => void;
  setPlacement: (p: Placement) => void;
  /** Drops a test card at `index` in the feed and switches to manual placement. */
  moveCardTo: (cardId: string, index: number) => void;
  setGuideDefault: (expanded: boolean) => void;
  toggleGuide: () => void;
  setViewer: (id: string, name: string) => void;
  toggleLike: (cardId: string) => void;
  addComment: (cardId: string, text: string) => void;
  removeComment: (cardId: string, commentId: string) => void;
  /**
   * Called after any reaction, so a shared page can forward it to the server.
   * Same injection idiom as `uploadHandler` / `dropHandler`.
   */
  feedbackSink:
    | ((cardId: string, next: CardFeedback) => void)
    | null;
  setFeedbackSink: (
    fn: ((cardId: string, next: CardFeedback) => void) | null,
  ) => void;
  /** Forgets every dragged position and returns to automatic placement. */
  clearSlots: () => void;
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
