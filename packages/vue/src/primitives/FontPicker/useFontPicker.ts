import { useFilter } from 'reka-ui'
import { computed, ref, watch } from 'vue'

import type { FontPickerEntry, FontPickerRow } from '#vue/primitives/FontPicker/types'

export type FontAccessState = 'unsupported' | 'prompt' | 'granted' | 'denied'

export interface FontAccessController {
  state: () => FontAccessState
  /** Grants Local Font Access, then returns the refreshed entry list. */
  load: () => Promise<FontPickerEntry[]>
}

/**
 * Options for {@link useFontPicker}.
 */
export interface UseFontPickerOptions {
  /** Writable model for the selected font family. */
  modelValue: { value: string }
  /** Async source for the picker's font entries (already grouped + ordered). */
  listFonts: () => Promise<FontPickerEntry[]>
  /** Host-provided local-font permission controller. */
  localFontAccess?: FontAccessController
  /** Optional callback fired after a family is selected. */
  onSelect?: (family: string) => void
}

/**
 * Returns searchable, grouped font-picker state and selection helpers.
 *
 * The font source is the app Font Registry — the curated catalog is always
 * present, so the picker is never empty even without Local Font Access.
 */
export function useFontPicker(options: UseFontPickerOptions) {
  const entries = ref<FontPickerEntry[]>([])
  const searchTerm = ref('')
  const open = ref(false)
  const loading = ref(false)
  const accessState = ref<FontAccessState>(options.localFontAccess?.state() ?? 'granted')

  const { contains } = useFilter({ sensitivity: 'base' })

  /** Entries after the search filter. */
  const matched = computed(() => {
    if (!searchTerm.value) return entries.value
    return entries.value.filter((entry) => contains(entry.family, searchTerm.value))
  })

  /** Rows to render: a section header precedes each new group. */
  const rows = computed<FontPickerRow[]>(() => {
    const out: FontPickerRow[] = []
    let lastGroup: string | undefined
    for (const entry of matched.value) {
      if (entry.group && entry.group !== lastGroup) {
        lastGroup = entry.group
        out.push({ kind: 'header', key: `h:${entry.group}`, label: entry.group })
      }
      out.push({ kind: 'font', key: `f:${entry.family}`, family: entry.family })
    }
    return out
  })

  /** Number of fonts (excluding headers) currently shown. */
  const fontCount = computed(() => matched.value.length)

  async function loadEntries() {
    if (loading.value) return
    loading.value = true
    try {
      // Re-fetch on every open so newly granted system fonts and load-state
      // changes are reflected. The source never triggers a permission prompt.
      entries.value = await options.listFonts()
      accessState.value = options.localFontAccess?.state() ?? accessState.value
    } finally {
      loading.value = false
    }
  }

  watch(open, async (isOpen) => {
    if (!isOpen) return
    searchTerm.value = ''
    accessState.value = options.localFontAccess?.state() ?? accessState.value
    await loadEntries()
  })

  async function requestAccess() {
    if (!options.localFontAccess || loading.value) return
    loading.value = true
    try {
      entries.value = await options.localFontAccess.load()
      accessState.value = options.localFontAccess.state()
    } finally {
      loading.value = false
    }
  }

  function select(family: string) {
    options.modelValue.value = family
    options.onSelect?.(family)
    open.value = false
  }

  return {
    entries,
    rows,
    fontCount,
    searchTerm,
    open,
    loading,
    accessState,
    requestAccess,
    select
  }
}
