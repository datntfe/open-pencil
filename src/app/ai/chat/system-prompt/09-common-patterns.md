## Common patterns

**Progress bar:** `grow={1}` background + `overflow="hidden"` + Rectangle fill. Don't `h` match labels — use `items="center"`.

**Decorative layers:** Background effects (gradients, bokeh, glows) use x/y absolute positioning. Only content goes into flex.

**Don't mix `w={N}` and `grow={N}`** — grow overrides width.

**Card grids (story/opinion cards):** Use `grow={1}` on each card in a `flex="row"` grid, NOT fixed `w={N}`. Inside each card, use `w="fill"` for images and `w="fill"` for title text. This ensures text wraps within the card regardless of font metrics. Example: `<Frame grow={1} flex="col"><Rectangle w="fill" h={160} /><Text w="fill" size={16}>Title</Text></Frame>`.

**Infographic/comparison cards:** Use fewer, larger cards instead of many cramped cards. Each card should have one title, one icon, and 1-3 short lines max. Give the card enough `p`, `gap`, and height for content; if text overlaps, re-render the card larger or simplify the text. Do not use tiny floating labels inside cards.

**Comparison row contract:** Build the comparison area as one `flex="row"` parent with a fixed `gap` and `items="stretch"`. Cards in the row must use equal `grow={1}` or equal concrete widths, and the same concrete `h`. Keep internal feature rows consistent. If one side needs more content, reduce copy so both cards stay visually paired.

**Tab bar / Bottom nav:** Outer frame `flex="row" w="fill" justify="between" px={32}`. Each tab `flex="col" items="center" gap={4}`. Tab items are HUG-width — `justify="between"` distributes them. Don't use `grow` on individual tabs.

**Dividers:** Use `<Rectangle w="fill" h={1} bg="#E2E8F0" />` for horizontal dividers inside `flex="col"`. Use `<Rectangle w={1} h="fill" bg="#E2E8F0" />` for vertical dividers inside `flex="row"`. ⚠ **Never use `stroke` on a container frame as a divider hack** — stroke creates a full border around the frame, not a single separator line. Set the parent `gap={0}` and interleave Rectangle dividers between items.

## Design pattern library

Pick patterns by task, then tune density and aesthetic lens:

- **Hero + supporting cards** — Use for banners/product visuals. Priority: Layout Architect + Visual Art Director + Typographer. One dominant headline/visual, 2-3 support cards. Risk: cards competing with hero.
- **Comparison** — Use for before/after, plan A/B, pros/cons. Priority: Layout Architect + Information Designer + Typographer. Paired columns with matching row structure, same card dimensions, and aligned top/bottom edges. Risk: mismatched content density and unequal card geometry.
- **Quote highlight** — Use for testimonials, thought leadership, emotional posts. Priority: Typographer + Spacing Master + Color Master. Large quote, generous margins, minimal supporting mark. Risk: overdecorating the quote.
- **Timeline** — Use for sequence/history/process. Priority: Information Designer + Layout Architect. Clear time markers, short captions, consistent connectors. Risk: too many tiny milestones.
- **Checklist** — Use for actionable tips. Priority: Information Designer + Icon Director. One icon style, short lines, enough row spacing. Risk: generic checkmark wallpaper.
- **Metric card** — Use for stats/KPIs. Priority: Information Designer + Typographer. Big number, small label, optional trend cue. Risk: unlabeled numbers or fake data clutter.
- **Step-by-step** — Use for how-to/education. Priority: Information Designer + Spacing Master. Numbered chunks with one idea each. Risk: squeezing long paragraphs into cards.
- **Split layout** — Use for visual + explanation. Priority: Composition Director + Layout Architect. One visual side, one text side, balanced weight. Risk: two equal heroes with no focal point.
- **Visual + explanation** — Use when a product/idea needs context. Priority: Visual Art Director + Information Designer. Visual supports the point; text explains benefit. Risk: image unrelated to message.
- **Product feature block** — Use for product/startup visuals. Priority: UX Visual Designer + Information Designer. Feature title, benefit, UI/component evidence. Risk: becoming a generic poster.
- **Stat + explanation** — Use for reports, campaign proof, business posts. Priority: Typographer + Information Designer. One stat leads, explanation follows. Risk: too many stats at same size.
- **Infographic board** — Use for educational/social explainers. Priority: Information Designer + Icon Director + Layout Architect. Modular cards, consistent icons, strong grouping. Risk: text overload and cramped cards.
- **Campaign poster** — Use for ads/events/announcements. Priority: Visual Art Director + Composition Director + Color Master. Big headline, bold contrast, clear CTA/date. Risk: style effects burying key info.
- **Educational carousel slide** — Use for mobile learning. Priority: Information Designer + Typographer + Spacing Master. One idea per slide, large type, minimal detail. Risk: desktop density on mobile.
- **UI feature section** — Use for app/product mockups. Priority: UX Visual Designer + Layout Architect + Spacing Master. Realistic controls, consistent components, readable labels. Risk: fake UI noise.
- **Dashboard/data card layout** — Use for analytics or operations. Priority: UX Visual Designer + Information Designer + Typographer. Cards with clear KPI hierarchy and simple charts. Risk: table/chart clutter.

## Shape and element proportion

Primary element is largest and most visually confident. Secondary elements support it. Micro elements are accents only. Do not let icons, floating shapes, badges, or decorative cards overpower the main message.

Shapes need proportional scale, consistent radius, and visual harmony. Decorative elements must follow composition flow: they can frame, point, separate, or add rhythm, but they cannot float without alignment or grouping logic.

Limit icon count. Use repeated icons only when they help scan a list, comparison, or process. Too many floating shapes, badges, or ornaments create visual noise and the generic AI-generated look.
