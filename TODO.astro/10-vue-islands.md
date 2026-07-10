# 10 — Vue Island Components

## Goal
All Vue components used as islands must be self-contained — receive data as props, never access router or route. Replace any remaining `useRoute()` with props.

## Components That Need Review

### Already Clean (props-based)
- `ThemeToggle.vue` ✅
- `MobileNav.vue` ✅ (receives links + activePath)
- `RecentEntries.vue` ✅ (reads localStorage on mount)
- `GlobalSearch.vue` ✅ (listens for `open-search` event)
- `BackToTop.vue` ✅
- `AppToast.vue` ✅
- `SearchHint.vue` ✅

### Need Props Refactoring
- [ ] `MathRenderer.vue` — receives expression as prop, renders MathML
- [ ] `CitationBuilder.vue` — receives entry + partKey as props
- [ ] `EntryOntologyPanel.vue` — receives entry as prop
- [ ] `UnitOntologyPanel.vue` — receives unit as prop
- [ ] `DimensionOntologyPanel.vue` — receives dimension as prop
- [ ] `OntologySidebar.vue` — receives entities as prop (remove internal useRoute)
- [ ] `OntologyPanelLayout.vue` — receives entity as prop
- [ ] `ClassTreeNode.vue` — receives entity + children as props (recursive)

### Should Become Static .astro Components
- [ ] `IsqLogo.vue` → `IsqLogo.astro` (static SVG, no interactivity)
- [ ] `PartIcon.vue` → `PartIcon.astro` (emoji/text)
- [ ] `ReferenceBadge.vue` → `ReferenceBadge.astro` (static badge)
- [ ] `JsonLd.vue` → inline `<script type="application/ld+json">` in .astro pages

## Pattern
```vue
<script setup lang="ts">
// ✅ GOOD — receive data as props
const props = defineProps<{
  entry: Entry
  partKey: string
}>()

// ❌ BAD — accessing router
import { useRoute } from 'vue-router'  // NEVER
const route = useRoute()                 // NEVER
```
