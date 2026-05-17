import { describe, expect, test } from 'bun:test'

import {
  CATALOG_FAMILIES,
  FONT_CATALOG,
  FONT_CATALOG_BY_FAMILY,
  FONT_CATEGORY_ORDER
} from '@open-pencil/core/text'

/** The defaults that must be visible immediately on a fresh browser session. */
const REQUIRED_DEFAULTS = [
  'Inter',
  'Be Vietnam Pro',
  'Roboto',
  'Noto Sans',
  'Noto Serif',
  'Montserrat',
  'Playfair Display',
  'Lora',
  'Oswald',
  'DM Sans',
  'Source Serif 4'
]

describe('font catalog', () => {
  test('includes every required default family as "recommended"', () => {
    for (const family of REQUIRED_DEFAULTS) {
      const entry = FONT_CATALOG_BY_FAMILY.get(family)
      expect(entry).toBeDefined()
      expect(entry?.category).toBe('recommended')
    }
  })

  test('offers well over 10 fonts so the picker is never near-empty', () => {
    expect(CATALOG_FAMILIES.length).toBeGreaterThanOrEqual(10)
  })

  test('every recommended font supports Vietnamese', () => {
    for (const entry of FONT_CATALOG) {
      if (entry.category === 'recommended') expect(entry.supportsVietnamese).toBe(true)
    }
  })

  test('has no duplicate families', () => {
    expect(new Set(FONT_CATALOG.map((e) => e.family)).size).toBe(FONT_CATALOG.length)
  })

  test('every entry declares at least one weight', () => {
    for (const entry of FONT_CATALOG) expect(entry.weights.length).toBeGreaterThan(0)
  })

  test('every entry uses a known category', () => {
    for (const entry of FONT_CATALOG) expect(FONT_CATEGORY_ORDER).toContain(entry.category)
  })

  test('every catalog font is sourced from Google (web-safe, on-demand)', () => {
    for (const entry of FONT_CATALOG) expect(entry.source).toBe('google')
  })
})
