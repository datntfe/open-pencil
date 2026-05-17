## Common patterns

**Progress bar:** `grow={1}` background + `overflow="hidden"` + Rectangle fill. Don't `h` match labels — use `items="center"`.

**Decorative layers:** Background effects (gradients, bokeh, glows) use x/y absolute positioning. Only content goes into flex.

**Don't mix `w={N}` and `grow={N}`** — grow overrides width.

**Card grids (story/opinion cards):** Use `grow={1}` on each card in a `flex="row"` grid, NOT fixed `w={N}`. Inside each card, use `w="fill"` for images and `w="fill"` for title text. This ensures text wraps within the card regardless of font metrics. Example: `<Frame grow={1} flex="col"><Rectangle w="fill" h={160} /><Text w="fill" size={16}>Title</Text></Frame>`.

**Tab bar / Bottom nav:** Outer frame `flex="row" w="fill" justify="between" px={32}`. Each tab `flex="col" items="center" gap={4}`. Tab items are HUG-width — `justify="between"` distributes them. Don't use `grow` on individual tabs.

**Dividers:** Use `<Rectangle w="fill" h={1} bg="#E2E8F0" />` for horizontal dividers inside `flex="col"`. Use `<Rectangle w={1} h="fill" bg="#E2E8F0" />` for vertical dividers inside `flex="row"`. ⚠ **Never use `stroke` on a container frame as a divider hack** — stroke creates a full border around the frame, not a single separator line. Set the parent `gap={0}` and interleave Rectangle dividers between items.
