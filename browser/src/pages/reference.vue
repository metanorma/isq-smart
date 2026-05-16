<script setup lang="ts">
import { getAllParts, partUrl } from '../data/PartRegistry'
import { partEntryCount, loadPartEntries } from '../data/index'
import { jsonLdToTurtle } from '../data/jsonld'
import { useToast } from '../composables/useToast'

const { show: showToast } = useToast()

async function downloadDataset(format: 'jsonld' | 'turtle') {
  const parts = getAllParts().filter(p => !p.parentPart && !p.partKey.includes('-'))
  const allEntries: any[] = []
  for (const part of parts) {
    try {
      const data = await loadPartEntries(part.partKey)
      for (const entry of data.entries) {
        allEntries.push({
          '@id': `isoiec80000:${entry.id}`,
          '@type': entry._tag === 'quantity' ? 'isoiec80000:Quantity' : 'isoiec80000:MathConcept',
          'dcterms:identifier': entry.num,
          'skosxl:prefLabel': entry.designations[0]?.designation.en?.text ?? '',
          'skos:definition': entry.def?.en ?? '',
          'dcterms:isPartOf': `isoiec80000:part-${part.partKey}`,
        })
      }
    } catch { /* skip missing parts */ }
  }

  const context = {
    '@context': {
      '@vocab': 'https://w3id.org/standards/isoiec80000/ontologies/core/',
      dcterms: 'http://purl.org/dc/terms/',
      skos: 'http://www.w3.org/2004/02/skos/core#',
      skosxl: 'http://www.w3.org/2008/05/skos-xl#',
      isoiec80000: 'https://w3id.org/standards/isoiec80000/',
    },
    '@graph': allEntries,
  }

  let content: string
  let filename: string
  let mime: string

  if (format === 'turtle') {
    content = jsonLdToTurtle(context as any)
    filename = 'iso80000-entries.ttl'
    mime = 'text/turtle'
  } else {
    content = JSON.stringify(context, null, 2)
    filename = 'iso80000-entries.jsonld'
    mime = 'application/ld+json'
  }

  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
  showToast(`Downloaded ${filename}`)
}
</script>

