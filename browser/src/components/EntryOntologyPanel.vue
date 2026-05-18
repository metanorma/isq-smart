<script setup lang="ts">
import { computed } from 'vue'
import { ontologyEntities } from '../data/generated/ontology'
import { entryRdfClass } from '../composables/useEntry'
import type { Entry, QuantityEntry } from '../data/types'

interface OntEntity {
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
  constraints?: { path: string; minCount?: number; maxCount?: number; datatype?: string; nodeKind?: string; classValue?: string; hasValue?: string }[]
  instanceOf?: string[]
}

const props = defineProps<{
  entry: Entry
  partParam: string
}>()

const allEntities = ontologyEntities as readonly OntEntity[]

function findByQname(qname: string): OntEntity | undefined {
  return allEntities.find(e => e.qname === qname)
}

function linkTo(qname: string): string {
  const e = findByQname(qname)
  return e ? `/ontology/${e.slug}` : ''
}

const entryClassQname = computed(() => entryRdfClass(props.entry))
const entryClassEntity = computed(() => findByQname(entryClassQname.value))

const ancestors = computed(() => {
  const chain: OntEntity[] = []
  let current = entryClassEntity.value
  let safety = 10
  while (safety-- > 0 && current?.parent) {
    const p = findByQname(current.parent)
    if (!p) break
    chain.push(p)
    current = p
  }
  return chain
})

const fullHierarchy = computed(() => {
  return [...ancestors.value.reverse(), entryClassEntity.value].filter(Boolean) as OntEntity[]
})

const shapes = computed(() =>
  allEntities.filter(e => e.type === 'shape' && e.targetClass === entryClassQname.value)
)

const partIndividual = computed(() => findByQname(`isoiec80000:part-${props.partParam}`))

interface PropertyRow {
  path: string
  pathSlug: string
  values: { label: string; link: string; type: 'iri' | 'literal' }[]
  shapeSource: string
  shapeSourceSlug: string
}

const propertyTable = computed(() => {
  const rows: PropertyRow[] = []

  function addRow(path: string, values: PropertyRow['values'], shapeQname: string) {
    const pathEntity = findByQname(path)
    const shapeEntity = findByQname(shapeQname)
    rows.push({
      path,
      pathSlug: pathEntity?.slug || '',
      values,
      shapeSource: shapeQname,
      shapeSourceSlug: shapeEntity?.slug || '',
    })
  }

  const classQname = entryClassQname.value
  const shapeQname = shapes.value[0]?.qname || ''

  // rdf:type
  addRow('rdf:type', [
    { label: classQname, link: linkTo(classQname), type: 'iri' },
    { label: 'smart:TermEntry', link: linkTo('smart:TermEntry'), type: 'iri' },
  ], shapeQname)

  // dcterms:identifier
  addRow('dcterms:identifier', [
    { label: props.entry.num, link: '', type: 'literal' },
  ], shapeQname)

  // skosxl:prefLabel
  const prefLabel = props.entry.designations[0]?.designation?.en?.text
  if (prefLabel) {
    addRow('skosxl:prefLabel', [
      { label: `"${prefLabel}"@en`, link: '', type: 'literal' },
    ], shapeQname)
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
    addRow('skosxl:altLabel', altLabels, shapeQname)
  }

  // skos:definition
  if (props.entry.def?.en) {
    addRow('skos:definition', [
      { label: props.entry.def.en.slice(0, 120) + (props.entry.def.en.length > 120 ? '…' : ''), link: '', type: 'literal' },
    ], shapeQname)
  }

  // skos:note
  if (props.entry.remarks?.en) {
    addRow('skos:note', [
      { label: props.entry.remarks.en.slice(0, 120) + (props.entry.remarks.en.length > 120 ? '…' : ''), link: '', type: 'literal' },
    ], shapeQname)
  }

  // isoiec80000:hasUnit (quantities only)
  if (props.entry._tag === 'quantity') {
    const units = (props.entry as QuantityEntry).units ?? []
    if (units.length) {
      const unitValues = units.map(u => {
        const sym = u.symbol?.[0] ?? u.en
        const unitQname = `isoiec80000:unit-${sym}`
        return { label: `${sym} (${u.en})`, link: linkTo('isoiec80000:Unit'), type: 'iri' as const }
      })
      addRow('isoiec80000:hasUnit', unitValues, shapeQname)
    }
  }

  // smart:hasBindingnessType
  addRow('smart:hasBindingnessType', [
    { label: 'bindingness-type:normative', link: linkTo('bindingness-type:normative'), type: 'iri' },
  ], shapeQname)

  // dcterms:isPartOf
  const partQname = `isoiec80000:part-${props.partParam}`
  addRow('dcterms:isPartOf', [
    { label: partQname, link: linkTo(partQname), type: 'iri' },
  ], shapeQname)

  return rows
})
</script>

