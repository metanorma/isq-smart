import type { Entry } from '../data/types'

export function entryRdfClass(e: Entry): string {
  return e._tag === 'quantity' ? 'isoiec80000:Quantity' : 'isoiec80000:MathConcept'
}
