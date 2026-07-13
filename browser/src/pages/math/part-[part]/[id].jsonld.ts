import type { APIRoute } from 'astro'
import { DataLoader } from '../../../data/DataLoader'
import { getPartMeta, getPartsByDomain } from '../../../data/PartRegistry'
import { generateEntryJsonLd } from '../../../data/serialization'
import type { Entry } from '../../../data/types'

export async function getStaticPaths() {
  const parts = getPartsByDomain('math')
  const paths = []
  for (const p of parts) {
    const data = await DataLoader.loadPart(p.partKey)
    // Deduplicate by entry ID — keep last (latest edition) when multiple editions exist
    const byId = new Map<string, Entry>()
    for (const entry of data.entries) byId.set(entry.id, entry)
    for (const [id, entry] of byId) {
      paths.push({
        params: { part: p.partKey, id },
        props: { entry, partKey: p.partKey },
      })
    }
  }
  return paths
}

export const GET: APIRoute = ({ props }) => {
  const { entry, partKey } = props as { entry: Entry; partKey: string }
  const meta = getPartMeta(partKey)!
  const jsonLd = generateEntryJsonLd(entry, meta, entry.edition)
  return new Response(JSON.stringify(jsonLd, null, 2), {
    headers: { 'Content-Type': 'application/ld+json' },
  })
}
