<script setup lang="ts">
import { nextTick } from 'vue'
import { templateRef, unrefElement } from '@vueuse/core'
import {
  ComboboxAnchor,
  ComboboxContent,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxPortal,
  ComboboxRoot,
  ComboboxVirtualizer,
  ComboboxViewport,
  type AcceptableValue
} from 'reka-ui'

import { useFontPicker, type FontAccessController } from '#vue/primitives/FontPicker/useFontPicker'

import type { FontPickerEntry, FontPickerRow, FontPickerUi } from '#vue/primitives/FontPicker/types'

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

const { searchTerm, open, rows, fontCount, loading, accessState, requestAccess, select } =
  useFontPicker({
    modelValue,
    listFonts,
    localFontAccess,
    onSelect: (family) => emit('select', family)
  })

const rowText = (row: FontPickerRow) => (row.kind === 'font' ? row.family : '')
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
      <slot name="trigger" :value="modelValue" :open="open">
        <button :class="ui?.trigger">
          <span class="truncate">{{ modelValue }}</span>
        </button>
      </slot>
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
          <ComboboxVirtualizer
            v-slot="{ option }"
            :options="rows"
            :text-content="rowText"
            :estimate-size="34"
          >
            <div
              v-if="option.kind === 'header'"
              :class="
                ui?.header ??
                'select-none px-2 pt-2 pb-1 text-[10px] font-medium uppercase tracking-wide text-muted'
              "
            >
              {{ option.label }}
            </div>
            <slot
              v-else
              name="item"
              :family="option.family"
              :selected="option.family === modelValue"
            >
              <ComboboxItem
                :value="option.family"
                :class="ui?.item"
                :style="{ fontFamily: `'${option.family}', sans-serif` }"
              >
                <ComboboxItemIndicator>
                  <slot name="indicator" :selected="option.family === modelValue" />
                </ComboboxItemIndicator>
                <span class="truncate">{{ option.family }}</span>
              </ComboboxItem>
            </slot>
          </ComboboxVirtualizer>

          <div v-if="fontCount === 0 && searchTerm" :class="ui?.empty">
            {{ emptySearchText ?? 'No fonts found' }}
          </div>
          <div v-else-if="fontCount === 0" :class="ui?.empty">
            <div>
              <p>{{ emptyFontsText ?? 'No fonts available.' }}</p>
              <p v-if="emptyFontsHint" class="mt-1">{{ emptyFontsHint }}</p>
            </div>
          </div>

          <button
            v-if="accessState === 'prompt'"
            type="button"
            :class="ui?.emptyAction"
            :disabled="loading"
            @click="requestAccess"
          >
            {{ loading ? 'Loading…' : 'Add system fonts' }}
          </button>
        </ComboboxViewport>
      </ComboboxContent>
    </ComboboxPortal>
  </ComboboxRoot>
</template>
