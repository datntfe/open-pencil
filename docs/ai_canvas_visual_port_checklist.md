# AI Canvas → OpenPencil — Visual Port Checklist (PHASE 0)

> Trạng thái: **Khảo sát hoàn tất — chưa sửa code.**
> Source chỉnh sửa: **OpenPencil only.** AI Canvas chỉ đọc tham khảo.

---

## 1. Tech stack — OpenPencil

| Hạng mục | Giá trị |
|---|---|
| Framework | Vue 3.5 + Vite 8 |
| Ngôn ngữ | TypeScript (strict) |
| Styling system | Tailwind CSS **v4** (CSS-based, plugin `@tailwindcss/vite`) |
| Theme/token location | `src/app.css` — block `@theme` (dark, mặc định) + `html[data-theme='light']` |
| Tailwind config file | **Không có** — cấu hình bằng CSS (`@theme`) trong `src/app.css` |
| Component styling | `tailwind-variants` (`tv()`) + `tailwind-merge` |
| Component library | `reka-ui` (headless), không phải shadcn |
| Canvas/editor package | `@open-pencil/core` (renderer CanvasKit/Skia WASM) + `@open-pencil/vue` (bindings) |
| Icons | `unplugin-icons` + Lucide (`<icon-lucide-*>`) |
| Lint/arch | `oxlint` (+ rule custom `open-pencil/*`) · `steiger` (kiến trúc FSD) |
| Theme hiện có | **2 theme**: dark (mặc định) + light (`data-theme="light"`) |

## 2. File styling chính — OpenPencil

| Vai trò | File |
|---|---|
| Global CSS + token | `src/app.css` |
| Theme config | `@theme` + `html[data-theme='light']` trong `src/app.css` |
| Component primitives (`tv()`) | `src/components/ui/`: `button.ts`, `input.ts`, `icon-button.ts`, `surface.ts`, `menu.ts`, `select.ts`, `dialog.ts`, `popover.ts`, `tooltip.ts`, `section.ts`, `picker-slider.ts`, `toast.ts` |
| Layout shell | `src/views/EditorView.vue` |
| Top tab bar | `src/components/TabBar.vue` |
| Left sidebar | `src/components/LayersPanel.vue`, `LayerTree.vue`, `PagesPanel.vue` |
| Bottom toolbar | `src/components/Toolbar/` (`Toolbar.vue`, `DesktopToolbar.vue`, `MobileToolbar.vue`, `ToolButton.vue`) |
| Right properties panel | `src/components/PropertiesPanel.vue`, `DesignPanel.vue`, `CodePanel.vue`, `ChatPanel.vue` |
| Canvas wrapper | `src/components/EditorCanvas.vue` |

### Token màu hiện có (OpenPencil)
Tất cả là `--color-*`, dùng qua class Tailwind (`bg-panel`, `text-surface`, `border-border`…):

`panel`, `canvas`, `border`, `hover`, `accent`, `surface` (text chính), `muted` (text phụ), `input`, `component`, + nhóm `warning-*`, `success-*`, `code-*`, `checkerboard-*`, `ruler-*`.

### Khoảng trống (gap) cần lưu ý
- ❌ **Không có** token `--radius-*` → `rounded-lg/xl/md/full` hard-code (~60+ chỗ).
- ❌ **Không có** token `--shadow-*` → `shadow-md/lg/xl/sm` hard-code (~20 chỗ).
- ❌ Không có token spacing riêng (dùng scale mặc định Tailwind).
- ❌ Không có token "text-secondary" tách bạch (chỉ có `surface` và `muted`).

---

## 3. Visual language — AI Canvas (tham khảo)

