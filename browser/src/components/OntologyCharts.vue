<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, shallowRef } from 'vue'

const props = defineProps<{
  typeLabels: string[]
  typeCounts: number[]
  typeColors: string[]
  ontoLabels: string[]
  ontoCounts: number[]
  ontoColors: string[]
}>()

const typeCanvas = ref<HTMLCanvasElement>()
const ontoCanvas = ref<HTMLCanvasElement>()
const charts = shallowRef<unknown[]>([])

onMounted(async () => {
  if (!typeCanvas.value || !ontoCanvas.value) return
  const { Chart, registerables } = await import('chart.js')
  Chart.register(...registerables)
  const isDark = document.documentElement.classList.contains('dark')

  const typeChart = new Chart(typeCanvas.value, {
    type: 'bar',
    data: {
      labels: props.typeLabels,
      datasets: [{
        data: props.typeCounts,
        backgroundColor: props.typeColors.map(c => c + (isDark ? '66' : '33')),
        borderColor: props.typeColors.map(c => isDark ? c + 'cc' : c),
        borderWidth: 1.5,
        borderRadius: 6,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true, ticks: { stepSize: 5, color: isDark ? '#a89ea6' : '#64748b' } },
        x: { ticks: { font: { size: 10 }, color: isDark ? '#a89ea6' : '#64748b' } },
      },
    },
  })

  const ontoChart = new Chart(ontoCanvas.value, {
    type: 'doughnut',
    data: {
      labels: props.ontoLabels,
      datasets: [{
        data: props.ontoCounts,
        backgroundColor: props.ontoColors.map(c => c + (isDark ? 'bb' : '99')),
        borderColor: isDark ? '#1e0f18' : '#fff',
        borderWidth: 2,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom', labels: { font: { size: 11 }, padding: 16, color: isDark ? '#a89ea6' : '#374151' } },
      },
    },
  })

  charts.value = [typeChart, ontoChart]
})

onBeforeUnmount(() => {
  for (const c of charts.value) {
    // Chart.js instances have a destroy() method
    ;(c as { destroy?: () => void }).destroy?.()
  }
})
</script>

<template>
  <!-- Entity type bar chart -->
  <div class="rounded-2xl border border-slate-200/80 dark:border-dark-600/80 bg-white dark:bg-dark-800 p-6">
    <h3 class="text-sm font-bold text-slate-700 dark:text-slate-200 mb-4">Entity Distribution</h3>
    <div class="h-64">
      <canvas ref="typeCanvas"></canvas>
    </div>
  </div>

  <!-- Ontology breakdown doughnut -->
  <div class="rounded-2xl border border-slate-200/80 dark:border-dark-600/80 bg-white dark:bg-dark-800 p-6">
    <h3 class="text-sm font-bold text-slate-700 dark:text-slate-200 mb-4">Ontology Breakdown</h3>
    <div class="h-56">
      <canvas ref="ontoCanvas"></canvas>
    </div>
  </div>
</template>
