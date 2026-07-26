import { PartCatalog } from './PartCatalog'
import { PartRouter } from './PartRouter'
import { PartSummaryProvider } from './PartSummaryProvider'
import type { Domain, PartKey } from './types'

export type { PartDocument, PartSection } from './PartCatalog'
export { PartCatalog } from './PartCatalog'
export { PartRouter } from './PartRouter'
export { PartSummaryProvider } from './PartSummaryProvider'
export { publisherOf } from './PartCatalog'

export function getPartDocument(partKey: string) {
  return PartCatalog.getPartDocument(partKey)
}
export function getAllDocuments() {
  return PartCatalog.getAllDocuments()
}
export function getDomains() {
  return PartCatalog.getDomains()
}
export function getDomain(key: Domain) {
  return PartCatalog.getDomain(key)
}
export function getPartMeta(partKey: PartKey) {
  return PartCatalog.getPartMeta(partKey)
}
export function getAllParts() {
  return PartCatalog.getAllParts()
}
export function getPartsByDomain(domain: Domain) {
  return PartCatalog.getPartsByDomain(domain)
}
export function getSectionsForDocument(docKey: string) {
  return PartCatalog.getSectionsForDocument(docKey)
}

export function partUrl(partKey: PartKey): string {
  return PartRouter.partUrl(partKey)
}
export function entryUrl(partKey: PartKey, id: string): string {
  return PartRouter.entryUrl(partKey, id)
}
export function domainPath(domain: Domain): string {
  return PartRouter.domainPath(domain)
}

export function getAvailableParts(): string[] {
  return PartSummaryProvider.getAvailableParts()
}
export function getPartEntryCount(partKey: string): number {
  return PartSummaryProvider.entryCount(partKey)
}
export function isBilingual(partKey: string): boolean {
  return PartSummaryProvider.isBilingual(partKey)
}
export function getPartEditions(partKey: string): string[] {
  return PartSummaryProvider.editions(partKey)
}
