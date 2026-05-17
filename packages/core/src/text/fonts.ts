import type { CanvasKit, TypefaceFontProvider } from 'canvaskit-wasm'

import { DEFAULT_FONT_FAMILY, IS_BROWSER, GOOGLE_FONTS_API_KEY } from '#core/constants'

import { CATALOG_FAMILIES } from '#core/text/font-catalog'
import {
  isVariableFont,
  normalizeFontFamily,
  pickFontStyle,
  styleToVariant,
  styleToWeight,
  uniqueSortedWeights,
  variantToWeight,
  weightToStyle
} from '#core/text/font-style'
import type { SceneGraph } from '#core/scene-graph'
import { fontFallbackEntry } from '#core/text/fallbacks'
import type { FontFallbackScript } from '#core/text/fallbacks'

// Re-export the stateless helpers so `@open-pencil/core/text` (and importers of
// this module) keep their existing API surface after the font-style split.
export * from '#core/text/font-style'

export interface FontInfo {
  family: string
  fullName: string
  style: string
  postscriptName: string
}

export type LocalFontAccessState = 'unsupported' | 'prompt' | 'granted' | 'denied'

/**
 * Snapshot of the optional Local Font Access source — for the diagnostics
 * shown in Font settings. The curated catalog is always available regardless
 * of these numbers; system fonts are a bonus, never a requirement.
 */
export interface LocalFontDiagnostics {
  /** Whether the browser exposes `window.queryLocalFonts`. */
  apiSupported: boolean
  /** Current permission state. */
  permission: LocalFontAccessState
  /** Raw entries returned by the last `queryLocalFonts()` call. */
  rawCount: number
  /** Distinct families after deduplication. */
  uniqueFamilies: number
  /** Variable fonts skipped during enumeration — always 0; they are no longer filtered out. */
  variableSkipped: number
  /** Curated catalog fonts that are always offered. */
  catalogCount: number
  /** Total families visible in the picker (catalog ∪ granted system fonts). */
  pickerTotal: number
}

export interface DownloadedFontCache {
  read(family: string, style: string): Promise<ArrayBuffer | null>
  write(family: string, style: string, data: ArrayBuffer): Promise<void>
}

type FindLocalFontOptions = { allowVariable?: boolean }

const BUNDLED_FONTS: Record<string, string> = {
  'Inter|Regular': '/Inter-Regular.ttf',
  'Inter|Medium': '/Inter-Medium.ttf',
  'Inter|SemiBold': '/Inter-SemiBold.ttf',
  'Inter|Bold': '/Inter-Bold.ttf',
  'Noto Naskh Arabic|Regular': '/NotoNaskhArabic-Regular.ttf'
}

export class FontManager {
  private loadedFamilies = new Map<string, ArrayBuffer>()
  private fontsChangedListeners = new Set<() => void>()
  // Every attached canvas surface has its own provider (the editor renders the
  // scene and overlay layers on separate surfaces). A font must be registered
  // into ALL of them, not just the last one attached.
  private fontProviders = new Set<TypefaceFontProvider>()
  private localFonts: FontInfo[] | null = null
  private localFontAccessState: LocalFontAccessState = IS_BROWSER ? 'prompt' : 'unsupported'
  private downloadedFontCache: DownloadedFontCache | null = null
  private fallbackUserAgent: string | undefined
  private googleFontsCache = new Map<string, Record<string, string>>()
  private googleFontsFailed = new Set<string>()
  private cjkFallbackFamilies: string[] = []
  private cjkFallbackPromise: Promise<string[]> | null = null
  private arabicFallbackFamilies: string[] = []
  private arabicFallbackPromise: Promise<string[]> | null = null
  private localFontStats = { rawCount: 0, uniqueFamilies: 0 }

  attachProvider(_canvasKit: CanvasKit, provider: TypefaceFontProvider): void {
    this.fontProviders.add(provider)
    // Mirror every already-loaded font into the newly attached provider so a
    // second surface starts fully in sync with what is already loaded.
    for (const [cacheKey, data] of this.loadedFamilies) {
      const family = cacheKey.slice(0, cacheKey.indexOf('|'))
      this.registerFontIntoProvider(provider, family, data)
    }
  }

