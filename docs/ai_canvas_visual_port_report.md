# AI Canvas → OpenPencil — Visual Port Report (PHASE 1–7)

> Source chỉnh sửa: **OpenPencil only.** AI Canvas chỉ đọc tham khảo visual.
> Xem khảo sát ban đầu: [`ai_canvas_visual_port_checklist.md`](./ai_canvas_visual_port_checklist.md).

---

## 1. Summary thay đổi

Port **visual language** của AI Canvas sang OpenPencil ở mức **tinh tế / an toàn**:
hệ token (radius + shadow), shadow mềm kiểu editorial, viền nhạt hơn, theme **light** làm mặc định,
focus state cho button, và text rendering mượt hơn. **Không** đụng logic editor, canvas, store, data model.

Quyết định đã chốt với user:
- Theme nghiệm thu: **Light** → đổi `DEFAULT_THEME` sang `light`.
- Mức độ: **Tinh tế (an toàn)** — không rewrite UI, giữ gần nguyên tông màu.
- Dot grid canvas: **không port** (xem mục 7 / R2).

## 2. File đã sửa (17 file source + 2 docs)

| Phase | File | Thay đổi |
|---|---|---|
| 1 | `src/app.css` | Thêm token radius/shadow/accent/surface vào `@theme` + override light |
| 1 | `src/app/shell/theme.ts` | `DEFAULT_THEME: 'dark'` → `'light'` |
| 1 | `index.html` | `<html data-theme="light">` (chống FOUC) + `theme-color` `#f3f4f6` |
| 2 | `src/app.css` | Light: `--color-canvas` `#f3f4f6→#f1f5f9`, `--color-border` `#d8dce3→#e3e6ec` |
| 2 | `src/components/Toolbar/DesktopToolbar.vue` | `shadow-lg` → `shadow-floating` |
| 2 | `src/components/Toolbar/MobileToolbar.vue` | `shadow-lg` → `shadow-floating` |
| 2 | `src/components/MobileHud/MobileFileMenu.vue` | `shadow-xl` → `shadow-floating` |
| 2 | `src/components/MobileHud/MobilePresencePopover.vue` | `shadow-xl` → `shadow-floating` |
| 2 | `src/components/EditorCanvas.vue` | Popover padding `shadow-lg` → `shadow-floating` |
| 3 | `src/components/ui/button.ts` | `+ focus-visible` ring; `hover:bg-accent/90` → `hover:bg-accent-hover` |
| 3 | `src/components/ui/icon-button.ts` | `+ focus-visible` ring |
| 3 | `src/components/ui/surface.ts` | `elevation`: `md/lg`→`shadow-panel`, `xl/overlay`→`shadow-floating` |
| 3 | `src/components/ui/menu.ts` | content `shadow-lg` → `shadow-floating` |
| 3 | `src/components/ui/select.ts` | content `shadow-lg/xl` → `shadow-floating` |
| 3 | `src/components/ui/dialog.ts` | content `shadow-2xl` → `shadow-floating` |
| 3 | `src/components/ui/popover.ts` | content `shadow-xl` → `shadow-floating` |
| 3 | `src/components/ui/tooltip.ts` | content `shadow-lg` → `shadow-floating` |
| 4 | `src/app.css` | `body`: `-webkit-font-smoothing: antialiased` + `-moz-osx-font-smoothing` |
| — | `src/app/ai/chat/activity.ts` | Sửa 3 lỗi type-aware lint (code từ task trước, xem mục 7) |

Docs: `docs/ai_canvas_visual_port_checklist.md` (PHASE 0), `docs/ai_canvas_visual_port_report.md` (file này).

## 3. Token / theme đã thêm

Tất cả thêm vào `src/app.css` — **giữ nguyên 100% tên token cũ**, chỉ thêm mới.

