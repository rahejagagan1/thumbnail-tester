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

## 4. Comparing several thumbnails, and placing them by hand (added)

**Why:** the target already had a Multiple thumbnail mode, but with three or four
variants in the feed every card looked identical — same title, same channel, same
everything — so you could not say which one you were reacting to. And the only choices
for where they sat were *all at the front* or *scattered at random*.

### Variant badges

In `Multiple` mode each enabled thumbnail becomes its own card, as before. When more
than one is enabled the cards now carry an **A / B / C…** badge (`.yt-variant-badge`,
top-left of the thumbnail), and the sidebar swatches carry the same letter. Letters
follow the enabled order, so hiding B re-letters the rest immediately — the mapping is
always what you see, never a stale index.

The alphabet is defined once in `useFeedCards.ts` (`VARIANT_LABELS`) and mirrored in
`EditorPanel.tsx` (`LETTERS`).

### Drag to place

Any test card can be dragged onto any other card in the desktop grid; it lands in that
slot and everything else shifts down. The first drag switches **Placement** to a new
third option, `Manual`; choosing `First` or `Random` again throws the arrangement away.

- `FeedState.slots` — `Record<cardId, feedIndex>`, written by `moveCardTo`.
- `useFeedCards` inserts manually-placed cards low index first, so each one lands where
  it was dropped instead of being pushed along by the cards inserted after it.
- Positions are saved with the task (`TaskRecord.slots`) and restored on reopen. Records
  written before this defaulted to `{}`.

A file drag (dropping a .png onto the test card to replace its image) and a card drag
fire the same DOM events. They are told apart by `dataTransfer.types` containing
`"Files"`, so the existing drop-to-upload path is untouched.

Mobile and Watch render the same ordered array, so an arrangement made on Desktop shows
up there too; the drag handles themselves are Desktop-only.

### Verification

`npm run test:e2e:columns` — asserts the rule against the measured content width on
both the tester and a shared link, collapses and reopens the guide from the masthead
(3 cards -> 4 -> 3, and the 168px moving between rail and grid), and re-checks the rule at
six viewport widths. 18/18 passing.

`npm run test:e2e:variants` — four variants uploaded in one go, badges asserted as
`ABCD`, a variant hidden and the rest re-lettered to `ABC`, then a real mouse drag from
slot 0 to slot 7 with the displaced card checked to still be present, and `First`
restoring the original order. 11/11 passing.

---

## 5. Likes and comments on a thumbnail (added)

**Why:** the previous two features made it possible to put four thumbnails in front of
someone. They gave nobody a way to say which one they preferred. On the target the card's
"3 dots" button is decorative; here it carries the two reactions that actually matter when
someone is weighing your options.

### The menu

`CardMenu.tsx`, rendered in place of the inert kebab **on test cards only** — pool cards
keep the target's original button, markup and all.

- **Like** — a toggle, with the count beside it.
- **Comment** — opens a composer (Enter posts, Shift+Enter newlines, 600 chars) and the
  thread underneath. You can delete your own comments, not other people's.
- Escape closes it, matching every other popover in the app.

Cards with reactions show a `♥ n  💬 n` badge in the thumbnail's top-right
(`.yt-feedback-badge`), so you can see where the feedback landed without opening
four menus.

### Where the reactions live

Likes are stored as **viewer ids, not a count**, so a reviewer can take their own like
back without being able to clear anyone else's. Each browser mints a random local id
(`getViewerId`); it is not an identity and tells the server nothing about the person.

| Test | Storage |
|---|---|
| Local only | `TaskRecord.feedback`, in IndexedDB with the rest of the test |
| Shared | `<share>/feedback.json` on the server, pooled across everyone with the link |

`useShareFeedback` is the bridge, and both sides call it — the tester at `/app` and the
read-only shared page. Given a share id it pulls the pooled reactions down and pushes
every local change up through `FeedState.feedbackSink` (the same injection idiom as
`uploadHandler` / `dropHandler`). The server wins per card, since it holds everyone's;
cards it has never heard of keep whatever is local. With no share id it does nothing and
reactions stay entirely local.

### API

