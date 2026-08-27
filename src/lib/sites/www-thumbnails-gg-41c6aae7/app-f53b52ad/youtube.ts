import "server-only";

import type { PoolVideo } from "@/types/thumbnails-app";

/**
 * Server-side YouTube channel reader.
 *
 * Reads a channel's Videos tab the same way a browser would, parses the
 * `ytInitialData` payload out of the HTML, then pages through the InnerTube
 * continuation endpoint to sample more uploads.
 *
 * YouTube no longer honours the old `?sort=p` "most popular" parameter, so the
 * sample is sorted by view count here instead. The result is therefore the
 * most-viewed videos *within the sampled window* of recent uploads, not the
 * channel's all-time top — see `sampled` on the result.
 */

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

const DEFAULT_CLIENT_VERSION = "2.20240101.00.00";

export interface ChannelResult {
  /** What the user typed. */
  url: string;
  ok: boolean;
  channel?: string;
  channelUrl?: string;
  avatar?: string | null;
  verified?: boolean;
  subscribers?: string | null;
  /** How many uploads were looked at before sorting by views. */
  sampled?: number;
  videos?: PoolVideo[];
  error?: string;
}

/**
 * Pulls the video id out of a watch / youtu.be / shorts / embed link.
 * Returns null for anything that is not a single-video URL.
 */
export function toVideoId(input: string): string | null {
  let s = input.trim();
  if (!s) return null;
  if (!/^https?:\/\//i.test(s)) s = `https://${s}`;
  let u: URL;
  try {
    u = new URL(s);
  } catch {
    return null;
  }
  const host = u.hostname.replace(/^www\./, "");
  const ok = (id: string | null | undefined) =>
    id && /^[\w-]{11}$/.test(id) ? id : null;

  if (host === "youtu.be") return ok(u.pathname.split("/").filter(Boolean)[0]);
  if (host !== "youtube.com" && host !== "m.youtube.com") return null;

  const parts = u.pathname.split("/").filter(Boolean);
  if (parts[0] === "watch") return ok(u.searchParams.get("v"));
  if (parts[0] === "shorts" || parts[0] === "embed" || parts[0] === "live") {
    return ok(parts[1]);
  }
  return null;
}

/** Accepts @handle, /channel/UC…, /c/name, /user/name, or a bare handle. */
export function toChannelVideosUrl(input: string): string | null {
  let s = input.trim();
  if (!s) return null;
  if (/^@[\w.\-]+$/.test(s)) return `https://www.youtube.com/${s}/videos`;
  if (/^UC[\w-]{20,}$/.test(s)) return `https://www.youtube.com/channel/${s}/videos`;
  if (!/^https?:\/\//i.test(s)) s = `https://${s}`;

  let u: URL;
  try {
    u = new URL(s);
  } catch {
    return null;
  }
  const host = u.hostname.replace(/^www\./, "");
  if (host !== "youtube.com" && host !== "m.youtube.com" && host !== "youtu.be") {
    return null;
  }

  const parts = u.pathname.split("/").filter(Boolean);
  if (parts[0]?.startsWith("@")) {
    return `https://www.youtube.com/${parts[0]}/videos`;
  }
  if (parts[0] === "channel" && parts[1]) {
    return `https://www.youtube.com/channel/${parts[1]}/videos`;
  }
  if ((parts[0] === "c" || parts[0] === "user") && parts[1]) {
    return `https://www.youtube.com/${parts[0]}/${parts[1]}/videos`;
  }
  return null;
}

/**
 * Resolves whatever the user pasted to a channel /videos URL, following a
 * single-video link back to its uploader when necessary.
 */
async function resolveChannelVideosUrl(input: string): Promise<string | null> {
  const direct = toChannelVideosUrl(input);
  if (direct) return direct;

  const videoId = toVideoId(input);
  if (!videoId) return null;

  try {
    const { status, body } = await fetchText(
      `https://www.youtube.com/watch?v=${videoId}`,
    );
    if (status !== 200) return null;
    const handle = /"canonicalBaseUrl":"\/(@[^"/]+)"/.exec(body);
    if (handle) return `https://www.youtube.com/${handle[1]}/videos`;
    const channelId = /"channelId":"(UC[\w-]{20,})"/.exec(body);
    if (channelId) {
      return `https://www.youtube.com/channel/${channelId[1]}/videos`;
    }
  } catch {
    return null;
  }
  return null;
}

async function fetchText(url: string): Promise<{ status: number; body: string }> {
  const res = await fetch(url, {
    headers: { "user-agent": UA, "accept-language": "en-US,en;q=0.9" },
    redirect: "follow",
    cache: "no-store",
  });
  return { status: res.status, body: await res.text() };
}

/* ------------------------------------------------------------------ */
/* ytInitialData walking                                               */
/* ------------------------------------------------------------------ */

type Json = unknown;

