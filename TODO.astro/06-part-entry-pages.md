# 06 — Part & Entry Detail Pages

## Goal
Rewrite part listing and entry detail pages as native `.astro` with `getStaticPaths()`.

## Pages & Sources

| Route | Astro file | Source Vue component |
|-------|-----------|---------------------|
| `/quantities/part-{part}` | `quantities/part-[part].astro` | `PartPage.vue` |
| `/quantities/part-{part}/{id}` | `quantities/part-[part]/[id].astro` | `EntryPage.vue` |
| `/math/part-{part}` | `math/part-[part].astro` | `PartPage.vue` |
| `/math/part-{part}/{id}` | `math/part-[part]/[id].astro` | `EntryPage.vue` |

## Pattern
```astro
---
import DefaultLayout from '../../layouts/DefaultLayout.astro'
import { getPartsByDomain, getPartMeta } from '../../data/index'
import { DataLoader } from '../../data/DataLoader'
import EntryOntologyPanel from '../../components/EntryOntologyPanel.vue'
import CitationBuilder from '../../components/CitationBuilder.vue'

export async function getStaticPaths() {
  const parts = getPartsByDomain('quantities')
  const paths = []
  for (const p of parts) {
    const data = await DataLoader.loadPart(p.partKey)
    for (const entry of data.entries) {
      paths.push({
        params: { part: p.partKey, id: entry.id },
        props: { entry, partKey: p.partKey },
      })
    }
  }
  return paths
}
const { entry, partKey } = Astro.props
---
<DefaultLayout>
  <!-- static entry content -->
  <CitationBuilder client:idle entry={entry} partKey={partKey} />
  <EntryOntologyPanel client:idle entry={entry} />
</DefaultLayout>
```

## Key Decisions
- Entry data fetched at build time via `DataLoader.loadPart()` in `getStaticPaths`
- Static content (definitions, symbols, units, remarks) rendered as HTML
- Interactive parts (citation builder, ontology panel, RDF export) as Vue islands
- `MathRenderer` → `client:visible` for math expressions

## Tasks
- [ ] Rewrite quantities/part-[part].astro (part listing)
- [ ] Rewrite quantities/part-[part]/[id].astro (entry detail)
- [ ] Rewrite math/part-[part].astro
- [ ] Rewrite math/part-[part]/[id].astro
- [ ] Delete PartPage.vue and EntryPage.vue wrappers
