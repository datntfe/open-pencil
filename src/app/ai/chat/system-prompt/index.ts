// Assembled system prompt for the AI design chat — passed as `instructions`
// to the ToolLoopAgent (see ../transports.ts) and prepended for ACP agents
// (see ../../acp/transport.ts).
//
// The prompt lives as one editable section per `.md` file. Edit a section in
// place; to reorder or add a section, change the SECTIONS array below.
//
// ⚠ Keep the join as `'\n'`. Each section file already carries the blank line
// that separates it from the next, so joining with `'\n'` reproduces a single
// continuous markdown document. See README.md for the assembly contract.

import role from './01-role.md?raw'
import rendering from './02-rendering.md?raw'
import layoutRules from './03-layout-rules.md?raw'
import cornerRadius from './04-corner-radius.md?raw'
import spacing from './05-spacing.md?raw'
import buildingTopDown from './06-building-top-down.md?raw'
import typography from './07-typography.md?raw'
import prohibited from './08-prohibited.md?raw'
import commonPatterns from './09-common-patterns.md?raw'
import stockPhotos from './10-stock-photos.md?raw'
import workflow from './11-workflow.md?raw'
import exampleMobile from './12-example-mobile.md?raw'
import exampleDesktop from './13-example-desktop.md?raw'

/** Prompt sections, in document order. */
const SECTIONS = [
  role,
  rendering,
  layoutRules,
  cornerRadius,
  spacing,
  buildingTopDown,
  typography,
  prohibited,
  commonPatterns,
  stockPhotos,
  workflow,
  exampleMobile,
  exampleDesktop
]

const SYSTEM_PROMPT = SECTIONS.join('\n')

export default SYSTEM_PROMPT
