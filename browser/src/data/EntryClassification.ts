import type { Entry } from './types'

export class EntryClassification {
  static hasFrench(entry: Entry): boolean {
    return entry.designations.some(d => d.designation.fr?.text) || !!entry.def.fr
  }

  static sectionGroup(entry: Entry): string {
    const parts = entry.num.split('.')
    return parts.length > 1 ? parts[0] : entry.num
  }
}
