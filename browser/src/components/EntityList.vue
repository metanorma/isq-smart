<script setup lang="ts">
import { computed } from 'vue'
import type { EntityConcept, EntityKind } from '../data/ontology'
import { asset } from '../lib/asset'

interface EntityLink {
  entity: EntityConcept
  kind?: EntityKind
}

const props = defineProps<{
  entityIds: string[]
  entities?: EntityConcept[]
  entityKinds?: EntityKind[]
}>()

const links = computed<EntityLink[]>(() => {
  if (!props.entities) return []
  const kindMap = new Map((props.entityKinds ?? []).map(k => [k.id, k]))
  return props.entityIds
    .map(id => props.entities!.find(e => e.id === id))
    .filter((e): e is EntityConcept => e !== undefined)
    .map(entity => ({
      entity,
      kind: entity.kindId ? kindMap.get(entity.kindId) : undefined,
    }))
})
</script>

<template>
  <div v-if="links.length > 0">
    <h4 class="text-xs font-bold uppercase tracking-wider text-rose-500 dark:text-rose-400 mb-2">Characterizes</h4>
    <div class="flex flex-wrap gap-1.5">
      <span
        v-for="link in links"
        :key="link.entity.id"
        class="inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-100/60 dark:border-rose-800/40"
        :title="link.kind ? `Kind: ${link.kind.prefLabel.en}` : undefined"
      >
        <span class="text-xs">●</span>
        {{ link.entity.prefLabel.en }}
      </span>
    </div>
  </div>
</template>
