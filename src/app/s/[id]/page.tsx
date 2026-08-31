import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";

import { SharedTaskView } from "@/components/sites/www-thumbnails-gg-41c6aae7/app-f53b52ad/SharedTaskView";
import { readShare } from "@/lib/sites/www-thumbnails-gg-41c6aae7/app-f53b52ad/shareStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

async function origin(): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3011";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

/**
 * Link previews.
 *
 * A shared test is usually pasted into a chat, so the unfurl carries the test's
 * own thumbnail as the preview image — the reviewer sees what they are being
 * asked about before they click.
 */
export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const share = await readShare(id);
  if (!share) return { title: "Link not available · thumbnails" };

  const cover = share.task.coverBlobId;
  const image = cover
    ? `${await origin()}/api/share/${id}/asset/${cover}`
    : undefined;

  return {
    title: `${share.name} · thumbnails`,
    description: share.task.card.title,
    openGraph: {
      title: share.name,
      description: share.task.card.title,
      type: "article",
      images: image ? [{ url: image, width: 1280, height: 720 }] : undefined,
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title: share.name,
      description: share.task.card.title,
      images: image ? [image] : undefined,
    },
    // A share link is unlisted, not public — keep it out of search results.
    robots: { index: false, follow: false },
  };
}

export default async function SharedTaskPage({ params }: Params) {
  const { id } = await params;
  const share = await readShare(id);
  if (!share) notFound();

  return <SharedTaskView share={share} />;
}
