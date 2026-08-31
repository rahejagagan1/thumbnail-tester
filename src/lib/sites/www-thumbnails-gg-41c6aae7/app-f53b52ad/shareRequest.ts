import "server-only";

import type { SharedTask } from "@/types/share";

import {
  LIMITS,
  isAllowedType,
  isAssetId,
  type IncomingAsset,
} from "./shareStore";

export interface ParsedShare {
  manifest: Omit<SharedTask, "shareId" | "assets">;
  assets: IncomingAsset[];
}

/**
 * Reads a share upload out of a multipart request.
 *
 * Shared by create (POST /api/share) and update (PUT /api/share/[id]) so both
 * enforce exactly the same limits. Returns a message string on rejection rather
 * than throwing, so each route can pick its own status code.
 */
export async function parseShareUpload(
  form: FormData,
): Promise<ParsedShare | { error: string; status: number }> {
  const rawManifest = form.get("manifest");
  if (typeof rawManifest !== "string") {
    return { error: "Missing manifest.", status: 400 };
  }
  if (rawManifest.length > LIMITS.maxManifestBytes) {
    return { error: "This test is too large to share.", status: 413 };
  }

  let manifest: Omit<SharedTask, "shareId" | "assets">;
  try {
    manifest = JSON.parse(rawManifest);
  } catch {
    return { error: "Manifest is not valid JSON.", status: 400 };
  }
  if (!manifest?.task?.card) {
    return { error: "Manifest is missing the test.", status: 400 };
  }

  const assets: IncomingAsset[] = [];
  let total = 0;

  for (const [field, value] of form.entries()) {
    if (!field.startsWith("asset:") || typeof value === "string") continue;

    const id = field.slice("asset:".length);
    if (!isAssetId(id)) return { error: `Bad asset id: ${id}`, status: 400 };

    const file = value as File;
    if (!isAllowedType(file.type)) {
      return {
        error: `Unsupported image type: ${file.type || "unknown"}.`,
        status: 415,
      };
    }
    if (file.size > LIMITS.maxAssetBytes) {
      return { error: "One of the images is too large to share.", status: 413 };
    }
    if (assets.length >= LIMITS.maxAssets) {
      return { error: "Too many images in this test to share.", status: 413 };
    }

    total += file.size;
    if (total > LIMITS.maxTotalBytes) {
      return {
        error: "This test's images exceed the share size limit.",
        status: 413,
      };
    }

    assets.push({
      id,
      contentType: file.type,
      bytes: Buffer.from(await file.arrayBuffer()),
    });
  }

  return {
    manifest: {
      name: String(manifest.name ?? "Shared test"),
      createdAt: Number(manifest.createdAt) || Date.now(),
      updatedAt: Number(manifest.updatedAt) || Date.now(),
      task: manifest.task,
    },
    assets,
  };
}
