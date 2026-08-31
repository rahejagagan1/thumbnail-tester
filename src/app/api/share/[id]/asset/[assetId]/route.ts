import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { readAsset } from "@/lib/sites/www-thumbnails-gg-41c6aae7/app-f53b52ad/shareStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string; assetId: string }> };

/** Serves one image from a share. Ids not listed in the manifest 404. */
export async function GET(_request: NextRequest, { params }: Params) {
  const { id, assetId } = await params;
  const asset = await readAsset(id, assetId);
  if (!asset) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  return new NextResponse(new Uint8Array(asset.bytes), {
    headers: {
      "content-type": asset.contentType,
      "content-length": String(asset.bytes.byteLength),
      // A share's images never change, so viewers and link unfurlers can hold
      // on to them for as long as they like.
      "cache-control": "public, max-age=31536000, immutable",
      "content-disposition": "inline",
      "x-content-type-options": "nosniff",
    },
  });
}
