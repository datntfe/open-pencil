/**
 * Curated, web-safe font catalog — the design font source for OpenPencil.
 *
 * Every entry here is served by Google Fonts and loaded on demand (see
 * `FontManager.loadFont`). The editor never depends on the Local Font Access
 * API for these: they are always available in the browser. System fonts, when
 * granted, are merged in as an *optional* extra source by the app-level
 * registry — they are not required for the picker to be usable.
 */

/** Where a font's bytes come from. */
export type FontSource = 'bundled' | 'google' | 'system'

/**
 * Picker section a font belongs to. Each font has exactly one category, so it
 * appears in exactly one section (no duplicates). `system` is assigned
 * dynamically by the registry, never in this static catalog.
 */
export type FontCategory =
  | 'recommended'
  | 'vietnamese'
  | 'sans'
  | 'serif'
  | 'display'
  | 'mono'
  | 'handwriting'
  | 'system'

export interface FontCatalogEntry {
  family: string
  source: Exclude<FontSource, 'system'>
  category: Exclude<FontCategory, 'system'>
  /** Weights the family ships. Indicative — `FontManager.availableWeights` is authoritative at runtime. */
  weights: number[]
  /** Whether the family includes italic styles. */
  hasItalic: boolean
  /** Whether the family covers the Vietnamese subset (đ, ă, ơ, diacritic stacks). */
  supportsVietnamese: boolean
}

// Shared weight sets — keeps the catalog readable.
const W_FULL = [100, 200, 300, 400, 500, 600, 700, 800, 900]
const W_WIDE = [300, 400, 500, 600, 700, 800, 900]
const W_COMMON = [300, 400, 500, 600, 700]
const W_PAIR = [400, 700]
const W_ONE = [400]

/** Compact constructor for a Google-sourced catalog entry. */
function g(
  family: string,
  category: FontCatalogEntry['category'],
  weights: number[],
  hasItalic: boolean,
  supportsVietnamese: boolean
): FontCatalogEntry {
  return { family, source: 'google', category, weights, hasItalic, supportsVietnamese }
}

/**
 * The catalog. Order within a category is the display order in the picker.
 *
 * `recommended` holds the 11 defaults that must be visible immediately on a
 * fresh browser session.
 */
