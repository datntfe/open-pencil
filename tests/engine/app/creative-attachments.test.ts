import { beforeEach, describe, expect, test } from 'bun:test'

import { useCreativeAttachments } from '@/app/ai/chat/creative-attachments'

function pngFile(name = 'a.png', bytes = 64): File {
  return new File([new Uint8Array(bytes)], name, { type: 'image/png' })
}

describe('useCreativeAttachments', () => {
  beforeEach(() => {
    useCreativeAttachments().clear()
  })

  test('stages a valid image as a data-URL preview', async () => {
    const composer = useCreativeAttachments()
    const errors = await composer.addFiles([pngFile()], 'mascot')
    expect(errors).toEqual([])
    expect(composer.attachments.value).toHaveLength(1)
    expect(composer.attachments.value[0].type).toBe('mascot')
    expect(composer.attachments.value[0].previewUrl.startsWith('data:image/png')).toBe(true)
  })

  test('rejects an unsupported mime type', async () => {
    const composer = useCreativeAttachments()
    const errors = await composer.addFiles(
      [new File([new Uint8Array(8)], 'x.gif', { type: 'image/gif' })],
      'logo'
    )
    expect(errors).toHaveLength(1)
    expect(composer.attachments.value).toHaveLength(0)
  })

  test('rejects an empty file', async () => {
    const composer = useCreativeAttachments()
    const errors = await composer.addFiles([new File([], 'e.png', { type: 'image/png' })], 'logo')
    expect(errors).toHaveLength(1)
    expect(composer.attachments.value).toHaveLength(0)
  })

  test('enforces the per-type limit (mascot ≤ 3)', async () => {
    const composer = useCreativeAttachments()
    await composer.addFiles(
      [pngFile('1.png'), pngFile('2.png'), pngFile('3.png'), pngFile('4.png')],
      'mascot'
    )
    expect(composer.countByType('mascot')).toBe(3)
    expect(composer.canAdd('mascot')).toBe(false)
  })

  test('composeMessage returns null when there is nothing to send', () => {
    expect(useCreativeAttachments().composeMessage()).toBeNull()
  })

  test('composeMessage with text only carries no file parts', () => {
    const composer = useCreativeAttachments()
    composer.composerText.value = 'hello'
    expect(composer.composeMessage()).toEqual({ text: 'hello', files: [] })
  })

  test('composeMessage with an attachment adds a typed context line + file part', async () => {
    const composer = useCreativeAttachments()
    composer.composerText.value = 'make a poster'
    await composer.addFiles([pngFile('meo.png')], 'mascot')
    const message = composer.composeMessage()
    if (!message) throw new Error('expected a composed message')
    expect(message.files).toHaveLength(1)
    expect(message.files[0]).toMatchObject({
      type: 'file',
      mediaType: 'image/png',
      filename: 'meo.png'
    })
    expect(message.text).toContain('[Creative references attached]')
    expect(message.text).toContain('- Mascot: meo.png')
    expect(message.text).toContain('Use mascot files as character/brand assets')
    expect(message.text).toContain('Priority: follow the user request first')
    expect(message.text).toContain('make a poster')
  })

  test('composeMessage describes each creative asset role', async () => {
    const composer = useCreativeAttachments()
    composer.composerText.value = 'make a launch graphic'
    await composer.addFiles([pngFile('hero-ref.png')], 'design_reference')
    await composer.addFiles([pngFile('brand.png')], 'logo')
    const message = composer.composeMessage()
    if (!message) throw new Error('expected a composed message')
    expect(message.files).toHaveLength(2)
    expect(message.text).toContain('- Logo: brand.png')
    expect(message.text).toContain('Use logo files as brand identity assets')
    expect(message.text).toContain('- Design reference: hero-ref.png')
    expect(message.text).toContain('Use design reference files for visual direction')
    expect(message.text).toContain('make a launch graphic')
  })

  test('removeAttachment and snapshot/restore round-trip', async () => {
    const composer = useCreativeAttachments()
    composer.composerText.value = 'draft'
    await composer.addFiles([pngFile()], 'logo')
    const snap = composer.snapshot()

    composer.clear()
    expect(composer.attachments.value).toHaveLength(0)
    expect(composer.composerText.value).toBe('')

    composer.restore(snap)
    expect(composer.attachments.value).toHaveLength(1)
    expect(composer.composerText.value).toBe('draft')

    composer.removeAttachment(composer.attachments.value[0].id)
    expect(composer.attachments.value).toHaveLength(0)
  })
})
