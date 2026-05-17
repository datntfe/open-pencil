/**
 * App-level Font Registry — the single source of truth the editor uses to
 * present fonts.
 *
 * The registry is built from the curated, web-safe font catalog
 * (`@open-pencil/core/text` → `FONT_CATALOG`), which is always available in the
 * browser via Google Fonts. System fonts (Local Font Access in the browser, or
 * the Rust enumerator in the desktop app) are merged in as an *optional* extra
 * group — never required for the picker to be usable.
 */
import {
  CATALOG_FAMILIES,
  FONT_CATALOG,
  FONT_CATEGORY_LABEL,
  FONT_CATEGORY_ORDER,
  fontManager
} from '@open-pencil/core/text'
import type { FontCategory, FontSource } from '@open-pencil/core/text'

import {
  listFamilies,
  listFonts,
  localFontAccessState,
  requestLocalFontAccess
} from '@/app/editor/fonts'
import { isTauri } from '@/app/tauri/env'

export interface FontRegistryItem {
  family: string
  source: FontSource
  category: FontCategory
  /** Indicative weights — `listWeights(family)` is authoritative at runtime. */
  weights: number[]
  hasItalic: boolean
  supportsVietnamese: boolean
  /** Whether the font bytes are already loaded into the editor. */
  loaded: boolean
}

export interface FontGroup {
  category: FontCategory
  label: string
  fonts: FontRegistryItem[]
}

const CATALOG_FAMILY_SET = new Set(CATALOG_FAMILIES)

/**
 * System families currently available — desktop app via the Rust enumerator,
 * browser via already-granted Local Font Access. Never triggers a permission
 * prompt; returns `[]` when system fonts are unavailable.
 */
async function getSystemFamilies(): Promise<string[]> {
  try {
    if (isTauri()) {
      const fonts = await listFonts()
      return fonts.map((f) => f.family)
    }
    // Browser: once Local Font Access is granted, re-query so system fonts
    // reappear after a reload without revisiting Font settings. This never
    // prompts — the permission is already granted.
    if (localFontAccessState() === 'granted') {
      await requestLocalFontAccess()
    }
    // listFamilies() = catalog ∪ granted local fonts; subtract the catalog to
    // isolate the system-only families.
    const all = await listFamilies()
    return all.filter((family) => !CATALOG_FAMILY_SET.has(family))
  } catch {
    return []
  }
}

/**
 * Returns the editor's fonts grouped into picker sections, in display order.
 * Empty groups are omitted. The "System" group only appears when system fonts
 * are actually available.
 */
export async function getFontGroups(): Promise<FontGroup[]> {
  const catalogItems: FontRegistryItem[] = FONT_CATALOG.map((entry) => ({
    family: entry.family,
    source: entry.source,
    category: entry.category,
    weights: entry.weights,
    hasItalic: entry.hasItalic,
    supportsVietnamese: entry.supportsVietnamese,
    loaded: fontManager.isLoaded(entry.family)
  }))

  const systemFamilies = await getSystemFamilies()
  const systemItems: FontRegistryItem[] = [...new Set(systemFamilies)]
    .filter((family) => !CATALOG_FAMILY_SET.has(family))
    .sort((a, b) => a.localeCompare(b))
    .map((family) => ({
      family,
      source: 'system' as const,
      category: 'system' as const,
      weights: [],
      hasItalic: true,
      supportsVietnamese: false,
      loaded: fontManager.isLoaded(family)
    }))

  const groups: FontGroup[] = []
  for (const category of FONT_CATEGORY_ORDER) {
    const fonts =
      category === 'system'
        ? systemItems
        : catalogItems.filter((item) => item.category === category)
    if (fonts.length > 0) {
      groups.push({ category, label: FONT_CATEGORY_LABEL[category], fonts })
    }
  }
  return groups
}

/** Flat list of every registry item, catalog first then system fonts. */
export async function getFontRegistry(): Promise<FontRegistryItem[]> {
  const groups = await getFontGroups()
  return groups.flatMap((group) => group.fonts)
}