| Hạng mục | Đặc điểm AI Canvas |
|---|---|
| Framework | Next.js 16 + React 19 (≠ OpenPencil → **không port code component**) |
| Styling | Tailwind v4 + shadcn/ui (Base UI) + `class-variance-authority` |
| Token location | `src/app/globals.css` — `:root` (light) + `.dark` |
| Color space | **oklch**, palette **xám trung tính** (hue = 0) |
| Background | Light-first: `--background: oklch(1 0 0)` (trắng) |
| Border | Rất nhạt: `oklch(0.922 0 0)` light / `oklch(1 0 0 / 10%)` dark |
| Radius | `--radius: 0.625rem` (10px) → `sm/md/lg/xl` suy ra |
| Shadow | Mềm, nhiều lớp: `--shadow-xl: 0 1px 8px rgba(0,0,0,.03), 0 5px 20px rgba(0,0,0,.03)` |
| Typography | `--text-xs: 0.7rem`, `--text-sm: 0.8rem` (nhỏ, gọn) |
| Easing | `--ease-fluid`, `--ease-snappy` (cubic-bezier) |
| Canvas background | `.canvas-stage` — **lưới chấm tròn** (radial-gradient 10px), light `rgb(241 245 249)` / dark `rgb(15 23 42)` |
| Sidebar | Có token riêng `--sidebar*` (gần như trùng surface) |
| Vibe tổng thể | Sáng, sạch, editorial, viền nhạt, shadow mềm, bo góc 10px |

### Khác biệt cốt lõi cần thu hẹp
| | AI Canvas | OpenPencil hiện tại |
|---|---|---|
| Tông | Light-first, editorial, mềm | Dark-first, kiểu Figma, cứng |
| Viền | Rất nhạt | Đậm hơn, tương phản cao |
| Shadow | Mềm nhiều lớp, opacity thấp | `shadow-lg/xl` mặc định Tailwind (cứng) |
| Radius | Token hoá, 10px | Hard-code, không hệ thống |
| Canvas bg | Lưới chấm | `--color-canvas` phẳng |

---

## 4. SẼ PORT (an toàn — chỉ token/theme/styling)

- [ ] **Token layer mới** trong `src/app.css`: thêm `--radius-sm/md/lg/xl`, `--shadow-panel/floating` (+ shadow mềm theo style AI Canvas).
- [ ] **Tinh chỉnh GIÁ TRỊ** các token màu hiện có (giữ nguyên TÊN token) cho mềm/sạch hơn: `border` nhạt hơn, `panel`/`canvas` sạch hơn, shadow mềm hơn — cho **cả 2 theme**.
- [ ] Thêm alias token theo yêu cầu (`--color-bg-app`, `--color-bg-panel`, `--color-text-primary`, `--color-accent-soft`…) **map vào token sẵn có**, không phá tên cũ.
- [ ] Styling **visual shell**: app background, layout shell, left sidebar, bottom toolbar, right panel, panel/card surface, divider/border, scrollbar.
- [ ] Styling **component primitives** (`tv()`): `button`, `input`, `icon-button`, `surface`, `menu`, `select`, `dialog`, `popover`, `tooltip`, `section` — **chỉ đổi class, giữ nguyên API/props/variant**.
- [ ] Áp `--radius-*` / `--shadow-*` token thay cho giá trị hard-code (dần dần, không bắt buộc 100%).
- [ ] Typography: cân nhắc map nhẹ font-size scale (rủi ro — xem mục 6).

## 5. KHÔNG PORT (cố ý bỏ qua)

- ❌ Không bê nguyên palette oklch của AI Canvas → giữ hệ token `--color-*` hiện có của OpenPencil (đổi value, không đổi tên).
- ❌ Không copy code component shadcn/React (khác framework: React ≠ Vue).
- ❌ Không đụng renderer `@open-pencil/core` / CanvasKit / WASM.
- ❌ Không đổi cơ chế theme (`data-theme` attribute) — giữ cả dark + light.
- ❌ Không đụng: canvas rendering, drag/drop, selection, shortcut, history/undo-redo, import/export, store/data model.
- ❌ Không thêm font external (OpenPencil đã dùng Inter — đủ).
- ❌ Không đổi kiến trúc FSD, không di chuyển file lớn.

## 6. Rủi ro có thể gây bug

