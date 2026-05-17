import { getToolName, isTextUIPart, isToolUIPart } from 'ai'
import { computed, markRaw, shallowRef, watch } from 'vue'

import { activeTab as activeDocumentTab } from '@/app/tabs'
import { useAIChat } from '@/app/ai/chat/use'

import type { Chat } from '@ai-sdk/vue'
import type { UIMessage } from 'ai'

/**
 * Shared, app-wide view of the active AI chat session.
 *
 * Both the bottom toolbar (input + mode toggle) and the side panel read from
 * the same chat instance, so the live "Thinking / Running …" state stays in
 * sync wherever it is shown.
 */
const chat = shallowRef<Chat<UIMessage> | null>(null)
let initialized = false

function toolLabel(rawName: string): string {
  return rawName
    .replace(/^mcp__[^_]+__/, '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim()
}

export function useChatActivity() {
  const { ensureChat } = useAIChat()

  async function refresh(): Promise<Chat<UIMessage> | null> {
    const c = await ensureChat()
    chat.value = c ? markRaw(c) : null
    return chat.value
  }

  if (!initialized) {
    initialized = true
    void refresh()
    watch(
      () => activeDocumentTab.value?.id,
      () => void refresh()
    )
  }

  const status = computed<'ready' | 'submitted' | 'streaming' | 'error'>(
    () => chat.value?.status ?? 'ready'
  )

  const isStreaming = computed(
    () => status.value === 'submitted' || status.value === 'streaming'
  )

  /** Short, human-readable description of what the agent is doing right now. */
  const activityLabel = computed(() => {
    if (!isStreaming.value) return ''
    const messages = chat.value?.messages ?? []
    if (messages.length === 0) return 'Thinking'
    const last = messages[messages.length - 1]
    if (last.role !== 'assistant') return 'Thinking'

    if (last.parts.length === 0) return 'Thinking'
    const lastPart = last.parts[last.parts.length - 1]

    if (isToolUIPart(lastPart)) {
      const done =
        lastPart.state === 'output-available' || lastPart.state === 'output-error'
      // A finished tool while still streaming means the agent is deciding
      // on its next step.
      return done ? 'Thinking' : toolLabel(getToolName(lastPart))
    }

    if (isTextUIPart(lastPart) && lastPart.text) return 'Writing'
    return 'Thinking'
  })

  return { chat, status, isStreaming, activityLabel, refresh }
}