| Token | Dark (`@theme`) | Light (`[data-theme=light]`) | Class sinh ra |
|---|---|---|---|
| `--radius-sm` | `0.375rem` (6px) | (như nhau) | `rounded-sm` |
| `--radius-md` | `0.5rem` (8px) | — | `rounded-md` |
| `--radius-lg` | `0.625rem` (10px) | — | `rounded-lg` |
| `--radius-xl` | `0.875rem` (14px) | — | `rounded-xl` |
| `--shadow-panel` | `0 1px 3px /.4` | `0 1px 2px /.06` | `shadow-panel` |
| `--shadow-floating` | `0 8px 30px /.45` | `0 2px 8px /.08, 0 12px 28px /.10` | `shadow-floating` |
| `--color-accent-hover` | `#2f74e8` | `#1d4ed8` | `bg/text-accent-hover` |
| `--color-accent-soft` | `rgb(59 130 246/.16)` | `#eaf1ff` | `bg-accent-soft` |
| `--color-panel-muted` | `#242424` | `#f6f7f9` | `bg-panel-muted` |
| `--color-border-strong` | `#4a4a4a` | `#c3c9d4` | `border-border-strong` |

### Bảng map tên generic (spec) → tên OpenPencil
OpenPencil đã có sẵn lớp token semantic — dùng tên cũ thay vì tạo trùng:

| Tên trong spec | Token OpenPencil tương ứng |
|---|---|
| `--color-bg-app` / `--color-bg-canvas` | `--color-canvas` |
| `--color-bg-panel` | `--color-panel` |
| `--color-bg-panel-muted` | `--color-panel-muted` *(mới)* |
| `--color-border-subtle` | `--color-border` |
| `--color-border-strong` | `--color-border-strong` *(mới)* |
| `--color-text-primary` | `--color-surface` |
| `--color-text-secondary` / `--color-text-muted` | `--color-muted` |
| `--color-accent` | `--color-accent` |
| `--color-accent-hover` | `--color-accent-hover` *(mới)* |
| `--color-accent-soft` | `--color-accent-soft` *(mới)* |
| `--shadow-panel` / `--shadow-floating` | giống tên *(mới)* |
| `--radius-sm/md/lg/xl` | giống tên *(mới)* |

> `--color-text-secondary` **không tạo riêng** — OpenPencil dùng mô hình 2 bậc `surface` (primary) + `muted` (secondary). Thêm bậc 3 gây rối, đã bỏ qua có chủ đích.

## 4. Component đã polish (PHASE 3)

- **Button**: thêm `focus-visible` ring (`ring-2 ring-accent/50`) — cải thiện accessibility; `accent` dùng token `accent-hover` thay vì opacity.
- **Icon button**: thêm `focus-visible` ring.
- **Surface (card/panel)**: shadow dùng token — `shadow-panel` (md/lg) và `shadow-floating` (xl/overlay), mềm hơn.
- **Menu / Select / Dialog / Popover / Tooltip**: shadow → `shadow-floating` đồng nhất.
- **API/props/variant giữ nguyên 100%** — chỉ đổi class bên trong `tv()`.

## 5. Phần cố tình KHÔNG đụng

- Canvas rendering, renderer `@open-pencil/core` / CanvasKit / WASM.
- Drag/drop, selection, resize/rotate, shortcut, history/undo-redo.
- Import/export, file format, store, data model.
- Kiến trúc FSD, tên token `--color-*` cũ.
- Cơ chế theme (`data-theme`) — giữ cả dark + light.
- Font family (đã là Inter — không thêm font external).
- Cỡ chữ / `--text-xs` `--text-sm` / line-height — không override (tránh R3 overflow & mất readability).
- Spacing toàn cục — editor dày đặc theo thiết kế, đổi spacing rủi ro vỡ layout.
- Tabs / layer row / empty-loading state — đã review, sẵn token-driven, không cần đổi.
- Dot grid canvas — xem R2 mục 7.

## 6. Test đã chạy & kết quả

