import { computed, ref } from 'vue'

import type { FileUIPart } from 'ai'

/**
 * Creative Input Composer — staged attachment state.
 *
 * The compact toolbar input and the expanded composer panel are separate
 * components, so the composer text + attachments live in module-level shared
 * state. Nothing here touches the chat transport; `composeMessage()` only
 * builds the argument for the AI SDK's native `sendMessage({ text, files })`.
 */

export type CreativeAssetType = 'mascot' | 'logo' | 'design_reference'
export type CreativeAssetStatus = 'local' | 'uploading' | 'uploaded' | 'failed'

export interface CreativeAttachment {
  id: string
  type: CreativeAssetType
  name: string
  mimeType: string
  size: number
  /** Data URL used for the in-composer preview and the outgoing file part. */
  previewUrl: string
  /** Set once a real upload endpoint exists; preferred over `previewUrl` when present. */
  assetUrl?: string
  status: CreativeAssetStatus
  error?: string
}

export interface ComposerSnapshot {
  text: string
  attachments: CreativeAttachment[]
}

export const CREATIVE_ASSET_LABEL: Record<CreativeAssetType, string> = {
  mascot: 'Mascot',
  logo: 'Logo',
  design_reference: 'Design reference'
}

const CREATIVE_ASSET_USE_PROMPT: Record<CreativeAssetType, string> = {
  mascot:
    'Use mascot files as character/brand assets. Preserve recognizable identity, proportions, colors, and personality unless the user explicitly asks to redesign them.',
  logo:
    'Use logo files as brand identity assets. Preserve the mark/wordmark and use it for branding placement; do not distort, redraw, or turn it into decoration unless requested.',
  design_reference:
    'Use design reference files for visual direction: layout rhythm, composition, typography mood, color treatment, and art direction. Do not copy exact text/content unless requested.'
}

const CREATIVE_ASSET_ORDER: CreativeAssetType[] = ['mascot', 'logo', 'design_reference']

/** Per-type and total attachment caps. */
export const PER_TYPE_LIMIT: Record<CreativeAssetType, number> = {
  mascot: 3,
  logo: 3,
  design_reference: 6
}
export const TOTAL_ATTACHMENT_LIMIT = 10

export const ACCEPTED_IMAGE_MIME = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']
const ACCEPTED_ATTRIBUTE = ACCEPTED_IMAGE_MIME.join(',')
const MAX_FILE_BYTES = 5 * 1024 * 1024

// Module-level shared state.
const composerText = ref('')
const attachments = ref<CreativeAttachment[]>([])
const isExpanded = ref(false)

async function readDataUrl(file: File): Promise<string> {
  const bytes = new Uint8Array(await file.arrayBuffer())
  return `data:${file.type};base64,${bytes.toBase64()}`
}

function countByType(type: CreativeAssetType): number {
  return attachments.value.filter((a) => a.type === type).length
}

export function useCreativeAttachments() {
  const totalCount = computed(() => attachments.value.length)
  const hasContent = computed(
    () => composerText.value.trim().length > 0 || attachments.value.length > 0
  )

  /** Whether another asset of `type` may still be added. */
  function canAdd(type: CreativeAssetType): boolean {
    return countByType(type) < PER_TYPE_LIMIT[type] && totalCount.value < TOTAL_ATTACHMENT_LIMIT
  }

  /** Validates + stages files. Returns human-readable errors for rejected files. */
  async function addFiles(files: File[], type: CreativeAssetType): Promise<string[]> {
    const errors: string[] = []
    for (const file of files) {
      if (!ACCEPTED_IMAGE_MIME.includes(file.type)) {
        errors.push(`${file.name}: unsupported file type`)
        continue
      }
      if (file.size === 0) {
        errors.push(`${file.name}: file is empty`)
        continue
      }
      if (file.size > MAX_FILE_BYTES) {
        errors.push(`${file.name}: file is too large (max 5 MB)`)
        continue
      }
      if (countByType(type) >= PER_TYPE_LIMIT[type]) {
        errors.push(`At most ${PER_TYPE_LIMIT[type]} ${CREATIVE_ASSET_LABEL[type].toLowerCase()} assets`)
        continue
      }
      if (totalCount.value >= TOTAL_ATTACHMENT_LIMIT) {
        errors.push(`At most ${TOTAL_ATTACHMENT_LIMIT} attachments`)
        continue
      }
      try {
        const previewUrl = await readDataUrl(file)
        attachments.value.push({
          id: `att-${crypto.randomUUID()}`,
          type,
          name: file.name,
          mimeType: file.type,
          size: file.size,
          previewUrl,
          status: 'local'
        })
      } catch {
        errors.push(`${file.name}: could not be read`)
      }
    }
    return errors
  }

  function removeAttachment(id: string): void {
    attachments.value = attachments.value.filter((a) => a.id !== id)
  }

  /** Re-classifies a staged asset (mascot ↔ logo ↔ design_reference). */
  function changeType(id: string, type: CreativeAssetType): void {
    const att = attachments.value.find((a) => a.id === id)
    if (att) att.type = type
  }

  function expand(): void {
    isExpanded.value = true
  }
  function collapse(): void {
    isExpanded.value = false
  }

  function snapshot(): ComposerSnapshot {
    return { text: composerText.value, attachments: [...attachments.value] }
  }
  function restore(snap: ComposerSnapshot): void {
    composerText.value = snap.text
    attachments.value = [...snap.attachments]
  }
  function clear(): void {
    composerText.value = ''
    attachments.value = []
    isExpanded.value = false
  }

  /**
   * Builds the argument for `chat.sendMessage(...)`, or `null` when there is
   * nothing to send. Images ride along as native AI SDK file parts; the asset
   * type is conveyed to the model as a short plain-text line — payload-safe.
   */
  function composeMessage(): { text: string; files: FileUIPart[] } | null {
    const text = composerText.value.trim()
    const atts = attachments.value
    if (!text && atts.length === 0) return null

    const files: FileUIPart[] = atts.map((a) => ({
      type: 'file',
      mediaType: a.mimeType,
      filename: a.name,
      url: a.assetUrl ?? a.previewUrl
    }))

    if (atts.length === 0) return { text, files }

    const contextLines = ['[Creative references attached]']
    for (const type of CREATIVE_ASSET_ORDER) {
      const names = atts.filter((a) => a.type === type).map((a) => a.name)
      if (names.length === 0) continue
      contextLines.push(`- ${CREATIVE_ASSET_LABEL[type]}: ${names.join(', ')}`)
      contextLines.push(`  ${CREATIVE_ASSET_USE_PROMPT[type]}`)
    }
    contextLines.push(
      'Priority: follow the user request first, preserve mascot/logo identity when provided, use design references for style and composition, and avoid inventing unsupported brand details.'
    )

    const context = contextLines.join('\n')
    return { text: text ? `${context}\n\n${text}` : context, files }
  }

  return {
    composerText,
    attachments,
    isExpanded,
    totalCount,
    hasContent,
    acceptAttribute: ACCEPTED_ATTRIBUTE,
    canAdd,
    countByType,
    addFiles,
    removeAttachment,
    changeType,
    expand,
    collapse,
    snapshot,
    restore,
    clear,
    composeMessage
  }
}
