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
  `/c/name`, `/user/name`), a bare `UC…` id, **or any video link from that channel**
  (`watch?v=`, `youtu.be/`, `/shorts/`, `/embed/`, `/live/`), which is resolved back to
  its uploader. Several can be pasted at once, separated by spaces or commas. Enter
  submits.
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

### Avatars

Fetched avatar URLs are normalised in `normalizeAvatar()` before they reach the client:
protocol-relative URLs get a scheme, `yt3.googleusercontent.com` is rewritten to its
`yt3.ggpht.com` alias (what YouTube's own feed and the target's dataset use), and the
`=s900` size is dropped to `=s176`. The avatar renders at 36px, so s900 was ~10x more
bytes than needed and made CDN rate limiting much more likely.

Google's avatar CDN returns **429 Too Many Requests** under load, which previously left a
broken-image glyph in the card because the target only falls back to its monogram when
`avatar` is null — never when the image *fails*. `ChannelAvatar.tsx` closes that gap: it
falls back to the target's coloured monogram on `onError` as well as on null. `onError`
is a client-side handler and is not serialised into HTML, so the rendered markup stays
byte-identical to the target on the happy path (verified: 658 vs 658 nodes, zero
divergences outside the added Competitors section).

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

## 3. Task library and autosave (added)

**Why:** the tester held one in-memory test. Reload and your thumbnail was gone.

### Routing

| Route | What it is |
|---|---|
| `/` | the library — every saved test, plus **New test** |
| `/app` | the tester (this also restores the target's own pathname) |
| `/app?task=<id>` | the tester with a saved test loaded |

The clone itself was unchanged by the move; `/app` still diffs to zero against the target
outside the two added features.

### Storage — IndexedDB, not localStorage

`taskDb.ts` keeps two object stores:

- `tasks` — small JSON-clonable records, indexed by `updatedAt`
- `blobs` — the actual image Blobs, referenced by id

localStorage was ruled out: a 1280x720 PNG is comfortably over 1MB and base64 adds
another third, against a ~5MB total budget — three or four saves and it is full.
IndexedDB stores Blobs natively with a far larger quota.

Blobs live outside the task record so the library can list tests without pulling
megabytes of image data. `deleteTask` garbage-collects a task's blobs but first checks
every other task, so a duplicated test never loses its image.

### Autosave

`useTaskAutosave.ts` subscribes to the store and debounces a write 900ms after the last
change. It will not create a record until `isWorthSaving()` is true — an upload, a
variant, a competitor, or an edited title/channel — so opening the tester and leaving
does not litter the library with empty tests. Concurrent saves are collapsed via an
in-flight flag with a dirty bit.

`taskSnapshot.ts` converts between store state and a task record. Freshly-uploaded
images (`blob:` URLs) are persisted; images already backed by a blob id are reused, so
repeated autosaves do not grow the database.

The toolbar carries the test name (click to rename) and a Saved / Saving… / Not saved
indicator.

### Limits worth knowing

Storage is per-browser and per-origin. Tests do not sync across devices or browsers, and
clearing site data removes them. Private windows usually block IndexedDB entirely — the
library detects this and says so rather than silently losing work.

---

## Closed gap

`GET /api/videos` is now implemented (`src/app/api/videos/route.ts`). It serves the same
bundled 182-video dataset the client already ships, so behaviour is identical to before
and the client's fetch no longer 404s on every page load.

## Fragility note

Both endpoints depend on the shape of YouTube's `ytInitialData` payload, which Google
changes without notice. Every parse step is defensive — a shape change degrades to
"Could not read the channel page" rather than throwing — but if competitor fetching
starts failing across the board, the parser in `youtube.ts` is the first place to look.


---

## Verification

`npm run test:e2e` (needs `npm run dev` running) drives a real Chromium through the whole
task flow: empty library, create, upload, edit, autosave, reopen, hard reload, duplicate,
delete, and a console-error check. 17/17 passing.

Clone fidelity is re-checked after every change by diffing `/app`'s server-rendered DOM
against the target's own HTML with the two added blocks excised:

```
clone nodes: 698
  - task chip:            7 nodes
  - Competitors section:  33 nodes
clone with both excised: 658 | target: 658
divergences outside the added features: 0
```

### Fidelity bug found during visual QA

The Watch surface had three action buttons — Share, **Download**, Save. The target has
only Share and Save; the extra button came from an error in the builder brief, not from
the recovered source. Removed, and confirmed against both the bundle
(two `ytw-action` entries) and the live page.