| Lệnh | Mục đích | Kết quả |
|---|---|---|
| `bun install` | Cài deps | ✅ OK |
| `bun run lint` | oxlint type-aware (toàn repo) | ✅ 0 warning, 0 error |
| `bun run check:vue` | `vue-tsc --noEmit` typecheck | ✅ 0 error |
| `bun run build` | Production build (`lint` + `vite build`) | ✅ Built, PWA generated |
| `bun run dev` | Dev smoke test | ✅ HTTP 200, HMR sạch suốt quá trình |
| `bun run test` | Playwright E2E | ⚠️ **Không chạy tự động** — xem ghi chú dưới |

> **Playwright (`bun run test`)**: bộ test có **visual snapshot**. Vì đây là port *visual*
> (shadow/radius/màu/theme đổi), snapshot sẽ lệch *có chủ đích* → cần chạy
> `bun run test:update` để re-baseline. Test **chức năng** (drag, select, undo…) không bị
> ảnh hưởng vì không sửa logic. Đây là **việc cần làm thủ công** trước khi merge.

## 7. Rủi ro còn lại

| # | Rủi ro | Trạng thái |
|---|---|---|
| R2 | **Dot grid canvas không port** | Đã xác minh: workspace do `<canvas>` WASM renderer vẽ (phủ kín container). Dot grid CSS sẽ bị che, hoặc nếu hiện thì không pan/zoom theo nội dung. Port đúng cần sửa renderer → ngoài phạm vi. **Bỏ qua đúng điều kiện "nếu khả thi bằng CSS".** |
| — | Visual snapshot Playwright lệch | Cần `bun run test:update` (mục 6). |
| — | `localStorage` ghi đè theme mặc định | User từng đổi theme sẽ có key `open-pencil:theme` — mặc định `light` mới chỉ áp cho cài đặt mới. Xóa key hoặc toggle để nghiệm thu light. |
| — | FOUC theme | Đã thêm `data-theme="light"` vào `index.html` → fresh load không nháy. Nếu localStorage = `dark`, vẫn nháy nhẹ light→dark (chấp nhận được). |
| — | `activity.ts` lint | 3 lỗi type-aware (từ task “show running state” trước đó, `oxlint` không type-aware nên lúc đó lọt) — **đã sửa** bằng cách check `.length` thay cho guard `!last`. |
| Thấp | Dark theme chưa tinh chỉnh sâu | Theme nghiệm thu là light. Dark vẫn hoạt động, shadow token đã có giá trị dark riêng, nhưng chưa polish kỹ màu. |

## 8. Manual QA checklist (cần kiểm thủ công)

Chạy `bun run dev` → http://localhost:1420 (đảm bảo theme = light):

- [ ] App mở được, không màn trắng/đen.
- [ ] Canvas render shapes bình thường.
- [ ] Kéo thả / chọn / resize / rotate object hoạt động.
- [ ] Double-click sửa text hoạt động.
- [ ] Thêm text / image / shape hoạt động.
- [ ] Undo/redo (`⌘Z` / `⌘⇧Z`) hoạt động.
- [ ] Save / load / export file hoạt động.
- [ ] Bottom toolbar nổi với shadow mềm, bo góc 14px.
- [ ] Menu / dropdown / dialog / tooltip có shadow mềm đồng nhất.
- [ ] Tab phím (keyboard) thấy focus ring xanh trên button.
- [ ] Toggle dark theme vẫn dùng được, không vỡ.
- [ ] Không có console error mới.
- [ ] Không có layout overflow ở desktop.
- [ ] (Trước merge) `bun run test:update` để cập nhật visual snapshot.

---

## PHASE 8 — Dot grid + framed shell (mở rộng phạm vi, user duyệt)

Sau khi user cung cấp ảnh tham khảo vibe, **được duyệt vượt luật "không đụng renderer"**:

### Dot grid (lưới chấm nền)
- Renderer giờ vẽ lưới chấm **cố định theo màn hình** sau khi clear `pageColor`, trước khi vẽ scene.
- File mới: `packages/core/src/canvas/renderer/dot-grid.ts` (`drawCanvasDotGrid`).
- `pipeline.ts`: gọi `drawCanvasDotGrid` ở nhánh clear non-overlays.
- `renderer.ts`: thêm field `_dotGridPaint` (theo pattern `_flashPaint`); `lifecycle.ts`: cleanup paint.
- Màu chấm tự chọn theo độ sáng `pageColor` (nền sáng → chấm tối, ngược lại).
- **Chỉ áp viewport editor** — raster export dùng render path riêng, không bị ảnh hưởng.

