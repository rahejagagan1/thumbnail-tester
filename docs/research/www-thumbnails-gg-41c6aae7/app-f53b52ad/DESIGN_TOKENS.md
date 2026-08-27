# Design Tokens — https://www.thumbnails.gg/app

Every value below is verbatim from the target's stylesheet
(`/_next/static/chunks/2f2llda_sn1fk.css`) and is present unchanged in
`src/app/globals.css`.

There are **two independent token systems** on this page:

1. The **tool shell** tokens on `:root` — the dark chrome around the mock.
2. The **YouTube mock** tokens on `.yt-root[data-theme]` — swapped when the user
   toggles the preview between dark and light.

## 1. Tool shell — `:root`

### Surfaces
| Token | Value |
|---|---|
| `--bg-base` | `#08090b` |
| `--bg-sunken` | `#050507` |
| `--bg-elevated` | `#0e1013` |
| `--bg-elevated-2` | `#15181c` |

### Glass layers
| Token | Value |
|---|---|
| `--glass-1-bg` | `#ffffff0a` |
| `--glass-1-border` | `#ffffff14` |
| `--glass-1-blur` | `blur(16px) saturate(140%)` |
| `--glass-2-bg` | `#14161a9e` |
| `--glass-2-border` | `#ffffff1a` |
| `--glass-2-blur` | `blur(20px) saturate(160%) brightness(1.05)` |
| `--glass-3-scrim` | `#030406a3` |
| `--glass-3-bg` | `#0e1013b8` |
| `--glass-3-border` | `#ffffff1f` |
| `--glass-3-blur` | `blur(24px) saturate(150%)` |

`.glass-dark` is its own recipe:
`background: linear-gradient(#ffffff0d, #fff0 26%), linear-gradient(#0d0e12d1, #07080ae6)`,
`border: 1px solid #ffffff17`, `backdrop-filter: blur(28px) saturate(140%)`,
`box-shadow: inset 0 1px #ffffff14, inset 0 0 0 1px #ffffff04, 0 32px 72px -20px #000000d1`,
plus a 1px top highlight via `::before`.

A `@supports not (backdrop-filter)` fallback swaps every glass class to a flat
`--bg-elevated` / `--bg-elevated-2`, and `@media (prefers-reduced-transparency: reduce)`
does the same for the toolbar.

### Borders
| Token | Value |
|---|---|
| `--border-subtle` | `#ffffff0f` |
| `--border-default` | `#ffffff1a` |
| `--border-strong` | `#ffffff29` |

### Text
| Token | Value |
|---|---|
| `--text-primary` | `#fffffff2` |
| `--text-secondary` | `#ffffffa8` |
| `--text-muted` | `#ffffff70` |
| `--text-faint` | `#ffffff47` |

### Accent & focus
| Token | Value |
|---|---|
| `--accent` | `#fff` |
| `--accent-fg` | `#08090b` |
| `--accent-glow` | `#ffffff1f` |
| `--focus-ring` | `#fff6` |

### Radii
`--radius-sm: 8px` · `--radius-md: 12px` · `--radius-lg: 16px` · `--radius-xl: 24px` · `--radius-full: 999px`

### Shadows
| Token | Value |
|---|---|
| `--shadow-sm` | `0 1px 2px #0006` |
| `--shadow-md` | `0 8px 24px -8px #0000008c` |
| `--shadow-lg` | `0 24px 60px -16px #000000b3` |
| `--shadow-glass` | `inset 0 1px 0 #ffffff14, 0 16px 40px -12px #000000a6` |

### Motion
| Token | Value |
|---|---|
| `--ease-out` | `cubic-bezier(.22, 1, .36, 1)` |
| `--ease-in-out` | `cubic-bezier(.65, 0, .35, 1)` |
| `--dur-fast` | `.12s` |
| `--dur-base` | `.2s` |
| `--dur-slow` | `.32s` |

### Type scale
| Token | Value |
|---|---|
| `--font-display` | `var(--font-serif), Georgia, "Times New Roman", serif` |
| `--text-display` | `clamp(2.75rem, 6.5vw, 5.5rem)` |
| `--text-h1` | `clamp(2.25rem, 4.5vw, 4rem)` |
| `--text-h2` | `clamp(1.75rem, 3vw, 2.75rem)` |
| `--text-h3` | `1.5rem` |
| `--leading-display` | `1.02` |
| `--tracking-display` | `-.01em` |

### Layout
`--section-gap: clamp(88px, 12vw, 160px)` · `--page-max: 1200px` · `--tool-bar-h: 54px`

