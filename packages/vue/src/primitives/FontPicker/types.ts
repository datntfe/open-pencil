/** One font offered by the picker, optionally tagged with a section/group. */
export interface FontPickerEntry {
  family: string
  /** Section label this font is grouped under (e.g. "Recommended"). */
  group?: string
}

/** A rendered row in the picker — either a section header or a selectable font. */
export type FontPickerRow =
  | { kind: 'header'; key: string; label: string }
  | { kind: 'font'; key: string; family: string }

export interface FontPickerUi {
  trigger?: string
  content?: string
  item?: string
  /** Section header row. */
  header?: string
  search?: string
  viewport?: string
  empty?: string
  emptyAction?: string
}
