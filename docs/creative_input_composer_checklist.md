# Creative Input Composer — Pre-implementation Checklist

> Phase 0 deliverable. No code is written until this checklist is agreed.
> Goal: let the chat composer attach mascot / logo / design-reference images
> alongside the text prompt, without breaking the existing chat flow.

---

## 1. Audit findings (current state)

| # | Area | Finding |
|---|---|---|
| 1 | Chat composer | [src/components/Toolbar/ToolbarChatInput.vue](../src/components/Toolbar/ToolbarChatInput.vue) — single-line input in the floating bottom toolbar. Shown by [DesktopToolbar.vue](../src/components/Toolbar/DesktopToolbar.vue) when `mode === 'ai'`. |
| 2 | Send / input / buttons | `ToolbarChatInput.vue`: `<input v-model="input">` (l.69), submit `<button>` (l.93), stop `<button>` (l.83), `handleSubmit` (l.22) → `chat.value?.sendMessage({ text })`. |
| 3 | Chat state | `Chat<UIMessage>` from `@ai-sdk/vue` (v3) — created in [transports.ts](../src/app/ai/chat/transports.ts) `createChatSessionManager`. Shared via [activity.ts](../src/app/ai/chat/activity.ts) `useChatActivity()`. Messages live in the `Chat` instance (in-memory). No Pinia store for composer text. |
| 4 | Send payload | `sendMessage` (ai v6) accepts `{ text, files?: FileList \| FileUIPart[], metadata? }`. `FileUIPart = { type:'file', mediaType, filename?, url }` (`url` = data URL). File parts are **native** and already part of `UIMessage.parts`. |
| 5 | Upload mechanism | No chat upload UI. Editor-side image import exists: [clipboard/images.ts](../packages/core/src/editor/clipboard/images.ts), [ImageFillPicker.vue](../src/components/ImageFillPicker.vue) uses `useFileDialog` from `@vueuse/core`. **No upload endpoint** — images are kept client-side. |
| 6 | Asset registry | Editor stores images in `graph.images` (hash→bytes) for canvas fills only. No general media library. |
| 7 | Thumbnail / dropzone | No reusable thumbnail/dropzone component. `ImageFillPicker.vue` has a simple `<img>` preview pattern. |
| 8 | Styling | Tailwind + token composables in `src/components/ui/` (`useButtonUI`, `useInputUI`, `usePopoverUI`…). Tokens: `text-surface`, `text-muted`, `bg-panel`, `bg-input`, `bg-hover`, `bg-accent`, `border-border`, `shadow-floating`, `rounded-xl`. |
| 9 | Responsive | `Toolbar.vue` switches Desktop/Mobile via `useViewportKind()`. Mobile uses `MobileToolbar.vue` (no inline chat input). The creative composer targets the **desktop** toolbar chat input. |
| 10 | Tests | [tests/e2e/chat/panel.spec.ts](../tests/e2e/chat/panel.spec.ts) — mocks the transport, asserts input/send/Enter. Test ids: `toolbar-chat-input`, `toolbar-chat-send`, `toolbar-chat-stop`. |

---

## 2. Files to CHANGE

| File | Change |
|---|---|
| `src/components/Toolbar/ToolbarChatInput.vue` | Add a compact-mode "+" import button; lift `input` text + send logic so the expanded panel can reuse it; mount the expanded panel. |
| `src/components/chat/ChatMessage.vue` | Render `file` parts of user messages as image thumbnails (uses `isFileUIPart` from `ai`). |
| i18n locale file(s) | Add strings: add mascot/logo/reference, creative references title, errors. |
| `tests/e2e/chat/panel.spec.ts` (or new spec) | Add coverage (see §6). |

## 2b. Files to CREATE

| File | Purpose |
|---|---|
| `src/app/ai/chat/creative-attachments.ts` | `useCreativeAttachments()` composable: staged attachment array, add/remove, file validation, `File → data URL`, per-type limits. Pure state — no transport coupling. |
| `src/components/chat/CreativeComposer.vue` | Expanded-mode panel: header + textarea + asset strip + 3 add-buttons + footer/send. Anchored above the toolbar. |
| `src/components/chat/CreativeAttachmentChip.vue` | One thumbnail chip: preview, type badge, remove button, loading/error state. |

## 3. Files that MUST NOT be touched

