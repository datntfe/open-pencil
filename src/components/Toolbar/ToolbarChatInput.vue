<script setup lang="ts">
import { nextTick, onMounted, ref } from 'vue'

import Tip from '@/components/ui/Tip.vue'
import { useButtonUI } from '@/components/ui/button'
import { useChatActivity } from '@/app/ai/chat/activity'
import { useAIChat } from '@/app/ai/chat/use'
import { toast } from '@/app/shell/ui'
import { useI18n } from '@open-pencil/vue'

const { isConfigured, activeTab } = useAIChat()
const { chat, isStreaming, activityLabel, refresh } = useChatActivity()
const { dialogs, panels } = useI18n()

const input = ref('')
const inputEl = ref<HTMLInputElement>()

onMounted(() => {
  nextTick(() => inputEl.value?.focus())
})

async function handleSubmit(e: Event) {
  e.preventDefault()
  const text = input.value.trim()
  if (!text || isStreaming.value) return
  input.value = ''
  // Reveal the conversation in the side panel so the user sees progress.
  activeTab.value = 'ai'
  try {
    await refresh()
  } catch (err) {
    toast.error(err instanceof Error ? err.message : String(err))
    return
  }
  chat.value?.sendMessage({ text }).catch((err: unknown) => {
    toast.error(err instanceof Error ? err.message : String(err))
  })
}

function handleStop() {
  chat.value?.stop()
}

function openSetup() {
  activeTab.value = 'ai'
}
</script>

<template>
  <form v-if="isConfigured" class="flex items-center gap-1" @submit="handleSubmit">
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
      v-model="input"
      type="text"
      data-test-id="toolbar-chat-input"
      :placeholder="dialogs.describeChange"
      class="h-8 w-72 min-w-0 rounded-md bg-transparent px-1.5 text-xs text-surface outline-none placeholder:text-muted"
      @paste.stop
      @copy.stop
      @cut.stop
    />

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
        :disabled="!input.trim()"
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
