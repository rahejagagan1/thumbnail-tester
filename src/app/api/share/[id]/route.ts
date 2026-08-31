import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { parseShareUpload } from "@/lib/sites/www-thumbnails-gg-41c6aae7/app-f53b52ad/shareRequest";
import {
  authorize,
  deleteShare,
  readShare,
  updateShare,
} from "@/lib/sites/www-thumbnails-gg-41c6aae7/app-f53b52ad/shareStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

const NOT_FOUND = NextResponse.json(
  { error: "Share not found." },
  { status: 404 },
);

export async function GET(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  const share = await readShare(id);
  if (!share) return NOT_FOUND;
  // Short cache only: a share can be updated in place by its author, so viewers
  // should not hold a stale manifest for long.
  return NextResponse.json(share, {
    headers: { "cache-control": "public, max-age=30" },
  });
}

/** Refreshes a share in place after the author edited the test. */
export async function PUT(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const secret = request.headers.get("x-share-secret") ?? "";
  if (!secret) {
    return NextResponse.json({ error: "Missing secret." }, { status: 401 });
  }

  // Check the secret before touching the body: an unauthorized caller should
  // never get the server to buffer a multi-megabyte upload.
  const auth = await authorize(id, secret);
  if (auth === "not-found") return NOT_FOUND;
  if (auth === "forbidden") {
    return NextResponse.json({ error: "Wrong secret." }, { status: 403 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "Expected multipart/form-data." },
      { status: 400 },
    );
  }

  const parsed = await parseShareUpload(form);
  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: parsed.status });
  }

  const result = await updateShare(id, secret, parsed.manifest, parsed.assets);
  if (result === "not-found") return NOT_FOUND;
  if (result === "forbidden") {
    return NextResponse.json({ error: "Wrong secret." }, { status: 403 });
  }
  return NextResponse.json({ ok: true });
}

/** Revokes a share. The secret is held only by the author's browser. */
export async function DELETE(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const secret = request.headers.get("x-share-secret") ?? "";
  if (!secret) {
    return NextResponse.json({ error: "Missing secret." }, { status: 401 });
  }

  const result = await deleteShare(id, secret);
  if (result === "not-found") return NOT_FOUND;
  if (result === "forbidden") {
    return NextResponse.json({ error: "Wrong secret." }, { status: 403 });
  }
  return NextResponse.json({ ok: true });
}
