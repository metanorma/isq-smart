import { ENG } from './Language'
import type { Language } from './Language'
import { LanguageStore } from './LanguageStore'
import { DomTranslator } from './DomTranslator'
import type { MessageLookup } from './MessageLookup'
import type { TextMatcher } from './TextMatcher'

export class I18nService {
  constructor(
    private readonly store: LanguageStore,
    private readonly translator: DomTranslator,
  ) {}

  init(): Language {
    const lang = this.store.get()
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang.htmlLang
      requestAnimationFrame(() => this.applyTranslations(lang))
    }
    return lang
  }

  switchTo(lang: Language): void {
    this.store.set(lang)
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang.htmlLang
      this.applyTranslations(lang)
      document.dispatchEvent(new CustomEvent('language-change', { detail: { lang: lang.htmlLang } }))
    }
  }

  apply(root: HTMLElement): void {
    this.translator.translate(root, this.store.get())
  }

  private applyTranslations(lang: Language): void {
    if (typeof document === 'undefined') return
    this.translator.translate(document.head, lang)
    this.translator.translate(document.body, lang)
  }
}

export function createI18nService(
  store: LanguageStore,
  lookup: MessageLookup,
  textMatcher: TextMatcher,
): I18nService {
  return new I18nService(store, new DomTranslator(lookup, textMatcher))
}

export { ENG }
