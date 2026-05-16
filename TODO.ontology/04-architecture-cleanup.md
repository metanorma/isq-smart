# 04: Architecture Cleanup

## Goal
Remove `/smartsdu` namespace entirely. Instance data and ontology are separate top-level concerns.

## Route Changes

### Remove
- `/smartsdu` — delete `smartsdu.vue`
- `/smartsdu/documents` — redirect to `/documents`

### Keep (already migrated)
- `/` — home page
- `/quantities/part-:part/:id` — entry detail
- `/math/part-:part/:id` — math entry detail
- `/ontology` — ontology browser
- `/ontology/:slug` — entity detail
- `/documents` — document listing
- `/documents/:partKey` — document sections
- `/documents/:partKey/:sectionId` — section detail

### Rename routes
- `/smartsdu/documents/:id` → `/documents/detail/:id` (or merge into existing document routes)
- `/smartsdu/provisions/:partKey` → `/provisions/:partKey`
- `/smartsdu/provision/:id` → `/provisions/:id`

## File Changes
- [ ] Delete `smartsdu.vue`
- [ ] Update `router.ts` — remove `/smartsdu` routes, add top-level replacements
- [ ] Update any internal links referencing `/smartsdu/...`
- [ ] Verify build passes after cleanup
