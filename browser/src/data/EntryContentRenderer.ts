import type { Entry } from './types'
import { EntryModel } from './EntryModel'
import { render as renderAsciiDoc } from './asciidoc'
import { xrefMap } from './generated/xref-map'

export interface EntryViewCaches {
  mathCache: Record<string, string>
  latexCache: Record<string, string>
}

export class EntryContentRenderer {
  constructor(private readonly caches: EntryViewCaches) {}

  definition(entry: Entry, lang: 'en' | 'fr'): string {
    return EntryModel.definition(entry, lang, this.caches.mathCache)
  }

  remarks(entry: Entry, lang: 'en' | 'fr'): string {
    return EntryModel.remarks(entry, lang, this.caches.mathCache)
  }

  renderedName(entry: Entry, lang: 'en' | 'fr'): string {
    return EntryModel.renderedName(entry, lang, this.caches.mathCache)
  }

  renderText(text: string): string {
    return renderAsciiDoc(text, this.caches.mathCache, xrefMap)
  }
}
