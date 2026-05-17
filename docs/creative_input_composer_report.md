# Creative Input Composer — Implementation Report (V1)

> Companion to [creative_input_composer_checklist.md](./creative_input_composer_checklist.md).

## 1. Summary

The AI chat composer can now attach **mascot / logo / design-reference** images
alongside the text prompt. The compact toolbar input is unchanged; a new
"Creative references" toggle opens an **expanded composer panel** that overlays
above the floating toolbar (it never resizes the toolbar or becomes a modal).
Attachments are previewed as thumbnails, can be removed, and are sent to the AI
as native file parts. The existing text-only send path is untouched.

## 2. Files changed

**New**
- `src/app/ai/chat/creative-attachments.ts` — `useCreativeAttachments()` composable: shared composer text + staged attachments, validation, file→data-URL, per-type/total limits, `composeMessage()`.
- `src/components/chat/CreativeComposer.vue` — expanded panel (header, textarea, asset strip, 3 add buttons, footer/send).
- `src/components/chat/CreativeAttachmentChip.vue` — one attachment thumbnail (preview, type label, remove, loading/error state).
- `tests/engine/app/creative-attachments.test.ts` — 8 unit tests for the composable.
- `docs/creative_input_composer_checklist.md`, `docs/creative_input_composer_report.md`.

**Modified**
- `src/components/Toolbar/ToolbarChatInput.vue` — compact input now uses the shared `composerText`; added the "Creative references" toggle button (with attachment-count badge); mounts `CreativeComposer` as an overlay; unified `send()` builds `{ text, files }` and restores text+attachments on failure.
- `src/components/chat/ChatMessage.vue` — user messages now render image `file` parts as thumbnails (additive; text/tool rendering unchanged).

**Not touched** (per checklist): `transports.ts`, `acp/transport.ts`, `system-prompt/*`, `MobileToolbar.vue`, editor/canvas/renderer, `ChatPanel.vue` send path.

## 3. UI behaviour

- **Compact (default):** unchanged toolbar input + a new image/`+` toggle button. Send button is enabled when there is text **or** an attachment.
- **Expanded (toggle, or when assets exist):** an overlay panel above the toolbar — title + collapse (✕), a 3-row textarea, a horizontally scrollable asset strip, three add buttons (Mascot / Logo / Design reference), helper text + Send.
- Add button → native file picker (`image/png,jpeg,webp,svg+xml`, multiple). Invalid files raise a toast and are skipped; the composer never crashes.
- Each thumbnail shows its type label and a hover/focus remove (✕) button.
- Limits: mascot ≤3, logo ≤3, design_reference ≤6, total ≤10 (add buttons disable at the cap).
- Send: composes text + file parts → `chat.sendMessage(...)` → on success clears text+attachments and collapses; on failure restores them for retry.
- Keyboard: textarea Enter = send, Shift+Enter = newline, Escape = collapse. All buttons have `aria-label`s.

## 4. Payload / contract changes

**No breaking change. No new endpoint.** There is no custom chat backend — the AI SDK (`ToolLoopAgent` / `DirectChatTransport`) calls the model provider directly.

- Images are sent as the AI SDK's **native `file` parts** via `chat.sendMessage({ text, files })`, where `files` is a `FileUIPart[]` (`{ type:'file', mediaType, filename, url: dataURL }`). Vision-capable models receive the images.
- The asset **type** (mascot/logo/design_reference) is conveyed by prepending a plain-text creative context block to the prompt, e.g.
  ```text
  [Creative references attached]
  - Mascot: meo.png
    Use mascot files as character/brand assets...
  - Logo: savepet-logo.png
    Use logo files as brand identity assets...
  - Design reference: layout-ref.png
    Use design reference files for visual direction...
  Priority: follow the user request first...
  ```
  This is ordinary message text → fully backward-compatible and model-readable, while giving the model clearer guidance for how to use each attached asset.
- `chat.sendMessage`'s signature is unchanged; only its argument is richer. A text-only send produces the same message shape as before.

## 5. Backward compatibility

- Text-only send path is behaviour-identical (`composeMessage()` returns `{ text, files: [] }`; empty `files` adds no parts).
- `file` parts are a native member of `UIMessage.parts`; the transport already iterates `parts`. Old messages and tool rendering are unaffected.
- `ChatMessage.vue` changes are additive (a new `file`-part branch); text/tool branches untouched.
- ACP transport extracts only text parts — file parts are ignored gracefully (documented limitation).
- Mini / widget-step composers and the mobile toolbar are not touched.

## 6. Tests run

- `bun run lint` — **0 errors / 0 warnings**.
- `bun run check:vue` (vue-tsc) — **pass**.
- `bunx vite build` — **build succeeds**.
- `bun test tests/engine/app/creative-attachments.test.ts` — **8/8 pass** (valid stage, mime/empty/oversize reject, per-type limit, `composeMessage` null/text-only/with-attachment, snapshot/restore).
- `tests/e2e/chat/panel.spec.ts` — the first test (`saving API key shows chat interface`, line 146) **fails, and this is pre-existing** — confirmed by stashing all changes and re-running: it fails identically on the untouched baseline. It expects the panel text "Describe what you want to create or change." which does not render. This spec is serial, so that pre-existing failure blocks the 9 downstream chat tests from running. The chat input itself renders correctly (the `toBeVisible()` check on the input passes). **No e2e regression was introduced** by this feature.

## 7. Known limitations

- **Pre-existing e2e blocker**: `panel.spec.ts:146` fails on `main` independently of this feature and blocks the rest of the chat e2e suite. Recommend fixing separately so chat e2e coverage can run.
- **No real upload endpoint**: attachments stay client-side as data URLs and are sent inline. Large images inflate the request to the model — capped at 5 MB/file, 10 files.
- **Asset type via text context block**, not a structured `attachments[]` field — a structured payload + `client_context` needs a custom chat backend (see Backlog).
- **ACP agents** (Claude Code / Gemini CLI) only receive the text; image file parts are dropped by `ACPChatTransport`.
- New-component UI strings are English-only (not run through i18n locales yet).
- Non-vision models ignore the images (graceful — the text context line still informs them).
- Mobile toolbar has no inline composer; the creative composer is desktop-only in V1.

## 8. Backlog (not in V1)

- **Backend**: a real `uploadCreativeReferenceAsset(file, type)` endpoint + a structured `attachments[]` / `client_context` payload.
- Drag & drop and paste-image into the composer.
- Large thumbnail preview / popover; reorder assets; in-chip type re-classification UI (the composable already exposes `changeType`).
- Asset library / brand-kit persistence; crop; background removal; AI asset-type classification; AI reference summarisation.
- i18n localisation of the new component strings.
