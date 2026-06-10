// Pure barrel: re-exports only, no logic.

export { EntryModel } from './EntryModel'
export { DataLoader, getAvailableParts, getPartEntryCount, isBilingual, getPartEditions } from './DataLoader'
export { getPartEntryCount as partEntryCount } from './DataLoader'

export {
  getDomains, getDomain, getPartMeta, getPartsByDomain,
  getAllParts, partUrl, entryUrl, domainPath, publisherOf,
  getPartDocument, getAllDocuments, getSectionsForDocument,
} from './PartRegistry'
export type { PartDocument, PartSection } from './PartRegistry'

export { partUrn, entryUrn, unitUrns, dimensionUrns, entryDualUrn } from './urn'
export { generateEntryJsonLd, generateIndexJsonLd, jsonLdToTurtle } from './serialization'
export { generateBibTeX, generateChicago, generateRis } from './citation'

export { partSummaries } from './generated/meta'

export type {
  Domain, PartKey, Entry, PartMeta, PartSummary, PartData,
  QuantityEntry, MathEntry, Designation, DesignationLang,
  Definition, Remark, ISO80000Unit, DomainInfo, DomainEntry,
} from './types'
