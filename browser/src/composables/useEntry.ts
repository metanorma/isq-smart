import type { Entry } from '../data/types'
import { tagToClass } from '../data/ontologyConfig'

export function entryRdfClass(e: Entry): string {
  return tagToClass(e._tag)
}
