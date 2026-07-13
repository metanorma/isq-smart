<script setup lang="ts">
import { asset } from '../lib/asset'
import { computed } from 'vue'
import { useClassHierarchy, findByQname, linkTo } from '../composables/useOntology'
import type { PropertyRow } from '../composables/useOntology'
import { ONTOLOGY_CLASSES, ONTOLOGY_PROPERTIES, unitQname } from '../data/ontologyConfig'
import OntologyPanelLayout from './OntologyPanelLayout.vue'

interface UnitRef { authority: string; uri: string; type: string }

interface UnitData {
  slug: string; name: string; symbols: string[]
  quantityCount: number; parts: string[]
  nistId?: string; unitsmlId?: string
  refs?: UnitRef[]; unitSystems?: string[]
  scaleRef?: string; root?: boolean
  dimensionRef?: string; dimensionSlug?: string
  quantityRefs?: string[]
}

const props = defineProps<{ unit: UnitData }>()

const classQname = ONTOLOGY_CLASSES.Unit
const { classEntity, fullHierarchy, shapes } = useClassHierarchy(classQname)

const instanceIri = computed(() =>
  props.unit.unitsmlId ? `unitsml:${props.unit.unitsmlId}` : unitQname(props.unit.slug)
)

const instanceColor = 'text-teal-700 dark:text-teal-400 bg-teal-50/50 dark:bg-teal-950/20'
const hierarchyColor = 'bg-teal-50 dark:bg-teal-950/30 border border-teal-100/60 dark:border-teal-800/40'

const propertyTable = computed(() => {
  const rows: PropertyRow[] = []

  function addRow(path: string, values: PropertyRow['values']) {
    const pathEntity = findByQname(path)
    rows.push({ path, pathSlug: pathEntity?.slug || '', values })
  }

  // rdf:type
  addRow(ONTOLOGY_PROPERTIES.rdfType, [
    { label: classQname, link: linkTo(classQname), type: 'iri' },
  ])

  // dcterms:identifier
  if (props.unit.nistId) {
    addRow(ONTOLOGY_PROPERTIES.identifier, [
      { label: props.unit.nistId, link: '', type: 'literal' },
    ])
  }

  // unitsml:id
  if (props.unit.unitsmlId) {
    addRow('unitsml:id', [
      { label: props.unit.unitsmlId, link: '', type: 'literal' },
    ])
  }

  // skosxl:prefLabel
  addRow(ONTOLOGY_PROPERTIES.prefLabel, [
    { label: `"${props.unit.name}"@en`, link: '', type: 'literal' },
  ])

  // skos:notation (symbols)
  if (props.unit.symbols.length) {
    addRow(ONTOLOGY_PROPERTIES.notation, props.unit.symbols.map(s => ({
      label: `"${s}"`, link: '', type: 'literal' as const,
    })))
  }

  // unitsml:unitSystem
  if (props.unit.unitSystems?.length) {
    addRow('unitsml:unitSystem', props.unit.unitSystems.map(us => ({
      label: us.replace(/_/g, ' '), link: '', type: 'literal' as const,
    })))
  }

  // unitsml:scaleReference
  if (props.unit.scaleRef) {
    addRow('unitsml:scaleReference', [
      { label: props.unit.scaleRef.replace(/_/g, ' '), link: '', type: 'literal' },
    ])
  }

  // unitsml:root
  if (props.unit.root !== undefined) {
    addRow('unitsml:root', [
      { label: String(props.unit.root), link: '', type: 'literal' },
    ])
  }

  // hasDimension
  if (props.unit.dimensionRef) {
    const dimLink = props.unit.dimensionSlug ? `/dimensions/${props.unit.dimensionSlug}` : ''
    addRow(ONTOLOGY_PROPERTIES.hasDimension, [
      { label: `unitsml:${props.unit.dimensionRef}`, link: dimLink, type: 'iri' },
    ])
  }

  // dcterms:references
  if (props.unit.refs?.length) {
    addRow('dcterms:references', props.unit.refs.map(r => ({
      label: `${r.authority}: ${r.uri}`,
      link: r.uri.startsWith('http') ? r.uri : '',
      type: 'iri' as const,
    })))
  }

  return rows
})

const related = computed(() => {
  const items: { qname: string; slug: string; link?: string }[] = []
  const dimCls = findByQname(ONTOLOGY_CLASSES.Dimension)
  if (dimCls) items.push({ qname: dimCls.qname, slug: dimCls.slug })
  const hasUnit = findByQname(ONTOLOGY_PROPERTIES.hasUnit)
  if (hasUnit) items.push({ qname: hasUnit.qname, slug: hasUnit.slug })
  const termEntry = findByQname(ONTOLOGY_CLASSES.TermEntry)
  if (termEntry) items.push({ qname: termEntry.qname, slug: termEntry.slug })
  if (props.unit.dimensionSlug) {
    items.push({
      qname: `Dimension: ${props.unit.dimensionRef}`,
      slug: '',
      link: `/dimensions/${props.unit.dimensionSlug}`,
    })
  }
  return items
})
</script>

<template>
  <OntologyPanelLayout
    :class-entity="classEntity"
    :hierarchy="fullHierarchy"
    :shapes="shapes"
    :instance-iri="instanceIri"
    :instance-color="hierarchyColor"
    :property-table="propertyTable"
    :related="related"
  >
    <template #header-badges>
      <div class="flex items-center gap-1.5 ml-1 normal-case tracking-normal text-xs font-medium">
        <a
          v-if="classEntity"
          :href="asset(`/ontology/${classEntity.slug}`)"
          class="px-2 py-0.5 rounded bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-400 border border-teal-100/60 dark:border-teal-800/40 hover:bg-teal-100 dark:hover:bg-teal-950/60 transition-colors"
        >{{ classQname }}</a>
      </div>
    </template>
    <template #instance-iri>
      <code class="text-xs text-teal-700 dark:text-teal-400 bg-teal-50/50 dark:bg-teal-950/20 px-2 py-1 rounded break-all">{{ instanceIri }}</code>
    </template>
  </OntologyPanelLayout>
</template>