<template>
  <div>
    <!-- Hero -->
    <section class="relative overflow-hidden bg-gradient-to-br from-indigo-950 via-indigo-900 to-blue-950">
      <div class="absolute inset-0 hero-pattern" />
      <div class="grain-overlay absolute inset-0" />
      <div class="absolute top-0 right-0 w-[800px] h-[800px] rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 bg-indigo-500/10" />
      <div class="hero-float-1 absolute top-[15%] right-[18%] w-3 h-3 rounded-full bg-indigo-400/20" />
      <div class="hero-float-2 absolute top-[30%] right-[8%] w-2 h-2 rounded-full bg-white/10" />
      <div class="hero-float-4 absolute top-[20%] left-[5%] w-16 h-16 rounded-full border border-white/[0.04]" />
      <div class="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div class="max-w-3xl page-enter">
          <div class="flex items-center gap-2 text-xs text-indigo-300/60 mb-5">
            <router-link to="/" class="hover:text-indigo-200 transition-colors">Home</router-link>
            <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" d="M9 5l7 7-7 7"/></svg>
          </div>
          <div class="text-3xl mb-2">📖</div>
          <h1 class="text-3xl sm:text-4xl font-bold text-white tracking-tight heading-serif">Reference</h1>
          <p class="mt-2 text-sm leading-relaxed max-w-xl text-indigo-300/80">
            How to cite, export, and programmatically access the ISO 80000 &amp; IEC 80000 entries. Every page includes machine-readable JSON-LD, and entries can be exported as RDF Turtle.
          </p>
        </div>
      </div>
      <div class="absolute bottom-0 inset-x-0 h-12 bg-gradient-to-t from-slate-50 dark:from-dark-950 to-transparent z-10" />
    </section>

    <section class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      <!-- URL patterns -->
      <div>
        <h2 class="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight heading-serif mb-6">URL Patterns</h2>
        <div class="grid sm:grid-cols-2 gap-4">
          <div class="group p-5 rounded-xl bg-white dark:bg-dark-800 border border-slate-200/60 dark:border-dark-600/60 hover:border-brand-200 dark:hover:border-brand-700 hover:shadow-sm transition-all">
            <div class="flex items-center gap-2 mb-3">
              <div class="w-7 h-7 rounded-lg bg-brand-50 dark:bg-brand-950/40 flex items-center justify-center">
                <svg class="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6z"/></svg>
              </div>
              <div class="text-xs font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-wider">Domain</div>
            </div>
            <code class="text-sm font-mono text-slate-700 dark:text-slate-300">/quantities</code>
            <span class="text-slate-400 dark:text-slate-500 mx-2 text-xs">or</span>
            <code class="text-sm font-mono text-slate-700 dark:text-slate-300">/math</code>
            <p class="mt-3 text-xs text-slate-500 dark:text-slate-400">Browse all parts within a domain.</p>
          </div>
          <div class="group p-5 rounded-xl bg-white dark:bg-dark-800 border border-slate-200/60 dark:border-dark-600/60 hover:border-brand-200 dark:hover:border-brand-700 hover:shadow-sm transition-all">
            <div class="flex items-center gap-2 mb-3">
              <div class="w-7 h-7 rounded-lg bg-brand-50 dark:bg-brand-950/40 flex items-center justify-center">
                <svg class="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"/></svg>
              </div>
              <div class="text-xs font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-wider">Part</div>
            </div>
            <code class="text-sm font-mono text-slate-700 dark:text-slate-300">/quantities/part-3</code>
            <p class="mt-3 text-xs text-slate-500 dark:text-slate-400">List all entries in a part.</p>
          </div>
          <div class="group p-5 rounded-xl bg-white dark:bg-dark-800 border border-slate-200/60 dark:border-dark-600/60 hover:border-brand-200 dark:hover:border-brand-700 hover:shadow-sm transition-all">
            <div class="flex items-center gap-2 mb-3">
              <div class="w-7 h-7 rounded-lg bg-brand-50 dark:bg-brand-950/40 flex items-center justify-center">
                <svg class="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12H9.75m3 0h.008v.008H12V12.75zm-3 0h.008v.008H9V12.75z"/></svg>
              </div>
              <div class="text-xs font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-wider">Entry</div>
            </div>
            <code class="text-sm font-mono text-slate-700 dark:text-slate-300">/quantities/part-3/t3-1.1</code>
            <p class="mt-3 text-xs text-slate-500 dark:text-slate-400">Individual entry with full definition, units, and JSON-LD.</p>
          </div>
          <div class="group p-5 rounded-xl bg-white dark:bg-dark-800 border border-slate-200/60 dark:border-dark-600/60 hover:border-brand-200 dark:hover:border-brand-700 hover:shadow-sm transition-all">
            <div class="flex items-center gap-2 mb-3">
              <div class="w-7 h-7 rounded-lg bg-brand-50 dark:bg-brand-950/40 flex items-center justify-center">
                <svg class="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5"/></svg>
              </div>
              <div class="text-xs font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-wider">Unit</div>
            </div>
            <code class="text-sm font-mono text-slate-700 dark:text-slate-300">/units/metre</code>
            <p class="mt-3 text-xs text-slate-500 dark:text-slate-400">Unit detail with all linked quantities.</p>
          </div>
        </div>
      </div>

      <!-- URN schemes -->
      <div>
        <h2 class="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight heading-serif mb-4">URN Identifier Schemes</h2>
        <p class="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
          ISO and IEC use different URN schemes for referencing standard content. ISO follows RFC 5141; IEC uses its own internal scheme with date-based edition identifiers.
        </p>
        <div class="grid sm:grid-cols-2 gap-4">
          <!-- ISO URN -->
          <div class="p-5 rounded-xl bg-white dark:bg-dark-800 border border-brand-200/50 dark:border-brand-800/40">
            <div class="flex items-center gap-2 mb-4">
              <img src="/img/logo-iso.svg" alt="ISO" class="h-5 w-auto" />
              <span class="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">RFC 5141 URN</span>
            </div>
            <p class="text-xs text-slate-500 dark:text-slate-400 mb-3">Example: ISO 80000-3, Item 3-1.1</p>
            <div class="px-3 py-2.5 rounded-lg bg-slate-900 dark:bg-dark-700 font-mono text-[11px] text-emerald-400 overflow-x-auto">
              urn:iso:std:iso:80000:-3:ed-2:en:item:3-1.1
            </div>
            <div class="mt-4 space-y-2">
              <div class="flex items-baseline gap-2 text-xs">
                <span class="text-[10px] font-mono text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/40 px-1.5 py-0.5 rounded flex-shrink-0">Part</span>
                <code class="text-slate-600 dark:text-slate-400">urn:iso:std:iso:80000:-3:ed-2:en</code>
              </div>
              <div class="flex items-baseline gap-2 text-xs">
                <span class="text-[10px] font-mono text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/40 px-1.5 py-0.5 rounded flex-shrink-0">Entry</span>
                <code class="text-slate-600 dark:text-slate-400">…:item:3-1.1</code>
              </div>
            </div>
            <p class="mt-3 text-[11px] text-slate-400 dark:text-slate-500 leading-relaxed">
              Uses base part number in the part segment. The <code class="text-slate-500 dark:text-slate-400">:item:</code> fragment type is specific to ISO/IEC 80000 — RFC 5141 supports <code class="text-slate-500 dark:text-slate-400">docelement</code> for clauses, figures, and terms, but not <code class="text-slate-500 dark:text-slate-400">item</code>.
            </p>
          </div>

          <!-- IEC URN -->
          <div class="p-5 rounded-xl bg-white dark:bg-dark-800 border border-teal-200/50 dark:border-teal-800/40">
            <div class="flex items-center gap-2 mb-4">
              <img src="/img/logo-iec.svg" alt="IEC" class="h-5 w-auto" />
              <span class="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">IEC Internal URN</span>
            </div>
            <p class="text-xs text-slate-500 dark:text-slate-400 mb-3">Example: IEC 80000-6, Item 6-42.1</p>
            <div class="space-y-2">
              <div>
                <div class="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Database form (used here)</div>
                <div class="px-3 py-2.5 rounded-lg bg-slate-900 dark:bg-dark-700 font-mono text-[11px] text-emerald-400 overflow-x-auto">
                  urn:iec:std:iec:80000-6-42.1:2022-11:::
                </div>
              </div>
              <div>
                <div class="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Component form</div>
                <div class="px-3 py-2.5 rounded-lg bg-slate-900 dark:bg-dark-700 font-mono text-[11px] text-slate-500 overflow-x-auto">
                  urn:iec:std:iec:80000-6:2022-11:::#item-6-42.1
                </div>
              </div>
            </div>
            <div class="mt-4 space-y-2">
              <div class="flex items-baseline gap-2 text-xs">
                <span class="text-[10px] font-mono text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/40 px-1.5 py-0.5 rounded flex-shrink-0">Part</span>
                <code class="text-slate-600 dark:text-slate-400">urn:iec:std:iec:80000-6:2022-11:::</code>
              </div>
              <div class="flex items-baseline gap-2 text-xs">
                <span class="text-[10px] font-mono text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/40 px-1.5 py-0.5 rounded flex-shrink-0">Entry</span>
                <code class="text-slate-600 dark:text-slate-400">urn:iec:std:iec:80000-6-42.1:2022-11:::</code>
              </div>
            </div>
            <p class="mt-3 text-[11px] text-slate-400 dark:text-slate-500 leading-relaxed">
              IEC uses a date-based edition identifier (e.g. <code class="text-slate-500 dark:text-slate-400">2022-11</code>). The database form embeds the item number directly in the namespace path rather than as a fragment.
            </p>
          </div>
        </div>
      </div>

      <!-- Citation formats -->
      <div>
        <h2 class="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight heading-serif mb-6">Citation Formats</h2>
        <p class="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
          Every entry page provides citation and export options:
        </p>
        <div class="grid sm:grid-cols-2 gap-4">
          <div class="p-5 rounded-xl bg-white dark:bg-dark-800 border border-slate-200/60 dark:border-dark-600/60 hover:border-amber-200 dark:hover:border-amber-700 hover:shadow-sm transition-all">
            <div class="flex items-center gap-2 mb-2">
              <div class="w-2 h-2 rounded-full bg-amber-400" />
              <h3 class="text-sm font-semibold text-slate-800 dark:text-slate-200">URN</h3>
            </div>
            <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">Stable URN identifier (ISO RFC 5141 or IEC scheme).</p>
            <div class="mt-3 px-3 py-2 rounded-lg bg-slate-900 dark:bg-dark-700 font-mono text-[11px] text-emerald-400 overflow-x-auto">
              urn:iso:std:iso:80000:-3:ed-2:en:item:3-1.1
            </div>
          </div>
          <div class="p-5 rounded-xl bg-white dark:bg-dark-800 border border-slate-200/60 dark:border-dark-600/60 hover:border-amber-200 dark:hover:border-amber-700 hover:shadow-sm transition-all">
            <div class="flex items-center gap-2 mb-2">
              <div class="w-2 h-2 rounded-full bg-brand-400" />
              <h3 class="text-sm font-semibold text-slate-800 dark:text-slate-200">BibTeX</h3>
            </div>
            <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">Standard bibliographic format for LaTeX papers.</p>
            <div class="mt-3 px-3 py-2 rounded-lg bg-slate-900 dark:bg-dark-700 font-mono text-[11px] text-slate-400 overflow-x-auto whitespace-pre">@standard{iso80000-3-2019-3-1-1,
  title = {ISO 80000-3},
  year = {2019}}</div>
          </div>
          <div class="p-5 rounded-xl bg-white dark:bg-dark-800 border border-slate-200/60 dark:border-dark-600/60 hover:border-amber-200 dark:hover:border-amber-700 hover:shadow-sm transition-all">
            <div class="flex items-center gap-2 mb-2">
              <div class="w-2 h-2 rounded-full bg-violet-400" />
              <h3 class="text-sm font-semibold text-slate-800 dark:text-slate-200">RDF Turtle</h3>
            </div>
            <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">W3C RDF serialization for linked data.</p>
            <div class="mt-3 px-3 py-2 rounded-lg bg-slate-900 dark:bg-dark-700 font-mono text-[11px] text-slate-400 overflow-x-auto whitespace-pre">@prefix isoiec80000: &lt;...&gt; .
