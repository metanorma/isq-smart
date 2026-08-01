import type { Entry, Lang } from './types'
import { render as renderAsciiDoc } from './asciidoc'
import { xrefMap } from './generated/xref-map'
import { langValue } from './langValue'

export class EntryTextRenderer {
  static definition(entry: Entry, lang: Lang | 'both', cache: Record<string, string>): string {
    const l: Lang = lang === 'both' ? 'en' : lang
    const raw = langValue(entry.def, l)
    return renderAsciiDoc(raw, cache, xrefMap)
  }

  static remarks(entry: Entry, lang: Lang | 'both', cache: Record<string, string>): string {
    if (!entry.remarks) return ''
    const l: Lang = lang === 'both' ? 'en' : lang
    const raw = langValue(entry.remarks, l)
    return raw ? renderAsciiDoc(raw, cache, xrefMap) : ''
  }

  static shortDefinition(entry: Entry, maxLen = 140, lang: Lang | 'both' = 'en'): string {
    const l: Lang = lang === 'both' ? 'en' : lang
    const raw = langValue(entry.def, l)
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
