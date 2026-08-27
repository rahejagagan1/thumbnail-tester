import { NextResponse } from "next/server";

import { fetchChannelIdentity } from "@/lib/sites/www-thumbnails-gg-41c6aae7/app-f53b52ad/youtube";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Channel name + avatar + verified tick for the editor's "Channel handle" field.
 * `handle` may be a bare handle ("MrBeast"), an @handle, a channel id, or a URL.
 */
export async function GET(request: Request) {
  const handle = new URL(request.url).searchParams.get("handle")?.trim();
  if (!handle) {
    return NextResponse.json({ error: "Missing `handle`." }, { status: 400 });
  }

  // A bare word is a handle; anything else is passed through as-is.
  const query = /^[\w.\-]+$/.test(handle) ? `@${handle}` : handle;

  const result = await fetchChannelIdentity(query).catch(() => ({
    ok: false as const,
    error: "Lookup failed.",
  }));

  if (!result.ok) {
    return NextResponse.json(
      { error: result.error ?? "Channel not found." },
      { status: 404 },
    );
  }

  return NextResponse.json({
    name: result.name,
    avatar: result.avatar ?? null,
    verified: result.verified ?? false,
    subscribers: result.subscribers ?? null,
  });
}
