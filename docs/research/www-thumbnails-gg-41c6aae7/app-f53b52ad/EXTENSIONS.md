# Extensions beyond the clone

Everything in `PAGE_TOPOLOGY.md`, `BEHAVIORS.md`, `DESIGN_TOKENS.md` and
`COMPONENT_INVENTORY.md` describes the target site as it exists. This file records
functionality added **on top of** the clone at the user's request. None of it exists on
`https://www.thumbnails.gg/app`.

If you re-run a fidelity diff against the target, expect these to show up as differences.
They are intentional.

---

## 1. Competitor feed (added)

**Why:** the stock feed surrounds your thumbnail with a fixed pool of 182 random videos.
That tells you how you read against *some* thumbnails, not against the ones you will
actually appear beside. This lets you pin real competitor channels and fill the feed with
their highest-viewed videos instead.

### UI

A new **COMPETITORS** accordion in the editor sidebar, between *Details* and *Placement*
(`CompetitorsSection.tsx`):

- **Feed** — a `Random` / `Competitors` segmented control. Random is the default and the
  original behaviour is untouched.
- **Add channel** — accepts a `@handle`, a full channel URL (`/@handle`, `/channel/UC…`,
  `/c/name`, `/user/name`), a bare `UC…` id, or several at once separated by spaces or
  commas. Enter submits.
- **Channel rows** — each shows the resolved channel avatar and name, its subscriber
  count, how many videos were kept and out of how many sampled, plus a checkbox to
  include/exclude it from the feed and an × to remove it. Errors render inline in red.
- **Fetch top videos** / **Remove all**.

Fetching switches `Feed` to `Competitors` and reshuffles automatically. If
`Competitors` is selected but nothing has loaded yet, the feed falls back to the random
pool and says so rather than rendering empty.

### Data flow

`POST /api/competitors` → `{ urls: string[], take?: number, pages?: number }`
→ `{ results: ChannelFetchResult[] }`, in request order.

Guard rails: at most 8 channels per request, at most 40 videos kept per channel, at most
4 continuation pages.

### How the videos are fetched

`src/lib/sites/.../youtube.ts` (server-only). It reads a channel's Videos tab the way a
browser does, parses `ytInitialData` out of the HTML, then pages through the InnerTube
`browse` continuation endpoint. No API key is required.

**Important caveat, by design:** YouTube no longer honours the old `?sort=p`
("most popular") parameter — it is silently ignored, and the InnerTube `params` values
that used to select a popular sort no longer work either. Both were tested and confirmed
dead. So the ranking is done locally: the reader samples the most recent ~90 uploads
(1 page + 2 continuations × 30) and sorts *that sample* by view count.

The result is therefore **the most-viewed videos among the channel's ~90 most recent
uploads**, not its all-time top. Each channel row shows `top of N` so this is visible in
the UI rather than implied. For most channels this is arguably the more useful set
anyway — recent uploads reflect the thumbnail style you are actually competing against
today.

Views are parsed with a `61M` / `357.5K` / `1,234` aware converter before sorting.
Continuations can overlap, so entries are de-duped by video id first.

Thumbnails use `https://i.ytimg.com/vi/{id}/hq720.jpg` — 1280×720, always present, and
free of the expiring `sqp` signature that the URLs embedded in `ytInitialData` carry.

The verified tick is read from a `CHECK_CIRCLE_FILLED` client resource inside the page
header. (The same icon appears next to channel names in video lockups, so the check is
scoped to `header` only.) Validated against verified channels and an unverified one.

---

## 2. Channel handle lookup (completed)

The target's editor has a **Channel handle → Fetch** button that fills in your own
channel name and avatar. In the clone this was a dead endpoint: the button called
`/api/channel` and no-opped, because reproducing it was assumed to need a YouTube Data
API key.

The same key-less reader used for competitors makes it work, so it is now implemented:

`GET /api/channel?handle=<handle|@handle|UC…|url>` →
`{ name, avatar, verified, subscribers }`, or `404 { error }`.

`ChannelHandleField` in `EditorPanel.tsx` was changed to render the error inline instead
of silently swallowing it.

---

## Remaining gap

`GET /api/videos` — the target refreshes its 182-video random pool from this endpoint on
mount. Not implemented; the fetch stays and fails soft onto the bundled dataset. It is
not needed for any behaviour, and the competitor feed now covers the real use case it
was serving.

## Fragility note

Both endpoints depend on the shape of YouTube's `ytInitialData` payload, which Google
changes without notice. Every parse step is defensive — a shape change degrades to
"Could not read the channel page" rather than throwing — but if competitor fetching
starts failing across the board, the parser in `youtube.ts` is the first place to look.
