import { computed, ref, watch } from 'vue'
import type { ComputedRef } from 'vue'

import {
  TYPOGRAPHY_WEIGHTS,
  createTypographyActions,
  createTypographyState
} from '#vue/controls/typography/actions'
import { useEditor } from '#vue/editor/context'

/**
 * Options for {@link useTypography}.
 */
export interface TypographyFontLoader {
  /** Loads a font face before changing family or weight. */
  load: (family: string, style: string) => Promise<unknown>
  /**
   * Optional — returns the weights (100–900) the family supports, so the
   * panel can hide weights the font does not have. An empty array means
   * "unknown"; the full weight scale is shown in that case.
   */
  listWeights?: (family: string) => Promise<number[]>
}

export interface UseTypographyOptions {
  /**
   * Optional font loader invoked before changing family or weight.
   */
  fontLoader?: TypographyFontLoader
}

/**
 * Tracks the weight options available for the selected font family.
 *
 * Falls back to the full weight scale whenever the family's weights are
 * unknown (no loader, lookup failed, or an empty result). The currently
 * applied weight is always kept selectable so the dropdown never desyncs.
 */
function useFontWeights(
  fontFamily: ComputedRef<string>,
  fontWeight: ComputedRef<number>,
  fontLoader?: TypographyFontLoader
) {
  // `null` = unknown → fall back to the full scale.
  const available = ref<number[] | null>(null)
  let token = 0

  watch(
    fontFamily,
    async (family) => {
      const listWeights = fontLoader?.listWeights
      if (!family || !listWeights) {
        available.value = null
        return
      }
      const requestId = ++token
      try {
        const result = await listWeights(family)
        if (requestId === token) available.value = result.length > 0 ? result : null
      } catch {
        if (requestId === token) available.value = null
      }
    },
    { immediate: true }
  )

  return computed(() => {
    if (!available.value) return TYPOGRAPHY_WEIGHTS
    const allowed = new Set(available.value)
    allowed.add(fontWeight.value) // keep the applied weight selectable
    const filtered = TYPOGRAPHY_WEIGHTS.filter((w) => allowed.has(w.value))
    return filtered.length > 0 ? filtered : TYPOGRAPHY_WEIGHTS
  })
}

/**
 * Returns typography-related state and actions for the current text selection.
 *
 * This composable is designed for text property panels and formatting controls.
 */
export function useTypography(options: UseTypographyOptions = {}) {
  const editor = useEditor()
  const typographyState = createTypographyState(editor)
  const actions = createTypographyActions({ editor, ...typographyState, options })
  const weights = useFontWeights(
    typographyState.fontFamily,
    typographyState.fontWeight,
    options.fontLoader
  )

  return {
    editor,
    ...typographyState,
    weights,
    ...actions
  }
}
