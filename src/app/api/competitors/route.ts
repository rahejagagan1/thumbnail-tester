import { NextResponse } from "next/server";

import { fetchChannelTopVideos } from "@/lib/sites/www-thumbnails-gg-41c6aae7/app-f53b52ad/youtube";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Guard rails so one request can't fan out into a scrape. */
const MAX_URLS = 8;
const MAX_TAKE = 40;

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Expected a JSON body." }, { status: 400 });
  }

  const body = payload as { urls?: unknown; take?: unknown; pages?: unknown };
  const urls = Array.isArray(body.urls)
    ? body.urls.filter((u): u is string => typeof u === "string" && u.trim() !== "")
    : [];

  if (urls.length === 0) {
    return NextResponse.json(
      { error: "Provide at least one channel URL in `urls`." },
      { status: 400 },
    );
  }
  if (urls.length > MAX_URLS) {
    return NextResponse.json(
      { error: `At most ${MAX_URLS} channels per request.` },
      { status: 400 },
    );
  }

  const take = Math.min(
    MAX_TAKE,
    Math.max(1, typeof body.take === "number" ? body.take : 24),
  );
  const pages = Math.min(4, Math.max(0, typeof body.pages === "number" ? body.pages : 2));

  const results = await Promise.all(
    urls.map((url) =>
      fetchChannelTopVideos(url, { take, pages }).catch(() => ({
        url,
        ok: false as const,
        error: "Fetch failed.",
      })),
    ),
  );

  return NextResponse.json({ results });
}
