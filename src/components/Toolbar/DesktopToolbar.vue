<script setup lang="ts">
import { ref } from 'vue'

import Tip from '@/components/ui/Tip.vue'
import ToolButton from '@/components/Toolbar/ToolButton.vue'
import ToolFlyout from '@/components/Toolbar/ToolFlyout.vue'
import ToolbarChatInput from '@/components/Toolbar/ToolbarChatInput.vue'
import { useChatActivity } from '@/app/ai/chat/activity'
import { toolbarToolTestId, ToolbarItem, useI18n } from '@open-pencil/vue'

import type { Tool } from '@open-pencil/vue'
import type { EditorToolDef } from '@open-pencil/core/editor'
import type { ToolbarUi, ToolIconMap, ToolLabels } from '@/components/Toolbar/types'

const { tools, activeTool, toolIcons, toolLabels, toolShortcuts, ui } = defineProps<{
  tools: EditorToolDef[]
  activeTool: Tool
  toolIcons: ToolIconMap
  toolLabels: ToolLabels
  toolShortcuts: Record<Tool, string>
  ui?: ToolbarUi
}>()

const emit = defineEmits<{
  setTool: [tool: Tool]
}>()

const { panels } = useI18n()
const { isStreaming } = useChatActivity()

const mode = ref<'design' | 'ai'>('design')

function isActive(tool: EditorToolDef) {
  return tool.key === activeTool || (tool.flyout?.includes(activeTool) ?? false)
}

function activeKeyForTool(tool: EditorToolDef) {
  return tool.flyout?.includes(activeTool) ? activeTool : tool.key
}
</script>

<template>
  <div class="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center">
    <div
      data-test-id="toolbar"
      class="flex items-center gap-1 rounded-xl border border-border bg-panel p-1 shadow-floating"
    >
      <!-- Design / AI mode toggle -->
      <div class="flex gap-0.5 rounded-lg bg-panel-muted p-0.5">
        <Tip :label="isStreaming ? panels.design + ' (AI is running)' : panels.design">
          <button
            type="button"
            data-test-id="toolbar-mode-design"
            :disabled="isStreaming"
            class="flex size-7 cursor-pointer items-center justify-center rounded-md border transition-colors disabled:cursor-not-allowed disabled:opacity-40"
            :class="
              mode === 'design'
                ? 'border-border bg-panel text-surface'
                : 'border-transparent bg-transparent text-muted enabled:hover:text-surface'
            "
            @click="mode = 'design'"
          >
            <icon-lucide-shapes class="size-4" />
          </button>
        </Tip>
        <Tip :label="panels.ai">
          <button
            type="button"
            data-test-id="toolbar-mode-ai"
            class="flex size-7 cursor-pointer items-center justify-center rounded-md border transition-colors"
            :class="
              mode === 'ai'
                ? 'border-border bg-panel text-surface'
                : 'border-transparent bg-transparent text-muted hover:text-surface'
            "
            @click="mode = 'ai'"
          >
            <icon-lucide-sparkles class="size-4" :class="{ 'animate-pulse': isStreaming }" />
          </button>
        </Tip>
      </div>

      <div class="h-5 w-px shrink-0 bg-border" />

      <!-- Design mode: drawing tools -->
      <div v-if="mode === 'design'" class="flex gap-0.5">
        <template v-for="tool in tools" :key="tool.key">
          <Tip
            v-if="tool.flyout && tool.flyout.length > 1"
            :label="`${toolLabels[activeKeyForTool(tool)]} (${tool.shortcut})`"
          >
            <ToolFlyout
              :tool="tool"
              :active-tool="activeTool"
              :tool-icons="toolIcons"
              :tool-labels="toolLabels"
              :tool-shortcuts="toolShortcuts"
              :ui="ui"
              @select="emit('setTool', $event)"
            />
          </Tip>

          <ToolbarItem v-else v-slot="{ active, actions }" :tool="tool.key">
            <Tip :label="`${toolLabels[tool.key]} (${tool.shortcut})`">
              <ToolButton
                :test-id="toolbarToolTestId(tool.key)"
                :icon="toolIcons[tool.key]"
                :active="active || isActive(tool)"
                @click="actions.select"
              />
            </Tip>
          </ToolbarItem>
        </template>
      </div>

      <!-- AI mode: inline chat input -->
      <ToolbarChatInput v-else />
    </div>
  </div>
</template>