function collect(root: Json, key: string): Record<string, Json>[] {
  const out: Record<string, Json>[] = [];
  const seen = new Set<object>();
  const walk = (n: Json) => {
    if (!n || typeof n !== "object") return;
    if (seen.has(n)) return;
    seen.add(n);
    const obj = n as Record<string, Json>;
    if (key in obj && obj[key] && typeof obj[key] === "object") {
      out.push(obj[key] as Record<string, Json>);
    }
    for (const k in obj) walk(obj[k]);
  };
  walk(root);
  return out;
}

function extractInitialData(html: string): Json | null {
  const m = /var ytInitialData = (\{[\s\S]*?\});<\/script>/.exec(html);
  if (!m) return null;
  try {
    return JSON.parse(m[1]) as Json;
  } catch {
    return null;
  }
}

interface RawVideo {
  id: string;
  title: string;
  views: string;
  age: string;
  duration: string;
}

function readLockups(data: Json): RawVideo[] {
  const out: RawVideo[] = [];
  for (const lv of collect(data, "lockupViewModel")) {
    const id = typeof lv.contentId === "string" ? lv.contentId : "";
    // Shorts and playlists also render as lockups; video ids are 11 chars.
    if (!id || id.length !== 11) continue;

    const meta = collect(lv, "lockupMetadataViewModel")[0];
    const titleNode = meta?.title as { content?: string } | undefined;
    const title = titleNode?.content ?? "";
    if (!title) continue;

    const rows =
      (collect(lv, "contentMetadataViewModel")[0]?.metadataRows as
        | { metadataParts?: { text?: { content?: string } }[] }[]
        | undefined) ?? [];
    const parts = rows
      .flatMap((r) => r.metadataParts ?? [])
      .map((p) => p.text?.content)
      .filter((x): x is string => Boolean(x));

    const views = parts.find((p) => /views?$/i.test(p)) ?? "";
    const age = parts.find((p) => /\bago$/i.test(p)) ?? "";

    const badge = collect(lv, "thumbnailBadgeViewModel")[0];
    const duration = typeof badge?.text === "string" ? badge.text : "";

    out.push({ id, title, views, age, duration });
  }
  return out;
}

/**
 * Makes a channel avatar URL safe to render directly.
 *
 * - `ytInitialData` sometimes returns protocol-relative URLs.
 * - Avatars are served from both `yt3.googleusercontent.com` and its
 *   `yt3.ggpht.com` alias; the latter is what YouTube's own feed uses and what
 *   the target site's dataset carries, so we normalise onto it.
 * - The default `=s900` variant is ~10x larger than needed for a 36px avatar.
 *   Asking for `s176` cuts bandwidth and makes CDN rate limiting far less likely.
 */
function normalizeAvatar(url: string | null): string | null {
  if (!url) return null;
  let out = url.trim();
  if (!out) return null;
  if (out.startsWith("//")) out = `https:${out}`;
  if (!/^https?:\/\//i.test(out)) return null;
  out = out.replace("//yt3.googleusercontent.com/", "//yt3.ggpht.com/");
  out = out.replace(/=s\d+-/, "=s176-");
  return out;
}

function readChannelIdentity(data: Json) {
  const root = (data ?? {}) as Record<string, Json>;
  const header = root.header ?? {};
  const meta = collect(data, "channelMetadataRenderer")[0];
  const title = typeof meta?.title === "string" ? meta.title : null;
  const thumbs = (meta?.avatar as { thumbnails?: { url: string }[] } | undefined)
    ?.thumbnails;
  const avatar = normalizeAvatar(
    thumbs?.length ? thumbs[thumbs.length - 1].url : null,
  );
  const channelUrl =
    typeof meta?.channelUrl === "string" ? meta.channelUrl : undefined;

  let subscribers: string | null = null;
  const walk = (n: Json) => {
    if (subscribers || !n || typeof n !== "object") return;
    const obj = n as Record<string, Json>;
    if (typeof obj.content === "string" && /\bsubscribers?\b/i.test(obj.content)) {
      subscribers = obj.content;
      return;
    }
    for (const k in obj) walk(obj[k]);
  };
  walk(header);

  // The channel's own verified tick renders as a CHECK_CIRCLE_FILLED client
  // resource inside the page header. (The same icon appears next to channel
  // names in video lockups, which is why this only looks at `header`.)
  const verified = /CHECK_CIRCLE_FILLED|CHECK_CIRCLE_THICK|"Verified"/.test(
    JSON.stringify(header),
  );

  return { title, avatar, channelUrl, subscribers, verified };
}

function continuationTokens(data: Json): string[] {
  const out: string[] = [];
  for (const c of collect(data, "continuationItemRenderer")) {
    const m = /"token":"([^"]+)"/.exec(JSON.stringify(c));
    if (m) out.push(m[1]);
  }
  return out;
}

async function fetchContinuation(token: string, clientVersion: string) {
  const res = await fetch(
    "https://www.youtube.com/youtubei/v1/browse?prettyPrint=false",
    {
      method: "POST",
      headers: { "content-type": "application/json", "user-agent": UA },
      body: JSON.stringify({
        context: {
          client: { clientName: "WEB", clientVersion, hl: "en", gl: "US" },
        },
        continuation: token,
      }),
      cache: "no-store",
    },
  );
  if (!res.ok) return null;
  try {
    return (await res.json()) as Json;
  } catch {
    return null;
  }
}