`GET /api/share/[id]/feedback` → `{ feedback }`, `no-store` — a reviewer's like should
show up on the author's next look, not after a TTL.

`POST /api/share/[id]/feedback` → `{ cardId, feedback }`, replaces one card's reactions.

**Deliberately unauthenticated.** The capability URL *is* the permission; demanding a
sign-in to say "I prefer B" would kill the one thing the feature is for. Standing in for
an account: every field is re-derived server-side by `sanitize()` rather than trusted, and
`FEEDBACK_LIMITS` caps cards per share, comments per card, comment and author length, and
likes per card. Last write wins per card — two reviewers reacting to different thumbnails
never contend, and two hitting the same one in the same instant is not worth a lock file.

The author's revoke secret still gates changing the test itself; revoking removes the
feedback with it.

### Naming

The shared page carries a **Your name** field next to Copy link, kept in `localStorage`,
that signs the comments a reviewer leaves. The author's own notes are signed `You`. The
name is supplied by the caller rather than re-read inside the hook, so an author who has
previously reviewed someone else's link does not end up signing their own notes with their
guest name.

Saving a copy of a shared test keeps the thread — the notes travel with the thumbnail they
are about.

**Fidelity impact:** the test card's kebab is now a menu inside a positioned `span`, so it
differs from the target's markup. Pool cards are untouched, which is the overwhelming
majority of the feed.

### Verification

`npm run test:e2e:feedback` — the full round trip in two isolated browser contexts: the
author likes and comments on variant A, reloads to prove it persisted, publishes, a
stranger opens the link, sets their name, and likes and comments on variant B; the author
reloads and sees the reviewer's note and count; the reviewer takes their like back and the
author's own like is unaffected. Plus the API's rejection cases. 20/20 passing.

---

## 6. Retitling from the inspect panel (added)

The inspect panel showed the title and the channel name as dead text: changing either
meant closing the panel, finding the field in the editor, and reopening. Both are now
editable where they are read.

### The affordance

A pencil button sits after each line, and the text itself is clickable. Clicking either
swaps the line for a field — a two-row textarea for the title, an input for the channel —
sized and coloured like the text it replaces, so the panel does not jump. Enter or Escape
closes it; so does clicking away. Both are in `EditableText` (`InspectModal.tsx`).

Edits are written through on every keystroke, the way the editor panel's fields are. That
is what makes the panel worth typing in: the exportable card, the three "at feed size"
previews and the feed behind the scrim all move with the text.

### Which title an edit belongs to

`inspect` holds the view model captured when the card was clicked — a snapshot, so an
edit written to the store would leave the panel showing its own stale copy. The panel now
reads the title and channel live from the store for a test card and keeps the snapshot for
everything else.

In multiple-titles mode the card is not showing `testCard.title` at all; it is showing one
variant, picked by hashing the seed with the card's key. An edit has to land on that
variant, so the picker moved out of `useFeedCards`'s memo into an exported
`titleVariantForCard(cardId, titleMode, titles, seed)` that both the feed builder and the
panel call. Matching the variant by its text instead would break on two variants with the
same words.

The channel name is shared by every variant, so it always writes to `testCard`.

### Not on a shared link

`InspectModal` takes `editable`, and `SharedTaskView` passes `editable={false}`. A
reviewer opening someone else's link inspects the card and leaves feedback; the test
itself stays the author's. Competitor cards are never editable either — they are fetched
video data with nowhere to write back to.

### Verification

`npm run test:e2e:inspect` — uploads a thumbnail, retitles and renames the channel from
the panel, and checks the text reaches the exportable card, the feed card and the editor
panel's own fields; switches to multiple titles and checks the edit lands on the drawn
variant while the single title is left alone; then publishes and checks a viewer of the
shared link gets no edit buttons. 18/18 passing.

### Noticed while testing, not fixed

`Field` (`EditorPanel.tsx`) wraps its control in a `<label>`. A `button` is labelable, so
in a `Field` containing a `Seg` the first segment takes the field's label as its
accessible name: the "Single" button announces as "Mode test one or many Multiple" and is
unreachable by its own name. Pre-existing, and outside this change — the e2e script
selects those segments by class with a comment saying why.

