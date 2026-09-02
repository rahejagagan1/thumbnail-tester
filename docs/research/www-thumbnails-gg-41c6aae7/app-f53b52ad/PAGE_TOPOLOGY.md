# Page Topology — https://www.thumbnails.gg/app

## What the page is

A single-screen, non-scrolling **tool shell** (`height: 100dvh; overflow: hidden`) that
hosts a pixel-accurate YouTube mock. The user drops a thumbnail in and sees how it reads
against real competing thumbnails.

There is **no page scroll**. The only scroll containers are the preview surface and the
editor sidebar. This is an application layout, not a marketing page — there are no
scroll-triggered animations, no parallax, no reveal-on-scroll, and no smooth-scroll
library (verified: no `.lenis`, no Locomotive, no `scroll-snap`, no `animation-timeline`).

## Root layout

```
<div class="tool-root">            flex column, 100dvh, overflow hidden, position relative
  <div class="ambient"/>           fixed inset-0, z-0, pointer-events none — ambient glow
  <header class="tool-topbar">     z-40, min-height 54px, flex-shrink 0, glass + blur
    <div class="tbar"> … </div>
  </header>
  <div class="tool-body">          flex-1, min-height 0, display flex, position relative
    <input type="file" hidden/>    global upload input
    <div class="tool-preview">     flex-1, min-width 0, bg --bg-sunken, position relative
      <div class="yt-root" data-theme="dark|light">   absolute inset-0, overflow-y auto
        …one of DesktopSurface | MobileView | WatchView…
      </div>
      …FlashOverlay when a flash test is running…
    </div>
    <button class="editor-toggle"/>  absolute, right:360px (or 0 when collapsed)
    <div class="tool-editor">        width 360px → 0 when collapsed
      <aside class="glass-dark">     the editor sidebar
    </div>
  </div>
</div>
```

## Sections, top to bottom / left to right

| # | Section | Interaction model | Notes |
|---|---------|-------------------|-------|
| 1 | `ambient` backdrop | static | Fixed radial glows behind everything, `z-index: 0` |
| 2 | **Toolbar** (`tool-topbar`) | click-driven | Wordmark, surface segmented control, theme toggle, Squint popover, Flash test, Reshuffle, Export popover |
| 3 | **Preview surface** (`tool-preview`) | click + infinite-scroll | Swaps between three mutually exclusive surfaces |
| 3a | → **DesktopSurface** | scroll (infinite) + click | Masthead, MiniGuide/Guide, ChipBar, responsive card grid |
| 3b | → **MobileView** | scroll (infinite) + click | iPhone bezel frame containing the YouTube mobile app |
| 3c | → **WatchView** | scroll (infinite) + click | Watch page: player, metadata, recommendation rail |
| 4 | **Editor toggle** rail button | click-driven | Collapses the sidebar; arrow rotates 180° |
| 5 | **Editor sidebar** (`tool-editor`) | click + form input | Five accordions: Thumbnail, Details, Placement, View, Analyze + a Tip card |
| 6 | **Inspect modal** (`inspect-scrim`) | click-driven overlay | Opens on clicking any feed card |
| 7 | **Flash overlay** | time-driven | Countdown → brief flash of the feed → "which did you notice?" |

## Z-index layers

| Layer | z-index |
|-------|---------|
| `ambient` | 0 |
| `yt-masthead`, `dev-*` chrome | 20 / 6 |
| `yt-chipbar` | 10 |
| `editor-toggle` | 25 |
| `tool-topbar` | 40 |
| popover scrims (`Squint`, `Export`) | 40 |
| `tmenu` popovers | 50 |
| `inspect-scrim` | 100 |
| `ios-island` | 40 |

## Dependencies between sections

- Everything reads from one Zustand store (`useFeed`). The toolbar, editor sidebar and
  all three surfaces are views over the same state — there is no prop drilling between
  siblings.
- The editor's **View → Surface / Theme / Columns** controls duplicate the toolbar's
  segmented control and theme button. Both write the same store keys.
- `tool-preview`'s DOM node ref is passed to the Export menu (`html-to-image` snapshots it)
  and to the Flash overlay.
- The **feed composition** is a `useMemo` over `[pool, seed, placement, testCard, thumbMode,
  thumbnails, titleMode, titles, flash…]`; changing any of them recomposes the card list.

## Responsive behavior

The tool shell itself is desktop-oriented and does not restructure at tablet/mobile —
`tool-topbar` is `flex-wrap: wrap`, and the editor stays 360px. What *is* responsive is
the **mocked feed**, which is the point of the product:

- `yt-grid` columns come from a `ResizeObserver` on the grid element:
  `cols = clamp(1, 6, floor((width + 16) / 316))` on the target when Columns is `Auto`;
  ours divides by 342.8 to match YouTube (see `EXTENSIONS.md`). Otherwise the literal
  3/4/5.
- `ios-frame` scales down at short viewports: `≤960px → scale(.9)`, `≤860px → scale(.8)`,
  `≤760px → scale(.7)` (height media queries).
- `inspect-body` collapses from `1.25fr 1fr` to a single column at `max-width: 820px`.

## Route mapping

| Source URL | Destination route | File |
|---|---|---|
| `https://www.thumbnails.gg/app` | `/` | `src/app/page.tsx` |

Root was chosen per the clone-website routing default: this was the first single-URL
clone into an untouched template scaffold, so `src/app/page.tsx` was replaced.
