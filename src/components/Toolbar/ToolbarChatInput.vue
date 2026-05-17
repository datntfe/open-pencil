<script setup lang="ts">
import { nextTick, onMounted, ref } from 'vue'

import CreativeComposer from '@/components/chat/CreativeComposer.vue'
import Tip from '@/components/ui/Tip.vue'
import { useButtonUI } from '@/components/ui/button'
import { useChatActivity } from '@/app/ai/chat/activity'
import { useCreativeAttachments } from '@/app/ai/chat/creative-attachments'
import { useAIChat } from '@/app/ai/chat/use'
import { toast } from '@/app/shell/ui'
import { useI18n } from '@open-pencil/vue'

const { isConfigured, activeTab } = useAIChat()
const { chat, isStreaming, activityLabel, refresh } = useChatActivity()
const { dialogs, panels } = useI18n()

const {
  composerText,
  totalCount,
  hasContent,
  isExpanded,
  expand,
  collapse,
  composeMessage,
  snapshot,
  restore,
  clear
} = useCreativeAttachments()

const inputEl = ref<HTMLInputElement>()

onMounted(() => {
  nextTick(() => inputEl.value?.focus())
})

async function send() {
  if (isStreaming.value) return
  const payload = composeMessage()
  if (!payload) return
  // Reveal the conversation in the side panel so the user sees progress.
  activeTab.value = 'ai'
  try {
    await refresh()
  } catch (err) {
    toast.error(err instanceof Error ? err.message : String(err))
    return
  }
  const target = chat.value
  if (!target) return
  // Snapshot, then clear optimistically; restore on failure so the user can retry.
  const snap = snapshot()
  clear()
  target.sendMessage(payload).catch((err: unknown) => {
    toast.error(err instanceof Error ? err.message : String(err))
    restore(snap)
  })
}

function handleSubmit(e: Event) {
  e.preventDefault()
  void send()
}

function handleStop() {
  chat.value?.stop()
}

function toggleExpanded() {
  if (isExpanded.value) collapse()
  else expand()
}

function openSetup() {
  activeTab.value = 'ai'
}
</script>

<template>
  <div v-if="isConfigured" class="relative">
    <!-- Expanded creative composer — overlays above the toolbar, never resizes it -->
    <CreativeComposer
      v-if="isExpanded"
      class="absolute bottom-full left-1/2 mb-2 -translate-x-1/2"
      :busy="isStreaming"
      @send="send"
      @close="collapse"
    />

    <form class="flex items-center gap-1" @submit="handleSubmit">
      <icon-lucide-sparkles class="ml-1 size-3.5 shrink-0 text-accent" />

      <!-- Streaming: live activity status -->
      <div
        v-if="isStreaming"
        data-test-id="toolbar-chat-status"
        class="flex h-8 w-72 min-w-0 items-center gap-2 px-1.5 text-xs text-surface"
      >
        <icon-lucide-loader-circle class="size-3.5 shrink-0 animate-spin text-accent" />
        <span class="truncate font-medium">{{ activityLabel }}</span>
        <span class="flex shrink-0 items-center gap-0.5">
          <span class="size-1 animate-bounce rounded-full bg-muted" style="animation-delay: 0ms" />
          <span class="size-1 animate-bounce rounded-full bg-muted" style="animation-delay: 150ms" />
          <span class="size-1 animate-bounce rounded-full bg-muted" style="animation-delay: 300ms" />
        </span>
      </div>

      <!-- Idle: text input -->
      <input
        v-else
        ref="inputEl"
        v-model="composerText"
        type="text"
        data-test-id="toolbar-chat-input"
        :placeholder="dialogs.describeChange"
        class="h-8 w-72 min-w-0 rounded-md bg-transparent px-1.5 text-xs text-surface outline-none placeholder:text-muted"
        @paste.stop
        @copy.stop
        @cut.stop
      />

      <!-- Creative references toggle -->
      <Tip label="Creative references">
        <button
          type="button"
          data-test-id="toolbar-chat-import"
          aria-label="Add creative references"
          :class="
            useButtonUI({
              tone: isExpanded ? 'accent' : 'ghost',
              size: 'icon',
              ui: { base: 'relative shrink-0 rounded-lg' }
            }).base
          "
          @click="toggleExpanded"
        >
          <icon-lucide-image-plus class="size-3.5" />
          <span
            v-if="totalCount > 0"
            data-test-id="toolbar-chat-import-count"
            class="absolute -right-1 -top-1 flex size-3.5 items-center justify-center rounded-full bg-accent text-[8px] font-bold text-white"
          >
            {{ totalCount }}
          </span>
        </button>
      </Tip>

      <Tip v-if="isStreaming" :label="dialogs.stopGenerating">
        <button
          type="button"
          data-test-id="toolbar-chat-stop"
          :class="useButtonUI({ tone: 'ghost', size: 'icon', ui: { base: 'shrink-0 rounded-lg' } }).base"
          @click="handleStop"
        >
          <icon-lucide-square class="size-3.5" />
        </button>
      </Tip>
      <Tip v-else :label="dialogs.sendMessage">
        <button
          type="submit"
          data-test-id="toolbar-chat-send"
          :disabled="!hasContent"
          :class="
            useButtonUI({
              tone: 'accent',
              size: 'icon',
              ui: { base: 'shrink-0 rounded-lg disabled:opacity-40' }
            }).base
          "
        >
          <icon-lucide-send class="size-3.5" />
        </button>
      </Tip>
    </form>
  </div>

  <button
    v-else
    type="button"
    data-test-id="toolbar-chat-setup"
    :class="useButtonUI({ tone: 'ghost', size: 'md', ui: { base: 'gap-1.5 rounded-lg' } }).base"
    @click="openSetup"
  >
    <icon-lucide-sparkles class="size-3.5 text-accent" />
    {{ panels.ai }}
  </button>
</template>
