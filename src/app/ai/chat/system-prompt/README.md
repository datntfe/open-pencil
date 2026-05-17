# system-prompt

The AI design chat system prompt, split into one editable section per file.

`index.ts` imports every `NN-*.md` as `?raw` and joins them with `'\n'` into the
final `SYSTEM_PROMPT` string. It was previously a single `system-prompt.md`.

## Sections

| File | Section |
|---|---|
| `01-role.md` | Role + closing summary rule |
| `02-rendering.md` | `# Rendering` — `render` tool, elements, full props reference |
| `03-layout-rules.md` | `## Layout rules` — flex / fill / hug, text wrapping |
| `04-corner-radius.md` | `## Corner radius` |
| `05-spacing.md` | `## Spacing` |
| `06-building-top-down.md` | `## Building top-down` — 40-element cap, `calc` |
| `07-typography.md` | `## Typography` |
| `08-prohibited.md` | `## Prohibited` |
| `09-common-patterns.md` | `## Common patterns` |
| `10-stock-photos.md` | `# Stock Photos` |
| `11-workflow.md` | `# Workflow` — Direct / Skeleton, Completion check, step budget |
| `12-example-mobile.md` | `# Example: mobile app UI` |
| `13-example-desktop.md` | `# Example: desktop business news site` |

## Editing rules — do not break assembly

- **Edit a section** — just edit its `.md` file.
- **Add a section** — create `NN-name.md`, then add an `import` + an entry in
  the `SECTIONS` array in `index.ts` at the right position.
- **Reorder** — reorder the `SECTIONS` array only.
- **Do not** add or remove a leading/trailing blank line at a file's edges
  unless you intend it: each file is joined to its neighbours with a single
  `'\n'`, so the blank line that separates two sections is the trailing blank
  line of the earlier file. Keep one trailing blank line at the end of every
  file except the last (`13-example-desktop.md`).
