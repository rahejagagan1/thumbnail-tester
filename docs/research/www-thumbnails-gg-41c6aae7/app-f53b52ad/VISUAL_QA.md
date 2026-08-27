# Visual QA — clone vs. https://www.thumbnails.gg/app

## Method

The usual side-by-side screenshot pass could not be completed: the Chrome instance
available to this session cannot reach this machine's dev server
(`ERR_CONNECTION_REFUSED` on `localhost:3000` and `127.0.0.1:3000`, while `curl` from the
same machine returns 200 — the browser is network-isolated from the host).

So QA was done structurally instead, which for this particular clone is a **stronger**
check than a screenshot diff: the target's stylesheet was ported verbatim, so if the DOM
matches and the CSS survives the build, the rendering is identical by construction.

Three checks were run.

## 1. Default state — full DOM diff vs. the target's own HTML

The target's server-rendered HTML (`source-app.html`) was diffed node-for-node against
the clone's server-rendered HTML, comparing tag, class list, every `data-*` attribute,
every inline style, and every text node.

```
target nodes: 658   clone nodes: 658
total divergences: 0
```

Class-set comparison over the same pair:

```
target classes: 65   clone classes: 65
missing in clone: (none)      extra in clone: (none)
```

SVG comparison (whole elements, whitespace-normalised, in document order):

```
target svgs: 51   clone svgs: 51   diffs: 0
target path d= attributes: 63   clone: 63   ordered diffs: 0
```

One divergence was found and fixed during this pass: the wordmark's `font-family` was
`var(--font-sans)` instead of the target's `var(--font-sans), sans-serif`
(`Toolbar.tsx:152`). After the fix the diff is clean.

## 2. Non-default states — rendered and verified

Each state below was rendered by temporarily setting it as the store's initial state,
capturing the SSR output, then restoring the source files (verified byte-identical
afterwards).

| State | Result |
|---|---|
| Mobile surface | 65 classes, all 18 expected `ios-*`/`ytm-*` classes present, status bar / chips / tab bar copy correct |
| Watch surface | 82 classes, all 26 expected `ytw-*` classes present; title, channel, sub count, `18K`, `7:24 / 28:07`, caption, and all reco chips verbatim |
| Light theme | `data-theme="light"` applied to `.yt-root` |
| Analyze (blur 6 + grayscale + safe-area + highlight) | `filter: blur(6px) grayscale(1)` on the grid, safe-area overlay rendered, `data-test="true" data-highlight="true"` on the test card |
| Multiple thumbnails + titles | multi-file dropzone, placeholder card retained, "Add title" control present |
| Inspect modal | all 17 `.inspect-*` elements present; "At feed size", "Palette", "Exportable card" copy correct; YouTube deep link resolves to `https://www.youtube.com/watch?v=2UN7IJvDqHk`; palette shows "reading colors…" pre-sampling, matching the target |
| Flash overlay (`ready`) | "First-impression test", "One second. Where does your eye go?", "The feed flashes for…", Start flash / Cancel all present |

**Every class used across every state resolves to a real rule in the target's stylesheet
— zero invented class names.**

## 3. Stylesheet integrity through the build

The ported CSS was compared against the CSS the dev server actually serves, to confirm
Tailwind v4 / Lightning CSS does not drop or rewrite anything:

```
selectors in target CSS: 324
missing from built CSS:  0
```

(The raw comparison initially reported 24 misses; all 24 were attribute selectors where
Lightning CSS adds quotes — `[data-active=true]` → `[data-active="true"]` — which is
semantically identical. After normalising quotes: zero.)

Design tokens and keyframes spot-checked in the built output: `--bg-base:#08090b`,
`--dur-slow:.32s`, `--ease-out:cubic-bezier(.22,1,.36,1)`, `--yt-chip-sel-bg:#f1f1f1`,
`--tool-bar-h:54px`, `--glass-2-blur`, and the `flash-count` / `flash-target` /
`flash-ping` / `enter-fade` / `dev-pop` keyframes — all present.

## Remaining discrepancies

None found.

## What structural QA does not cover

These need a browser that can reach the dev server, and are worth a manual pass:

- True pixel rendering of the glass/backdrop-filter layers (`.glass-dark`, `.tool-topbar`)
  — the CSS is verbatim, but blur compositing is worth an eyeball.
- Live hover, focus-visible, and transition timing.
- The flash test's `show → recall → result` sequence, which depends on real click
  coordinates and `getBoundingClientRect` measurements.
- Palette swatch extraction in the inspect modal (canvas sampling of a cross-origin
  YouTube thumbnail — it is guarded in try/catch and degrades to no swatches, which is
  the expected outcome for tainted canvases).
- PNG export and clipboard copy.
- `ResizeObserver`-driven column reflow at different window widths.

Reference screenshots of the original at 1440px (desktop, mobile and watch surfaces) are
in `docs/design-references/www-thumbnails-gg-41c6aae7/app-f53b52ad/`.
