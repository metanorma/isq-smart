import { JsonLdSerializer } from './JsonLdSerializer'
import { TurtleSerializer } from './TurtleSerializer'

export { jsonLdContextUrl, jsonLdContext, ttlKnownPrefixes, isKnownTtlPrefix } from './RdfContext'
export { JsonLdSerializer } from './JsonLdSerializer'
export { TurtleSerializer } from './TurtleSerializer'

export function generateEntryJsonLd(
  entry: Parameters<typeof JsonLdSerializer.forEntry>[0],
  meta: Parameters<typeof JsonLdSerializer.forEntry>[1],
  edition: Parameters<typeof JsonLdSerializer.forEntry>[2],
  options?: Parameters<typeof JsonLdSerializer.forEntry>[3],
) {
  return JsonLdSerializer.forEntry(entry, meta, edition, options)
}

export function generateKindJsonLd(kind: Parameters<typeof JsonLdSerializer.forKind>[0]) {
  return JsonLdSerializer.forKind(kind)
}

export function generateEntityJsonLd(entity: Parameters<typeof JsonLdSerializer.forEntity>[0]) {
  return JsonLdSerializer.forEntity(entity)
}

export function generateIndexJsonLd(parts: Parameters<typeof JsonLdSerializer.forIndex>[0]) {
  return JsonLdSerializer.forIndex(parts)
}

export function jsonLdToTurtle(data: Record<string, unknown>): string {
  return TurtleSerializer.fromJsonLd(data)
}
