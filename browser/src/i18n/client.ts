import { messages } from './messages'
import { MessageLookup } from './MessageLookup'
import { buildTextMatcher } from './TextMatcher'
import { LanguageStore } from './LanguageStore'
import { DomTranslator } from './DomTranslator'
import { ENG, FRA } from './Language'
import type { Language } from './Language'

type Lang = 'en' | 'fr'

const byHtmlLang: Record<Lang, Language> = { en: ENG, fr: FRA }

const lookup = new MessageLookup(messages as unknown as Record<'en' | 'fr', Record<string, unknown>>)
const textMatcher = buildTextMatcher(messages as unknown as Record<string, unknown>)
const store = new LanguageStore()
const translator = new DomTranslator(lookup, textMatcher)

export function getStoredLang(): Lang {
  return store.get().htmlLang
}

export function setStoredLang(lang: Lang): void {
  store.set(byHtmlLang[lang])
}

export function applyLanguage(lang: Lang, reload = false): void {
  if (reload) {
    setStoredLang(lang)
    window.location.reload()
    return
  }
  const language = byHtmlLang[lang]
  document.documentElement.lang = lang
  translator.translate(document.head, language)
  translator.translate(document.body, language)
  document.dispatchEvent(new CustomEvent('language-change', { detail: { lang } }))
}

export function initLanguage(): Lang {
  const lang = store.get()
  if (lang !== ENG) {
    document.documentElement.lang = lang.htmlLang
    requestAnimationFrame(() => {
      translator.translate(document.head, lang)
      translator.translate(document.body, lang)
    })
  }
  return lang.htmlLang
}