export const FONT_CATALOG: FontCatalogEntry[] = [
  // ── Recommended (the 11 defaults — all Vietnamese-safe) ────────────────────
  g('Inter', 'recommended', W_FULL, true, true),
  g('Be Vietnam Pro', 'recommended', [100, 300, 400, 500, 600, 700, 800], true, true),
  g('Roboto', 'recommended', [100, 300, 400, 500, 700, 900], true, true),
  g('Noto Sans', 'recommended', W_FULL, true, true),
  g('Noto Serif', 'recommended', W_FULL, true, true),
  g('Montserrat', 'recommended', W_FULL, true, true),
  g('Playfair Display', 'recommended', [400, 500, 600, 700, 800, 900], true, true),
  g('Lora', 'recommended', [400, 500, 600, 700], true, true),
  g('Oswald', 'recommended', [200, 300, 400, 500, 600, 700], false, true),
  g('DM Sans', 'recommended', W_FULL, true, true),
  g('Source Serif 4', 'recommended', [200, 300, 400, 500, 600, 700, 800, 900], true, true),

  // ── Vietnamese-safe (extra families with full Vietnamese coverage) ─────────
  g('Open Sans', 'vietnamese', [300, 400, 500, 600, 700, 800], true, true),
  g('Nunito', 'vietnamese', W_WIDE, true, true),
  g('Nunito Sans', 'vietnamese', W_WIDE, true, true),
  g('Mulish', 'vietnamese', W_FULL, true, true),
  g('Manrope', 'vietnamese', [200, 300, 400, 500, 600, 700, 800], false, true),
  g('Bitter', 'vietnamese', W_FULL, true, true),
  g('Quicksand', 'vietnamese', [300, 400, 500, 600, 700], false, true),

  // ── Sans Serif ─────────────────────────────────────────────────────────────
  g('Lato', 'sans', [100, 300, 400, 700, 900], true, false),
  g('Raleway', 'sans', W_FULL, true, true),
  g('Work Sans', 'sans', W_FULL, true, true),
  g('Poppins', 'sans', W_FULL, true, false),
  g('Rubik', 'sans', [300, 400, 500, 600, 700, 800, 900], true, false),
  g('Karla', 'sans', [200, 300, 400, 500, 600, 700, 800], true, true),
  g('Figtree', 'sans', [300, 400, 500, 600, 700, 800, 900], true, true),
  g('Plus Jakarta Sans', 'sans', [200, 300, 400, 500, 600, 700, 800], true, true),
  g('Outfit', 'sans', W_FULL, false, true),
  g('Sora', 'sans', [100, 200, 300, 400, 500, 600, 700, 800], false, false),
  g('Space Grotesk', 'sans', [300, 400, 500, 600, 700], false, false),
  g('Archivo', 'sans', W_FULL, true, true),
  g('Barlow', 'sans', W_FULL, true, true),
  g('Public Sans', 'sans', W_FULL, true, true),
  g('Hanken Grotesk', 'sans', [100, 200, 300, 400, 500, 600, 700, 800, 900], true, true),

  // ── Serif ──────────────────────────────────────────────────────────────────
  g('Merriweather', 'serif', [300, 400, 700, 900], true, true),
  g('PT Serif', 'serif', W_PAIR, true, true),
  g('EB Garamond', 'serif', [400, 500, 600, 700, 800], true, true),
  g('Cormorant Garamond', 'serif', [300, 400, 500, 600, 700], true, true),
  g('Libre Baskerville', 'serif', W_PAIR, true, true),
  g('Spectral', 'serif', [200, 300, 400, 500, 600, 700, 800], true, true),
  g('Newsreader', 'serif', [200, 300, 400, 500, 600, 700, 800], true, true),
  g('Fraunces', 'serif', W_FULL, true, true),
  g('Instrument Serif', 'serif', W_ONE, true, true),

  // ── Display ────────────────────────────────────────────────────────────────
  g('Bebas Neue', 'display', W_ONE, false, false),
  g('Anton', 'display', W_ONE, false, true),
  g('Archivo Black', 'display', W_ONE, false, true),
  g('Abril Fatface', 'display', W_ONE, false, false),
  g('Comfortaa', 'display', W_COMMON, false, true),

  // ── Monospace ──────────────────────────────────────────────────────────────
  g('Roboto Mono', 'mono', [300, 400, 500, 600, 700], true, true),
  g('JetBrains Mono', 'mono', [100, 200, 300, 400, 500, 600, 700, 800], true, true),
  g('Source Code Pro', 'mono', [300, 400, 500, 600, 700, 800, 900], true, true),
  g('IBM Plex Mono', 'mono', [100, 200, 300, 400, 500, 600, 700], true, true),
  g('Space Mono', 'mono', W_PAIR, true, false),
  g('Fira Code', 'mono', W_COMMON, false, true),

  // ── Handwriting ────────────────────────────────────────────────────────────
  g('Dancing Script', 'handwriting', [400, 500, 600, 700], false, true),
  g('Caveat', 'handwriting', [400, 500, 600, 700], false, true),
  g('Pacifico', 'handwriting', W_ONE, false, false),
  g('Lobster', 'handwriting', W_ONE, false, true)
]

/** All catalog font-family names (sorted, deduped). */
export const CATALOG_FAMILIES: string[] = [...new Set(FONT_CATALOG.map((e) => e.family))].sort()

/** Lookup map keyed by family name. */
export const FONT_CATALOG_BY_FAMILY: ReadonlyMap<string, FontCatalogEntry> = new Map(
  FONT_CATALOG.map((e) => [e.family, e])
)

/** Human-readable section label for a category, in picker display order. */
export const FONT_CATEGORY_LABEL: Record<FontCategory, string> = {
  recommended: 'Recommended',
  vietnamese: 'Vietnamese-safe',
  sans: 'Sans Serif',
  serif: 'Serif',
  display: 'Display',
  mono: 'Monospace',
  handwriting: 'Handwriting',
  system: 'System'
}

/** Category order used when grouping the picker. */
export const FONT_CATEGORY_ORDER: FontCategory[] = [
  'recommended',
  'vietnamese',
  'sans',
  'serif',
  'display',
  'mono',
  'handwriting',
  'system'
]
