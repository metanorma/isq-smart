import { messages } from './messages'
import { MessageLookup } from './MessageLookup'
import { buildTextMatcher, TextMatcher } from './TextMatcher'
import { LanguageStore } from './LanguageStore'
import { createI18nService, I18nService } from './I18nService'
import { ENG, FRA, defaultLanguage, languageFromCode } from './Language'
import type { Language } from './Language'

export type Lang = 'en' | 'fr'

const messageLookup = new MessageLookup(messages as unknown as Record<'en' | 'fr', Record<string, unknown>>)
const textMatcher = buildTextMatcher(messages as unknown as Record<string, unknown>)
const languageStore = new LanguageStore()

export function createService(): I18nService {
  return createI18nService(languageStore, messageLookup, textMatcher)
}

function lookup(lang: Lang, key: string): string | undefined {
  const language = lang === 'fr' ? FRA : ENG
  const result = messageLookup.resolve(language, key)
  return result === key ? undefined : result
}

export function t(key: string, lang: Lang = 'en'): string {
  return lookup(lang, key) ?? lookup('en', key) ?? key
}

export function tMap(key: string): Record<Lang, string> {
  return {
    en: lookup('en', key) ?? key,
    fr: lookup('fr', key) ?? lookup('en', key) ?? key,
  }
}

export { messages, MessageLookup, TextMatcher, LanguageStore, I18nService }
export { ENG, FRA, defaultLanguage, languageFromCode }
export type { Language }

export function getLangFromPath(pathname: string): Lang {
  return pathname.includes('/fr/') || pathname.startsWith('/fr') ? 'fr' : 'en'
}

export function allKeys(): string[] {
  const keys: string[] = []
  function flatten(obj: Record<string, unknown>, prefix = '') {
    for (const [k, v] of Object.entries(obj)) {
      const full = prefix ? `${prefix}.${k}` : k
      if (typeof v === 'object' && v !== null) flatten(v as Record<string, unknown>, full)
      else keys.push(full)
    }
  }
  flatten(messages.en as unknown as Record<string, unknown>)
  return keys
}
