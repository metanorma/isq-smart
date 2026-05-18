<script setup lang="ts">
import { jsonLdToTurtle } from '../data/jsonld'
import { useToast } from '../composables/useToast'

const toast = useToast()

const props = defineProps<{
  data: Record<string, unknown>
  filename: string
}>()

function downloadJsonLd() {
  const json = JSON.stringify(props.data, null, 2)
  const blob = new Blob([json], { type: 'application/ld+json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = props.filename
  a.click()
  URL.revokeObjectURL(url)
  toast.show('JSON-LD downloaded')
}

function downloadTurtle() {
  const ttl = jsonLdToTurtle(props.data)
  const blob = new Blob([ttl], { type: 'text/turtle' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = props.filename.replace(/\.jsonld$/, '.ttl')
  a.click()
  URL.revokeObjectURL(url)
  toast.show('Turtle downloaded')
}

function viewJsonLd() {
  const json = JSON.stringify(props.data, null, 2)
  const dark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const w = window.open('', '_blank')
  if (w) {
    const bg = dark ? '#0f1219' : '#f8fafc'
    const fg = dark ? '#e2e8f0' : '#1e293b'
    w.document.write(`<pre style="font-family:monospace;font-size:13px;padding:2rem;background:${bg};color:${fg};min-height:100vh;margin:0">${json.replace(/</g, '&lt;')}</pre>`)
    w.document.title = props.filename
  }
}
</script>

<template>
  <div class="flex items-center gap-1.5">
    <button @click="downloadJsonLd" class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 bg-slate-100/80 dark:bg-dark-800 border border-slate-200/60 dark:border-dark-600/60 hover:bg-slate-200 dark:hover:bg-dark-700 hover:text-slate-800 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-dark-500 transition-all" :title="`Download ${filename}`">
      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
      JSON-LD
    </button>
    <button @click="downloadTurtle" class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-dark-800/50 border border-slate-200/60 dark:border-dark-600/60 hover:bg-slate-100 dark:hover:bg-dark-700 hover:text-slate-700 dark:hover:text-slate-300 hover:border-slate-300 dark:hover:border-dark-500 transition-all" title="Download RDF Turtle">
      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
      TTL
    </button>
    <button @click="viewJsonLd" class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-dark-800/50 border border-slate-200/60 dark:border-dark-600/60 hover:bg-slate-100 dark:hover:bg-dark-700 hover:text-slate-700 dark:hover:text-slate-300 hover:border-slate-300 dark:hover:border-dark-500 transition-all" title="View JSON-LD in new tab">
      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"/></svg>
      View
    </button>
  </div>
</template>
