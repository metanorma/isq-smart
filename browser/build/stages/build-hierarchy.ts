import { writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import type { RawEntry } from '../types'
import type { BuildContext } from '../buildContext'
import type { ConceptHierarchy, HierarchyEntry } from '../../src/data/ontology'

const SPECIFICITY_PREFIXES: Array<{ prefix: RegExp; strip: (s: string) => string }> = [
  { prefix: /^specific\s+/i, strip: (s) => s.replace(/^specific\s+/i, '') },
  { prefix: /^massic\s+/i, strip: (s) => s.replace(/^massic\s+/i, '') },
  { prefix: /^volumic\s+/i, strip: (s) => s.replace(/^volumic\s+/i, '') },
  { prefix: /^lineic\s+/i, strip: (s) => s.replace(/^lineic\s+/i, '') },
  { prefix: /^areic\s+/i, strip: (s) => s.replace(/^areic\s+/i, '') },
  { prefix: /^molar\s+/i, strip: (s) => s.replace(/^molar\s+/i, '') },
  { prefix: /^relative\s+/i, strip: (s) => s.replace(/^relative\s+/i, '') },
  { prefix: /^differential\s+/i, strip: (s) => s.replace(/^differential\s+/i, '') },
  { prefix: /^mean\s+/i, strip: (s) => s.replace(/^mean\s+/i, '') },
]

function primaryDesignationText(entry: RawEntry): string {
  return entry.designations[0]?.designation.en?.text ?? ''
}

function findBaseEntry(rawEntries: readonly RawEntry[], baseName: string): RawEntry | undefined {
  return rawEntries.find((e) => {
    const text = primaryDesignationText(e).toLowerCase()
    return text === baseName.toLowerCase()
  })
}

function deriveNamingPatternLinks(
  rawEntries: readonly RawEntry[],
): Map<string, string[]> {
  const broaderFor: Map<string, string[]> = new Map()

  for (const entry of rawEntries) {
    const name = primaryDesignationText(entry)
    for (const { prefix, strip } of SPECIFICITY_PREFIXES) {
      if (!prefix.test(name)) continue
      const baseName = strip(name)
      const base = findBaseEntry(rawEntries, baseName)
      if (!base || base.id === entry.id) continue
      const list = broaderFor.get(entry.id) ?? []
      if (!list.includes(base.id)) list.push(base.id)
      broaderFor.set(entry.id, list)
    }
  }

  return broaderFor
}

export interface HierarchyBuildResult {
  hierarchy: ConceptHierarchy
}

export function buildHierarchy(
  rawEntries: readonly RawEntry[],
  kindResult: { quantityToKind: Record<string, string>; kinds: readonly { id: string; quantityIds: readonly string[] }[] },
  ctx: BuildContext,
  generatedDir: string,
): HierarchyBuildResult {
  const adjacency = new Map<string, { broader: Set<string>; narrower: Set<string> }>()

  function ensureNode(id: string): { broader: Set<string>; narrower: Set<string> } {
    let node = adjacency.get(id)
    if (!node) {
      node = { broader: new Set(), narrower: new Set() }
      adjacency.set(id, node)
    }
    return node
  }

  function link(narrowerId: string, broaderId: string): void {
    ensureNode(narrowerId).broader.add(broaderId)
    ensureNode(broaderId).narrower.add(narrowerId)
  }

  for (const kind of kindResult.kinds) {
    for (const quantityId of kind.quantityIds) {
      link(quantityId, kind.id)
    }
  }

  const namingLinks = deriveNamingPatternLinks(rawEntries)
  for (const [narrowerId, broaderIds] of namingLinks) {
    for (const broaderId of broaderIds) {
      link(narrowerId, broaderId)
    }
  }

  const hierarchy: ConceptHierarchy = {}
  for (const [id, { broader, narrower }] of adjacency) {
    const entry: HierarchyEntry = {
      broader: [...broader].sort(),
      narrower: [...narrower].sort(),
    }
    hierarchy[id] = entry
  }

  writeFileSync(
    resolve(generatedDir, 'hierarchy.ts'),
    `import type { ConceptHierarchy } from '../ontology'\n`
    + `export const conceptHierarchy: ConceptHierarchy = ${JSON.stringify(hierarchy, null, 2)}\n`,
  )

  return { hierarchy }
}
