import type { Entry, Lang } from './types'
import { renderInline } from './asciidoc'

export class EntryNameResolver {
  static resolve(entry: Entry, lang: Lang | 'both'): string {
    if (lang === 'both') {
      const en = entry.designations.map(d => d.designation.en?.text).filter(Boolean).join(', ')
      const fr = entry.designations.map(d => d.designation.fr?.text).filter(Boolean).join(', ')
      if (fr && fr !== en) return `${en} / ${fr}`
      return en
    }
    return entry.designations
      .map(d => d.designation[lang]?.text)
      .filter(Boolean)
      .join(', ')
  }

  static rendered(entry: Entry, lang: Lang | 'both', cache: Record<string, string>): string {
    return renderInline(this.resolve(entry, lang), cache)
  }

  static plain(entry: Entry, lang: Lang | 'both'): string {
    return this.resolve(entry, lang).replace(/stem:\[([^\]]+)\]/g, (_, expr) => expr.replace(/^"|"$/g, ''))
  }
}
