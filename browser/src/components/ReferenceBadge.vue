<script setup lang="ts">
import { computed, ref } from 'vue'
import { partUrn, entryUrn } from '../data/urn'
import { useToast } from '../composables/useToast'

const toast = useToast()

const props = defineProps<{
  part: string
  edition?: string
  entryNum?: string
  bilingual?: boolean
}>()

const urn = computed(() => {
  if (!props.edition) return ''
  if (props.entryNum) return entryUrn({ num: props.entryNum }, props.part, props.edition)
  return partUrn(props.part, props.edition)
})

const copied = ref(false)

function copyUrn() {
  if (!urn.value) return
  navigator.clipboard?.writeText(urn.value)
  copied.value = true
  toast.show('URN copied to clipboard')
  setTimeout(() => { copied.value = false }, 1500)
}
</script>

<template>
  <div v-if="urn" class="flex items-center gap-2">
    <div class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-dark-800 border border-slate-200/60 dark:border-dark-600/60 transition-colors" :class="{ 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200/60 dark:border-emerald-700/60': copied }">
      <span class="text-[10px] font-semibold uppercase tracking-wider transition-colors" :class="copied ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'">{{ copied ? 'Copied' : 'URN' }}</span>
      <code class="text-[11px] font-mono select-all break-all transition-colors" :class="copied ? 'text-emerald-700 dark:text-emerald-300' : 'text-brand-700 dark:text-brand-400'">{{ urn }}</code>
      <a to="/reference/urn-patterns" class="ml-0.5 text-slate-300 dark:text-slate-600 hover:text-brand-500 dark:hover:text-brand-400 transition-colors" title="URN pattern documentation">
        <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><circle cx="12" cy="17" r="0.5"/></svg>
      </a>
    </div>
    <button @click="copyUrn" class="p-1.5 rounded-lg transition-all" :class="copied ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30' : 'text-slate-400 dark:text-slate-500 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-950/30'" :title="copied ? 'Copied!' : 'Copy URN'">
      <svg v-if="!copied" class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
      <svg v-else class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>
    </button>
  </div>
</template>
