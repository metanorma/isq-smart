<script setup lang="ts">
import { computed } from 'vue'
import { ontologyEntities } from '../data/generated/ontology'

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

interface OntEntity {
  uri: string; qname: string; slug: string; label: string
  description: string; ontology: string; type: string
  parent?: string; targetClass?: string
  domain?: string[]; range?: string[]
  constraints?: { path: string; minCount?: number; maxCount?: number; datatype?: string; nodeKind?: string; classValue?: string; hasValue?: string }[]
  instanceOf?: string[]
}

const props = defineProps<{ unit: UnitData }>()

const allEntities = ontologyEntities as readonly OntEntity[]

function findByQname(qname: string): OntEntity | undefined {
  return allEntities.find(e => e.qname === qname)
}

function linkTo(qname: string): string {
  const e = findByQname(qname)
  return e ? `/ontology/${e.slug}` : ''
}

const classQname = 'isoiec80000:Unit'
const classEntity = computed(() => findByQname(classQname))

const ancestors = computed(() => {
  const chain: OntEntity[] = []
  let current = classEntity.value
  let safety = 10
  while (safety-- > 0 && current?.parent) {
    const p = findByQname(current.parent)
    if (!p) break
    chain.push(p)
    current = p
  }
  return chain
})

const fullHierarchy = computed(() =>
  [...ancestors.value.reverse(), classEntity.value].filter(Boolean) as OntEntity[]
)

const shapes = computed(() =>
  allEntities.filter(e => e.type === 'shape' && e.targetClass === classQname)
)

interface PropertyRow {
  path: string; pathSlug: string
  values: { label: string; link: string; type: 'iri' | 'literal' }[]
}

