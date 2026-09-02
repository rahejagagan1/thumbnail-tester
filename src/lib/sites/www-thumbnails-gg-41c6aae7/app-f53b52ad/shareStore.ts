import "server-only";

import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import {
  mkdir,
  readFile,
  readdir,
  rename,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import path from "node:path";

import type { ShareAsset, SharedTask } from "@/types/share";
import type { CardFeedback } from "@/types/thumbnails-app";

/**
 * Server-side storage for shared tests.
 *
 * Saved tests live in the author's IndexedDB, which nobody else can read, so a
 * share has to be copied somewhere both people can reach. This is the only
 * server-persisted state in the app.
 *
 * Layout on disk:
 *   <root>/<shareId>/manifest.json   public — served as-is to viewers
 *   <root>/<shareId>/owner.json      private — sha256 of the revoke secret
 *   <root>/<shareId>/assets/<id>     raw image bytes
 *   <root>/<shareId>/feedback.json   public — likes and comments from viewers
 *
 * The driver is deliberately the only thing that touches the filesystem: to run
 * this on a serverless host (where the disk is ephemeral and per-invocation),
 * swap the six functions below for an object-store client. `isEphemeralHost()`
 * reports when that swap has not been done, so the UI can warn instead of
 * handing out a link that will stop working.
 *
 * The root is a hard-coded subfolder rather than an env var on purpose: a
 * dynamic base path makes Turbopack trace the entire project into the server
 * bundle. Point `.data` at a mounted volume if the shares need to outlive the
 * container.
 */

const ROOT = path.join(process.cwd(), ".data", "shares");

/** Rejected outright rather than truncated — a share is all-or-nothing. */
export const LIMITS = {
  maxAssets: 40,
  maxAssetBytes: 12 * 1024 * 1024,
  maxTotalBytes: 40 * 1024 * 1024,
  maxManifestBytes: 2 * 1024 * 1024,
} as const;

const SHARE_ID = /^[a-z0-9]{12}$/;
const ASSET_ID = /^[A-Za-z0-9_-]{1,64}$/;

const ALLOWED_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "image/avif",
]);

/** Guards every path join; ids come from the URL and are never trusted. */
export const isShareId = (v: string): boolean => SHARE_ID.test(v);
export const isAssetId = (v: string): boolean =>
  ASSET_ID.test(v) && v !== "." && v !== "..";

export function isAllowedType(v: string): boolean {
  return ALLOWED_TYPES.has(v.split(";")[0].trim().toLowerCase());
}

export function isEphemeralHost(): boolean {
  // Vercel/Lambda-style hosts give each invocation a fresh, read-only-ish disk.
  return Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
}

function newShareId(): string {
  // 12 chars of base36 ≈ 62 bits — unguessable, and short enough to paste.
  let out = "";
  while (out.length < 12) {
    out += randomBytes(16).toString("hex").replace(/[^a-z0-9]/g, "");
  }
  return out.slice(0, 12);
}

const dirFor = (id: string) => path.join(ROOT, id);
const sha256 = (v: string) => createHash("sha256").update(v).digest("hex");

/* ------------------------------------------------------------------ */
/* write                                                               */
/* ------------------------------------------------------------------ */

export interface IncomingAsset {
  id: string;
  contentType: string;
  bytes: Buffer;
}

export async function createShare(
  share: Omit<SharedTask, "shareId" | "assets">,
  assets: IncomingAsset[],
): Promise<{ id: string; secret: string }> {
  const id = newShareId();
  const secret = randomBytes(24).toString("base64url");
  const dir = dirFor(id);

  await mkdir(path.join(dir, "assets"), { recursive: true });

  await Promise.all(
    assets.map((a) =>
      writeFile(path.join(dir, "assets", a.id), a.bytes),
    ),
  );

  const manifest: SharedTask = {
    ...share,
    shareId: id,
    assets: assets.map<ShareAsset>((a) => ({
      id: a.id,
      contentType: a.contentType,
      bytes: a.bytes.byteLength,
    })),
  };

  await writeFile(path.join(dir, "manifest.json"), JSON.stringify(manifest));
  await writeFile(
    path.join(dir, "owner.json"),
    JSON.stringify({ secretHash: sha256(secret), createdAt: Date.now() }),
  );

  return { id, secret };
}

