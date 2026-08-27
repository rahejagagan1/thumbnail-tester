# Behaviors — https://www.thumbnails.gg/app

Every behavior below was recovered from the target's production JavaScript bundle and
its stylesheet, then cross-checked against the live page. Values are exact, not estimated.

## Global: what this page does NOT do

Ruled out by inspection of the DOM, the stylesheet and the bundle:

- **No smooth-scroll library.** No `.lenis`, no `.locomotive-scroll`, no scroll-container wrapper.
- **No page scroll at all.** `.tool-root { height: 100dvh; overflow: hidden }`.
- **No scroll-triggered reveal animations, no parallax, no `scroll-snap`, no `animation-timeline`.**
- **No sticky-header state change** — the toolbar's appearance is constant.

The only entrance animations are the one-shot `.anim-fade` / `.anim-scale` classes applied
when an element mounts (editor sidebar, popovers, modals).

## Interaction model per section

| Section | Model |
|---|---|
| Toolbar | click-driven |
| Surface segmented control | click-driven |
| Squint / Export popovers | click-driven, closed by a fixed `zIndex:40` scrim |
| Feed grid / mobile feed / watch rail | **infinite scroll** (IntersectionObserver) + click-to-inspect |
| Editor sidebar | form input + accordion click |
| Inspect modal | click-driven |
| Flash test | **time-driven** state machine |

## Infinite scroll (all three surfaces)

```
initial   = 12 items
step      = +9 per trigger
observer  = IntersectionObserver(root = the surface's scroll element,
                                 rootMargin = "800px 0px")
reset     = whenever `resetKey` changes, count returns to `initial`
resetKey  = `${viewMode}-${seed}-${placement}`
```

The sentinel is a 1px-high `aria-hidden` div after the last card.

## Desktop grid columns

A `ResizeObserver` on the `.yt-grid` element recomputes the column count on every
resize when Columns is `Auto`:

```
cols = clamp(1, 6, floor((containerWidth + 16) / 316))
```

Initial value 4; also computed once from `el.clientWidth` on mount. When Columns is
`3`/`4`/`5` the literal value is used and the observer result is ignored. The count is
written to the CSS custom property `--yt-cols`, consumed by
`grid-template-columns: repeat(var(--yt-cols, 4), minmax(0, 1fr))`.

## Feed composition (the core memo)

Recomputed when any of `[pool, seed, placement, testCard, thumbMode, thumbnails, titleMode, titles, flash.index, flash.seed]` changes:

1. Shuffle the 182-video pool with a seeded LCG:
   `s = (1664525·s + 0x3c6ef35f) >>> 0`, Fisher–Yates using `s % (i+1)`.
   The seed is `flash.seed` while a flash test runs, otherwise the store's `seed`.
2. Build the test card(s). In `multiple` thumbnail mode one card per enabled thumbnail;
   in `single` mode one card, using `PLACEHOLDER_THUMB` until an image is uploaded.
3. In `multiple` title mode each test card's title is picked deterministically:
   `enabledTitles[hashString(\`title${seed}_${cardId}\`) % enabledTitles.length]`.
4. Insert:
   - while flashing → spliced at `clamp(0, flash.index, list.length)`
   - `placement === "first"` → unshifted at index 0
   - `placement === "random"` → each card spliced at
     `hashString(\`pos${seed}_${i}\`) % min(list.length + 1, 12)`

`hashString` is FNV-1a 32-bit. `monogramColor(name)` = `hsl(hashString(name) % 360 32% 38%)`.

## Video pool loading

On mount the page `fetch("/api/videos")`s a live pool and replaces the bundled list when
the response contains a non-empty `videos` array; failures are swallowed. It also calls
`reshuffle()` once on mount, so the feed order differs on every page load. The bundled
data has two tiers: a 182-entry pool with real YouTube thumbnails, and a 36-entry
offline fallback with no images (thumbnails are generated procedurally).

## Squint / Analyze filters

Blur and grayscale are applied as one CSS `filter` string on the feed container:

```
filter: blur(Npx) grayscale(1)      // whichever are active; omitted entirely when neither
transition: filter var(--dur-base) var(--ease-out)   // 0.2s cubic-bezier(.22,1,.36,1)
```

- Blur range: `0–12`, step 1.
- The Squint toolbar button shows a `.tdot` when blur/grayscale/safe-area is active *and*
  the menu is closed; `data-active` is set when the menu is open **or** any setting is on.
- Safe-area overlay draws `.yt-safe-badge-zone` (56×20 desktop, 40×14 on watch recos) —
  a dashed `#ff3c3c` box in the bottom-right corner where YouTube's duration badge sits —
  on the test card only.

## Editor collapse

```
.tool-editor            width: 360px → 0            transition 0.32s var(--ease-out)
.tool-editor > aside    opacity: 1 → 0              transition 0.2s
.editor-toggle          right: 360px → 0            transition 0.32s var(--ease-out)
.editor-toggle svg      transform: rotate(0) → rotate(180deg)   transition 0.2s
```

