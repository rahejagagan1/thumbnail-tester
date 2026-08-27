# Artifact Manifest — https://www.thumbnails.gg/app

## Output plan (as executed)

| Item | Value |
|---|---|
| App root | `.` (repository root) |
| Site key | `www-thumbnails-gg-41c6aae7` |
| Page key | `app-f53b52ad` |
| Source URL | `https://www.thumbnails.gg/app` |
| Destination route | `/` |
| Route file | `src/app/page.tsx` |
| Artifact root | `docs/research/www-thumbnails-gg-41c6aae7/app-f53b52ad/` |
| Screenshot root | `docs/design-references/www-thumbnails-gg-41c6aae7/app-f53b52ad/` |
| Component root | `src/components/sites/www-thumbnails-gg-41c6aae7/app-f53b52ad/` |
| Same-site shared components | `src/components/sites/www-thumbnails-gg-41c6aae7/shared/` |
| Asset root | `public/sites/www-thumbnails-gg-41c6aae7/app-f53b52ad/` |

`<site-key>` = origin slug + first 8 hex of SHA-256 over `https://www.thumbnails.gg`.
`<page-key>` = pathname slug + first 8 hex of SHA-256 over `/app`.

### Routing decision

The repository was an untouched template scaffold: the only route was the placeholder
`src/app/page.tsx` shipped with the template ("Clone target not yet built. Run
/clone-website to start."). Per the clone-website routing default for a first single-URL
clone into an untouched template, that scaffold page was replaced so the clone is served
at `/`.

**No pre-existing cloned or user-authored route, component namespace, research folder,
screenshot, or asset namespace was deleted, replaced, or modified.** The only shared files
touched were `src/app/globals.css` (appended to) and `src/app/layout.tsx` (fonts and
metadata), both of which contained only untouched template scaffolding.

## Downloaded / extracted source artifacts

| File | What it is |
|---|---|
| `source-app.html` | The target's server-rendered HTML (72,858 bytes) |
| `source-app.css` | The target's complete stylesheet (81,045 bytes) |

Both are kept as the auditable record behind every value in the clone.

## Generated code artifacts

| Destination | Provenance |
|---|---|
| `src/app/globals.css` (appended block) | `source-app.css` with `@font-face` blocks and the trailing `@property --tw-*` declarations removed; everything else verbatim |
| `src/data/.../videoPool.ts` | 182 entries, extracted from the `JSON.parse('[…]')` literal in chunk `1xnqcsb_5n59a.js` |
| `src/data/.../fallbackVideos.ts` | 36 entries, extracted from bundle module `46924` |
| `src/data/.../guideChannels.ts` | 7 guide channels + the desktop/mobile/watch chip label lists |
| `src/components/sites/.../shared/icons.tsx` | 30 icons + the YouTube wordmark, extracted by evaluating the bundle's icon module against a shim JSX runtime and re-serialising |
| `src/lib/.../format.ts` | `formatViews`, `formatAge`, `hashString` (FNV-1a), `monogramColor`, `seededShuffle` (LCG), `genThumb`, `PLACEHOLDER_THUMB` — ported 1:1 |
| `src/lib/.../store.ts` | The Zustand store, same keys and action names as the target |
| `src/lib/.../useInfiniteScroll.ts` | The pagination hook and `autoColumns` |

## Image and media assets

**No image, video, or font file was downloaded into `public/`.** This is deliberate and
matches how the target itself works:

- **Feed thumbnails and channel avatars** are remote URLs on `i.ytimg.com` and
  `yt3.ggpht.com`, carried in the extracted dataset and referenced exactly as the target
  references them.
- **Placeholder thumbnails** (used for pool entries with no image, and for the "Drop your
  thumbnail" card) are procedurally generated `data:image/svg+xml` URIs — `genThumb` and
  `PLACEHOLDER_THUMB` reproduce the target's generator byte for byte.
- **All icons and the YouTube wordmark** are inline SVG in `icons.tsx`.
- **Fonts** come from `next/font/google` rather than copied `.woff2` files.

`public/sites/www-thumbnails-gg-41c6aae7/` therefore exists but is empty. There was no
per-page asset download script to write, because there were no files to download.

## Missing / unrecoverable assets

None. Every visual element of the page was recovered exactly.

## Generated substitute assets

**None.** The Atlas Cloud fallback path was not used, was not needed, and was never
invoked. No brand artwork, logo, screenshot, or thumbnail was regenerated or substituted —
every image on the page is either the original remote URL, an inline SVG copied verbatim,
or output of the target's own procedural generator.

## Known gaps

| Gap | Reason |
|---|---|
| `GET /api/videos` | Backend explicitly out of scope. The fetch is retained and fails soft; the bundled 182-video pool serves the feed. |
| `GET /api/channel` | Requires a YouTube Data API key. The Fetch button calls the endpoint and no-ops on failure rather than fabricating channel data. |

Both are backend endpoints, out of scope by the clone's stated defaults. No visual or
interactive behaviour depends on them.