| # | Rủi ro | Mức | Giảm thiểu |
|---|---|---|---|
| R1 | Đổi **tên** token `--color-*` sẽ phá hàng trăm chỗ dùng `bg-panel`, `text-surface`… | Cao | **Chỉ đổi value, giữ nguyên tên.** Token mới chỉ thêm, không thay thế. |
| R2 | Lưới chấm canvas: nền canvas OpenPencil do CanvasKit (WASM) vẽ, không phải CSS → đổi cần sửa renderer (ngoài phạm vi) | Trung bình | Xác minh ở PHASE 2. Nếu là WASM-rendered → **giữ nguyên**, chỉ chỉnh `--color-canvas`. |
| R3 | Override `--text-xs/sm` làm đổi cỡ chữ toàn cục → overflow layout | Trung bình | Không port; hoặc chỉ chỉnh có kiểm soát + test overflow. |
| R4 | Đổi class trong primitive `tv()` làm lệch variant chưa thấy | Trung bình | Test từng variant button/input/menu; `tailwind-merge` tự giải xung đột class. |
| R5 | Light-first của AI Canvas vs dark-default OpenPencil → đẩy quá "sáng" làm hỏng theme dark (theme chính) | Trung bình | Tinh chỉnh **cả 2 theme**, lấy dark làm chuẩn nghiệm thu. |
| R6 | `oxlint` rule custom + `steiger` chặn pattern/cấu trúc mới | Thấp | File mới theo FSD + naming; chạy `lint`/`check:arch` sau mỗi nhóm sửa. |
| R7 | Shadow/radius đổi gây "nhảy" layout | Thấp | Radius/shadow không đổi box-size; smoke test desktop. |

## 7. Danh sách file dự kiến chỉnh (PHASE 1–4)

| Phase | File |
|---|---|
| 1 — Token | `src/app.css` |
| 2 — Shell | `src/views/EditorView.vue`, `src/components/TabBar.vue`, `LayersPanel.vue`, `PropertiesPanel.vue`, `EditorCanvas.vue` (chỉ nếu nền canvas là CSS) |
| 2 — Shell | `src/components/Toolbar/DesktopToolbar.vue`, `MobileToolbar.vue`, `ToolButton.vue` |
| 3 — Component | `src/components/ui/`: `button.ts`, `input.ts`, `icon-button.ts`, `surface.ts`, `menu.ts`, `select.ts`, `dialog.ts`, `popover.ts`, `tooltip.ts`, `section.ts` |
| 3 — Component | `src/components/LayerTree.vue` (layer/item row) |
| 4 — Typo/spacing | `src/app.css` (+ tinh chỉnh nhỏ trong shell nếu cần) |
| 7 — Report | `docs/ai_canvas_visual_port_report.md` (tạo mới) |

## 8. Lệnh test khả dụng (cho PHASE 6)

| Mục đích | Lệnh | Ghi chú |
|---|---|---|
| Install | `bun install` | |
| Lint | `bun run lint` | oxlint type-aware + structure |
| Typecheck | `bun run check:vue` | `vue-tsc --noEmit` (typecheck đầy đủ nằm trong `bun run check`) |
| Arch check | `bun run check:arch` | `steiger` |
| Test E2E | `bun run test` | Playwright (project `openpencil`) |
| Build | `bun run build` | chạy `lint` + `vite build` |
| Dev smoke | `bun run dev` | cổng 1420 |

> Không có script `typecheck` độc lập → dùng `bun run check` (gồm `tsgo --noEmit` + `vue-tsc`). Không bịa thêm script.

---

## Cổng phê duyệt

PHASE 0 hoàn tất. **Chưa sửa bất kỳ dòng code nào.** Cần xác nhận trước khi sang PHASE 1:
1. Đồng ý chiến lược **giữ tên token cũ, chỉ đổi value + thêm token mới**?
2. Có muốn port lưới chấm canvas không (phụ thuộc R2 — xác minh được hay không)?
3. Theme nghiệm thu chính là **dark** hay **light**?

### Quyết định đã chốt (user xác nhận)

| # | Quyết định | Lựa chọn |
|---|---|---|
| 1 | Theme chuẩn nghiệm thu | **Light** — đổi `DEFAULT_THEME` sang `light`, tinh chỉnh cả 2 theme |
| 2 | Mức độ thay đổi visual | **Tinh tế (an toàn)** — chỉ token radius/shadow + làm mềm shadow/viền, giữ gần nguyên tông màu |
| 3 | Lưới chấm canvas | **Port nếu khả thi bằng CSS** — xác minh ở PHASE 2; nếu do WASM vẽ thì bỏ qua |

> Chiến lược token: **giữ nguyên tên `--color-*` hiện có**, chỉ thêm token mới theo convention OpenPencil (không `bg-`/`text-` prefix). Tên generic trong spec (`--color-bg-panel`…) được map sang tên OpenPencil — xem bảng map trong report PHASE 7.