@prefix smart: &lt;...&gt; .</div>
          </div>
          <div class="p-5 rounded-xl bg-white dark:bg-dark-800 border border-slate-200/60 dark:border-dark-600/60 hover:border-amber-200 dark:hover:border-amber-700 hover:shadow-sm transition-all">
            <div class="flex items-center gap-2 mb-2">
              <div class="w-2 h-2 rounded-full bg-teal-400" />
              <h3 class="text-sm font-semibold text-slate-800 dark:text-slate-200">JSON-LD</h3>
            </div>
            <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">Linked data format embedded in every page.</p>
            <div class="mt-3 px-3 py-2 rounded-lg bg-slate-900 dark:bg-dark-700 font-mono text-[11px] text-slate-400 overflow-x-auto whitespace-pre">{
  "@type": "isoiec80000:Quantity",
  "dcterms:identifier": "3-1.1"
}</div>
          </div>
        </div>
      </div>

      <!-- Data sources -->
      <div>
        <h2 class="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight heading-serif mb-6">Data Sources</h2>
        <div class="grid sm:grid-cols-3 gap-4">
          <div class="p-5 rounded-xl bg-white dark:bg-dark-800 border border-slate-200/60 dark:border-dark-600/60 hover:border-brand-200 dark:hover:border-brand-700 hover:shadow-sm transition-all">
            <div class="w-9 h-9 rounded-lg bg-brand-50 dark:bg-brand-950/40 flex items-center justify-center mb-3">
              <svg class="w-4.5 h-4.5 text-brand-600 dark:text-brand-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"/></svg>
            </div>
            <h3 class="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">ISO 80000 &amp; IEC 80000</h3>
            <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Quantities, units, and definitions from the official dataset. Content copyright &copy; ISO and IEC.
            </p>
          </div>
          <div class="p-5 rounded-xl bg-white dark:bg-dark-800 border border-slate-200/60 dark:border-dark-600/60 hover:border-brand-200 dark:hover:border-brand-700 hover:shadow-sm transition-all">
            <div class="w-9 h-9 rounded-lg bg-violet-50 dark:bg-violet-950/40 flex items-center justify-center mb-3">
              <svg class="w-4.5 h-4.5 text-violet-600 dark:text-violet-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125"/></svg>
            </div>
            <h3 class="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">UnitsDB &amp; UnitsML</h3>
            <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Cross-referenced units database providing symbol mapping and quantity-unit relationships.
            </p>
          </div>
          <div class="p-5 rounded-xl bg-white dark:bg-dark-800 border border-slate-200/60 dark:border-dark-600/60 hover:border-brand-200 dark:hover:border-brand-700 hover:shadow-sm transition-all">
            <div class="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center mb-3">
              <svg class="w-4.5 h-4.5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5"/></svg>
            </div>
            <h3 class="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">SMART Ontology</h3>
            <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Information model annotations from the SmartSDU Core Ontology for machine-readable standards.
            </p>
          </div>
        </div>
      </div>

      <!-- Parts overview -->
      <div>
        <h2 class="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight heading-serif mb-6">Parts Overview</h2>
        <div class="grid sm:grid-cols-2 gap-2">
          <router-link
            v-for="part in getAllParts()"
            :key="part.partKey"
            :to="partUrl(part.partKey)"
            class="group flex items-center gap-3 px-4 py-3 rounded-xl bg-white dark:bg-dark-800 border border-slate-200/60 dark:border-dark-600/60 hover:border-brand-200 dark:hover:border-brand-700 hover:shadow-sm transition-all"
          >
            <span class="text-lg leading-none">{{ part.icon }}</span>
            <div class="min-w-0 flex-1">
              <div class="text-xs font-semibold text-slate-700 dark:text-slate-300 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">Part {{ part.partKey }}</div>
              <div class="text-[11px] text-slate-500 dark:text-slate-400 truncate">{{ part.title }}</div>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-[10px] text-slate-400 dark:text-slate-500 font-mono tabular-nums">{{ partEntryCount(part.partKey) }}</span>
              <svg class="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 group-hover:text-brand-500 dark:group-hover:text-brand-400 group-hover:translate-x-0.5 transition-all" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" d="M9 5l7 7-7 7"/></svg>
            </div>
          </router-link>
        </div>
      </div>

      <!-- Dataset Downloads -->
      <div>
        <h2 class="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight heading-serif mb-4">Dataset Downloads</h2>
        <p class="text-sm text-slate-500 dark:text-slate-400 mb-6">Download the complete ISO &amp; IEC 80000 entry dataset in machine-readable linked data formats for semantic web consumption.</p>
        <div class="grid sm:grid-cols-2 gap-4">
          <button
            @click="downloadDataset('jsonld')"
            class="group flex items-start gap-4 p-5 rounded-xl bg-white dark:bg-dark-800 border border-slate-200/60 dark:border-dark-600/60 hover:border-brand-200 dark:hover:border-brand-700 hover:shadow-sm transition-all text-left"
          >
            <div class="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center text-emerald-600 flex-shrink-0">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
            </div>
            <div>
              <div class="font-semibold text-slate-900 dark:text-slate-100 text-sm group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">JSON-LD</div>
              <div class="text-xs text-slate-400 dark:text-slate-500 mt-1">Complete entry dataset as JSON-LD with UnitsML vocabulary context</div>
            </div>
          </button>
          <button
            @click="downloadDataset('turtle')"
            class="group flex items-start gap-4 p-5 rounded-xl bg-white dark:bg-dark-800 border border-slate-200/60 dark:border-dark-600/60 hover:border-brand-200 dark:hover:border-brand-700 hover:shadow-sm transition-all text-left"
          >
            <div class="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center text-blue-600 flex-shrink-0">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
            </div>
            <div>
              <div class="font-semibold text-slate-900 dark:text-slate-100 text-sm group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">RDF Turtle</div>
              <div class="text-xs text-slate-400 dark:text-slate-500 mt-1">Complete entry dataset as RDF Turtle with SKOS-XL and Dublin Core terms</div>
            </div>
          </button>
        </div>
      </div>

      <!-- Copyright -->
      <div class="pt-8 border-t border-slate-200/60 dark:border-dark-600/60">
        <h2 class="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight heading-serif mb-6">Copyright &amp; Attribution</h2>
        <div class="p-5 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/40 dark:border-amber-800/30 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          <p>
            Content from the ISO 80000 &amp; IEC 80000 series is copyright &copy; ISO and IEC. All rights reserved.
            This browser is provided for reference purposes. For the authoritative text of the standard,
            please consult the official ISO and IEC publications.
          </p>
          <p class="mt-2">
            Browser &copy; 2025&ndash;2026. Data sourced from ISO 80000 &amp; IEC 80000 datasets and UnitsDB.
          </p>
        </div>
      </div>
    </section>
  </div>
</template>
