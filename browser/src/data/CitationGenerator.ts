import type { Entry, PartMeta } from './types'
import { publisherOf } from './PartRegistry'

export type CitationFormat = 'bibtex' | 'chicago' | 'ris'

export interface CitationFormatter {
  format(ctx: CitationContext): string
}

export interface CitationContext {
  entry: Entry
  meta: PartMeta
  edition: string
  edNum: string
  name: string
  publisher: string
  publisherFull: string
  prefix: string
  key: string
  url: string
}

const PUBLISHER_NAMES: Record<string, string> = {
  ISO: 'International Organization for Standardization',
  IEC: 'International Electrotechnical Commission',
}

function buildContext(entry: Entry, meta: PartMeta, edition: string): CitationContext {
  const edNum = edition.replace(/^.*?(\d+).*$/, '$1') || '1'
  const name = entry.designations[0]?.designation.en?.text ?? entry.num
  const pub = publisherOf(meta.partKey)
  const prefix = pub === 'IEC' ? 'IEC' : 'ISO'
  const publisherFull = PUBLISHER_NAMES[pub] ?? PUBLISHER_NAMES.ISO
  const key = `iso80000-${meta.partKey}-${edNum}-${entry.num.replace(/[^a-zA-Z0-9]/g, '-')}`
  const url = `https://iso80000.org/quantities/part-${meta.partKey}/${entry.id}`
  return { entry, meta, edition, edNum, name, publisher: prefix, publisherFull, prefix, key, url }
}

class BibTeXFormatter implements CitationFormatter {
  format(ctx: CitationContext): string {
    return [
      `@standard{${ctx.key},`,
      `  title = {${ctx.prefix} 80000-${ctx.meta.partKey}:${ctx.edNum} -- ${ctx.meta.title}},`,
      `  entry = {${ctx.entry.num} ${ctx.name}},`,
      `  organization = {${ctx.publisherFull}},`,
      `  year = {${ctx.edNum}},`,
      `  url = {${ctx.url}}`,
      `}`,
    ].join('\n')
  }
}

class ChicagoFormatter implements CitationFormatter {
  format(ctx: CitationContext): string {
    return `${ctx.prefix} 80000-${ctx.meta.partKey}:${ctx.edNum}, entry ${ctx.entry.num}, "${ctx.name}." ${ctx.publisherFull}.`
  }
}

class RisFormatter implements CitationFormatter {
  format(ctx: CitationContext): string {
    return [
      'TY  - STD',
      `TI  - ${ctx.prefix} 80000-${ctx.meta.partKey}:${ctx.edNum} -- ${ctx.meta.title}, entry ${ctx.entry.num}: ${ctx.name}`,
      `PB  - ${ctx.publisherFull}`,
      `PY  - ${ctx.edNum}`,
      `UR  - ${ctx.url}`,
      'ER  - ',
    ].join('\n')
  }
}

export class CitationGenerator {
  private readonly formatters: Record<CitationFormat, CitationFormatter>

  constructor(formatters?: Partial<Record<CitationFormat, CitationFormatter>>) {
    this.formatters = {
      bibtex: formatters?.bibtex ?? new BibTeXFormatter(),
      chicago: formatters?.chicago ?? new ChicagoFormatter(),
      ris: formatters?.ris ?? new RisFormatter(),
    }
  }

  generate(entry: Entry, meta: PartMeta, edition: string, format: CitationFormat): string {
    const ctx = buildContext(entry, meta, edition)
    const formatter = this.formatters[format]
    return formatter.format(ctx)
  }

  generateAll(entry: Entry, meta: PartMeta, edition: string): Record<CitationFormat, string> {
    const ctx = buildContext(entry, meta, edition)
    return {
      bibtex: this.formatters.bibtex.format(ctx),
      chicago: this.formatters.chicago.format(ctx),
      ris: this.formatters.ris.format(ctx),
    }
  }

  static formats(): CitationFormat[] {
    return ['bibtex', 'chicago', 'ris']
  }
}