/**
 * Replaces the contents of an existing share, keeping its id and secret.
 *
 * A share is a snapshot, so an author who keeps editing needs a way to refresh
 * the link rather than minting a new one and re-sending it. Assets are written
 * to a fresh directory and swapped in, so a viewer mid-request never sees a
 * half-updated share.
 */
export async function updateShare(
  id: string,
  secret: string,
  share: Omit<SharedTask, "shareId" | "assets">,
  assets: IncomingAsset[],
): Promise<"ok" | "not-found" | "forbidden"> {
  const auth = await authorize(id, secret);
  if (auth !== "ok") return auth;

  const dir = dirFor(id);
  const staging = path.join(dir, "assets.next");
  await rm(staging, { recursive: true, force: true });
  await mkdir(staging, { recursive: true });
  await Promise.all(
    assets.map((a) => writeFile(path.join(staging, a.id), a.bytes)),
  );

  const manifest: SharedTask = {
    ...share,
    shareId: id,
    assets: assets.map<ShareAsset>((a) => ({
      id: a.id,
      contentType: a.contentType,
      bytes: a.bytes.byteLength,
    })),
  };

  await rm(path.join(dir, "assets"), { recursive: true, force: true });
  await rename(staging, path.join(dir, "assets"));
  await writeFile(path.join(dir, "manifest.json"), JSON.stringify(manifest));
  return "ok";
}

/* ------------------------------------------------------------------ */
/* read                                                                */
/* ------------------------------------------------------------------ */

export async function readShare(id: string): Promise<SharedTask | null> {
  if (!isShareId(id)) return null;
  try {
    const raw = await readFile(path.join(dirFor(id), "manifest.json"), "utf8");
    return JSON.parse(raw) as SharedTask;
  } catch {
    return null;
  }
}

