<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue'
import { useTheme } from '../composables/useTheme'

const props = defineProps<{
  chart: string
}>()

const container = ref<HTMLDivElement>()
const rendered = ref(false)
const { isDark } = useTheme()

async function renderChart() {
  if (!container.value) return
  rendered.value = false

  const { default: mermaid } = await import('mermaid')

  mermaid.initialize({
    startOnLoad: false,
    theme: isDark.value ? 'dark' : 'default',
    securityLevel: 'loose',
    flowchart: { useMaxWidth: true, htmlLabels: true },
    class: { useMaxWidth: true },
  })

  try {
    const id = `mermaid-${Date.now()}`
    const { svg } = await mermaid.render(id, props.chart)
    if (container.value) {
      container.value.innerHTML = svg
    }
    rendered.value = true
  } catch (e) {
    console.error('Mermaid render error:', e)
  }
}

onMounted(async () => {
  await nextTick()
  await renderChart()
})

watch(isDark, async () => {
  await renderChart()
})
</script>

<template>
  <div class="mermaid-container w-full overflow-x-auto">
    <div v-if="!rendered" class="flex items-center justify-center py-12">
      <div class="animate-pulse text-sm text-slate-400">Rendering diagram...</div>
    </div>
    <div ref="container" class="mermaid-output flex justify-center" v-show="rendered"></div>
  </div>
</template>

<style scoped>
.mermaid-output :deep(svg) {
  max-width: 100%;
  height: auto;
}
</style>
