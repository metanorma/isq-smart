import type { Designation, Definition, Remark, ISO80000Unit } from '../src/data/types'

// ── Build-only types (YAML source format, not used at runtime) ──

export interface RawEntry {
  part: number | string
  edition?: string | number
  id: string
  num: string
  oldnum?: string
  designations: Designation[]
  symbols?: string[]
  def: Definition
  units?: ISO80000Unit[]
  remarks?: Remark
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

export interface BuildPaths {
  isoIec80000Dir: string
  unitsdbDir: string
  sduSmartDir: string
  sourcesDir: string
  datasetDir: string
  generatedDir: string
  ontologySrcDir: string
  ontologyRefDir: string
}