  detachProvider(provider?: TypefaceFontProvider | null): void {
    if (provider) this.fontProviders.delete(provider)
  }

  provider(): TypefaceFontProvider | null {
    for (const provider of this.fontProviders) return provider
    return null
  }

  localAccessState(): LocalFontAccessState {
    return this.localFontAccessState
  }

  /** Diagnostics for the optional Local Font Access source. */
  localFontDiagnostics(): LocalFontDiagnostics {
    const localFamilies = this.localFonts?.map((f) => f.family) ?? []
    return {
      apiSupported: IS_BROWSER && typeof window.queryLocalFonts === 'function',
      permission: this.localFontAccessState,
      rawCount: this.localFontStats.rawCount,
      uniqueFamilies: this.localFontStats.uniqueFamilies,
      variableSkipped: 0,
      catalogCount: CATALOG_FAMILIES.length,
      pickerTotal: new Set([...CATALOG_FAMILIES, ...localFamilies]).size
    }
  }

  setDownloadedFontCache(cache: DownloadedFontCache | null): void {
    this.downloadedFontCache = cache
  }

  setFallbackUserAgent(userAgent: string | undefined): void {
    this.fallbackUserAgent = userAgent
  }

  async loadCachedFont(family: string, style = 'Regular'): Promise<ArrayBuffer | null> {
    const cached = await this.readDownloadedFont(family, style)
    if (!cached) return null
    return this.registerAndCache(family, style, cached)
  }

  async requestLocalFontAccess(): Promise<FontInfo[]> {
    if (!IS_BROWSER || !window.queryLocalFonts) {
      this.localFontAccessState = 'unsupported'
      this.localFonts = []
      return []
    }
    try {
      const fonts = await window.queryLocalFonts()
      const seen = new Set<string>()
      const result: FontInfo[] = []
      for (const f of fonts) {
        const key = `${f.family}|${f.style}`
        if (seen.has(key)) continue
        seen.add(key)
        result.push({
          family: f.family,
          fullName: f.fullName,
          style: f.style,
          postscriptName: f.postscriptName
        })
      }
      this.localFonts = result
      this.localFontAccessState = 'granted'
      this.localFontStats = {
        rawCount: fonts.length,
        uniqueFamilies: new Set(result.map((r) => r.family)).size
      }
      return result
    } catch {
      this.localFonts = []
      this.localFontAccessState = 'denied'
      this.localFontStats = { rawCount: 0, uniqueFamilies: 0 }
      return []
    }
  }

  async listFamilies(): Promise<string[]> {
    // The curated catalog is always offered so the picker is usable even
    // before (or without) Local Font Access. Local fonts are merged in only
    // once already granted — never trigger the permission prompt from here.
    const local = this.localFonts?.map((f) => f.family) ?? []
    return [...new Set([...CATALOG_FAMILIES, ...local])].sort()
  }

  /**
   * Weights (100–900) the family actually provides — derived from granted
   * local fonts, else the Google Fonts catalog. Returns `[]` when unknown, so
   * callers can fall back to the full weight scale.
   *
   * Note: a variable local font may report only its default named instance
   * here; its full `wght` axis range is not introspected.
   */
  async availableWeights(family: string): Promise<number[]> {
    const local =
      this.localFonts?.filter(
        (f) => f.family === family || normalizeFontFamily(f.family) === family
      ) ?? []
    if (local.length > 0) {
      return uniqueSortedWeights(local.map((f) => styleToWeight(f.style)))
    }

    try {
      const files = await this.fetchGoogleFontFiles(family)
      if (files) return uniqueSortedWeights(Object.keys(files).map(variantToWeight))
    } catch (e) {
      console.warn(`Could not resolve available weights for "${family}":`, e)
    }
    return []
  }

