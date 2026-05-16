// Shared types for the browser app

export type Domain = 'quantities' | 'math'
export type Lang = 'en' | 'fr'

export type PartKey = string

export interface DesignationLang {
  text: string
  index_as?: string[]
  noun?: string
  gender?: string
  adj?: string
}

export interface Designation {
  designation: {
    en?: DesignationLang
    fr?: DesignationLang
  }
}

export interface Definition {
  en: string
  fr?: string
}

export interface Remark {
  en: string
  fr?: string
}

export interface ISO80000Unit {
  en: string
  fr?: string
  symbol?: string[]
}

export interface QuantityEntry {
  readonly _tag: 'quantity'
  readonly partKey: PartKey
  readonly edition: string
  readonly id: string
  readonly num: string
  readonly designations: Designation[]
  readonly symbols?: string[]
  readonly def: Definition
  readonly units?: ISO80000Unit[]
  readonly remarks?: Remark
}

export interface MathEntry {
  readonly _tag: 'math'
  readonly partKey: PartKey
  readonly edition: string
  readonly id: string
  readonly num: string
  readonly designations: Designation[]
  readonly symbols?: string[]
  readonly def: Definition
  readonly remarks?: Remark
}

export type Entry = QuantityEntry | MathEntry

// ISO/IEC 80000 information model types
export interface TermEntryData {
  id: string
  partKey: string
  num: string
  designations: Designation[]
  symbols?: string[]
  def: Definition
  units?: ISO80000Unit[]
  remarks?: Remark
  bindingnessType: string
  publicationDocument: string
}

export interface ClauseData {
  id: string
  partKey: string
  title: string
  sectionNumber: string
  bindingnessType: string
  parentId: string
}

export interface PublicationDocumentData {
  id: string
  partKey: string
  title: string
  edition: string
  publicationType: string
  publisher: string
  clauseCount: number
  termCount: number
}

export interface DocumentSection {
  id: string
  partKey: string
  filename: string
  title: string
  content: string
  clauseType: string
}

export interface DocumentClauseData {
  id: string
  partKey: string
  sectionNumber: string
  title: string
  anchor: string
  bindingnessType: string
  parentId: string
  provisionCount: number
}

export interface DomainInfo {
  key: Domain
  label: string
  description: string
  path: string
  icon: string
}

export interface PartMeta {
  domain: Domain
  partKey: PartKey
  title: string
  description: string
  icon: string
  accent: string
  parentPart?: string
  parentTitle?: string
}

export interface PartSummary {
  domain: Domain
  count: number
  bilingual: boolean
  editions: string[]
}

export interface PartData {
  entries: Entry[]
  editions: string[]
  bilingual: boolean
  mathCache: Record<string, string>
  latexCache: Record<string, string>
}

export interface DomainEntry {
  i: string   // id
  n: string   // num
  t: string   // title/name
  s: string[] // symbols
  u: string[] // unit symbols
  p: string   // partKey
}
