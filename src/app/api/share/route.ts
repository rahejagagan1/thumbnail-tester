import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { parseShareUpload } from "@/lib/sites/www-thumbnails-gg-41c6aae7/app-f53b52ad/shareRequest";
import {
  createShare,
  isEphemeralHost,
} from "@/lib/sites/www-thumbnails-gg-41c6aae7/app-f53b52ad/shareStore";
import type { CreateShareResponse } from "@/types/share";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Publishes a saved test so anyone with the link can open it.
 *
 * The body is multipart/form-data: a `manifest` field holding the task JSON,
 * plus one file per image under `asset:<blobId>`. Images travel as raw files
 * rather than base64 inside the JSON, which keeps the request about a third
 * smaller and lets the server write them straight to disk.
 */
export async function POST(request: NextRequest) {
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

  const { id, secret } = await createShare(parsed.manifest, parsed.assets);

  const body: CreateShareResponse = {
    id,
    secret,
    url: `${request.nextUrl.origin}/s/${id}`,
    ephemeral: isEphemeralHost(),
  };
  return NextResponse.json(body, { status: 201 });
}