  async fetchBundledFont(url: string): Promise<ArrayBuffer | null> {
    if (IS_BROWSER) {
      const response = await fetch(url)
      return response.arrayBuffer()
    }
    const { readFile } = await import(/* @vite-ignore */ 'node:fs/promises')
    const { resolve, dirname } = await import(/* @vite-ignore */ 'node:path')
    const { createRequire } = await import(/* @vite-ignore */ 'node:module')
    const require = createRequire(import.meta.url)
    const packageRoot = dirname(require.resolve('@open-pencil/core/package.json'))
    const assetPath = resolve(packageRoot, `assets${url}`)
    const buf = await readFile(assetPath)
    return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength)
  }

  async loadFont(family: string, style = 'Regular'): Promise<ArrayBuffer | null> {
    const cacheKey = `${family}|${style}`
    if (this.loadedFamilies.has(cacheKey)) {
      const cached = this.loadedFamilies.get(cacheKey)
      if (!cached) return null
      this.registerFontInCanvasKit(family, cached)
      return cached
    }

    const downloadedBuffer = await this.loadCachedFont(family, style)
    if (downloadedBuffer) return downloadedBuffer

    const localBuffer = await this.findLocalFont(family, style, { allowVariable: true })
    if (localBuffer) return this.registerAndCache(family, style, localBuffer)

    if (typeof fetch !== 'undefined') {
      try {
        const buffer = await this.fetchGoogleFont(family, style)
        if (buffer) {
          await this.writeDownloadedFont(family, style, buffer)
          return this.registerAndCache(family, style, buffer)
        }
      } catch (e) {
        console.warn(`Google Fonts fetch failed for "${family}" ${style}:`, e)
      }
    }

    const bundledUrl = BUNDLED_FONTS[cacheKey]
    if (bundledUrl) {
      try {
        const buffer = await this.fetchBundledFont(bundledUrl)
        if (buffer && !isVariableFont(buffer)) return this.registerAndCache(family, style, buffer)
      } catch (e) {
        console.warn(`Bundled font load failed for "${family}" ${style}:`, e)
      }
    }

    return null
  }

  async ensureNodeFont(family: string, weight: number): Promise<void> {
    await this.loadFont(family, weightToStyle(weight))
  }

  markLoaded(family: string, style: string, data: ArrayBuffer): void {
    this.loadedFamilies.set(`${family}|${style}`, data)
    this.registerFontInCanvasKit(family, data)
    this.notifyFontsChanged()
  }

  /**
   * Subscribe to font-load events — fired whenever a font's bytes become
   * available. Returns an unsubscribe function. Used to refresh missing-font
   * warnings and to repaint the canvas once an on-demand font has loaded.
   */
  onFontsChanged(listener: () => void): () => void {
    this.fontsChangedListeners.add(listener)
    return () => this.fontsChangedListeners.delete(listener)
  }

  private notifyFontsChanged(): void {
    for (const listener of this.fontsChangedListeners) listener()
  }

  isLoaded(family: string): boolean {
    return [...this.loadedFamilies.keys()].some((k) => k.startsWith(`${family}|`))
  }

  isStyleLoaded(family: string, style: string): boolean {
    return this.loadedFamilies.has(`${family}|${style}`)
  }

  loadedData(family: string, style: string): ArrayBuffer | null {
    return this.loadedFamilies.get(`${family}|${style}`) ?? null
  }

  collectFontKeys(graph: SceneGraph, nodeIds: string[]): Array<[string, string]> {
    const fontKeys = new Set<string>()
    const collect = (id: string) => {
      const node = graph.getNode(id)
      if (!node) return
      if (node.type === 'TEXT') {
        const family = node.fontFamily || DEFAULT_FONT_FAMILY
        fontKeys.add(`${family}\0${weightToStyle(node.fontWeight || 400, node.italic)}`)
        for (const run of node.styleRuns) {
          const f = run.style.fontFamily ?? family
          const w = run.style.fontWeight ?? node.fontWeight
          const i = run.style.italic ?? node.italic
          fontKeys.add(`${f}\0${weightToStyle(w, i)}`)
        }
      }
      for (const childId of node.childIds) collect(childId)
    }
    for (const id of nodeIds) collect(id)

    return [...fontKeys].map((k) => k.split('\0') as [string, string])
  }

  async ensureCJKFallback(): Promise<string[]> {
    if (this.cjkFallbackFamilies.length > 0) return this.cjkFallbackFamilies
    if (this.cjkFallbackPromise) return this.cjkFallbackPromise

    this.cjkFallbackPromise = this.ensureFallbackFamilies('cjk', this.cjkFallbackFamilies, {
      allowVariableLocalFonts: true
    })
    return this.cjkFallbackPromise
  }

  getCJKFallbackFamilies(): string[] {
    return this.cjkFallbackFamilies
  }

  setCJKFallbackFamily(family: string): void {
    if (!this.cjkFallbackFamilies.includes(family)) {
      this.cjkFallbackFamilies.push(family)
    }
  }

  async ensureArabicFallback(): Promise<string[]> {
    if (this.arabicFallbackFamilies.length > 0) return this.arabicFallbackFamilies
    if (this.arabicFallbackPromise) return this.arabicFallbackPromise

    this.arabicFallbackPromise = this.ensureFallbackFamilies('arabic', this.arabicFallbackFamilies)
    return this.arabicFallbackPromise
  }

  async ensureFallbackPack(
    scripts: FontFallbackScript[] = ['cjk', 'arabic']
  ): Promise<Record<FontFallbackScript, string[]>> {
    const result: Record<FontFallbackScript, string[]> = { cjk: [], arabic: [] }
    await Promise.all(
      scripts.map(async (script) => {
        result[script] =
          script === 'cjk' ? await this.ensureCJKFallback() : await this.ensureArabicFallback()
      })
    )
    return result
  }

  getArabicFallbackFamilies(): string[] {
    return this.arabicFallbackFamilies
  }

  setArabicFallbackFamily(family: string): void {
    if (!this.arabicFallbackFamilies.includes(family)) {
      this.arabicFallbackFamilies.push(family)
    }
  }

  private async ensureFallbackFamilies(
    script: FontFallbackScript,
    targetFamilies: string[],
    options: { allowVariableLocalFonts?: boolean } = {}
  ): Promise<string[]> {
    const manifest = fontFallbackEntry(script, this.fallbackUserAgent)

    for (const family of manifest.localFamilies) {
      const buffer = await this.findLocalFont(family, undefined, {
        allowVariable: options.allowVariableLocalFonts
      })
      if (buffer && this.registerAndCache(family, 'Regular', buffer)) {
        targetFamilies.push(family)
      }
    }

    if (targetFamilies.length === 0) {
      const results = await Promise.allSettled(
        manifest.remoteFamilies.map(async (family) => {
          const data = await this.loadFont(family, 'Regular')
          return data ? family : null
        })
      )
      for (const result of results) {
        if (result.status === 'fulfilled' && result.value) targetFamilies.push(result.value)
      }
    }

    return targetFamilies
  }

  private async readDownloadedFont(family: string, style: string): Promise<ArrayBuffer | null> {
    if (!this.downloadedFontCache) return null
    try {
      return await this.downloadedFontCache.read(family, style)
    } catch (e) {
      console.warn(`Downloaded font cache read failed for "${family}" ${style}:`, e)
      return null
    }
  }

  private async writeDownloadedFont(
    family: string,
    style: string,
    data: ArrayBuffer
  ): Promise<void> {
    if (!this.downloadedFontCache) return
    try {
      await this.downloadedFontCache.write(family, style, data)
    } catch (e) {
      console.warn(`Downloaded font cache write failed for "${family}" ${style}:`, e)
    }
  }

  private async retryWithNormalizedFamily(family: string): Promise<Record<string, string> | null> {
    const normalized = normalizeFontFamily(family)
    if (normalized === family) {
      this.googleFontsFailed.add(family)
      return null
    }
    const result = await this.fetchGoogleFontFiles(normalized)
    if (result) this.googleFontsCache.set(family, result)
    else this.googleFontsFailed.add(family)
    return result
  }

  private async fetchGoogleFontFiles(family: string): Promise<Record<string, string> | null> {
    if (this.googleFontsCache.has(family)) return this.googleFontsCache.get(family) ?? null
    if (this.googleFontsFailed.has(family)) return null

    const url = `https://www.googleapis.com/webfonts/v1/webfonts?family=${encodeURIComponent(family)}&key=${GOOGLE_FONTS_API_KEY}`
    let response: Response
    try {
      response = await fetch(url)
    } catch {
      this.googleFontsFailed.add(family)
      return null
    }
    if (!response.ok) return this.retryWithNormalizedFamily(family)

    const data = (await response.json()) as {
      items?: Array<{ files?: Record<string, string> }>
    }
    const files = data.items?.[0]?.files
    if (!files) return this.retryWithNormalizedFamily(family)

    this.googleFontsCache.set(family, files)
    return files
  }

  private async fetchGoogleFont(family: string, style: string): Promise<ArrayBuffer | null> {
    const files = await this.fetchGoogleFontFiles(family)
    if (!files) return null

    const variant = styleToVariant(style)
    const ttfUrl = files[variant] ?? files['regular']
    if (!ttfUrl) return null

    const response = await fetch(ttfUrl)
    if (!response.ok) return null

    return response.arrayBuffer()
  }

  private async findLocalFont(
    family: string,
    style?: string,
    options: FindLocalFontOptions = {}
  ): Promise<ArrayBuffer | null> {
    if (!IS_BROWSER || !window.queryLocalFonts) return null
    try {
      const fonts = await window.queryLocalFonts()
      const families = [family]
      const normalized = normalizeFontFamily(family)
      if (normalized !== family) families.push(normalized)

      let match: (typeof fonts)[number] | undefined
      for (const f of families) {
        match = pickFontStyle(
          fonts.filter((x) => x.family === f),
          style
        )
        if (match) break
      }

      if (!match) return null
      const blob: Blob = await match.blob()
      const buffer = await blob.arrayBuffer()
      if (!options.allowVariable && isVariableFont(buffer)) return null
      return buffer
    } catch (e) {
      console.warn(`Local font access failed for "${family}" ${style ?? ''}:`, e)
      return null
    }
  }

  private registerAndCache(family: string, style: string, buffer: ArrayBuffer): ArrayBuffer | null {
    this.loadedFamilies.set(`${family}|${style}`, buffer)
    this.registerFontInCanvasKit(family, buffer)
    this.registerFontInBrowser(family, style, buffer)
    this.notifyFontsChanged()
    return buffer
  }

  private registerFontInCanvasKit(family: string, data: ArrayBuffer): boolean {
    if (this.fontProviders.size === 0) {
      console.warn(
        `[fonts] "${family}" loaded but no CanvasKit provider is attached — ` +
          `the canvas will fall back to a default font.`
      )
      return false
    }
    let registered = false
    for (const provider of this.fontProviders) {
      if (this.registerFontIntoProvider(provider, family, data)) registered = true
    }
    return registered
  }

  private registerFontIntoProvider(
    provider: TypefaceFontProvider,
    family: string,
    data: ArrayBuffer
  ): boolean {
    if (data.byteLength < 4) return false
    try {
      provider.registerFont(data, family)
      return true
    } catch (e) {
      console.warn(`[fonts] CanvasKit rejected font "${family}":`, e)
      return false
    }
  }

  private registerFontInBrowser(family: string, style: string, data: ArrayBuffer) {
    if (!IS_BROWSER) return
    const italic = style.toLowerCase().includes('italic') ? 'italic' : 'normal'
    // A variable font file spans a weight range; pinning it to one weight makes
    // the DOM ignore it for every other weight.
    const weight = isVariableFont(data) ? '100 900' : String(styleToWeight(style))
    const face = new FontFace(family, data, {
      weight,
      style: italic
    })
    face
      .load()
      .then(() => document.fonts.add(face))
      .catch(() => {
        console.warn(`Failed to load font "${family}" (${style})`)
      })
  }
}

export const fontManager = new FontManager()
