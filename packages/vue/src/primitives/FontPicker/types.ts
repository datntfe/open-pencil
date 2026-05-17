/** One font offered by the picker, optionally tagged with a section/group. */
export interface FontPickerEntry {
  family: string
  /** Section label this font is grouped under (e.g. "Recommended"). */
  group?: string
}

/** A picker section: a label and its (search-filtered) font families. */
export interface FontPickerGroup {
  label: string
  families: string[]
}

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