---

## 7. Review stages on a saved test (added)

The library listed tests with no sense of where any of them had got to. Each one now
carries a stage, shown as a coloured chip on its card and changed from a menu behind it.

| stage | chip | means |
|---|---|---|
| `draft` | First draft | Yours, not shown to anyone yet |
| `review` | For approval | Sent out, waiting on a verdict |
| `revision` | Changes needed | Came back with notes to work through |
| `final` | Final approval | Last look before it ships |
| `done` | Completed | Signed off and published |

Stored as a key, not a label, so the wording can change without rewriting saved tasks.
`revision` sits third because that is where a rejected review lands; from there a test
goes back out for approval rather than onwards.

### Where it is written

`TaskRecord.status`, alongside `share` — both are things that happen *to* a test rather
than edits of it. `setTaskStatus` writes it straight to IndexedDB and, like `setTaskShare`,
deliberately leaves `updatedAt` alone: the library is ordered by last edit, and a test
jumping to the front because someone ticked it off would lose that ordering.

`normalize` defaults a missing status to `draft`, so tests saved before this existed read
as first drafts. `toTaskRecord` carries the existing status through, which is what stops
an autosave from un-approving a test the moment the author opens it again. A duplicate
keeps the stage; unlike `share`, a stage is not something a copy has to earn back.

### Two places, one chip

The chip is on the library card and in the tester's toolbar, beside the test name and the
save state — the two places you look at a test. `TaskStatusChip.tsx` holds the stage
table, the chip and the picker; the library passes the summary it already has, and the
toolbar reads the one field it needs through `useTaskStatus`, straight from the database,
because the feed store knows nothing about review stages. Either one writes to the same
record, so they cannot disagree.

The toolbar chip appears only once a test has been saved: before the first autosave there
is no record to write a stage to.

### The filter

The stage tabs above the grid count what is at each stage and hide the ones holding
nothing. With fewer than two stages in play the row does not render — a single tab reading
"All 3" is noise.

### Not on the shared link

A share is a snapshot: a viewer opening a link published at "For approval" would still see
that after the test was completed, which is worse than showing nothing. The stage stays in
the author's library.

### Verification

`npm run test:e2e:status` — a new test starts as a first draft, walks all four remaining
stages, survives a reload, survives being edited afterwards, does not reorder the library
when restaged, filters correctly, and is carried by a duplicate. Then the toolbar: it
shows the stage the library shows, restaging there reaches the library, and an unsaved
test has no chip at all. 20/20 passing.

---

## Corrected against YouTube

### Feed column count (changed)

The target computes the desktop grid's auto column count as:

```js
function x(e){return e<=0?4:Math.max(1,Math.min(6,Math.floor((e+16)/316)))}
```

316 = a 300px minimum card + a 16px margin. YouTube's actual rich grid, read off a live
desktop feed in Chrome, uses:

```
--ytd-rich-grid-item-min-width: 326.8px
--ytd-rich-grid-item-margin:     16px
```

Measured: at 1249px of grid width YouTube rendered **3** cards per row; the target's
formula returns 4 at that width. The target overshoots by one column across a wide band —
notably 1564-1632px, where it shows 5 and YouTube shows 4.

For a thumbnail tester that gap matters more than clone fidelity does: a card previewed
five-across is narrower than it will ever be on YouTube, so the test flatters small text
and tight crops. `autoColumns` in `useInfiniteScroll.ts` now divides by
`326.8 + 16 = 342.8`, with both constants named and sourced in a comment.

| grid width | target | ours / YouTube |
|---|---|---|
| 1000 | 3 | 2 |
| 1249 | 4 | **3** (measured) |
| 1400 | 4 | 4 |
| 1564 | 5 | 4 |
| 1632 | 5 | 4 |
| 1700 | 5 | 5 |
| 2000 | 6 | 5 |

Those "ours" figures are the YouTube rule alone; four is now the ceiling on top of it —
see *Four cards per row, maximum* below.