/** "61M views" / "357.5K views" / "1,234 views" -> a sortable number. */
export function viewsToNumber(s: string): number {
  const m = /([\d.,]+)\s*([KMB])?/i.exec(s);
  if (!m) return 0;
  const n = Number(m[1].replace(/,/g, ""));
  if (Number.isNaN(n)) return 0;
  const mult =
    { k: 1e3, m: 1e6, b: 1e9 }[(m[2] ?? "").toLowerCase() as "k" | "m" | "b"] ?? 1;
  return n * mult;
}

/* ------------------------------------------------------------------ */
/* public entry point                                                  */
/* ------------------------------------------------------------------ */

export interface ChannelIdentity {
  ok: boolean;
  name?: string;
  avatar?: string | null;
  verified?: boolean;
  subscribers?: string | null;
  error?: string;
}

/** Just the name / avatar / tick for a channel — no video listing. */
export async function fetchChannelIdentity(
  input: string,
): Promise<ChannelIdentity> {
  const target = await resolveChannelVideosUrl(input);
  if (!target) {
    return { ok: false, error: "Not a YouTube channel handle or URL." };
  }
  let page: { status: number; body: string };
  try {
    page = await fetchText(target);
  } catch {
    return { ok: false, error: "Could not reach YouTube." };
  }
  if (page.status === 404) return { ok: false, error: "Channel not found." };
  if (page.status !== 200) {
    return { ok: false, error: `YouTube returned ${page.status}.` };
  }
  const data = extractInitialData(page.body);
  if (!data) return { ok: false, error: "Could not read the channel page." };

  const identity = readChannelIdentity(data);
  if (!identity.title) return { ok: false, error: "Channel not found." };
  return {
    ok: true,
    name: identity.title,
    avatar: identity.avatar,
    verified: identity.verified,
    subscribers: identity.subscribers,
  };
}

export interface FetchOptions {
  /** Extra continuation pages beyond the first (30 uploads each). */
  pages?: number;
  /** How many of the highest-viewed sampled videos to keep. */
  take?: number;
}

export async function fetchChannelTopVideos(
  input: string,
  { pages = 2, take = 24 }: FetchOptions = {},
): Promise<ChannelResult> {
  const target = await resolveChannelVideosUrl(input);
  if (!target) {
    return {
      url: input,
      ok: false,
      error:
        "Not a YouTube channel. Paste a @handle, a channel URL, or any video link from that channel.",
    };
  }

  let page: { status: number; body: string };
  try {
    page = await fetchText(target);
  } catch {
    return { url: input, ok: false, error: "Could not reach YouTube." };
  }
  if (page.status === 404) {
    return { url: input, ok: false, error: "Channel not found." };
  }
  if (page.status !== 200) {
    return { url: input, ok: false, error: `YouTube returned ${page.status}.` };
  }

  const data = extractInitialData(page.body);
  if (!data) {
    return { url: input, ok: false, error: "Could not read the channel page." };
  }

  const identity = readChannelIdentity(data);
  const raw = readLockups(data);

  const versionMatch = /"INNERTUBE_CLIENT_VERSION":"([^"]+)"/.exec(page.body);
  const clientVersion = versionMatch?.[1] ?? DEFAULT_CLIENT_VERSION;

  let tokens = continuationTokens(data);
  for (let i = 0; i < pages && tokens.length > 0; i++) {
    const next = await fetchContinuation(tokens[0], clientVersion);
    if (!next) break;
    raw.push(...readLockups(next));
    tokens = continuationTokens(next);
  }

  // De-dupe (continuations can overlap), then rank by views.
  const byId = new Map<string, RawVideo>();
  for (const v of raw) if (!byId.has(v.id)) byId.set(v.id, v);
  const sampled = [...byId.values()];

  if (sampled.length === 0) {
    return {
      url: input,
      ok: false,
      channel: identity.title ?? undefined,
      error: "No public uploads found on this channel.",
    };
  }

  const channelName = identity.title ?? "Unknown channel";
  const videos: PoolVideo[] = sampled
    .sort((a, b) => viewsToNumber(b.views) - viewsToNumber(a.views))
    .slice(0, take)
    .map((v) => ({
      id: v.id,
      title: v.title,
      channel: channelName,
      avatar: identity.avatar,
      verified: identity.verified,
      views: v.views,
      age: v.age,
      duration: v.duration,
      thumb: `https://i.ytimg.com/vi/${v.id}/hq720.jpg`,
      subscribers: identity.subscribers ?? undefined,
    }));

  return {
    url: input,
    ok: true,
    channel: channelName,
    channelUrl: identity.channelUrl,
    avatar: identity.avatar,
    verified: identity.verified,
    subscribers: identity.subscribers,
    sampled: sampled.length,
    videos,
  };
}
