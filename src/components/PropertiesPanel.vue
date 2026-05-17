<script setup lang="ts">
import { TabsContent, TabsList, TabsRoot, TabsTrigger } from 'reka-ui'

import { useI18n } from '@open-pencil/vue'
import { useAIChat } from '@/app/ai/chat/use'

import ChatPanel from './ChatPanel.vue'
import CodePanel from './CodePanel.vue'
import DesignPanel from './DesignPanel.vue'
import ZoomDropdown from './ZoomDropdown.vue'

const { activeTab } = useAIChat()
const { panels } = useI18n()
</script>

<template>
  <aside
    data-test-id="properties-panel"
    class="flex min-w-0 flex-1 flex-col overflow-hidden border-l border-border bg-panel"
    style="contain: paint layout style"
  >
    <TabsRoot v-model="activeTab" class="flex min-h-0 flex-1 flex-col">
      <TabsList class="flex h-10 shrink-0 items-center gap-1 border-b border-border px-2">
        <div class="flex gap-0.5 rounded-lg bg-panel-muted p-0.5">
          <TabsTrigger
            value="design"
            data-test-id="properties-tab-design"
            class="rounded-md border border-transparent px-2.5 py-1 text-xs font-medium text-muted transition-colors hover:text-surface data-[state=active]:border-border data-[state=active]:bg-panel data-[state=active]:text-surface"
          >
            {{ panels.design }}
          </TabsTrigger>
          <TabsTrigger
            value="code"
            data-test-id="properties-tab-code"
            class="flex items-center gap-1 rounded-md border border-transparent px-2.5 py-1 text-xs font-medium text-muted transition-colors hover:text-surface data-[state=active]:border-border data-[state=active]:bg-panel data-[state=active]:text-surface"
          >
            <icon-lucide-code class="size-3" />
            {{ panels.code }}
          </TabsTrigger>
          <TabsTrigger
            value="ai"
            data-test-id="properties-tab-ai"
            class="flex items-center gap-1 rounded-md border border-transparent px-2.5 py-1 text-xs font-medium text-muted transition-colors hover:text-surface data-[state=active]:border-border data-[state=active]:bg-panel data-[state=active]:text-surface"
          >
            <icon-lucide-sparkles class="size-3" />
            {{ panels.ai }}
          </TabsTrigger>
        </div>
        <ZoomDropdown v-if="activeTab === 'design'" />
      </TabsList>

      <TabsContent
        value="design"
        class="flex min-h-0 flex-1 flex-col"
        :force-mount="true"
        :hidden="activeTab !== 'design'"
      >
        <DesignPanel />
      </TabsContent>

      <TabsContent
        value="code"
        class="flex min-h-0 flex-1 flex-col"
        :force-mount="true"
        :hidden="activeTab !== 'code'"
      >
        <CodePanel />
      </TabsContent>

      <TabsContent
        value="ai"
        class="flex min-h-0 flex-1 flex-col"
        :force-mount="true"
        :hidden="activeTab !== 'ai'"
      >
        <ChatPanel />
      </TabsContent>
    </TabsRoot>
  </aside>
</template>
