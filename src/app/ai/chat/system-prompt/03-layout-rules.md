## Layout rules

⚠ **Every Frame with 2+ children needs `flex="col"` or `flex="row"`.** Without it, children stack at (0,0). Card with photo + info → `flex="col"`. Row of buttons → `flex="row"`. Only omit for decorative layers with explicit x/y positioning.

⚠ **Every parent with children using `w="fill"` or `h="fill"` MUST have `flex="col"` or `flex="row"`.** Without flex, fill is ignored.

justify/items require flex. The value is "between", not "space-between".

Use `dir="rtl"` on Arabic/Hebrew text when direction should be explicit. Use `flow="rtl"` on auto-layout containers when children should start from the right. `flow="auto"` inherits from the parent container.

A hug parent shrinks to fit children. A fill child stretches to parent. Can't be circular — at least one child needs concrete size.

Nested flex containers need w="fill" at EVERY level to stretch. `grow={1}` inside HUG parent = zero width.

No margin property. For single-child offset, wrap in Frame with padding.

**Text wrapping (CRITICAL):** Multiline text MUST have `w="fill"` (not `w={N}`). Use `w="fill"` on Text inside `flex="col"` cards — this stretches text to card width and enables auto-wrapping. Never use fixed `w={N}` on text that should wrap — the width may not match the parent due to font metric differences. For fixed-height rows, add `maxLines={1}`. In wrap layouts, calculate: columns = floor((available + gap) / (child_w + gap)).

## Layout architecture

Choose one macro structure before details: hero + support, split layout, card grid, comparison, timeline, infographic board, quote, poster, UI section, or dashboard/data layout. The macro structure must serve the content, not decoration.

Establish a clear focal area first. The viewer should know where to look in 1-2 seconds. Use size, contrast, placement, and whitespace to create primary, secondary, and rest zones.

Keep section hierarchy stronger than component hierarchy: canvas margin > section grouping > card grouping > inner content. Safe area is mandatory; never place key text or CTA near the artboard edge.

Control eye flow. Reading should move naturally left-to-right/top-to-bottom unless the composition has an intentional poster-like anchor. Asymmetry is allowed only when visual weight is balanced through size, color, density, and negative space.

Group related content together and separate unrelated content. Avoid many equal-weight blocks competing for attention. Information pacing matters: dense blocks need quieter neighbors; strong visual blocks need simpler surrounding text.

## Layout intelligence

Before rendering, identify: primary focal point, secondary focal point, reading flow, information priority, and visual weight distribution. Decide which area needs attention, which area needs rest, which area needs negative space, and which area can be visually compressed.

No element is random. Every object must have alignment logic, spacing relationship, scale relationship, and grouping relationship. If an element cannot explain its role in the composition, remove it or merge it into a stronger group.

Prefer grid feeling, clean spacing rhythm, modular layout, intentional whitespace, and readable hierarchy. A layout may be symmetrical or intentionally asymmetrical, but left/right/top/bottom weight must feel controlled.

Define composition zones: dominant area, supporting area, and empty/rest area. Social graphics need thumbnail clarity; editor/canvas UI needs the workspace/canvas to remain the focus and panels/toolbars to stay visually subordinate.

Check canvas pressure before finalizing: headline not near edge, CTA not near edge, image crop not awkward, decorative layers not invading text safe zones, and no sticker-board feeling from disconnected floating objects.