const propertyTable = computed(() => {
  const rows: PropertyRow[] = []

  function addRow(path: string, values: PropertyRow['values']) {
    const pathEntity = findByQname(path)
    rows.push({ path, pathSlug: pathEntity?.slug || '', values })
  }

  // rdf:type
  addRow('rdf:type', [
    { label: classQname, link: linkTo(classQname), type: 'iri' },
  ])

  // dcterms:identifier
  if (props.unit.nistId) {
    addRow('dcterms:identifier', [
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
  addRow('skosxl:prefLabel', [
    { label: `"${props.unit.name}"@en`, link: '', type: 'literal' },
  ])

  // skos:notation (symbols)
  if (props.unit.symbols.length) {
    addRow('skos:notation', props.unit.symbols.map(s => ({
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

  // isoiec80000:hasDimension
  if (props.unit.dimensionRef) {
    const dimLink = props.unit.dimensionSlug ? `/dimensions/${props.unit.dimensionSlug}` : ''
    addRow('isoiec80000:hasDimension', [
      { label: `unitsml:${props.unit.dimensionRef}`, link: dimLink, type: 'iri' },
    ])
  }

  // External references
  if (props.unit.refs?.length) {
    const refValues = props.unit.refs.map(r => ({
      label: `${r.authority}: ${r.uri}`,
      link: r.uri.startsWith('http') ? r.uri : '',
      type: 'iri' as const,
    }))
    addRow('dcterms:references', refValues)
  }

  return rows
})
</script>

<template>
  <div class="mb-12">
    <h2 class="flex items-center gap-2 text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em] mb-4">
      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"/></svg>
      Ontology
      <div class="flex items-center gap-1.5 ml-1 normal-case tracking-normal text-xs font-medium">
        <router-link
          :to="`/ontology/${classEntity?.slug}`"
          class="px-2 py-0.5 rounded bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-400 border border-teal-100/60 dark:border-teal-800/40 hover:bg-teal-100 dark:hover:bg-teal-950/60 transition-colors"
        >{{ classQname }}</router-link>
      </div>
    </h2>

    <div class="space-y-4">
      <!-- Class hierarchy -->
      <div class="rounded-xl border border-slate-200/60 dark:border-dark-600/60 bg-white dark:bg-dark-900 overflow-hidden">
        <div class="px-4 py-2.5 bg-slate-50/80 dark:bg-dark-800/80 border-b border-slate-200/60 dark:border-dark-600/60">
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
              <span v-else class="font-bold text-slate-900 dark:text-slate-100 px-1.5 py-0.5 rounded bg-teal-50 dark:bg-teal-950/30 border border-teal-100/60 dark:border-teal-800/40">{{ cls.qname }}</span>
              <svg v-if="i < fullHierarchy.length - 1" class="w-3 h-3 text-slate-300 dark:text-slate-600 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" d="M9 5l7 7-7 7"/></svg>
            </template>
          </div>
          <p v-if="classEntity?.description" class="mt-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{{ classEntity.description }}</p>
        </div>
      </div>

      <!-- Instance IRI -->
      <div class="rounded-xl border border-slate-200/60 dark:border-dark-600/60 bg-white dark:bg-dark-900 overflow-hidden">
        <div class="px-4 py-2.5 bg-slate-50/80 dark:bg-dark-800/80 border-b border-slate-200/60 dark:border-dark-600/60">
          <h3 class="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-[0.12em]">Instance IRI</h3>
        </div>
        <div class="p-4">
          <code v-if="unit.unitsmlId" class="text-xs text-teal-700 dark:text-teal-400 bg-teal-50/50 dark:bg-teal-950/20 px-2 py-1 rounded break-all">unitsml:{{ unit.unitsmlId }}</code>
          <code v-else class="text-xs text-teal-700 dark:text-teal-400 bg-teal-50/50 dark:bg-teal-950/20 px-2 py-1 rounded break-all">isoiec80000:unit-{{ unit.slug }}</code>
        </div>
      </div>

      <!-- Properties table -->
      <div class="rounded-xl border border-slate-200/60 dark:border-dark-600/60 bg-white dark:bg-dark-900 overflow-hidden">
        <div class="px-4 py-2.5 bg-slate-50/80 dark:bg-dark-800/80 border-b border-slate-200/60 dark:border-dark-600/60 flex items-center justify-between">
          <h3 class="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-[0.12em]">Properties</h3>
          <div class="flex items-center gap-1.5">
            <span v-for="shape in shapes" :key="shape.qname" class="text-[9px] font-medium px-1.5 py-0.5 rounded bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 border border-purple-100/60 dark:border-purple-800/40">
              <router-link :to="`/ontology/${shape.slug}`" class="hover:underline" @click.stop>{{ shape.qname }}</router-link>
            </span>
          </div>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-xs">
            <thead>
              <tr class="bg-slate-50/50 dark:bg-dark-800/50 border-b border-slate-200/60 dark:border-dark-600/60">
                <th class="text-left px-4 py-2 font-semibold text-slate-500 dark:text-slate-400 w-48">Property</th>
                <th class="text-left px-4 py-2 font-semibold text-slate-500 dark:text-slate-400">Value</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in propertyTable" :key="row.path + row.values[0]?.label" class="border-b border-slate-100/60 dark:border-dark-700/60 last:border-0 hover:bg-slate-50/30 dark:hover:bg-dark-800/30 transition-colors">
                <td class="px-4 py-2">
                  <router-link v-if="row.pathSlug" :to="`/ontology/${row.pathSlug}`" class="font-mono text-brand-600 dark:text-brand-400 hover:underline">{{ row.path }}</router-link>
                  <span v-else class="font-mono text-slate-600 dark:text-slate-400">{{ row.path }}</span>
                </td>
                <td class="px-4 py-2">
                  <div class="flex flex-wrap gap-1.5">
                    <template v-for="(v, vi) in row.values" :key="vi">
                      <a v-if="v.link && v.link.startsWith('http')" :href="v.link" target="_blank" rel="noopener" class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-50 dark:bg-dark-800 border border-slate-200/60 dark:border-dark-600/60 hover:border-brand-200 dark:hover:border-brand-800 text-brand-600 dark:text-brand-400 hover:underline transition-colors break-all">
                        {{ v.label.length > 80 ? v.label.slice(0, 77) + '…' : v.label }}
                        <svg class="w-2.5 h-2.5 flex-shrink-0 opacity-40" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                      </a>
                      <router-link
                        v-else-if="v.link"
                        :to="v.link"
                        class="px-1.5 py-0.5 rounded bg-slate-50 dark:bg-dark-800 border border-slate-200/60 dark:border-dark-600/60 hover:border-brand-200 dark:hover:border-brand-800 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
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
      <div class="rounded-xl border border-slate-200/60 dark:border-dark-600/60 bg-white dark:bg-dark-900 overflow-hidden">
        <div class="px-4 py-2.5 bg-slate-50/80 dark:bg-dark-800/80 border-b border-slate-200/60 dark:border-dark-600/60">
          <h3 class="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-[0.12em]">Related Entities</h3>
        </div>
        <div class="p-4 flex flex-wrap gap-2">
          <!-- SHACL Shapes -->
          <router-link
            v-for="shape in shapes"
            :key="shape.qname"
            :to="`/ontology/${shape.slug}`"
            class="text-xs font-medium px-2.5 py-1.5 rounded-lg border border-purple-300 dark:border-purple-800 bg-purple-100 dark:bg-purple-950/40 text-purple-800 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-950/60 transition-colors inline-flex items-center gap-1.5"
          >
            <span class="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
            {{ shape.qname }}
          </router-link>
          <!-- Dimension class -->
          <router-link
            to="/ontology/isoiec80000-Dimension"
            class="text-xs font-medium px-2.5 py-1.5 rounded-lg border border-indigo-300 dark:border-indigo-800 bg-indigo-100 dark:bg-indigo-950/40 text-indigo-800 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-950/60 transition-colors inline-flex items-center gap-1.5"
          >
            <span class="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
            isoiec80000:Dimension
          </router-link>
          <!-- hasUnit property -->
          <router-link
            to="/ontology/isoiec80000-hasUnit"
            class="text-xs font-medium px-2.5 py-1.5 rounded-lg border border-sky-300 dark:border-sky-800 bg-sky-100 dark:bg-sky-950/40 text-sky-800 dark:text-sky-300 hover:bg-sky-200 dark:hover:bg-sky-950/60 transition-colors inline-flex items-center gap-1.5"
          >
            <span class="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
            isoiec80000:hasUnit
          </router-link>
          <!-- TermEntry class -->
          <router-link
            to="/ontology/smart-TermEntry"
            class="text-xs font-medium px-2.5 py-1.5 rounded-lg border border-emerald-300 dark:border-emerald-800 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-950/60 transition-colors inline-flex items-center gap-1.5"
          >
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            smart:TermEntry
          </router-link>
          <!-- Linked dimension -->
          <router-link
            v-if="unit.dimensionSlug"
            :to="`/dimensions/${unit.dimensionSlug}`"
            class="text-xs font-medium px-2.5 py-1.5 rounded-lg border border-amber-300 dark:border-amber-800 bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-950/60 transition-colors inline-flex items-center gap-1.5"
          >
            <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            Dimension: {{ unit.dimensionRef }}
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>
