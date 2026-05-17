<script setup lang="ts">
import { nextTick } from 'vue'
import { templateRef, unrefElement } from '@vueuse/core'
import {
  ComboboxAnchor,
  ComboboxContent,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxLabel,
  ComboboxPortal,
  ComboboxRoot,
  ComboboxTrigger,
  ComboboxViewport,
  type AcceptableValue
} from 'reka-ui'

import { useFontPicker, type FontAccessController } from '#vue/primitives/FontPicker/useFontPicker'

import type { FontPickerEntry, FontPickerUi } from '#vue/primitives/FontPicker/types'

const { listFonts, localFontAccess, ui, emptySearchText, emptyFontsText, emptyFontsHint } =
  defineProps<{
    listFonts: () => Promise<FontPickerEntry[]>
    localFontAccess?: FontAccessController
    ui?: FontPickerUi
    emptySearchText?: string
    emptyFontsText?: string
    emptyFontsHint?: string
  }>()

const modelValue = defineModel<string>({ required: true })
const emit = defineEmits<{ select: [family: string] }>()

const contentRef = templateRef<HTMLElement>('contentRef')

function focusSearchInput() {
  nextTick(() => {
    const content = unrefElement(contentRef)
    if (!(content instanceof HTMLElement)) return
    content.querySelector<HTMLInputElement>('input')?.focus()
  })
}

const { searchTerm, open, filteredGroups, fontCount, select } = useFontPicker({
  modelValue,
  listFonts,
  localFontAccess,
  onSelect: (family) => emit('select', family)
})
</script>

<template>
  <ComboboxRoot
    v-model:open="open"
    :model-value="modelValue"
    :ignore-filter="true"
    @update:model-value="
      (v: AcceptableValue) => {
        if (typeof v === 'string') select(v)
      }
    "
  >
    <ComboboxAnchor as-child>
      <ComboboxTrigger as-child>
        <slot name="trigger" :value="modelValue" :open="open">
          <button :class="ui?.trigger">
            <span class="truncate">{{ modelValue }}</span>
          </button>
        </slot>
      </ComboboxTrigger>
    </ComboboxAnchor>

    <ComboboxPortal>
      <ComboboxContent
        :side-offset="2"
        align="start"
        position="popper"
        :class="ui?.content"
        @open-auto-focus.prevent
        ref="contentRef"
        @vue:mounted="focusSearchInput"
      >
        <slot name="search" :search-term="searchTerm">
          <ComboboxInput
            v-model="searchTerm"
            :class="ui?.search"
            placeholder="Search fonts…"
            autocomplete="off"
            autocorrect="off"
            autocapitalize="off"
            spellcheck="false"
          />
        </slot>

        <ComboboxViewport :class="ui?.viewport ?? 'max-h-72 overflow-y-auto'">
          <ComboboxGroup v-for="group in filteredGroups" :key="group.label">
            <ComboboxLabel
              v-if="group.label"
              :class="
                ui?.header ??
                'select-none px-2 pt-2 pb-1 text-[10px] font-medium uppercase tracking-wide text-muted'
              "
            >
              {{ group.label }}
            </ComboboxLabel>
            <ComboboxItem
              v-for="family in group.families"
              :key="family"
              :value="family"
              :class="ui?.item"
              :style="{ fontFamily: `'${family}', sans-serif` }"
            >
              <slot name="item" :family="family" :selected="family === modelValue">
                <span class="truncate">{{ family }}</span>
              </slot>
            </ComboboxItem>
          </ComboboxGroup>

          <div v-if="fontCount === 0 && searchTerm" :class="ui?.empty">
            {{ emptySearchText ?? 'No fonts found' }}
          </div>
          <div v-else-if="fontCount === 0" :class="ui?.empty">
            <p>{{ emptyFontsText ?? 'No fonts available.' }}</p>
            <p v-if="emptyFontsHint" class="mt-1">{{ emptyFontsHint }}</p>
          </div>
        </ComboboxViewport>
      </ComboboxContent>
    </ComboboxPortal>
  </ComboboxRoot>
</template>