- `src/app/ai/chat/transports.ts` — send pipeline. `sendMessage({ text, files })` is native; no transport change needed.
- `src/app/ai/acp/transport.ts` — ACP agents. It extracts only text parts; file parts are ignored gracefully (documented limitation).
- `src/app/ai/chat/system-prompt/*` — design system prompt.
- `src/components/Toolbar/MobileToolbar.vue` — mobile composer (out of V1 scope).
- Editor / canvas / renderer / scene-graph — unrelated.
- `ChatPanel.vue` send path — left as-is (it also calls `sendMessage({ text })`; still valid).

---

## 4. API / payload — does it change?

**No breaking change. No custom backend exists for chat** — the AI SDK (`ToolLoopAgent` / `DirectChatTransport`) calls the model provider directly.

Approach (backward-compatible):

- Images are attached as **native AI SDK `file` parts** via `chat.sendMessage({ text, files })`, where `files` is a `FileUIPart[]` (`{ type:'file', mediaType, filename, url: dataURL }`). Vision-capable models receive the images; old text-only messages are unaffected (the transport already iterates `parts`).
- Asset **type** (mascot / logo / design_reference) is conveyed by **prepending one concise line to the prompt text**, e.g. `[Creative references: mascot — meo.png; logo — savepet-logo.png]`. This is plain text → 100% backward-compatible, and the model reads it.
- A structured `attachments[]` / `client_context` object as in the original spec would require a **custom chat backend**, which does not exist here. This is recorded as a backend follow-up in the final report; the FE keeps a clean `useCreativeAttachments` abstraction so wiring a real endpoint later is localized.

→ **`sendMessage` signature is unchanged; only its arguments are richer. Compact text-only send is byte-identical to today.**

---

## 5. UI flow

**Compact (default):** unchanged toolbar input + a new `+` (image) icon button.

**Expanded (on `+` click or when an asset is attached):** a panel anchored **above** the floating toolbar (overlay — the toolbar itself does not resize / does not become a modal):
```
┌ Creative references ───────────────── ✕ ┐
│ textarea: Describe what you want…        │
│ [mascot ▸ chip] [logo ▸ chip] …          │
│ + Mascot   + Logo   + Design ref         │
│ helper text                       [Send] │
└──────────────────────────────────────────┘
```
- Add button → `useFileDialog` (`image/png,jpeg,webp,svg`) → validate → stage as local-preview attachment.
- Chip: thumbnail + type badge + remove (✕) + loading/error state.
- Send → compose text + file parts → `sendMessage` → on success clear text+attachments, collapse to compact.
- Close (✕) collapses to compact (text + attachments preserved).
- Limits: mascot ≤3, logo ≤3, design_reference ≤6, total ≤10.

---

## 6. Risks

| Risk | Mitigation |
|---|---|
| Floating toolbar layout breaks | Expanded panel is **absolutely positioned overlay above** the toolbar; toolbar markup/height unchanged. |
| Large data-URL payload to model | Per-file size cap (e.g. 5 MB) + count caps; reject oversized. |
| Non-vision model ignores images | Acceptable — file parts are ignored gracefully; text context line still informs the model. |
| ACP agents don't get images | Documented limitation — ACP transport only forwards text. |
| `ChatMessage.vue` regression | Add file-part branch additively; do not alter existing text/tool branches. |
| Mini composer / widget-step composer | Not touched — `ToolbarChatInput` only; verified no shared mutation. |
| Console errors from object URLs | Use data URLs (no `revokeObjectURL` lifecycle bugs) or revoke on unmount. |

---

## 7. Tests to run

- `bun run lint` + `bun run check:vue` (type-check).
- `tests/e2e/chat/panel.spec.ts` — existing chat tests still pass (compact send unchanged).
- New e2e: open expanded composer, add an asset (mocked file), see chip, remove, send with attachment, invalid-file error.
- Manual: compact send unchanged; expanded overlay doesn't break toolbar; no console errors; mini/widget composers unaffected.

---

## 8. Implementation order (V1)

1. `useCreativeAttachments` composable (state + validation + dataURL).
2. `CreativeAttachmentChip.vue`.
3. `CreativeComposer.vue` (expanded panel).
4. Wire into `ToolbarChatInput.vue` (compact `+` button, expanded mount, shared text + send).
5. `ChatMessage.vue` — render image file parts.
6. i18n strings.
7. Tests + lint/typecheck.
8. `docs/creative_input_composer_report.md`.

V1.1 (if safe): real upload endpoint, drag-drop, paste image, large preview. Backlog: asset library, reorder, crop, bg-removal, AI classify/summarize, brand-kit persistence.
