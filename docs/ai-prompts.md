# AI Prompts — những gì được submit lên model

> Mục đích: liệt kê **toàn bộ prompt mà OpenPencil gửi lên AI model** ở chế độ "Design bằng AI", **không bao gồm prompt do user gõ**. Dùng khi audit / chỉnh hành vi AI.

---

## 1. Một request gồm những gì

Mỗi lần AI chạy, payload gửi lên model gồm 4 phần (ngoài tin nhắn của user):

| # | Phần | Nguồn | Vai trò |
|---|---|---|---|
| 1 | **System prompt** (`instructions`) | `src/app/ai/chat/system-prompt/` | Luật thiết kế + workflow |
| 2 | **Tool definitions** | 23 tool — `description` + schema params | Danh sách công cụ model được gọi |
| 3 | **Runtime-injected** | `ai-adapter.ts` chèn vào tool result | Cảnh báo step budget, ảnh export |
| 4 | Lịch sử hội thoại + tin nhắn user | — | *(không nằm trong phạm vi doc này)* |

Lắp ráp tại [transports.ts](../src/app/ai/chat/transports.ts) — `createToolLoopTransport` dựng `ToolLoopAgent`:

```ts
new ToolLoopAgent({
  model,
  instructions: SYSTEM_PROMPT,        // ← phần 1, từ system-prompt/index.ts
  tools,                               // ← phần 2, từ createAITools()
  stopWhen: stepCountIs(MAX_AGENT_STEPS),
  maxOutputTokens,
  providerOptions: cacheProviderOptions
})
```

---

## 2. Hai đường transport (prompt khác nhau)

| Provider | Transport | System prompt dùng |
|---|---|---|
| API key trực tiếp (Anthropic / OpenAI / Gemini / OpenRouter / compatible) | `ToolLoopAgent` + `DirectChatTransport` | **`system-prompt/`** (đầy đủ, ~600 dòng) |
| ACP agent (Claude Code, Gemini CLI…) — provider id `acp:*` | `ACPChatTransport` | **`acp/design-context.md`** (rút gọn, 1 đoạn) — agent đã có system prompt riêng |

Doc còn lại tập trung vào đường `ToolLoopAgent` (đường mặc định khi dùng API key).

---

## 3. Phần 1 — System prompt (`instructions`)

Thư mục nguồn: [src/app/ai/chat/system-prompt/](../src/app/ai/chat/system-prompt/). Prompt được **tách thành từng section, mỗi section 1 file `.md`**; [index.ts](../src/app/ai/chat/system-prompt/index.ts) import tất cả bằng `?raw` rồi `join('\n')` lại thành chuỗi `SYSTEM_PROMPT` gửi **nguyên văn** làm `instructions`.

> ⚠ Việc lắp ráp là **không mất mát**: các file nối lại bằng `'\n'` cho ra đúng từng byte như bản `system-prompt.md` cũ. Sửa hành vi AI = sửa file section tương ứng. Quy ước lắp ráp (thêm/đổi thứ tự section) xem [system-prompt/README.md](../src/app/ai/chat/system-prompt/README.md).

Mỗi section ↔ một file (sửa hành vi AI = sửa file tương ứng):

| File | Mục | Nội dung |
|---|---|---|
| `01-role.md` | Mở đầu | Vai trò "design assistant", yêu cầu summary 2–3 dòng cuối |
| `02-rendering.md` | `# Rendering` | Tool `render` JSX, danh sách element hợp lệ, **toàn bộ props reference** |
| `03-layout-rules.md` | `## Layout rules` | Luật flex / fill / hug, text wrapping |
| `04-corner-radius.md` | `## Corner radius` | Thang corner radius |
| `05-spacing.md` | `## Spacing` | Thang spacing 4px grid |
| `06-building-top-down.md` | `## Building top-down` | Trần 40 element/render call, bắt buộc dùng `calc` |
| `07-typography.md` | `## Typography` | Thang typography |
| `08-prohibited.md` | `## Prohibited` | Cấm: CSS, named color, emoji, `Math.` trong calc… |
| `09-common-patterns.md` | `## Common patterns` | Progress bar, divider, tab bar, card grid… |
| `10-stock-photos.md` | `# Stock Photos` | Cách dùng `stock_photo` |
| `11-workflow.md` | `# Workflow (MANDATORY)` | Phân loại **Direct** vs **Skeleton**, Completion check, Phase 1–4, step budget 80/message |
| `12-example-mobile.md` | `# Example: …` | Ví dụ đầy đủ mobile app UI |
| `13-example-desktop.md` | `# Example: …` | Ví dụ đầy đủ desktop news site |

> Liên quan: tiêu chí ĐÚNG/SAI của output xem [ai-design-quality.md](./ai-design-quality.md).

---

## 4. Phần 2 — Tool definitions

`createAITools()` ([src/app/ai/tools/index.ts](../src/app/ai/tools/index.ts)) submit **`CORE_TOOLS` + `export_image`** = **23 tool**. Mỗi tool gửi lên model gồm `name`, `description`, và schema params (mỗi param có `description` riêng).