Collapsing the editor also **expands the YouTube guide**: the page passes
`guideExpanded={!editorOpen}`, swapping the 72px `.yt-mini-guide` for the 240px `.yt-guide`.

## Flash test (time-driven state machine)

```
idle → ready → show → recall → result → (idle | ready)
```

| Phase | What happens |
|---|---|
| `ready` | Modal card: "One second. Where does your eye go?" with a duration segmented control and Start / Cancel. |
| `show` | Preview scrolled to top; test card spliced at a random index (`mobile` → 0–1, `watch` → 0–4, otherwise 0–5); a fresh seed reshuffles the feed. A 3px bar at the top runs `animation: flash-count <durationMs>ms linear forwards`. A `setTimeout(durationMs)` advances to `recall`. |
| `recall` | Opaque `rgba(6,7,9,0.975)` layer, `cursor: crosshair`, "Click where your eye landed first". On click it measures every `[data-test="true"]` node (preferring its `.yt-thumb-wrap`, `.ytm-thumb-wrap` or `.ytw-reco-thumb` child), recording hit/miss, the distance to the nearest target centre, the click point and the target rects. |
| `result` | Draws previous markers, outlines the target rects with a "Your thumbnail" tag (`animation: flash-target 0.4s var(--ease-out) both`) and a pinging click marker (`flash-ping 0.9s var(--ease-out) infinite`, green `#3dd68c` on a hit, white on a miss). |

Verdict copy, verbatim:
- no targets → *"No thumbnail was in the feed for this run."*
- hit → *"Direct hit. Your thumbnail caught the eye first."*
- `distance < 260` → *"Close. Your eye landed {distance}px from your thumbnail."*
- otherwise → *"Your eye went elsewhere. Your thumbnail is outlined below."*

While a flash test runs the preview switches to `overflow-y: hidden` and the toolbar's
flash button is disabled.

## Export

`html-to-image`'s `toPng` snapshots the `.tool-preview` inner node at a chosen pixel
ratio. Download names the file `thumbnails_{viewMode}_{Date.now()}.png`; Copy writes an
`image/png` `ClipboardItem`. Status strings: *"Saved to downloads"*, *"Copied to clipboard"*,
*"Copy not supported here"*, *"Export failed"*.

## Hover states (from the stylesheet)

| Element | Change | Transition |
|---|---|---|
| `.tool-wordmark` | `opacity: 1 → .68` | `0.12s var(--ease-out)` |
| `.tbtn`, `.ticon` | `border-color → var(--border-strong)`, `color → var(--text-primary)` | `0.12s var(--ease-out)` |
| `.tprimary` | `filter: brightness(.94)`; active `transform: scale(.985)` | `0.12s var(--ease-out)` |
| `.tseg-btn` (inactive) | `color → var(--text-primary)` | `0.2s var(--ease-out)` |
| `.yt-icon-btn`, `.yt-guide-row`, `.yt-mini-item` | `background → var(--yt-hover)` | none (instant) |
| `.yt-chip` | `background → var(--yt-chip-hover)` | none |
| `.yt-card-menu` | `opacity: 0 → 1` on `.yt-card:hover` | none |
| `.ytw-reco-dots` | `opacity: 0 → 1` on `.ytw-reco:hover` | none |
| `.inspect-swatch` | `transform: translateY(-2px) scale(1.05)` | `0.12s var(--ease-out)` |
| `.inspect-close`, `.inspect-yt` | background lightens | `0.12s` |
| `.editor-toggle` | `background → var(--bg-elevated-2)`, `color → var(--text-primary)` | `0.12s` |

## Focus

`.focus-ring:focus-visible` → `box-shadow: 0 0 0 3px var(--accent-glow), 0 0 0 1px var(--focus-ring); outline: none`.
`.fx:focus` / `:focus-visible` → `box-shadow: 0 0 0 3px var(--accent-glow); border-color: #ffffff47`.

Every mock-YouTube control carries `tabIndex={-1}` — the fake UI is deliberately kept out
of the tab order so keyboard focus stays on the real tool controls.

## Responsive

Height-based media queries scale the phone mock:

```
@media (max-height: 960px) { .ios-frame { transform: scale(.9) } }
@media (max-height: 860px) { .ios-frame { transform: scale(.8) } }
@media (max-height: 760px) { .ios-frame { transform: scale(.7) } }
```

`@media (max-width: 820px) { .inspect-body { grid-template-columns: 1fr } }`

The desktop feed reflows purely through the `--yt-cols` ResizeObserver described above;
there are no width breakpoints in the tool shell itself.

## Theme

`.yt-root[data-theme="dark"|"light"]` swaps ~16 `--yt-*` custom properties (background,
text, search chrome, chips, hover, dividers, skeletons). The tool shell around it stays
dark in both cases — only the mocked YouTube surface changes.
