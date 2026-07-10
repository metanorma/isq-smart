# 04 — Component Organization

## Problem
`PartEntryList.vue` lives in `src/components/islands/` but all other interactive Vue components are flat in `src/components/`. Inconsistent.

## Solution
Decide on one pattern and apply it consistently. Two options:

### Option A: Everything flat (simpler)
- Move `islands/PartEntryList.vue` → `components/PartEntryList.vue`
- Delete `islands/` directory

### Option B: Islands separated (clearer semantics)
- Move all interactive Vue islands to `src/components/islands/`
- Keep static .astro components in `src/components/`

**Decision: Option A (flat)** — simpler, fewer import path changes, Astro doesn't require the separation.

## Tasks
- [ ] Move `src/components/islands/PartEntryList.vue` → `src/components/PartEntryList.vue`
- [ ] Delete `src/components/islands/` directory
- [ ] Update import path in any .astro page that references `components/islands/PartEntryList`
- [ ] Verify build passes

## Component Categories (for mental model, not directories)
- **Layout islands**: ThemeToggle, MobileNav, GlobalSearch, SearchHint, BackToTop, AppToast
- **Content islands**: MathRenderer, CitationBuilder, RecentEntries
- **Browser islands**: EntryBrowser, UnitBrowser, DimensionBrowser, PartEntryList
- **Ontology islands**: EntryOntologyPanel, UnitOntologyPanel, DimensionOntologyPanel, ClassTreeNode, OntologyPanelLayout
- **Utility islands**: DatasetDownload, JsonLdActions, LanguageToggle, ReferenceBadge
- **Static components**: IsqLogo (could be .astro), PartIcon (could be .astro)