### Nền ấm + framed shell
- `constants.ts`: `CANVAS_BG_COLOR` → `#f9f8f5` (trắng ngả ấm, thay xám lạnh).
- `app.css`: thêm token `--color-shell` (tan ấm `#e9dabd` light / `#1a1815` dark).
- `EditorView.vue` (chỉ desktop layout): `SplitterGroup` nền `bg-shell` + `p-2.5`; mỗi `SplitterPanel`
  thành **card nổi** bo góc `rounded-xl` + `border` + `shadow-panel`; resize handle thành rãnh hở 10px.
- `LayersPanel.vue` / `PropertiesPanel.vue`: bỏ `border-r`/`border-l` + `bg-panel` (card cha đã có).

### Test lại sau PHASE 8
| Lệnh | Kết quả |
|---|---|
| `bun run lint` | ✅ 0 lỗi (type-aware, gồm `packages/core`) |
| `bun run build` | ✅ Built OK |
| `bun run dev` | ✅ HTTP 200 |

### Rủi ro PHASE 8
- Renderer pipeline đã bị sửa (có duyệt). Dot grid vẽ mỗi frame — `drawPoints` 1 call, chi phí thấp.
- `EditorView.vue` desktop layout đổi — **cần QA thủ công kéo resize splitter** (padding trên `SplitterGroup` không ảnh hưởng toán resize của reka-ui, nhưng nên kiểm).
- Mobile / bare / collapsed layout **không đụng** — chỉ desktop có framed shell.

---

## PHASE 9 — Điều chỉnh theo phản hồi

> ⚠️ Phần **framed shell (khung tan + panel nổi)** ở PHASE 8 đã **REVERT** theo yêu cầu user
> (layout shell giữ y gốc). `--color-shell` đã gỡ. Dưới đây là trạng thái cuối thực tế.

**Giữ lại từ PHASE 8:** dot grid + nền canvas ấm (`CANVAS_BG_COLOR` `#f9f8f5`).

**Nguyên tắc chốt cùng user:** *shadow rất ít · viền mảnh 1px là chính · nền trắng + xám nhạt tương phản.*

| Hạng mục | Thay đổi |
|---|---|
| 3 segmented control (File/Assets, Design/Code/AI, toggle bottom bar) | Track `bg-panel-muted`, tab active = `bg-panel` + `border` 1px, **bỏ shadow**. Bottom toggle bỏ nền xanh đặc → segmented. |
| Section header label | `text-[11px] text-muted` → `text-xs font-semibold text-surface` (`section.ts`) |
| `input.ts` primitive | nền `bg-panel-muted` + `border` 1px + `rounded-md` — áp mọi input |
| Nút `+` / `−` các section | ký tự thô → icon `lucide-plus` / `lucide-minus` |
| Nút Export | hard-code `bg-blue-600` → token `bg-accent` + `rounded-lg` |
| Color row | `ColorInput` → ô gộp xám viền mảnh; `ColorStyleRow` remove → icon |

## Tiêu chí hoàn thành

| Tiêu chí | Trạng thái |
|---|---|
| Giữ nguyên chức năng editor | ✅ Không sửa logic nào |
| Visual vibe gần AI Canvas hơn | ✅ Shadow mềm, viền nhạt, radius 10px, light-first, focus state |
| Color system token hoá | ✅ Token cũ giữ nguyên + thêm radius/shadow/accent |
| Không hard-code lan man | ✅ Floating UI đều dùng `shadow-floating` |
| Không regression canvas/editor | ✅ Lint/typecheck/build pass; cần E2E xác nhận cuối |
| Có checklist trước + report sau | ✅ 2 file trong `docs/` |
