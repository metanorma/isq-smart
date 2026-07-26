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
      requestAnimationFrame(() => {
        this.translator.translate(document.body, lang)
      })
    }
    return lang
  }

  switchTo(lang: Language): void {
    this.store.set(lang)
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang.htmlLang
      this.translator.translate(document.body, lang)
      document.dispatchEvent(new CustomEvent('language-change', { detail: { lang: lang.htmlLang } }))
    }
  }

  apply(root: HTMLElement): void {
    const lang = this.store.get()
    this.translator.translate(root, lang)
  }
}

export function createI18nService(
  store: LanguageStore,
  lookup: MessageLookup,
  textMatcher: TextMatcher,
): I18nService {
  const translator = new DomTranslator(lookup, textMatcher)
  return new I18nService(store, translator)
}

export { ENG }
