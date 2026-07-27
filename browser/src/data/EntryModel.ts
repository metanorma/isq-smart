import type { Entry, Lang } from './types'
import { EntryNameResolver } from './EntryNameResolver'
import { EntryTextRenderer } from './EntryTextRenderer'
import { EntryUnitResolver } from './EntryUnitResolver'
import { EntryClassification } from './EntryClassification'

export { EntryNameResolver } from './EntryNameResolver'
export { EntryTextRenderer } from './EntryTextRenderer'
export { EntryUnitResolver } from './EntryUnitResolver'
export { EntryClassification } from './EntryClassification'

export const entryName = EntryNameResolver.resolve.bind(EntryNameResolver)
export const entryRenderedName = EntryNameResolver.rendered.bind(EntryNameResolver)
export const entryPlainName = EntryNameResolver.plain.bind(EntryNameResolver)
export const entryDefinition = EntryTextRenderer.definition.bind(EntryTextRenderer)
export const entryRemarks = EntryTextRenderer.remarks.bind(EntryTextRenderer)
export const entryShortDef = EntryTextRenderer.shortDefinition.bind(EntryTextRenderer)
export const entryUnitName = EntryUnitResolver.name.bind(EntryUnitResolver)
export const entryUnitSymbols = EntryUnitResolver.symbols.bind(EntryUnitResolver)
export const entryHasFrench = EntryClassification.hasFrench.bind(EntryClassification)
export const entrySectionGroup = EntryClassification.sectionGroup.bind(EntryClassification)

export const EntryModel = {
  name: entryName,
  renderedName: entryRenderedName,
  plainName: entryPlainName,
  definition: entryDefinition,
  remarks: entryRemarks,
  shortDef: entryShortDef,
  unitName: entryUnitName,
  unitSymbols: entryUnitSymbols,
  hasFrench: entryHasFrench,
  sectionGroup: entrySectionGroup,
}

export type { Entry, Lang } from './types'
