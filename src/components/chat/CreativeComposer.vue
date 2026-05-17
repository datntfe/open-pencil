<script setup lang="ts">
import { ref } from 'vue'
import { useFileDialog } from '@vueuse/core'

import CreativeAttachmentChip from '@/components/chat/CreativeAttachmentChip.vue'
import { useButtonUI } from '@/components/ui/button'
import { toast } from '@/app/shell/ui'
import {
  CREATIVE_ASSET_LABEL,
  useCreativeAttachments,
  type CreativeAssetType
} from '@/app/ai/chat/creative-attachments'

const { busy = false } = defineProps<{ busy?: boolean }>()
const emit = defineEmits<{ send: []; close: [] }>()

const {
  composerText,
  attachments,
  hasContent,
  acceptAttribute,
  canAdd,
  addFiles,
  removeAttachment
} = useCreativeAttachments()

const ADD_ACTIONS: CreativeAssetType[] = ['mascot', 'logo', 'design_reference']

const closeBtn = useButtonUI({
  tone: 'ghost',
  size: 'icon',
  ui: { base: 'shrink-0 rounded-md' }
}).base
const sendBtn = useButtonUI({
  tone: 'accent',
  size: 'sm',
  ui: { base: 'gap-1.5 rounded-lg disabled:opacity-40' }
}).base

const pendingType = ref<CreativeAssetType>('design_reference')
const { open, onChange, reset } = useFileDialog({
  accept: acceptAttribute,
  multiple: true
})

onChange(async (files) => {
  if (!files || files.length === 0) return
  const errors = await addFiles([...files], pendingType.value)
  for (const message of errors) toast.error(message)
  reset()
})

function pick(type: CreativeAssetType) {
  pendingType.value = type
  open()
}

function submit() {
  if (busy || !hasContent.value) return
  emit('send')
}

function onTextareaKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    submit()
  } else if (e.key === 'Escape') {
    emit('close')
  }
}
</script>

<template>
  <div
    data-test-id="creative-composer"
    class="flex w-96 max-w-[calc(100vw-2rem)] flex-col gap-2 rounded-xl border border-border bg-panel p-2.5 shadow-floating"
  >
    <!-- Header -->
    <div class="flex items-center gap-1.5">
      <icon-lucide-sparkles class="size-3.5 shrink-0 text-accent" />
      <span class="text-[11px] font-semibold text-surface">Creative references</span>
      <span class="flex-1" />
      <button
        type="button"
        aria-label="Collapse composer"
        data-test-id="creative-composer-close"
        :class="closeBtn"
        @click="emit('close')"
      >
        <icon-lucide-chevron-down class="size-3.5" />
      </button>
    </div>

    <!-- Prompt -->
    <textarea
      v-model="composerText"
      aria-label="Describe what you want to create"
      data-test-id="creative-composer-textarea"
      rows="3"
      placeholder="Describe what you want to create…"
      class="w-full resize-none rounded-lg border border-border bg-input px-2 py-1.5 text-xs leading-relaxed text-surface outline-none placeholder:text-muted focus:border-accent"
      @keydown="onTextareaKeydown"
    />

    <!-- Asset strip -->
    <div
      v-if="attachments.length > 0"
      data-test-id="creative-composer-assets"
      class="flex gap-2 overflow-x-auto pb-0.5"
    >
      <CreativeAttachmentChip
        v-for="att in attachments"
        :key="att.id"
        :attachment="att"
        @remove="removeAttachment"
      />
    </div>

    <!-- Add actions -->
    <div class="flex flex-wrap gap-1">
      <button
        v-for="type in ADD_ACTIONS"
        :key="type"
        type="button"
        :data-test-id="`creative-composer-add-${type}`"
        :disabled="!canAdd(type)"
        :aria-label="`Add ${CREATIVE_ASSET_LABEL[type]}`"
        class="flex items-center gap-1 rounded-lg border border-border bg-input px-2 py-1 text-[11px] text-surface hover:bg-hover disabled:cursor-not-allowed disabled:opacity-40"
        @click="pick(type)"
      >
        <icon-lucide-plus class="size-3 text-muted" />
        {{ CREATIVE_ASSET_LABEL[type] }}
      </button>
    </div>

    <!-- Footer -->
    <div class="flex items-center gap-2">
      <span class="flex-1 truncate text-[10px] text-muted">
        Attach a mascot, logo or design reference for the AI to use.
      </span>
      <button
        type="button"
        data-test-id="creative-composer-send"
        :disabled="busy || !hasContent"
        :class="sendBtn"
        @click="submit"
      >
        <icon-lucide-send class="size-3" />
        Send
      </button>
    </div>
  </div>
</template>
