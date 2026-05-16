import { ref, type Ref } from 'vue'

const collapsedState: Ref<Set<string>> = ref(new Set<string>())
let initialized = false

export function useOntologySidebar() {
  if (!initialized) {
    initialized = true
    // Will be populated on first component mount via initCollapsed()
  }

  function initCollapsed(keys: string[]) {
    if (!initialized || collapsedState.value.size === 0) {
      collapsedState.value = new Set(keys)
    }
  }

  return { collapsed: collapsedState, initCollapsed }
}
