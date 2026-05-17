import { useIntervalFn } from '@vueuse/core'
import type { ShallowRef } from 'vue'

import type { Editor } from '@open-pencil/core/editor'
import type { SceneNode } from '@open-pencil/core/scene-graph'
import { adjustRunsForDelete, adjustRunsForInsert } from '@open-pencil/core/text'

const CARET_BLINK_MS = 530

export function createCaretBlink(store: Editor) {
  const { pause, resume } = useIntervalFn(
    () => {
      if (!store.textEditor) return
      store.textEditor.caretVisible = !store.textEditor.caretVisible
      store.requestRepaint()
    },
    CARET_BLINK_MS,
    { immediate: false }
  )

  function resetBlink() {
    if (store.textEditor) store.textEditor.caretVisible = true
    pause()
    resume()
    store.requestRepaint()
  }

  return { resetBlink, stopBlink: pause }
}

type TextCompositionOptions = {
  textareaRef: ShallowRef<HTMLTextAreaElement | null>
  getEditingNode: () => SceneNode | null
  insertText: (text: string, node: SceneNode) => void
  deleteText: (node: SceneNode, forward: boolean) => void
  resetBlink: () => void
}

export function createTextCompositionHandlers({
  textareaRef,
  getEditingNode,
  insertText,
  deleteText,
  resetBlink
}: TextCompositionOptions) {
  let isComposing = false
  // Length of the not-yet-committed text currently previewed on the canvas
  // while an IME composition (e.g. Vietnamese Telex/VNI) is in progress.
  let composingLength = 0

  // Removes the live composition preview so it can be replaced or finalized.
  function clearComposingPreview() {
    for (let i = 0; i < composingLength; i++) {
      const node = getEditingNode()
      if (!node) break
      deleteText(node, false)
    }
    composingLength = 0
  }

  function onCompositionStart() {
    isComposing = true
    composingLength = 0
  }

  // Fires on every IME keystroke — renders the in-progress composition live
  // instead of leaving the canvas blank until compositionend.
  function onCompositionUpdate(e: CompositionEvent) {
    clearComposingPreview()
    const data = e.data
    if (!data) {
      resetBlink()
      return
    }
    const node = getEditingNode()
    if (!node) return
    insertText(data, node)
    composingLength = data.length
    resetBlink()
  }

  function onCompositionEnd(e: CompositionEvent) {
    clearComposingPreview()
    isComposing = false
    if (textareaRef.value) textareaRef.value.value = ''
    if (!e.data) {
      resetBlink()
      return
    }
    const node = getEditingNode()
    if (!node) return
    insertText(e.data, node)
    resetBlink()
  }

  function onInput() {
    const el = textareaRef.value
    if (isComposing || !el) return
    const text = el.value
    if (!text) return
    el.value = ''

    const node = getEditingNode()
    if (!node) return
    insertText(text, node)
    resetBlink()
  }

  function resetComposition() {
    isComposing = false
    composingLength = 0
  }

  return {
    isComposing: () => isComposing,
    onCompositionStart,
    onCompositionUpdate,
    onCompositionEnd,
    onInput,
    resetComposition
  }
}

export function createTextEditActions(store: Editor) {
  function getEditingNode() {
    const id = store.state.editingTextId
    if (!id) return null
    return store.graph.getNode(id) ?? null
  }

  function syncText(nodeId: string, text: string, runs?: SceneNode['styleRuns']) {
    const changes: Partial<SceneNode> = { text }
    if (runs !== undefined) changes.styleRuns = runs
    store.graph.updateNode(nodeId, changes)
    store.requestRender()
  }

  function insertText(text: string, node: SceneNode) {
    const editor = store.textEditor
    if (!editor) return
    const range = editor.getSelectionRange()
    let runs = node.styleRuns
    if (range) {
      runs = adjustRunsForDelete(runs, range[0], range[1] - range[0])
      runs = adjustRunsForInsert(runs, range[0], text.length)
    } else {
      runs = adjustRunsForInsert(runs, editor.state?.cursor ?? 0, text.length)
    }
    editor.insert(text, node)
    syncText(node.id, editor.state?.text ?? '', runs)
  }

  function deleteText(node: SceneNode, forward: boolean) {
    const editor = store.textEditor
    if (!editor) return
    const range = editor.getSelectionRange()
    let runs = node.styleRuns
    if (range) {
      runs = adjustRunsForDelete(runs, range[0], range[1] - range[0])
    } else if (forward && editor.state && editor.state.cursor < node.text.length) {
      runs = adjustRunsForDelete(runs, editor.state.cursor, 1)
    } else if (!forward && editor.state && editor.state.cursor > 0) {
      runs = adjustRunsForDelete(runs, editor.state.cursor - 1, 1)
    }
    if (forward) {
      editor.delete(node)
    } else {
      editor.backspace(node)
    }
    syncText(node.id, editor.state?.text ?? '', runs)
  }

  return { getEditingNode, insertText, deleteText }
}
