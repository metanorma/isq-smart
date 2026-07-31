import { CitationGenerator } from './CitationGenerator'
import type { Entry, PartMeta } from './types'

const generator = new CitationGenerator()

export function generateBibTeX(entry: Entry, meta: PartMeta, edition: string): string {
  return generator.generate(entry, meta, edition, 'bibtex')
}

export function generateChicago(entry: Entry, meta: PartMeta, edition: string): string {
  return generator.generate(entry, meta, edition, 'chicago')
}

export function generateRis(entry: Entry, meta: PartMeta, edition: string): string {
  return generator.generate(entry, meta, edition, 'ris')
}

export { CitationGenerator } from './CitationGenerator'
export type { CitationFormat, CitationFormatter, CitationContext } from './CitationGenerator'
