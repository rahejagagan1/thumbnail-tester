/**
 * Formatting + deterministic-hash helpers.
 * Ported 1:1 from the target site's bundle so generated art and shuffles match.
 */

export const AGE_LABELS: Record<string, string> = {
  "2h": "2 hours ago",
  "1d": "1 day ago",
  "3d": "3 days ago",
  "1w": "1 week ago",
  "2w": "2 weeks ago",
  "1mo": "1 month ago",
  "6mo": "6 months ago",
  "1y": "1 year ago",
};

export const AGE_OPTIONS = Object.entries(AGE_LABELS).map(([value, label]) => ({
  value,
  label,
}));

export function formatAge(value: string): string {
  return AGE_LABELS[value] ?? value;
}

export function formatViews(input: string | number): string {
  let n: number;
  if (typeof input === "string") {
    const t = input.trim();
    if (/[a-zA-Z]/.test(t)) return /view/i.test(t) ? t : `${t} views`;
    const parsed = Number(t.replace(/[,\s]/g, ""));
    if (Number.isNaN(parsed)) return t;
    n = parsed;
  } else {
    n = input;
  }
  const round = (v: number, suffix: string) =>
    `${v.toFixed(1).replace(/\.0$/, "")}${suffix}`;
  const out =
    n >= 1e9
      ? round(n / 1e9, "B")
      : n >= 1e6
        ? round(n / 1e6, "M")
        : n >= 1e3
          ? round(n / 1e3, "K")
          : String(n);
  return `${out} views`;
}

/** FNV-1a 32-bit. */
export function hashString(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x1000193);
  }
  return h >>> 0;
}

export function monogramColor(s: string): string {
  return `hsl(${hashString(s) % 360} 32% 38%)`;
}

/** Linear-congruential shuffle — same sequence as the target for a given seed. */
export function seededShuffle<T>(list: readonly T[], seed: number): T[] {
  const out = [...list];
  let s = seed >>> 0 || 1;
  for (let i = out.length - 1; i > 0; i--) {
    s = (Math.imul(1664525, s) + 0x3c6ef35f) >>> 0;
    const j = s % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

const PALETTES: ReadonlyArray<readonly [string, string, string]> = [
  ["#1f2937", "#0b1220", "#f8fafc"],
  ["#3b0d0d", "#150404", "#fde2e2"],
  ["#0d2b3b", "#04141d", "#dcf3ff"],
  ["#2b1a3b", "#120a1d", "#efe2ff"],
  ["#1a3b22", "#08160d", "#dcffe6"],
  ["#3b3210", "#1d1804", "#fff6dc"],
  ["#11243b", "#06101d", "#dce8ff"],
  ["#3b1024", "#1d0612", "#ffdcec"],
];

const MOTIFS = ["bars", "rings", "diag", "blob"] as const;

/** Deterministic placeholder thumbnail for pool entries that have no image. */
export function genThumb(id: string, title = ""): string {
  const h = hashString(id);
  const [from, to, ink] = PALETTES[h % PALETTES.length];
  const motif = MOTIFS[(h >> 4) % MOTIFS.length];

  let shapes = "";
  if (motif === "bars") {
    shapes = Array.from({ length: 5 })
      .map((_, i) => {
        const height = 120 + ((h >> (i + 2)) % 280);
        return `<rect x="${40 + 240 * i}" y="${720 - height}" width="120" height="${height}" fill="${ink}" opacity="0.10"/>`;
      })
      .join("");
  } else if (motif === "rings") {
    shapes = Array.from({ length: 4 })
      .map(
        (_, i) =>
          `<circle cx="980" cy="180" r="${80 + 110 * i}" fill="none" stroke="${ink}" stroke-width="14" opacity="0.10"/>`,
      )
      .join("");
  } else if (motif === "diag") {
    shapes = Array.from({ length: 7 })
      .map(
        (_, i) =>
          `<rect x="${-200 + 220 * i}" y="-100" width="80" height="920" fill="${ink}" opacity="0.07" transform="rotate(20 640 360)"/>`,
      )
      .join("");
  } else {
    shapes = `<ellipse cx="${300 + (h % 700)}" cy="${200 + (h % 320)}" rx="320" ry="240" fill="${ink}" opacity="0.08"/>`;
  }

  const initials = (title || id)
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1" gradientTransform="rotate(${(h >> 8) % 360} 0.5 0.5)">
<stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient></defs>
<rect width="1280" height="720" fill="url(#g)"/>
${shapes}
<text x="640" y="400" font-family="Arial, sans-serif" font-size="220" font-weight="700" fill="${ink}" fill-opacity="0.92" text-anchor="middle" dominant-baseline="middle">${initials}</text>
</svg>`;

  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

/** The "Drop your thumbnail" art shown until the user uploads one. */
export const PLACEHOLDER_THUMB = `data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720"><rect width="1280" height="720" fill="#1a1a1a"/><rect x="20" y="20" width="1240" height="680" rx="24" fill="none" stroke="#555" stroke-width="6" stroke-dasharray="24 20"/><text x="640" y="345" font-family="Arial" font-size="64" font-weight="700" fill="#888" text-anchor="middle">Drop your thumbnail</text><text x="640" y="420" font-family="Arial" font-size="40" fill="#666" text-anchor="middle">1280 × 720 · .png</text></svg>`,
)}`;
