<script setup lang="ts">
const props = defineProps<{ expression: string; cache?: Record<string, string> }>()

function getHtml(): string {
  return props.cache?.[props.expression] ?? ''
}
</script>

<template>
  <span v-if="getHtml()" class="math-render inline-flex items-baseline" v-html="getHtml()" />
  <code v-else class="font-mono text-brand-700 dark:text-brand-400 text-sm">{{ expression }}</code>
</template>

<style scoped>
.math-render { animation: fadeIn 0.2s ease-out; }
@keyframes fadeIn { from { opacity: 0.6; } to { opacity: 1; } }
</style>
