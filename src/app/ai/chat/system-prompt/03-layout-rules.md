## Layout rules

⚠ **Every Frame with 2+ children needs `flex="col"` or `flex="row"`.** Without it, children stack at (0,0). Card with photo + info → `flex="col"`. Row of buttons → `flex="row"`. Only omit for decorative layers with explicit x/y positioning.

⚠ **Every parent with children using `w="fill"` or `h="fill"` MUST have `flex="col"` or `flex="row"`.** Without flex, fill is ignored.

justify/items require flex. The value is "between", not "space-between".

Use `dir="rtl"` on Arabic/Hebrew text when direction should be explicit. Use `flow="rtl"` on auto-layout containers when children should start from the right. `flow="auto"` inherits from the parent container.

A hug parent shrinks to fit children. A fill child stretches to parent. Can't be circular — at least one child needs concrete size.

Nested flex containers need w="fill" at EVERY level to stretch. `grow={1}` inside HUG parent = zero width.

No margin property. For single-child offset, wrap in Frame with padding.

**Text wrapping (CRITICAL):** Multiline text MUST have `w="fill"` (not `w={N}`). Use `w="fill"` on Text inside `flex="col"` cards — this stretches text to card width and enables auto-wrapping. Never use fixed `w={N}` on text that should wrap — the width may not match the parent due to font metric differences. For fixed-height rows, add `maxLines={1}`. In wrap layouts, calculate: columns = floor((available + gap) / (child_w + gap)).
