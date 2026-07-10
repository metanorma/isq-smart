# 03 — Dead Code Removal

## Components to Delete (verified unused)
- [ ] `SiteHeader.vue` — replaced by static HTML in DefaultLayout.astro. Verify no imports, then delete.
- [ ] `JsonLd.vue` — replaced by inline `<script type="application/ld+json" set:html={...} />` in pages. Verify, then delete.
- [ ] `OntologySidebar.vue` — not imported by any page. The ontology pages inline the sidebar. Verify, then delete.

## Components to Verify Usage First
- [ ] `JsonLdActions.vue` — check if any .astro page imports it
- [ ] `LanguageToggle.vue` — check if any .astro page imports it
- [ ] `PartIcon.vue` — check if any .astro page imports it
- [ ] `ReferenceBadge.vue` — check if any .astro page imports it
- [ ] `IsqLogo.vue` — used by about.astro, KEEP

## Composables to Delete
- [ ] `useEntry.ts` — was used by deleted EntryPage.vue, verify no imports
- [ ] `usePartData.ts` — was used by deleted PartPage.vue, verify no imports
- [ ] `useOntologySidebar.ts` — was used by dead OntologySidebar.vue, verify no imports

## SiteConfig Cleanup
- [ ] Remove `asset()` method from SiteConfig (dead code, replaced by `src/lib/asset.ts`)
- [ ] Keep `isExcluded()` and `excludedParts` (still used by build plugins)

## Rules
- Before deleting, grep for ALL imports: `grep -rn "ComponentName" src/`
- If any file imports it, do NOT delete — investigate first
- Per CLAUDE.md: "NEVER DELETE any file you did not create" — these are files I created during migration, so deletion is safe
