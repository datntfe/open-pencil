# AI Design Quality — Flow & QA Checklist

> Mục đích: tài liệu giúp **dễ biết một kết quả AI design là ĐÚNG hay SAI**, và hiểu **flow xử lý** của chế độ "Design bằng AI". Dùng khi review output hoặc khi sửa pipeline AI.

---

## 1. Vấn đề từng gặp

AI design mode chỉ ra **wireframe rỗng** — chip rỗng, ô xám placeholder, thẻ chỉ có icon, thiếu text thật.

**Nguyên nhân:** AI hoàn thành *Skeleton* (dựng khung xám) nhưng không hoàn thành *Fill content* (đổ nội dung thật). Cộng dồn từ: model yếu chạy quy trình quá dài · skeleton-first không hợp artboard đơn · áp lực step budget · không có phản hồi thị giác · tiêu chí "xong" yếu.

**Đã xử lý:** xem mục 4.

---

## 2. Flow xử lý (sau khi sửa)

AI phân loại yêu cầu rồi chọn 1 trong 2 workflow:

### Direct workflow — artboard đơn
Dùng cho: banner, poster, social graphic, 1 app screen, card, ad — **một bố cục tự chứa**.

```
Plan (text) → calc kích thước → render NỘI DUNG THẬT trực tiếp (2–3 call)
→ describe + batch_update fix → stock_photo (ảnh) → describe cuối → export_image tự kiểm
```
**Không** dùng ô xám placeholder. Render thẳng text/màu/icon thật.

### Skeleton workflow — trang nhiều section
Dùng cho: web cuộn dài, landing nhiều section, multi-screen.

```
Phase 1 Plan → Phase 2 Skeleton (khung xám cả trang) → Phase 3 Fill content
(replace_id từng section + describe/fix) → Phase 4 Polish
```

### Tool chính
`render` (JSX→node) · `describe` (phản hồi cấu trúc) · `batch_update` (sửa hàng loạt) · `calc` · `stock_photo` (ảnh Pexels) · `export_image` (tự kiểm thị giác cuối).

---

## 3. Checklist ĐÚNG / SAI

Eyeball một kết quả AI. **ĐÚNG = tất cả ✅. SAI = còn bất kỳ ❌.**

| # | Tiêu chí | ĐÚNG |
|---|---|---|
| 1 | Không còn ô xám placeholder (`#E2E8F0`, `#CBD5E1`, `#E5E7EB`...) trong vùng nội dung | ✅ |
| 2 | Mọi `<Text>` có chữ THẬT — không rỗng, không "Lorem/Title/Text" | ✅ |
| 3 | Mọi shape/frame nội dung có màu nền hoặc màu chữ (không trong suốt vô hình) | ✅ |
| 4 | Đủ các block đã nêu trong phần Plan của AI | ✅ |
| 5 | Ảnh (nếu cần) đã được `stock_photo` đổ vào, không còn ô ảnh xám | ✅ |
| 6 | Layout không lỗi: không tràn, không sụp về 0, text wrap đúng | ✅ |

→ Nếu **bất kỳ** dòng nào ❌ → AI **mới chỉ ra layout, chưa design xong**.

---

## 4. Đã sửa gì

| Hạng mục | Thay đổi |
|---|---|
| Workflow | `system-prompt/11-workflow.md`: thêm phân loại artboard đơn / trang nhiều section; thêm **Direct workflow** render nội dung thật trực tiếp (bỏ skeleton-first cho artboard đơn) |
| Cổng hoàn thành | `system-prompt/11-workflow.md`: mục "Completion check" — cấm kết thúc khi còn placeholder/text rỗng |
| Phản hồi thị giác | Thêm `export_image` vào tool của agent; prompt yêu cầu tự kiểm bằng ảnh ở bước cuối |
| Step budget | `MAX_AGENT_STEPS` nâng để phase đổ nội dung không bị cắt cụt |
| Model | **Người dùng tự đổi** sang model mạnh (Gemini 3 Pro / Claude / GPT) trong AI settings — đòn bẩy lớn nhất |

---

## 5. Cách verify

1. `bun run dev` → mở AI panel → đổi sang model mạnh.
2. **Artboard đơn**: prompt 1 banner → kỳ vọng đi Direct workflow, canvas ra text/màu thật, đối chiếu checklist mục 3 — phải toàn ✅.
3. **Trang nhiều section** (regression): prompt 1 landing dài → skeleton workflow vẫn chạy, kết thúc cũng không còn placeholder.
4. `bun run lint` sạch.

---

## 6. Giới hạn còn lại (KHÔNG phải bug)

`render` JSX chưa hỗ trợ: **gradient**, **image-fill trong JSX**, **inner-shadow**, **đa fill/stroke**, **per-character style**. → Độ tinh xảo bị chặn ở mức này; thiết kế cần gradient/hiệu ứng nâng cao sẽ ra phiên bản phẳng hơn. Đây là giới hạn tool, không phải lỗi quy trình.
