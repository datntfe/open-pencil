import { createHead } from '@unhead/vue/client'
import { createApp } from 'vue'

import './app.css'
import { preloadFonts } from '@/app/editor/fonts'
import { IS_TAURI } from '@/constants'

import App from './App.vue'
import router from './router'

// Self-heal stale lazy-loaded chunks. A Vite dependency re-optimization in dev
// (triggered by editing files while the app is open) or a new deploy in
// production can invalidate dynamically-imported modules. Without this, a
// failed chunk fetch throws inside an async component loader and freezes the
// UI mid-action — e.g. the AI chat crashing while rendering a streamed reply.
let reloadScheduled = false
window.addEventListener('vite:preloadError', (event) => {
  event.preventDefault()
  if (reloadScheduled) return
  // performance.now() is ms since this page loaded. A failure within the first
  // few seconds means the chunk is genuinely missing — reloading would only
  // loop — so only self-heal once the page has been alive long enough that the
  // failure must be a fresh invalidation.
  if (performance.now() < 5000) return
  reloadScheduled = true
  window.location.reload()
})

preloadFonts()
const head = createHead()
createApp(App).use(router).use(head).mount('#app')

if (!IS_TAURI) {
  void import('virtual:pwa-register').then(({ registerSW }) => {
    registerSW({ immediate: true })
  })
}
