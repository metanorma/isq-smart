import type { Entry, QuantityEntry, ISO80000Unit } from '../data/types'

export function getEntryName(entry: Entry): string {
  return entry.designations[0]?.designation?.en?.text ?? entry.id
}

export function getUnitStr(entry: Entry): string {
  if (entry._tag !== 'quantity' || !(entry as QuantityEntry).units?.length) return ''
  return (entry as QuantityEntry).units!.map(u => u.symbol?.join('') ?? u.en).join(', ')
}

export function unitUri(u: ISO80000Unit): string {
  const sym = u.symbol?.[0]
  return sym ? `unit-${sym}` : `unit-${u.en.toLowerCase().replace(/\s+/g, '-')}`
}

export function entryRdfClass(e: Entry): string {
  return e._tag === 'quantity' ? 'isoiec80000:Quantity' : 'isoiec80000:MathConcept'
}

export function entryDomainRdfClass(e: Entry): string {
  return e._tag === 'quantity' ? 'Quantity' : 'MathConcept'
}
