<script setup lang="ts">
import { computed } from 'vue'

import ProviderModelSelect from '@/components/chat/ProviderModelSelect.vue'
import ProviderSettings from '@/components/chat/ProviderSettings/ProviderSettings.vue'
import { useAIChat } from '@/app/ai/chat/use'

import { ACP_AGENTS } from '@open-pencil/core/constants'

const { providerID, providerDef, modelID, customModelID } = useAIChat()

const isACPProvider = computed(() => providerID.value.startsWith('acp:'))
const acpAgentName = computed(() => {
  const agentId = providerID.value.replace('acp:', '')
  return ACP_AGENTS.find((a) => a.id === agentId)?.name ?? agentId
})
const isCustomProvider = computed(
  () => providerID.value === 'openai-compatible' || providerID.value === 'anthropic-compatible'
)
const selectedModelName = computed(() => {
  if (isCustomProvider.value) return customModelID.value || 'No model'
  return providerDef.value.models.find((m) => m.id === modelID.value)?.name ?? modelID.value
})
</script>

<template>
  <div class="flex shrink-0 items-center gap-1 border-t border-border px-3 py-2">
    <div
      v-if="isACPProvider"
      class="flex items-center gap-1 px-1.5 py-0.5 text-[10px] text-muted"
    >
      <icon-lucide-bot class="size-3" />
      {{ acpAgentName }}
    </div>
    <div
      v-else-if="isCustomProvider"
      class="flex items-center gap-1 px-1.5 py-0.5 text-[10px] text-muted"
      data-test-id="chat-custom-model-label"
    >
      <icon-lucide-bot class="size-3" />
      {{ selectedModelName }}
    </div>
    <ProviderModelSelect v-else>
      <template #value>{{ selectedModelName }}</template>
    </ProviderModelSelect>

    <div class="ml-auto">
      <ProviderSettings />
    </div>
  </div>
</template>
