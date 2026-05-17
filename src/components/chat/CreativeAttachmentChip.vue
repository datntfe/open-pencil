<script setup lang="ts">
import { CREATIVE_ASSET_LABEL, type CreativeAttachment } from '@/app/ai/chat/creative-attachments'

const { attachment } = defineProps<{ attachment: CreativeAttachment }>()
const emit = defineEmits<{ remove: [id: string] }>()
</script>

<template>
  <div class="group relative flex w-[68px] shrink-0 flex-col gap-1">
    <div
      class="relative aspect-square overflow-hidden rounded-lg border border-border bg-input"
    >
      <img
        :src="attachment.previewUrl"
        :alt="attachment.name"
        class="size-full object-cover"
      />

      <div
        v-if="attachment.status === 'uploading'"
        class="absolute inset-0 flex items-center justify-center bg-black/40"
      >
        <icon-lucide-loader-circle class="size-3.5 animate-spin text-white" />
      </div>
      <div
        v-else-if="attachment.status === 'failed'"
        class="absolute inset-0 flex items-center justify-center bg-red-500/40"
        :title="attachment.error"
      >
        <icon-lucide-triangle-alert class="size-3.5 text-white" />
      </div>

      <button
        type="button"
        :aria-label="`Remove ${attachment.name}`"
        class="absolute right-0.5 top-0.5 flex size-4 items-center justify-center rounded-full bg-black/65 text-white opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100 focus:opacity-100"
        @click="emit('remove', attachment.id)"
      >
        <icon-lucide-x class="size-2.5" />
      </button>
    </div>

    <span
      class="truncate text-[9px] font-medium uppercase tracking-wide text-muted"
      :title="attachment.name"
    >
      {{ CREATIVE_ASSET_LABEL[attachment.type] }}
    </span>
  </div>
</template>
