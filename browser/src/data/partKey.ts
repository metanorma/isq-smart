/**
 * PartKey utilities — single source of truth for parsing, formatting, and
 * comparing part keys throughout the build pipeline and runtime.
 *
 * A PartKey is either a simple part ("3", "6", "13") or a compound
 * sub-section ("2-5", "11-4"). The base part is the part before the dash.
 */

export function basePartKey(partKey: string): string {
  return partKey.includes('-') ? partKey.split('-')[0]! : partKey
}

export interface ParsedPartKey {
  base: number
  sub: number
}

export function parsePartKey(partKey: string): ParsedPartKey {
  if (partKey.includes('-')) {
    const [baseStr, subStr] = partKey.split('-')
    return { base: Number(baseStr), sub: Number(subStr) }
  }
  return { base: Number(partKey), sub: 0 }
}

export function comparePartKeys(a: string, b: string): number {
  const pa = parsePartKey(a)
  const pb = parsePartKey(b)
  return pa.base !== pb.base ? pa.base - pb.base : pa.sub - pb.sub
}

export function sortPartKeys(keys: string[]): string[] {
  return [...keys].sort(comparePartKeys)
}

export function isSubSection(partKey: string): boolean {
  return partKey.includes('-')
}

export function sectionLabel(partKey: string): string {
  if (!isSubSection(partKey)) return partKey
  return `§${partKey.split('-')[1]}`
}