## 2. YouTube mock — `.yt-root[data-theme]`

| Token | dark | light |
|---|---|---|
| `--yt-bg` | `#0f0f0f` | `#fff` |
| `--yt-text-primary` | `#f1f1f1` | `#0f0f0f` |
| `--yt-text-secondary` | `#aaa` | `#606060` |
| `--yt-icon` | `#f1f1f1` | `#0f0f0f` |
| `--yt-search-bg` | `#121212` | `#fff` |
| `--yt-search-border` | `#303030` | `#ccc` |
| `--yt-search-btn-bg` | `#222` | `#f8f8f8` |
| `--yt-search-btn-hover` | `#272727` | `#f0f0f0` |
| `--yt-voice-bg` | `#181818` | `#f2f2f2` |
| `--yt-voice-hover` | `#313131` | `#e5e5e5` |
| `--yt-chip-bg` | `#272727` | `#f2f2f2` |
| `--yt-chip-text` | `#f1f1f1` | `#0f0f0f` |
| `--yt-chip-hover` | `#3d3d3d` | `#e5e5e5` |
| `--yt-chip-sel-bg` | `#f1f1f1` | `#0f0f0f` |
| `--yt-chip-sel-text` | `#0f0f0f` | `#fff` |
| `--yt-hover` | `#ffffff1a` | `#0000000d` |
| `--yt-divider` | `#ffffff1a` | `#0000001a` |
| `--yt-skeleton` | `#272727` | `#e5e5e5` |
| `--yt-create-bg` | `#ffffff1a` | `#0000000d` |

## Typography

Four families, all loaded through `next/font/google` in `src/app/layout.tsx` with the
same CSS variable names the stylesheet expects:

| Family | Variable | Weights | Used for |
|---|---|---|---|
| Inter | `--font-inter` → `--font-sans` | 300, 400, 500, 600, 700 | the whole tool shell |
| Playfair Display | `--font-playfair` → `--font-serif` | 400–700, normal + italic | `--font-display` (unused on this route, kept for parity) |
| Geist Mono | `--font-geist-mono` → `--font-mono` | variable 100–900 | numeric read-outs (`.tbar-val`, `.dev-hud`, slider values) |
| Roboto | `--font-roboto` | 400, 500, 700 | `.yt-root` — the mocked YouTube UI |

Body: `font-family: var(--font-sans), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`,
`-webkit-font-smoothing: antialiased`, `text-rendering: optimizeLegibility`.

### Notable fixed sizes
| Element | Size / weight / line-height |
|---|---|
| Wordmark | 17px / 600 / 1, `letter-spacing: -0.03em` |
| `.tool-by` | 12px / 500, `letter-spacing: -0.01em` |
| `.tbar-label`, `.eyebrow` | 11px / 500, `letter-spacing: .14em` / `.16em`, uppercase |
| `.tseg-btn` | 12.5px / 500 (`.tseg.lg` → 13.5px, height 30px) |
| `.tbtn` | 12.5px / 500, height 32px |
| `.tprimary` | 13px / 600, height 34px |
| `.ticon` | 34×34, svg 16×16 |
| Editor section header | 11px / 600, `letter-spacing: 0.1em`, uppercase |
| Editor field label | 12px / 500, `var(--text-muted)` |
| Editor inputs | 14px, height 36px, radius 8px |
| `.yt-card-title` | 16px / 500 / 22px, 2-line clamp |
| `.yt-card-channel`, `.yt-card-meta` | 12px / 400 / 18px |
| `.yt-chip` | 14px / 500, height 32px, radius 8px |
| `.yt-search-input` | 16px, height 40px |
| `.ytm-title` | 14px / 500 / 20px, 2-line clamp |
| `.ytm-meta` | 12px / 16px |
| `.ytw-title` | 20px / 700 / 28px |
| `.ytw-reco-title` | 14px / 500 / 20px, 2-line clamp |
| `.inspect-title` | 19px / 600 / 1.25, `letter-spacing: -0.01em` |

## Scrollbars

```css
::-webkit-scrollbar { width: 11px; height: 11px }
::-webkit-scrollbar-thumb { background: #ffffff1f padding-box content-box;
                            border: 3px solid transparent; border-radius: 999px }
::-webkit-scrollbar-thumb:hover { background: #fff3 padding-box content-box }
::-webkit-scrollbar-track { background: none }
::selection { background: #ffffff29 }
```

The YouTube guide gets its own thin, hover-revealed scrollbar; the chip bars and the
mobile feed hide theirs entirely (`scrollbar-width: none`).
