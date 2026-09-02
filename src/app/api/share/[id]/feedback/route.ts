import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import {
  FEEDBACK_LIMITS,
  putCardFeedback,
  readFeedback,
} from "@/lib/sites/www-thumbnails-gg-41c6aae7/app-f53b52ad/shareStore";
import type { CardComment, CardFeedback } from "@/types/thumbnails-app";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

const NOT_FOUND = NextResponse.json(
  { error: "Share not found." },
  { status: 404 },
);

/** Whatever the client sent, reduced to the shape the store will accept. */
function sanitize(body: unknown): CardFeedback | null {
  if (typeof body !== "object" || body === null) return null;
  const raw = body as { likes?: unknown; comments?: unknown };

  const likes = Array.isArray(raw.likes)
    ? raw.likes.filter((v): v is string => typeof v === "string" && v.length > 0)
    : [];

  const comments: CardComment[] = Array.isArray(raw.comments)
    ? raw.comments
        .filter((c): c is Record<string, unknown> =>
          typeof c === "object" && c !== null,
        )
        .map((c) => ({
          id: typeof c.id === "string" ? c.id : "",
          text: typeof c.text === "string" ? c.text.trim() : "",
          at: typeof c.at === "number" ? c.at : Date.now(),
          author: typeof c.author === "string" ? c.author.trim() : "Anonymous",
        }))
        .filter((c) => c.id !== "" && c.text !== "")
    : [];

  if (comments.length > FEEDBACK_LIMITS.maxCommentsPerCard) return null;
  return { likes, comments };
}

/** Everyone with the link reads the same reactions. */
export async function GET(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  const feedback = await readFeedback(id);
  return NextResponse.json(
    { feedback },
    // No caching: a reviewer's like should show up on the author's next look,
    // not after a TTL.
    { headers: { "cache-control": "no-store" } },
  );
}

/**
 * Replaces one card's reactions.
 *
 * No secret required — anyone holding the share link may react, which is the
 * whole point. The author's revoke secret still gates changing the test itself.
 */
export async function POST(request: NextRequest, { params }: Params) {
  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Expected JSON." }, { status: 400 });
  }

  const { cardId, feedback } = (body ?? {}) as {
    cardId?: unknown;
    feedback?: unknown;
  };
  if (typeof cardId !== "string" || cardId === "") {
    return NextResponse.json({ error: "Missing cardId." }, { status: 400 });
  }

  const clean = sanitize(feedback);
  if (!clean) {
    return NextResponse.json({ error: "Bad feedback payload." }, { status: 400 });
  }

  const result = await putCardFeedback(id, cardId, clean);
  if (result === "not-found") return NOT_FOUND;
  return NextResponse.json({ feedback: result });
}
