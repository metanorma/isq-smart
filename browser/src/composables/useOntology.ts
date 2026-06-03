import { computed, type MaybeRef, unref } from 'vue'
import { ontologyEntities } from '../data/generated/ontology'
import {
  ONTOLOGY_CLASSES,
  CLASS_BADGE_COLORS,
} from '../data/ontologyConfig'

// ── Types ──

export interface OntEntity {
  uri: string
  qname: string
  slug: string
  label: string
  description: string
  ontology: string
  type: string
  parent?: string
  targetClass?: string
  domain?: string[]
  range?: string[]
  constraints?: {
    path: string
    minCount?: number
    maxCount?: number
    datatype?: string
    nodeKind?: string
    classValue?: string
    hasValue?: string
  }[]
  instanceOf?: string[]
  isPartOf?: string[]
  identifier?: string
}

export interface PropertyRow {
  path: string
  pathSlug: string
  values: { label: string; link: string; type: 'iri' | 'literal' }[]
  shapeSource?: string
  shapeSourceSlug?: string
}

// ── Map-based lookup (O(1) instead of O(n) array scan) ──

const entityMap = new Map<string, OntEntity>(
  (ontologyEntities as readonly OntEntity[]).map(e => [e.qname, e])
)

// Pre-index shapes by targetClass for O(1) lookup
const shapesByTarget = new Map<string, OntEntity[]>()
for (const e of ontologyEntities as readonly OntEntity[]) {
  if (e.type === 'shape' && e.targetClass) {
    let list = shapesByTarget.get(e.targetClass)
    if (!list) { list = []; shapesByTarget.set(e.targetClass, list) }
    list.push(e)
  }
}

export function findByQname(qname: string): OntEntity | undefined {
  return entityMap.get(qname)
}

export function linkTo(qname: string): string {
  const e = entityMap.get(qname)
  return e ? `/ontology/${e.slug}` : ''
}

// ── Class hierarchy composable ──

export function useClassHierarchy(classQname: MaybeRef<string>) {
  const classEntity = computed(() => entityMap.get(unref(classQname)))

  const ancestors = computed(() => {
    const chain: OntEntity[] = []
    let current = classEntity.value
    let safety = 10
    while (safety-- > 0 && current?.parent) {
      const p = entityMap.get(current.parent)
      if (!p) break
      chain.push(p)
      current = p
    }
    return chain
  })

  const fullHierarchy = computed(() =>
    [...ancestors.value.reverse(), classEntity.value].filter(Boolean) as OntEntity[]
  )

  const shapes = computed(() => {
    const target = unref(classQname)
    return shapesByTarget.get(target) ?? []
  })

  return { classEntity, ancestors, fullHierarchy, shapes }
}

// ── Badge color helper ──

export function classBadgeColor(classQname: string) {
  return CLASS_BADGE_COLORS[classQname] ?? {
    bg: 'bg-slate-50 dark:bg-slate-800',
    text: 'text-slate-700 dark:text-slate-300',
    border: 'border-slate-200/60 dark:border-slate-700',
  }
}

// ── Related entity badge color helper ──

export function relatedBadgeColor(qname: string): { bg: string; text: string; border: string; dot: string } {
  if (qname === ONTOLOGY_CLASSES.Unit)
    return { bg: 'bg-teal-100 dark:bg-teal-950/40', text: 'text-teal-800 dark:text-teal-300', border: 'border-teal-300 dark:border-teal-800', dot: 'bg-teal-500' }
  if (qname === ONTOLOGY_CLASSES.Dimension)
    return { bg: 'bg-sky-100 dark:bg-sky-950/40', text: 'text-sky-800 dark:text-sky-300', border: 'border-sky-300 dark:border-sky-800', dot: 'bg-sky-500' }
  if (qname === ONTOLOGY_CLASSES.TermEntry)
    return { bg: 'bg-emerald-100 dark:bg-emerald-950/40', text: 'text-emerald-800 dark:text-emerald-300', border: 'border-emerald-300 dark:border-emerald-800', dot: 'bg-emerald-500' }
  if (qname.includes(':hasUnit'))
    return { bg: 'bg-teal-100 dark:bg-teal-950/40', text: 'text-teal-800 dark:text-teal-300', border: 'border-teal-300 dark:border-teal-800', dot: 'bg-teal-500' }
  if (qname.includes(':hasDimension'))
    return { bg: 'bg-sky-100 dark:bg-sky-950/40', text: 'text-sky-800 dark:text-sky-300', border: 'border-sky-300 dark:border-sky-800', dot: 'bg-sky-500' }
  return { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-800 dark:text-slate-300', border: 'border-slate-300 dark:border-slate-700', dot: 'bg-slate-500' }
}
