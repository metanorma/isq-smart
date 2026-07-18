import type { Lang } from '../types'

export const CONCEPT_LEVELS = [0, 1, 2, 3] as const
export type ConceptLevel = (typeof CONCEPT_LEVELS)[number]

export const CONCEPT_AXES = ['quantity', 'entity', 'measurement'] as const
export type ConceptAxis = (typeof CONCEPT_AXES)[number]

export interface MultiLangText {
  en: string
  fr?: string
}

export interface ConceptNode {
  readonly id: string
  readonly iri: string
  readonly level: ConceptLevel
  readonly axis: ConceptAxis
  readonly prefLabel: MultiLangText
  readonly altLabels?: MultiLangText[]
  readonly definition?: MultiLangText
}

export interface KindOfQuantity extends ConceptNode {
  readonly level: 0
  readonly axis: 'quantity'
  readonly dimensionVector: string
  readonly dimensionSymbol: string
  readonly quantityIds: readonly string[]
}

export interface QuantityConcept extends ConceptNode {
  readonly level: 1
  readonly axis: 'quantity'
  readonly kindId: string
  readonly symbols: readonly string[]
  readonly partKey: string
  readonly entryId: string
}

export interface EntityKind extends ConceptNode {
  readonly level: 1
  readonly axis: 'entity'
}

export interface EntityConcept extends ConceptNode {
  readonly level: 2
  readonly axis: 'entity'
  readonly kindId: string
}

export interface DedicatedQuantity extends ConceptNode {
  readonly level: 2
  readonly axis: 'quantity'
  readonly quantityId: string
  readonly entityIds: readonly string[]
}

export type Concept =
  | KindOfQuantity
  | QuantityConcept
  | EntityKind
  | EntityConcept
  | DedicatedQuantity

export interface HierarchyEntry {
  readonly broader: readonly string[]
  readonly narrower: readonly string[]
}

export type ConceptHierarchy = Readonly<Record<string, HierarchyEntry>>

export function isKindOfQuantity(c: Concept): c is KindOfQuantity {
  return c.level === 0 && c.axis === 'quantity'
}

export function isQuantityConcept(c: Concept): c is QuantityConcept {
  return c.level === 1 && c.axis === 'quantity'
}

export function isEntityKind(c: Concept): c is EntityKind {
  return c.level === 1 && c.axis === 'entity'
}

export function isEntityConcept(c: Concept): c is EntityConcept {
  return c.level === 2 && c.axis === 'entity'
}

export function isDedicatedQuantity(c: Concept): c is DedicatedQuantity {
  return c.level === 2 && c.axis === 'quantity'
}

export function conceptPrefLabel(c: Concept, lang: Lang = 'en'): string {
  const label = c.prefLabel[lang] ?? c.prefLabel.en
  return label
}
