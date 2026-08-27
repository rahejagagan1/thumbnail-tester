# Tech Stack Analysis — https://www.thumbnails.gg/app

## What the target uses

| Concern | Target | Our clone |
|---|---|---|
| Framework | Next.js (App Router, Turbopack build) | Next.js 16, App Router — same |
| React | React 19 (`jsx`/`jsxs` runtime, `useOptimistic` in the Link internals) | React 19 — same |
| Styling | One hand-written stylesheet with semantic class names, layered on Tailwind's preflight + a handful of Tailwind utilities (`h-full`, `antialiased`, `font-sans`, `font-serif`) | The target's stylesheet ported **verbatim** into `globals.css`, on top of the existing Tailwind v4 base |
| Design tokens | CSS custom properties on `:root` and `.yt-root[data-theme]` | Identical — copied unchanged |
| State | Zustand (a vanilla store + `useSyncExternalStore`, no middleware, no persistence) | `zustand` — same store shape, same action names |
| Fonts | `next/font` with Inter, Playfair Display, Geist Mono, Roboto | `next/font/google`, same four families, same CSS variable names |
| Icons | Hand-authored inline SVG, all routed through one `<Svg>` base component | Extracted verbatim into `src/components/sites/<site>/shared/icons.tsx` |
| Images | Plain `<img>` pointing at `i.ytimg.com` / `yt3.ggpht.com`, plus procedurally generated `data:image/svg+xml` placeholders | Same — plain `<img>`, same remote URLs, `genThumb` ported 1:1 |
| PNG export | `html-to-image` (bundled inline) | `html-to-image` from npm |
| Data | A 182-video pool + a 36-video offline fallback, both compiled into the bundle; refreshed at runtime from `GET /api/videos` | Both datasets extracted to `src/data/sites/…`; the `/api/videos` fetch is kept and fails soft |
| Animation library | None — CSS keyframes and transitions only | Same |
| Smooth scroll | None | Same |

## Why the stylesheet was ported rather than reimplemented

The target does not use utility classes for layout. Its markup is semantic
(`.tool-topbar`, `.yt-card`, `.ytm-feed`, `.inspect-panel`) and every rule lives in one
81KB stylesheet, of which ~39KB is application CSS and the rest is `@font-face` and
Tailwind preflight.

Reimplementing those 39KB as Tailwind utilities would have meant translating several
hundred exact values — `12.5px` font sizes, `#ffffff0f` borders,
`cubic-bezier(.22, 1, .36, 1)` easings, `calc((100% - 6px) / 3)` thumb widths — with a
rounding error at every step. Porting the stylesheet unchanged and reconstructing the DOM
against it makes the visual result exact by construction, and it is what "pixel-perfect
emulation" asks for.

`@font-face` blocks were dropped (replaced by `next/font`) and the trailing
`@property --tw-*` declarations were dropped (Tailwind v4 already emits them). Nothing
else was altered.

## Data recovery

The production bundle is minified but not obfuscated beyond identifier renaming, and it
ships the React `jsx()` calls intact. That made three things directly recoverable:

- **Datasets** — `JSON.parse('[…]')` literals and a `t.exports = […]` module, extracted
  by locating the literals and re-parsing them.
- **Icons** — evaluated in Node against a shim `jsx` runtime that builds plain objects,
  then serialised back to TSX. This resolves the shared `<Svg>` wrapper automatically, so
  each icon's real `viewBox` and paths came out exact rather than hand-copied.
- **Component structure and behaviour** — read directly from the `jsx()` call trees.

## What is intentionally not reproduced

| Feature | Why | What we do instead |
|---|---|---|
| `GET /api/videos` | No backend in scope | The fetch stays and fails soft; the bundled 182-video pool is the source of truth |
| `GET /api/channel` (handle → name + avatar lookup) | Requires a YouTube Data API key | The Fetch button calls the endpoint and silently no-ops on failure — no fabricated channel data |
| Analytics / telemetry | Out of scope | Omitted |

Both endpoints are absent by design, not by oversight. Everything the user can do without
a network round-trip — upload, drag-drop, every editor control, all three surfaces, both
themes, the squint tests, the flash test, the inspect modal, and PNG export — works.

## Third-party content

The mocked feed uses real YouTube thumbnail and channel-avatar URLs from the target's own
dataset, served from Google's CDNs exactly as the target serves them. No third-party
imagery was copied into `public/`, and no brand asset was regenerated or substituted —
see `ARTIFACT_MANIFEST.md`.