A pinned count overrides the window width *and* the guide rail, which from the feed alone
looks identical to a layout bug — it was mistaken for one. Layout now labels the hint
`pinned — ignores width` and spells out underneath that resizing and collapsing the guide
will not change it, with Auto named as the way back.

### Four cards per row, maximum (changed)

`autoColumns` clamps at `MAX_COLUMNS = 4`, and the pinned options are `Auto / 3 / 4`. The
`5` button is gone.

YouTube keeps going past four — six across on a 2560px screen — so this is a deliberate
break with the target rather than a fidelity fix. The reason is what the tool is for: a
thumbnail judged five-across is smaller than it will ever be in a real feed, so small text
and tight crops look better in the test than they will in life. Four is where a card is
still big enough to judge.

It is one ceiling in one function, so the tester and a shared link inherit it together —
both surfaces render through `autoColumns`. `fromTaskRecord` clamps as well: tests saved
while `5` was on offer, and links published then, would otherwise reinstate a count the
app no longer allows.

The width readout in the Columns field keeps reporting honestly — a 2080px feed reads
`2080px → 4`, not a made-up number.

### The guide rail counts

The left rail is 240px expanded and 72px collapsed, and `.yt-feed` is `flex: 1`, so the
rail comes straight off the grid. At a 1526px viewport that is the difference between
**3 cards and 4** — one whole column — which matches YouTube exactly.

Two things were wrong here and are now fixed:

- **The masthead menu button was decorative.** On the target it does nothing, so the
  shared page had no way to see the feed without the guide, and the tester only collapsed
  it as a side effect of opening the editor. It now toggles the rail, as on YouTube.
  `guideDefault` is what the surface asks for and `guideOpen` is the viewer's own choice,
  which wins until the surface default changes under it. Neither is saved with the task —
  it is a way of looking at the feed, not part of the test.
- **The mount measurement disagreed with the resize measurement.** `ResizeObserver`
  reports the content box, but the initial read used `el.clientWidth`, which includes the
  grid's 24px side padding — 48px, enough to show one column too many until the first
  resize corrected it. Both now measure the content box.

**Fidelity impact:** a diff against the target at a width in one of the divergent bands
will report a different card count in the grid. That is intentional.

---

## Removed from the clone

### Author credit in the brand (removed)

The target prints an author credit next to the wordmark — `by <handle>`, linking to that
person's X profile — inside a `span.tool-by`. It was reproduced during the emulation phase
and has now been removed at the user's request, from both the tester toolbar
(`Toolbar.tsx`) and the library header (`TaskLibrary.tsx`). This is someone else's
attribution; it does not belong on a build that is not theirs.

The same handle was also the default channel name on an untouched test card. It is now
`Your Channel`, matching the neutral `Your Title Goes Here` beside it. Both defaults are
exported from `store.ts` as `DEFAULT_CARD_CHANNEL` / `DEFAULT_CARD_TITLE` and consumed by
`isWorthSaving` and `defaultTaskName`, so "still untouched" is decided in one place — a
reworded placeholder cannot silently start autosaving empty tests.

The `.tool-by` class stays: the task chip and the shared-task header both use it. Its
`a` rules in `globals.css` are now unused but are left as ported, untouched stylesheet.

Verbatim captures of the target (`source-app.html`, `components/Toolbar.spec.md`) still
contain the credit. They are evidence of what the target renders and were left alone.

**Fidelity impact:** the target renders `<span class="tool-by">by <a>…</a></span>` inside
`.tool-brand` — 2 elements, measured against `source-app.html`. Our `/app` no longer emits
them, so a fidelity diff will report the brand region as 2 elements short. That is
intentional; excise `.tool-brand > .tool-by` on the target side alongside the task chip
and the Competitors section when re-running the diff.

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

Those counts predate the author-credit removal. The clone side is now 2 elements lower in
the brand region, and `.tool-brand > .tool-by` has to be excised on the target side too —
see *Removed from the clone* above.

### Fidelity bug found during visual QA

The Watch surface had three action buttons — Share, **Download**, Save. The target has
only Share and Save; the extra button came from an error in the builder brief, not from
the recovered source. Removed, and confirmed against both the bundle
(two `ytw-action` entries) and the live page.
