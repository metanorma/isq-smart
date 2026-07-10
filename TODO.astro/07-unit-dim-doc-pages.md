# 07 — Unit, Dimension & Document Pages

## Goal
Rewrite remaining detail pages as native `.astro`.

## Pages & Sources

| Route | Astro file | Source Vue component |
|-------|-----------|---------------------|
| `/units/{slug}` | `units/[slug].astro` | `UnitPage.vue` |
| `/dimensions/{slug}` | `dimensions/[slug].astro` | `DimensionDetailPage.vue` |
| `/documents/part-{part}` | `documents/part-[part].astro` | `DocumentPartPage.vue` |
| `/documents/{id}` | `documents/[id].astro` | `DocumentDetailPage.vue` |
| `/documents/{partKey}/sections` | `documents/[partKey]/sections.astro` | `DocumentSectionsPage.vue` |
| `/documents/{partKey}/sections/{sectionId}` | `documents/[partKey]/sections/[sectionId].astro` | `DocumentSectionDetailPage.vue` |

## Tasks
- [ ] Rewrite units/[slug].astro — unit detail with quantities list
- [ ] Rewrite dimensions/[slug].astro — dimension detail with base dim breakdown
- [ ] Rewrite documents/part-[part].astro — document overview
- [ ] Rewrite documents/[id].astro — document detail
- [ ] Rewrite documents/[partKey]/sections.astro — section list
- [ ] Rewrite documents/[partKey]/sections/[sectionId].astro — section detail
- [ ] Delete all wrapper components
