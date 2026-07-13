<script setup lang="ts">
import { asset } from '../lib/asset'
import { computed } from 'vue'
import { useClassHierarchy, findByQname, linkTo } from '../composables/useOntology'
import type { PropertyRow } from '../composables/useOntology'
import {
  ONTOLOGY_CLASSES, ONTOLOGY_PROPERTIES, tagToClass, partQname, entryQname,
} from '../data/ontologyConfig'
import type { Entry, QuantityEntry } from '../data/types'
import OntologyPanelLayout from './OntologyPanelLayout.vue'

const props = defineProps<{
  entry: Entry
  partParam: string
}>()

const classQname = computed(() => tagToClass(props.entry._tag))
const { classEntity, fullHierarchy, shapes } = useClassHierarchy(classQname)

const instanceIri = computed(() => entryQname(props.entry.id))

const hierarchyColor = computed(() =>
  classQname.value === ONTOLOGY_CLASSES.Quantity
    ? 'bg-brand-50 dark:bg-brand-900/40 border border-brand-100/60 dark:border-brand-700/60'
    : 'bg-brand-50 dark:bg-brand-900/40 border border-brand-100/60 dark:border-brand-700/60'
)

const instanceColor = computed(() =>
  classQname.value === ONTOLOGY_CLASSES.Quantity
    ? 'text-brand-700 dark:text-brand-400 bg-brand-50/50 dark:bg-brand-950/30'
    : 'text-brand-700 dark:text-brand-400 bg-brand-50/50 dark:bg-brand-950/30'
)

const propertyTable = computed(() => {
  const rows: PropertyRow[] = []
  const shapeQname = shapes.value[0]?.qname || ''

  function addRow(path: string, values: PropertyRow['values']) {
    const pathEntity = findByQname(path)
    rows.push({ path, pathSlug: pathEntity?.slug || '', values })
  }

  // rdf:type
  addRow(ONTOLOGY_PROPERTIES.rdfType, [
    { label: classQname.value, link: linkTo(classQname.value), type: 'iri' },
    { label: ONTOLOGY_CLASSES.TermEntry, link: linkTo(ONTOLOGY_CLASSES.TermEntry), type: 'iri' },
  ])

  // dcterms:identifier
  addRow(ONTOLOGY_PROPERTIES.identifier, [
    { label: props.entry.num, link: '', type: 'literal' },
  ])

  // skosxl:prefLabel
  const prefLabel = props.entry.designations[0]?.designation?.en?.text
  if (prefLabel) {
    addRow(ONTOLOGY_PROPERTIES.prefLabel, [
      { label: `"${prefLabel}"@en`, link: '', type: 'literal' },
    ])
  }

  // skosxl:altLabel
  const altLabels: PropertyRow['values'] = []
  for (let i = 1; i < props.entry.designations.length; i++) {
    const text = props.entry.designations[i].designation?.en?.text
    if (text) altLabels.push({ label: `"${text}"@en`, link: '', type: 'literal' })
  }
  for (const sym of props.entry.symbols ?? []) {
    altLabels.push({ label: `"${sym}"@en`, link: '', type: 'literal' })
  }
  if (altLabels.length) {
    addRow(ONTOLOGY_PROPERTIES.altLabel, altLabels)
  }

  // skos:definition
  if (props.entry.def?.en) {
    const def = props.entry.def.en
    addRow(ONTOLOGY_PROPERTIES.definition, [
      { label: def.slice(0, 120) + (def.length > 120 ? '…' : ''), link: '', type: 'literal' },
    ])
  }

  // skos:note
  if (props.entry.remarks?.en) {
    const rem = props.entry.remarks.en
    addRow(ONTOLOGY_PROPERTIES.note, [
      { label: rem.slice(0, 120) + (rem.length > 120 ? '…' : ''), link: '', type: 'literal' },
    ])
  }

  // hasUnit / hasDimension (quantities only)
  if (props.entry._tag === 'quantity') {
    const units = (props.entry as QuantityEntry).units ?? []
    if (units.length) {
      const unitValues = units.map(u => {
        const sym = u.symbol?.[0] ?? u.en
        return { label: `${sym} (${u.en})`, link: linkTo(ONTOLOGY_CLASSES.Unit), type: 'iri' as const }
      })
      addRow(ONTOLOGY_PROPERTIES.hasUnit, unitValues)
    }

    addRow(ONTOLOGY_PROPERTIES.hasDimension, [
      { label: ONTOLOGY_CLASSES.Dimension, link: linkTo(ONTOLOGY_CLASSES.Dimension), type: 'iri' },
    ])
  }

  // hasBindingnessType
  addRow(ONTOLOGY_PROPERTIES.hasBindingnessType, [
    { label: 'bindingness-type:normative', link: linkTo('bindingness-type:normative'), type: 'iri' },
  ])

  // isPartOf
  const pqname = partQname(props.partParam)
  addRow(ONTOLOGY_PROPERTIES.isPartOf, [
    { label: pqname, link: linkTo(pqname), type: 'iri' },
  ])

  return rows
})

const related = computed(() => {
  const items: { qname: string; slug: string }[] = []
  const partInd = findByQname(partQname(props.partParam))
  if (partInd) items.push({ qname: partInd.qname, slug: partInd.slug })
  if (props.entry._tag === 'quantity') {
    const unitCls = findByQname(ONTOLOGY_CLASSES.Unit)
    if (unitCls) items.push({ qname: unitCls.qname, slug: unitCls.slug })
    const dimCls = findByQname(ONTOLOGY_CLASSES.Dimension)
    if (dimCls) items.push({ qname: dimCls.qname, slug: dimCls.slug })
    const hasDim = findByQname(ONTOLOGY_PROPERTIES.hasDimension)
    if (hasDim) items.push({ qname: hasDim.qname, slug: hasDim.slug })
  }
  const termEntry = findByQname(ONTOLOGY_CLASSES.TermEntry)
  if (termEntry) items.push({ qname: termEntry.qname, slug: termEntry.slug })
  return items
})

const headerBadges = computed(() => {
  const badges: { qname: string; slug: string; colorClass: string }[] = []
  if (classEntity.value) {
    badges.push({ qname: classQname.value, slug: classEntity.value.slug, colorClass: 'bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-400 border border-brand-100/60 dark:border-brand-800/40' })
  }
  const termEntry = findByQname(ONTOLOGY_CLASSES.TermEntry)
  if (termEntry) {
    badges.push({ qname: ONTOLOGY_CLASSES.TermEntry, slug: termEntry.slug, colorClass: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-100/60 dark:border-emerald-800/40' })
  }
  return badges
})
</script>

<template>
  <OntologyPanelLayout
    :class-entity="classEntity"
    :hierarchy="fullHierarchy"
    :shapes="shapes"
    :instance-iri="instanceIri"
    :instance-color="instanceColor"
    :property-table="propertyTable"
    :related="related"
  >
    <template #header-badges>
      <div class="flex items-center gap-1.5 ml-1 normal-case tracking-normal text-xs font-medium">
        <a
          v-for="badge in headerBadges"
          :key="badge.qname"
          :href="asset(`/ontology/${badge.slug}`)"
          class="px-2 py-0.5 rounded hover:opacity-80 transition-colors"
          :class="badge.colorClass"
        >{{ badge.qname }}</a>
      </div>
    </template>
    <template #instance-iri>
      <code class="text-xs text-brand-700 dark:text-brand-400 bg-brand-50/50 dark:bg-brand-950/30 px-2 py-1 rounded break-all">{{ instanceIri }}</code>
    </template>
  </OntologyPanelLayout>
</template>
