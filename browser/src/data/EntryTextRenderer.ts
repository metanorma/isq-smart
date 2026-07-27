import type { Entry, Lang } from './types'
import { render as renderAsciiDoc } from './asciidoc'
import { xrefMap } from './generated/xref-map'

export class EntryTextRenderer {
  static definition(entry: Entry, lang: Lang | 'both', cache: Record<string, string>): string {
    const l = lang === 'both' ? 'en' : lang
    const def = entry.def as unknown as Record<string, string>
    const raw = def[l] ?? def.en ?? entry.def.en
    return renderAsciiDoc(raw, cache, xrefMap)
  }

  static remarks(entry: Entry, lang: Lang | 'both', cache: Record<string, string>): string {
    if (!entry.remarks) return ''
    const l = lang === 'both' ? 'en' : lang
    const rem = entry.remarks as unknown as Record<string, string>
    const raw = rem[l] ?? (entry.remarks as unknown as Record<string, string>).en
    return raw ? renderAsciiDoc(raw, cache, xrefMap) : ''
  }

  static shortDefinition(entry: Entry, maxLen = 140, lang: Lang | 'both' = 'en'): string {
    const l = lang === 'both' ? 'en' : lang
    const defObj = entry.def as unknown as Record<string, string | undefined>
    const raw = (defObj[l] ?? defObj['en'] ?? entry.def.en ?? '')
      .replace(/\[stem[^\]]*\]\n\+{4}\n[\s\S]*?\+{4}\n?/g, '')
      .replace(/stem:\[([^\]]+)\]\s*::\s*/g, '')
      .replace(/stem:\[([^\]]+)\]/g, '')
      .replace(/<<([^>,>]+)(?:,[^>]*)?>>/g, '$1')
      .replace(/::\s*/g, ' ')
      .replace(/\n/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
    if (!raw) return ''
    if (raw.length <= maxLen) return raw
    return raw.slice(0, maxLen).replace(/\s\S*$/, '…')
  }
}
