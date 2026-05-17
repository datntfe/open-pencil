<script setup lang="ts">
import { computed } from 'vue'
import { FontPickerRoot } from '@open-pencil/vue'

import { useSelectUI } from '@/components/ui/select'
import { usePopoverUI } from '@/components/ui/popover'
import { localFontAccessState, requestLocalFontAccess } from '@/app/editor/fonts'
import { getFontGroups } from '@/app/editor/fonts/registry'

import type { FontPickerUi, FontPickerEntry } from '@open-pencil/vue'

const modelValue = defineModel<string>({ required: true })
const emit = defineEmits<{ select: [family: string] }>()

const cls = usePopoverUI({
  content: 'w-[var(--reka-combobox-trigger-width)] min-w-56 overflow-hidden p-0'
})
const selectCls = useSelectUI({
  trigger: 'w-full rounded px-2 py-1 text-xs',
  item: 'w-full gap-2 px-2 py-2 text-sm'
})

const ui = computed<FontPickerUi>(() => ({
  trigger: selectCls.trigger,
  content: cls.content,
  item: selectCls.item,
  header: 'select-none px-2 pt-2 pb-1 text-[10px] font-medium uppercase tracking-wide text-muted',
  search:
    'w-full border-b border-border bg-transparent px-2 py-1 text-xs text-surface outline-none placeholder:text-muted',
  empty: 'px-2 py-3 text-center text-xs text-muted',
  emptyAction: 'm-2 rounded border border-border px-2 py-1 text-xs text-muted disabled:opacity-50'
}))

/** Flattens the app Font Registry into grouped picker entries. */
async function listFonts(): Promise<FontPickerEntry[]> {
  const groups = await getFontGroups()
  return groups.flatMap((group) =>
    group.fonts.map((font) => ({ family: font.family, group: group.label }))
  )
}

const localFontAccess = {
  state: localFontAccessState,
  load: async (): Promise<FontPickerEntry[]> => {
    await requestLocalFontAccess()
    return listFonts()
  }
}
</script>

<template>
  <FontPickerRoot
    v-model="modelValue"
    data-test-id="font-picker-root"
    :list-fonts="listFonts"
    :local-font-access="localFontAccess"
    :ui="ui"
    empty-fonts-hint="Curated web fonts load on demand — system fonts are optional."
    @select="emit('select', $event)"
  >
    <template #trigger>
      <button data-test-id="font-picker-trigger" :class="selectCls.trigger">
        <span class="truncate">{{ modelValue }}</span>
        <icon-lucide-chevron-down class="size-3 shrink-0 text-muted" />
      </button>
    </template>

    <template #item="{ family, selected }">
      <div
        data-test-id="font-picker-item"
        :class="selectCls.item"
        :style="{ fontFamily: `'${family}', sans-serif` }"
      >
        <icon-lucide-check v-if="selected" class="size-3 shrink-0 text-accent" />
        <span v-else class="size-3 shrink-0" />
        <span class="truncate">{{ family }}</span>
      </div>
    </template>
  </FontPickerRoot>
</template>
