import { NextResponse } from "next/server";

import { FALLBACK_VIDEOS } from "@/data/sites/www-thumbnails-gg-41c6aae7/app-f53b52ad/fallbackVideos";
import { VIDEO_POOL } from "@/data/sites/www-thumbnails-gg-41c6aae7/app-f53b52ad/videoPool";

export const runtime = "nodejs";

/**
 * The random feed pool.
 *
 * The target refreshes its pool from this endpoint on mount. We serve the same
 * 182-video dataset that ships in the bundle, so behaviour is identical and the
 * client's fetch succeeds instead of 404-ing on every page load.
 */
export async function GET() {
  const videos = VIDEO_POOL.length > 0 ? VIDEO_POOL : FALLBACK_VIDEOS;
  return NextResponse.json(
    { videos },
    { headers: { "cache-control": "public, max-age=3600" } },
  );
}
