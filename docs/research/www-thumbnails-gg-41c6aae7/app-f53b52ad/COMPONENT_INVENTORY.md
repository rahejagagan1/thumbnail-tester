# Component Inventory — https://www.thumbnails.gg/app

All components live under `src/components/sites/www-thumbnails-gg-41c6aae7/`.
Page-scoped components are in `app-f53b52ad/`; the icon set is in `shared/`.

| Component | File | Exports | Spec |
|---|---|---|---|
| Toolbar | `app-f53b52ad/Toolbar.tsx` | `Toolbar`, `Wordmark`, `TSeg`, `SquintMenu`, `ExportMenu` | `components/Toolbar.spec.md` |
| Desktop surface | `app-f53b52ad/DesktopSurface.tsx` | `DesktopSurface` | `components/DesktopSurface.spec.md` |
| Masthead | `app-f53b52ad/Masthead.tsx` | `Masthead` | ↑ same spec |
| Guide rails | `app-f53b52ad/Guide.tsx` | `MiniGuide` | ↑ same spec |
| Chip bar | `app-f53b52ad/ChipBar.tsx` | `ChipBar` | ↑ same spec |
| Feed card | `app-f53b52ad/VideoCard.tsx` | `VideoCard` | ↑ same spec |
| Mobile surface | `app-f53b52ad/MobileView.tsx` | `MobileView` | `components/MobileView.spec.md` |
| Watch surface | `app-f53b52ad/WatchView.tsx` | `WatchView` | `components/WatchView.spec.md` |
| Editor sidebar | `app-f53b52ad/EditorPanel.tsx` | `EditorPanel` | `components/EditorPanel.spec.md` |
| Inspect modal | `app-f53b52ad/InspectModal.tsx` | `InspectModal` | `components/InspectModal.spec.md` |
| Flash overlay | `app-f53b52ad/FlashOverlay.tsx` | `FlashOverlay` | `components/FlashOverlay.spec.md` |
| Icons | `shared/icons.tsx` | 30 `Icon*` components + `YouTubeLogo` | extracted, see `ARTIFACT_MANIFEST.md` |

Page assembly lives in `src/app/page.tsx`.

## Component detail

### Toolbar (`.tool-topbar`)
- **Structure:** brand (`Wordmark`; the target also prints an author credit beside it, deliberately not carried over — see `EXTENSIONS.md`) · spacer · surface `TSeg` (Desktop/Mobile/Watch, `lg`, 106px columns) · spacer · `.tbar-right` (theme `.ticon`, `SquintMenu`, flash `.ticon`, reshuffle `.ticon`, `ExportMenu`).
- **Variants:** `TSeg` has `lg` (30px tall, 13.5px text, fixed-width columns) and `full` (equal `1fr` columns) modes, and an optional per-option icon.
- **States:** `data-active` drives the sliding `.tseg-thumb`; `.tbtn[data-active]` for an open or dirty Squint menu; flash button disabled while a flash test runs.
- **Interactions:** two popovers, each with a fixed `z-index: 40` click-away scrim.

### DesktopSurface (`.yt-body`)
- Composes `Masthead`, `MiniGuide`, `ChipBar` and the grid.
- **Grid:** `--yt-cols` from a `ResizeObserver`; blur/grayscale as one CSS `filter`; infinite scroll with a 1px sentinel.
- **Responsive:** 1–6 columns. The target uses `clamp(1, 6, floor((w + 16) / 316))`; ours divides by 342.8 to match YouTube's own grid metrics — see `EXTENSIONS.md`.

### MiniGuide (`Guide.tsx`)
- **Two variants in one component.** Collapsed → `.yt-mini-guide` (72px, 4 items). Expanded → `.yt-guide` (240px, five sections separated by `.yt-guide-divider`: Home/Shorts · Subscriptions (7 channels + Show more) · You (7 links + Show more) · Explore (Music/Movies/Live) · YouTube Music/Kids · Report history/Settings).
- **States:** `data-active` on rows; `.yt-guide-live` (red) and `.yt-guide-dot` (blue) badges per channel.

### VideoCard (`.yt-card`)
- **States:** `data-test`, `data-highlight`, `data-live` on the duration badge, watched-progress bar, safe-area overlay, avatar image vs. generated monogram.
- **Hover:** `.yt-card-menu` fades in.

### MobileView (`.ios-frame`)
- iPhone bezel (405px wide, 57px radius) with a dynamic island, a status bar, the YouTube mobile masthead, chips, the feed, and a bottom tab bar. Scales to 0.9/0.8/0.7 at short viewports.

### WatchView (`.ytw-page`)
- Two-column grid (`minmax(0,1fr) 402px`): player + metadata on the left, recommendation rail on the right. The blur/grayscale filter applies to `.ytw-reco-list` only — the player is never filtered.

### EditorPanel (`.tool-editor > aside`)
- Sticky header + five accordions (Thumbnail, Details, Placement, View, Analyze) + a Tip card.
- Built from local primitives: `Section`, `Field`, `Seg`, `Toggle`, `RangeRow`, `Dropzone`, `ThumbnailGrid`, `TitleList`, `ChannelHandleField`.
- **Variants:** Thumbnail and Title each have single/multiple modes that swap the control set.
- Styled almost entirely with inline styles, matching the target.

### InspectModal (`.inspect-scrim`)
- Two-column panel: preview + squint tools + at-feed-size previews on the left; title/meta/YouTube link/palette/export actions on the right.
- Collapses to one column below 820px.
- Palette swatches are sampled client-side from a canvas; the placeholder reads "reading colors…" until then, exactly as the target does.

### FlashOverlay
- A five-phase state machine rendered over the preview. See `BEHAVIORS.md` for the full transition table and verdict copy.

## Shared primitives NOT used

The template's shadcn scaffold (`src/components/ui/button.tsx`, `cn()`) is untouched and
unused by this clone — the target has its own button system (`.tbtn`, `.ticon`,
`.tprimary`, `.btn-primary`, `.seg-btn`, `.tseg-btn`) which was ported directly.