export async function readAsset(
  id: string,
  assetId: string,
): Promise<{ bytes: Buffer; contentType: string } | null> {
  if (!isShareId(id) || !isAssetId(assetId)) return null;
  const manifest = await readShare(id);
  // Only ids the manifest lists are readable, so the assets directory cannot be
  // enumerated or probed through this route.
  const entry = manifest?.assets.find((a) => a.id === assetId);
  if (!entry) return null;
  try {
    const bytes = await readFile(path.join(dirFor(id), "assets", assetId));
    return { bytes, contentType: entry.contentType };
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------ */
/* revoke                                                              */
/* ------------------------------------------------------------------ */

/**
 * Constant-time check that the caller holds this share's secret.
 *
 * Exported so a route can reject an unauthorized upload before buffering its
 * body — otherwise anyone could make the server read tens of megabytes.
 */
export async function authorize(
  id: string,
  secret: string,
): Promise<"ok" | "not-found" | "forbidden"> {
  if (!isShareId(id)) return "not-found";
  let ownerRaw: string;
  try {
    ownerRaw = await readFile(path.join(dirFor(id), "owner.json"), "utf8");
  } catch {
    return "not-found";
  }

  const { secretHash } = JSON.parse(ownerRaw) as { secretHash: string };
  const a = Buffer.from(sha256(secret));
  const b = Buffer.from(secretHash);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return "forbidden";
  return "ok";
}

export async function deleteShare(
  id: string,
  secret: string,
): Promise<"ok" | "not-found" | "forbidden"> {
  const auth = await authorize(id, secret);
  if (auth !== "ok") return auth;
  await rm(dirFor(id), { recursive: true, force: true });
  return "ok";
}

/* ------------------------------------------------------------------ */
/* feedback                                                            */
/* ------------------------------------------------------------------ */

/**
 * Reactions left by whoever opened the link.
 *
 * Deliberately unauthenticated: the capability URL *is* the permission, and
 * demanding a sign-in to say "I like B better" would kill the one thing the
 * feature is for. The caps below are what stands in for an account.
 */
export const FEEDBACK_LIMITS = {
  maxCards: 40,
  maxCommentsPerCard: 60,
  maxCommentChars: 600,
  maxAuthorChars: 40,
  maxViewerIdChars: 64,
  maxLikesPerCard: 500,
} as const;

export type ShareFeedback = Record<string, CardFeedback>;

const feedbackPath = (id: string) => path.join(ROOT, id, "feedback.json");

export async function readFeedback(id: string): Promise<ShareFeedback> {
  if (!isShareId(id)) return {};
  try {
    return JSON.parse(await readFile(feedbackPath(id), "utf8")) as ShareFeedback;
  } catch {
    // Absent until someone reacts; an unreadable file is treated the same way
    // rather than failing the page that renders around it.
    return {};
  }
}

/** Trims one card's reactions to the caps above, dropping the oldest comments. */
function clampCard(card: CardFeedback): CardFeedback {
  const seen = new Set<string>();
  const likes: string[] = [];
  for (const v of card.likes) {
    const id = String(v).slice(0, FEEDBACK_LIMITS.maxViewerIdChars);
    if (!id || seen.has(id)) continue;
    seen.add(id);
    likes.push(id);
    if (likes.length >= FEEDBACK_LIMITS.maxLikesPerCard) break;
  }
  const comments = card.comments
    .slice(-FEEDBACK_LIMITS.maxCommentsPerCard)
    .map((c) => ({
      id: String(c.id).slice(0, 64),
      text: String(c.text).slice(0, FEEDBACK_LIMITS.maxCommentChars),
      at: Number.isFinite(c.at) ? c.at : Date.now(),
      author: String(c.author).slice(0, FEEDBACK_LIMITS.maxAuthorChars),
    }));
  return { likes, comments };
}

/**
 * Replaces one card's reactions.
 *
 * Last write wins per card, which is the right granularity here: two reviewers
 * reacting to different thumbnails never contend, and two reacting to the same
 * one within the same instant is not worth a lock file.
 */
export async function putCardFeedback(
  id: string,
  cardId: string,
  card: CardFeedback,
): Promise<ShareFeedback | "not-found"> {
  if (!isShareId(id)) return "not-found";
  try {
    await stat(path.join(ROOT, id, "manifest.json"));
  } catch {
    return "not-found";
  }

  const key = String(cardId).slice(0, 128);
  if (!key) return "not-found";

  const all = await readFeedback(id);
  const next: ShareFeedback = { ...all, [key]: clampCard(card) };

  // Drop empty entries so a like taken back does not leave a husk behind.
  for (const [k, v] of Object.entries(next)) {
    if (v.likes.length === 0 && v.comments.length === 0) delete next[k];
  }
  if (Object.keys(next).length > FEEDBACK_LIMITS.maxCards) return "not-found";

  await writeFile(feedbackPath(id), JSON.stringify(next), "utf8");
  return next;
}

/* ------------------------------------------------------------------ */
/* housekeeping                                                        */
/* ------------------------------------------------------------------ */

/**
 * Drops shares older than `maxAgeDays`.
 *
 * Nothing schedules this yet — it exists so the directory has a defined
 * retention story rather than growing forever, and can be wired to a cron.
 */
export async function pruneShares(maxAgeDays = 90): Promise<number> {
  const cutoff = Date.now() - maxAgeDays * 24 * 60 * 60 * 1000;
  let removed = 0;
  let entries: string[];
  try {
    entries = await readdir(ROOT);
  } catch {
    return 0;
  }
  for (const entry of entries) {
    if (!isShareId(entry)) continue;
    try {
      const info = await stat(path.join(ROOT, entry, "manifest.json"));
      if (info.mtimeMs < cutoff) {
        await rm(path.join(ROOT, entry), { recursive: true, force: true });
        removed++;
      }
    } catch {
      /* skip unreadable entries */
    }
  }
  return removed;
}
