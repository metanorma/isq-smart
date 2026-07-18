// Single source of truth for ontology namespace, class qnames, and property qnames.
// All components and composables import from here — never hardcode ontology strings.

// ── Namespace definitions ──

export const NS = {
  core: {
    prefix: 'isq',
    uri: 'https://w3id.org/standards/isq/ontologies/core/',
  },
  smart: {
    prefix: 'smart',
    uri: 'https://example.org/smart-sdu/',
  },
} as const

// ── Class qnames ──

export const ONTOLOGY_CLASSES = {
  Quantity: `${NS.core.prefix}:Quantity`,
  MathConcept: `${NS.core.prefix}:MathConcept`,
  Unit: `${NS.core.prefix}:Unit`,
  Dimension: `${NS.core.prefix}:Dimension`,
  TermEntry: `${NS.smart.prefix}:TermEntry`,
  Entity: `${NS.smart.prefix}:Entity`,
  KindOfQuantity: `${NS.core.prefix}:KindOfQuantity`,
  EntityKind: `${NS.core.prefix}:EntityKind`,
  EntityConcept: `${NS.core.prefix}:EntityConcept`,
  DedicatedQuantity: `${NS.core.prefix}:DedicatedQuantity`,
} as const

// ── Property qnames ──

export const ONTOLOGY_PROPERTIES = {
  hasUnit: `${NS.core.prefix}:hasUnit`,
  hasDimension: `${NS.core.prefix}:hasDimension`,
  identifier: 'dcterms:identifier',
  isPartOf: 'dcterms:isPartOf',
  prefLabel: 'skosxl:prefLabel',
  altLabel: 'skosxl:altLabel',
  definition: 'skos:definition',
  note: 'skos:note',
  notation: 'skos:notation',
  broader: 'skos:broader',
  narrower: 'skos:narrower',
  rdfType: 'rdf:type',
  hasBindingnessType: `${NS.smart.prefix}:hasBindingnessType`,
  hasKind: `${NS.core.prefix}:hasKind`,
  characterizes: `${NS.core.prefix}:characterizes`,
  definedByEquation: `${NS.core.prefix}:definedByEquation`,
  hasMember: `${NS.core.prefix}:hasMember`,
} as const

// ── Tag → class mapping ──

export function tagToClass(tag: 'quantity' | 'math'): string {
  return tag === 'quantity' ? ONTOLOGY_CLASSES.Quantity : ONTOLOGY_CLASSES.MathConcept
}

// ── QName constructors ──

export function partQname(partKey: string): string {
  return `${NS.core.prefix}:part-${partKey}`
}

export function entryQname(entryId: string): string {
  return `${NS.core.prefix}:${entryId}`
}

export function unitQname(unitSlug: string): string {
  return `${NS.core.prefix}:unit:${unitSlug}`
}

// ── Badge color mapping per ontology class ──

export const CLASS_BADGE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  [ONTOLOGY_CLASSES.Quantity]: { bg: 'bg-brand-50 dark:bg-brand-950/40', text: 'text-brand-700 dark:text-brand-400', border: 'border-brand-100/60 dark:border-brand-800/40' },
  [ONTOLOGY_CLASSES.MathConcept]: { bg: 'bg-brand-50 dark:bg-brand-950/40', text: 'text-brand-700 dark:text-brand-400', border: 'border-brand-100/60 dark:border-brand-800/40' },
  [ONTOLOGY_CLASSES.Unit]: { bg: 'bg-teal-50 dark:bg-teal-950/40', text: 'text-teal-700 dark:text-teal-400', border: 'border-teal-100/60 dark:border-teal-800/40' },
  [ONTOLOGY_CLASSES.Dimension]: { bg: 'bg-indigo-50 dark:bg-indigo-950/40', text: 'text-indigo-700 dark:text-indigo-400', border: 'border-indigo-100/60 dark:border-indigo-800/40' },
  [ONTOLOGY_CLASSES.TermEntry]: { bg: 'bg-emerald-50 dark:bg-emerald-950/40', text: 'text-emerald-700 dark:text-emerald-400', border: 'border-emerald-100/60 dark:border-emerald-800/40' },
  [ONTOLOGY_CLASSES.KindOfQuantity]: { bg: 'bg-indigo-50 dark:bg-indigo-950/40', text: 'text-indigo-700 dark:text-indigo-400', border: 'border-indigo-100/60 dark:border-indigo-800/40' },
  [ONTOLOGY_CLASSES.EntityKind]: { bg: 'bg-rose-50 dark:bg-rose-950/40', text: 'text-rose-700 dark:text-rose-400', border: 'border-rose-100/60 dark:border-rose-800/40' },
  [ONTOLOGY_CLASSES.EntityConcept]: { bg: 'bg-rose-50 dark:bg-rose-950/40', text: 'text-rose-700 dark:text-rose-400', border: 'border-rose-100/60 dark:border-rose-800/40' },
  [ONTOLOGY_CLASSES.DedicatedQuantity]: { bg: 'bg-amber-50 dark:bg-amber-950/40', text: 'text-amber-700 dark:text-amber-400', border: 'border-amber-100/60 dark:border-amber-800/40' },
}