<template>
  <div class="mb-12">
    <!-- Header -->
    <h2 class="flex items-center gap-2 text-[10px] font-semibold text-slate-400 uppercase tracking-[0.15em] mb-4">
      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"/></svg>
      Ontology
      <!-- Type badges -->
      <div class="flex items-center gap-1.5 ml-1 normal-case tracking-normal text-xs font-medium">
        <router-link
          v-if="entryClassEntity"
          :to="`/ontology/${entryClassEntity.slug}`"
          class="px-2 py-0.5 rounded bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-400 border border-brand-100/60 dark:border-brand-800/40 hover:bg-brand-100 dark:hover:bg-brand-900/50 transition-colors"
        >{{ entryClassQname }}</router-link>
        <router-link
          to="/ontology/smart-TermEntry"
          class="px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-100/60 dark:border-emerald-800/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors"
        >smart:TermEntry</router-link>
      </div>
    </h2>

    <!-- Content -->
    <div class="space-y-4">
      <!-- Class hierarchy -->
      <div class="rounded-xl border border-slate-200/60 dark:border-dark-600/60 bg-white dark:bg-dark-800 overflow-hidden">
        <div class="px-4 py-2.5 bg-slate-50/80 dark:bg-dark-700/80 border-b border-slate-200/60 dark:border-dark-600/60">
          <h3 class="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-[0.12em]">Class Hierarchy</h3>
        </div>
        <div class="p-4">
          <div class="flex items-center gap-1.5 flex-wrap font-mono text-xs">
            <template v-for="(cls, i) in fullHierarchy" :key="cls.qname">
              <router-link
                v-if="i < fullHierarchy.length - 1"
                :to="`/ontology/${cls.slug}`"
                class="text-brand-600 dark:text-brand-400 hover:underline"
              >{{ cls.qname }}</router-link>
              <span v-else class="font-bold text-slate-900 dark:text-slate-100 px-1.5 py-0.5 rounded bg-brand-50 dark:bg-brand-900/40 border border-brand-100/60 dark:border-brand-700/60">{{ cls.qname }}</span>
              <svg v-if="i < fullHierarchy.length - 1" class="w-3 h-3 text-slate-300 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" d="M9 5l7 7-7 7"/></svg>
            </template>
          </div>
          <p v-if="entryClassEntity?.description" class="mt-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{{ entryClassEntity.description }}</p>
        </div>
      </div>

      <!-- Instance URI -->
      <div class="rounded-xl border border-slate-200/60 dark:border-dark-600/60 bg-white dark:bg-dark-800 overflow-hidden">
        <div class="px-4 py-2.5 bg-slate-50/80 dark:bg-dark-700/80 border-b border-slate-200/60 dark:border-dark-600/60">
          <h3 class="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-[0.12em]">Instance IRI</h3>
        </div>
        <div class="p-4">
          <code class="text-xs text-brand-700 dark:text-brand-400 bg-brand-50/50 dark:bg-brand-950/30 px-2 py-1 rounded break-all">isoiec80000:{{ entry.id }}</code>
        </div>
      </div>

      <!-- Properties table -->
      <div class="rounded-xl border border-slate-200/60 dark:border-dark-600/60 bg-white dark:bg-dark-800 overflow-hidden">
        <div class="px-4 py-2.5 bg-slate-50/80 dark:bg-dark-700/80 border-b border-slate-200/60 dark:border-dark-600/60 flex items-center justify-between">
          <h3 class="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-[0.12em]">Properties</h3>
          <div class="flex items-center gap-1.5">
            <span v-for="shape in shapes" :key="shape.qname" class="text-[9px] font-medium px-1.5 py-0.5 rounded bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border border-purple-100/60 dark:border-purple-800/40">
              <router-link :to="`/ontology/${shape.slug}`" class="hover:underline" @click.stop>{{ shape.qname }}</router-link>
            </span>
          </div>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-xs">
            <thead>
              <tr class="bg-slate-50/50 dark:bg-dark-700/50 border-b border-slate-200/60 dark:border-dark-600/60">
                <th class="text-left px-4 py-2 font-semibold text-slate-500 dark:text-slate-400 w-48">Property</th>
                <th class="text-left px-4 py-2 font-semibold text-slate-500 dark:text-slate-400">Value</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in propertyTable" :key="row.path" class="border-b border-slate-100/60 dark:border-dark-700/40 last:border-0 hover:bg-slate-50/30 dark:hover:bg-dark-700/30 transition-colors">
                <td class="px-4 py-2">
                  <router-link v-if="row.pathSlug" :to="`/ontology/${row.pathSlug}`" class="font-mono text-brand-600 dark:text-brand-400 hover:underline">{{ row.path }}</router-link>
                  <span v-else class="font-mono text-slate-600 dark:text-slate-400">{{ row.path }}</span>
                </td>
                <td class="px-4 py-2">
                  <div class="flex flex-wrap gap-1.5">
                    <template v-for="(v, vi) in row.values" :key="vi">
                      <router-link
                        v-if="v.link"
                        :to="v.link"
                        class="px-1.5 py-0.5 rounded bg-slate-50 dark:bg-dark-700 border border-slate-200/60 dark:border-dark-600/60 hover:border-brand-200 dark:hover:border-brand-700 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                      >{{ v.label }}</router-link>
                      <span v-else class="text-slate-600 dark:text-slate-400">{{ v.label }}</span>
                    </template>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Related entities -->
      <div class="rounded-xl border border-slate-200/60 dark:border-dark-600/60 bg-white dark:bg-dark-800 overflow-hidden">
        <div class="px-4 py-2.5 bg-slate-50/80 dark:bg-dark-700/80 border-b border-slate-200/60 dark:border-dark-600/60">
          <h3 class="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-[0.12em]">Related Entities</h3>
        </div>
        <div class="p-4 flex flex-wrap gap-2">
          <!-- SHACL Shape -->
          <router-link
            v-for="shape in shapes"
            :key="shape.qname"
            :to="`/ontology/${shape.slug}`"
            class="text-xs font-medium px-2.5 py-1.5 rounded-lg border border-purple-300 dark:border-purple-700 bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900/60 transition-colors inline-flex items-center gap-1.5"
          >
            <span class="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
            {{ shape.qname }}
          </router-link>
          <!-- Parent part individual -->
          <router-link
            v-if="partIndividual"
            :to="`/ontology/${partIndividual.slug}`"
            class="text-xs font-medium px-2.5 py-1.5 rounded-lg border border-amber-300 dark:border-amber-700 bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-900/60 transition-colors inline-flex items-center gap-1.5"
          >
            <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            {{ partIndividual.qname }}
          </router-link>
          <!-- Unit class (quantities only) -->
          <router-link
            v-if="entry._tag === 'quantity'"
            to="/ontology/isoiec80000-Unit"
            class="text-xs font-medium px-2.5 py-1.5 rounded-lg border border-teal-300 dark:border-teal-700 bg-teal-100 dark:bg-teal-900/40 text-teal-800 dark:text-teal-300 hover:bg-teal-200 dark:hover:bg-teal-900/60 transition-colors inline-flex items-center gap-1.5"
          >
            <span class="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
            isoiec80000:Unit
          </router-link>
          <!-- TermEntry class -->
          <router-link
            to="/ontology/smart-TermEntry"
            class="text-xs font-medium px-2.5 py-1.5 rounded-lg border border-emerald-300 dark:border-emerald-700 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-900/60 transition-colors inline-flex items-center gap-1.5"
          >
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            smart:TermEntry
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>