> `EXTENDED_TOOLS` (~80 tool: variables, vector, boolean, analyze, codegen…) **KHÔNG** được submit ở chế độ chat — chỉ dùng qua MCP server.

23 tool được submit (`description` rút gọn):

| Tool | Description |
|---|---|
| `get_selection` | Get details about currently selected nodes. |
| `get_node` | Get detailed properties of a node by ID. `depth` giới hạn đệ quy con. |
| `find_nodes` | Find nodes by name pattern and/or type. |
| `get_jsx` | Get JSX representation of a node and its children (round-trip format). |
| `render` | Render JSX to design nodes. `replace_id` để thay skeleton bằng nội dung thật. |
| `update_node` | Update position, size, opacity, corner radius, visibility, text, font. |
| `set_layout` | Set auto-layout (flexbox): direction, alignment, spacing, padding. |
| `set_layout_child` | Configure auto-layout child: sizing FIXED/HUG/FILL, grow, alignment. |
| `set_radius` | Set corner radius (hỗ trợ từng góc riêng). |
| `set_fill` | Set fill (solid / image…) on a node. |
| `set_stroke` | Set the stroke (border) of a node. |
| `set_text` | Set text content of a text node. |
| `set_text_properties` | Set alignment, auto-resize, text case, decoration, truncation. |
| `delete_node` | Delete a node by ID. |
| `reparent_node` | Move a node into a different parent. |
| `node_resize` | Resize a node. |
| `batch_update` | Execute multiple modifications in one call. |
| `stock_photo` | Search stock photos (Pexels) and apply to leaf shapes. |
| `describe` | Semantic description of one or more nodes (depth tự thích ứng). |
| `calc` | Arithmetic calculator. ALWAYS use instead of mental math. |
| `eval` | Execute JavaScript with full Figma Plugin API access. |
| `viewport_zoom_to_fit` | Zoom viewport to fit specified nodes. |
| `export_image` | Export nodes as raster image (PNG/JPG/WEBP), trả base64 — model có vision tự kiểm. |

Danh sách `CORE_TOOLS` định nghĩa tại [packages/core/src/tools/registry-core.ts](../packages/core/src/tools/registry-core.ts); mỗi `description` nằm trong file tool tương ứng (`tools/read.ts`, `tools/create/`, `tools/modify/`…).

---

## 5. Phần 3 — Nội dung chèn lúc runtime

`toolsToAI()` trong [packages/core/src/tools/ai-adapter.ts](../packages/core/src/tools/ai-adapter.ts) chèn thêm vào **tool result** (model thấy ở lượt sau):

**a. Cảnh báo step budget** — khi còn ≤ 5 step (`STEP_WARNING_THRESHOLD = 5`), gắn field `_warning` vào kết quả tool:

```
⚠ {N} steps remaining out of {max}. Wrap up: finish critical fixes,
skip polish. User can send "continue" for more steps.
```

**b. Ảnh từ `export_image`** — `toModelOutput` chuyển base64 → media content để model vision "nhìn" được:

```ts
{ type: 'content', value: [{ type: 'media', mediaType, data: base64 }] }
```

Ngoài ra mỗi tool result là JSON do tool execute trả về (không phải prompt soạn sẵn).

---

## 6. Anthropic prompt caching

Với provider Anthropic (hoặc OpenRouter model `anthropic/*`), `transports.ts` gắn `providerOptions.anthropic.cacheControl = { type: 'ephemeral' }` → system prompt + tool defs được cache, giảm token cho các step sau.

---

## 7. Những thứ KHÔNG phải prompt chat

Dễ nhầm — các file `.md` sau **không** được submit ở chế độ AI chat:

| File | Dùng ở đâu |
|---|---|
| `packages/core/src/tools/prompts/jsx-reference.md` | Chỉ Code panel ([CodePanel.vue](../src/components/CodePanel.vue)) — nút copy JSX reference |
| `packages/core/src/tools/prompts/codegen.md` | Chỉ MCP server expose như prompt resource |
| `EXTENDED_TOOLS` | Chỉ MCP server (`ALL_TOOLS`) |

---

## 8. Muốn đổi prompt thì sửa đâu

| Muốn đổi | Sửa file |
|---|---|
| Luật thiết kế / workflow / ví dụ | file section trong `src/app/ai/chat/system-prompt/` (xem bảng mục 3) |
| Mô tả 1 tool | file tool tương ứng trong `packages/core/src/tools/` |
| Tool nào được submit | `CORE_TOOLS` trong `registry-core.ts`, hoặc mảng trong `createAITools()` |
| Ngưỡng cảnh báo step | `STEP_WARNING_THRESHOLD` trong `ai-adapter.ts` |
| Tổng step budget | `MAX_AGENT_STEPS` trong `src/app/ai/tools/index.ts` |
| Prompt cho ACP agent | `src/app/ai/acp/design-context.md` |
