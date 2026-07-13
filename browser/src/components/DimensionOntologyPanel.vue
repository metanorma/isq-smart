<script setup lang="ts">
import { asset } from '../lib/asset'
import { computed } from 'vue'
import { useClassHierarchy, findByQname, linkTo } from '../composables/useOntology'
import type { PropertyRow } from '../composables/useOntology'
import { ONTOLOGY_CLASSES, ONTOLOGY_PROPERTIES } from '../data/ontologyConfig'
import OntologyPanelLayout from './OntologyPanelLayout.vue'

interface DimVector { base: string; power: number }

interface DimData {
  nistId: string; unitsmlId: string; slug: string; name: string
  shortName: string; dimensionless: boolean
  vector: DimVector[]; vectorNotation: string
  linkedQuantities: string[]; isoEntries: { id: string; num: string; name: string; part: string }[]; isoUnitSlugs: string[]
  qudtUri?: string
}

const props = defineProps<{ dim: DimData }>()

const classQname = ONTOLOGY_CLASSES.Dimension
const { classEntity, fullHierarchy, shapes } = useClassHierarchy(classQname)

const instanceIri = computed(() => `unitsml:${props.dim.unitsmlId}`)
const hierarchyColor = 'bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100/60 dark:border-indigo-800/40'
const instanceColor = 'text-indigo-700 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/20'

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
  addRow(ONTOLOGY_PROPERTIES.identifier, [
    { label: props.dim.nistId, link: '', type: 'literal' },
  ])

  // unitsml:id
  addRow('unitsml:id', [
    { label: props.dim.unitsmlId, link: '', type: 'literal' },
  ])

  // skosxl:prefLabel
  addRow(ONTOLOGY_PROPERTIES.prefLabel, [
    { label: `"${props.dim.name}"@en`, link: '', type: 'literal' },
  ])

  // unitsml:shortName
  addRow('unitsml:shortName', [
    { label: props.dim.shortName, link: '', type: 'literal' },
  ])

  // unitsml:dimensionless
  addRow('unitsml:dimensionless', [
    { label: String(props.dim.dimensionless), link: '', type: 'literal' },
  ])

  // unitsml:dimensionVector
  if (!props.dim.dimensionless) {
    addRow('unitsml:dimensionVector', [
      { label: props.dim.vectorNotation, link: '', type: 'literal' },
    ])
  }

  // Vector component breakdown
  if (props.dim.vector.length) {
    const comps = props.dim.vector
      .filter(c => c.power !== 0)
      .map(c => `${c.base}^${c.power}`)
    if (comps.length) {
      addRow('unitsml:baseDimension', comps.map(c => ({ label: c, link: '', type: 'literal' as const })))
    }
  }

  // qudt:equivalentDimension
  if (props.dim.qudtUri) {
    addRow('qudt:equivalentDimension', [
      { label: props.dim.qudtUri, link: props.dim.qudtUri, type: 'iri' },
    ])
  }

  return rows
})

const related = computed(() => {
  const items: { qname: string; slug: string }[] = []
  const unitCls = findByQname(ONTOLOGY_CLASSES.Unit)
  if (unitCls) items.push({ qname: unitCls.qname, slug: unitCls.slug })
  const hasDim = findByQname(ONTOLOGY_PROPERTIES.hasDimension)
  if (hasDim) items.push({ qname: hasDim.qname, slug: hasDim.slug })
  const termEntry = findByQname(ONTOLOGY_CLASSES.TermEntry)
  if (termEntry) items.push({ qname: termEntry.qname, slug: termEntry.slug })
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
          :href="asset(`/ontology/${classEntity?.slug}`)"
          class="px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 border border-indigo-100/60 dark:border-indigo-800/40 hover:bg-indigo-100 dark:hover:bg-indigo-950/60 transition-colors"
        >{{ classQname }}</a>
      </div>
    </template>
    <template #instance-iri>
      <code class="text-xs text-indigo-700 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/20 px-2 py-1 rounded break-all">unitsml:{{ dim.unitsmlId }}</code>
    </template>
  </OntologyPanelLayout>
</template>
