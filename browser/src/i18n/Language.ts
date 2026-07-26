export type HtmlLangCode = 'en' | 'fr'

export interface Language {
  readonly code: 'eng' | 'fra'
  readonly htmlLang: HtmlLangCode
  readonly displayName: string
}

export const ENG: Language = {
  code: 'eng',
  htmlLang: 'en',
  displayName: 'English',
}

export const FRA: Language = {
  code: 'fra',
  htmlLang: 'fr',
  displayName: 'Français',
}

export const ALL_LANGUAGES: readonly Language[] = [ENG, FRA]

const byCode = new Map<string, Language>([
  ['eng', ENG],
  ['fra', FRA],
  ['en', ENG],
  ['fr', FRA],
])

export function languageFromCode(code: string): Language | undefined {
  return byCode.get(code)
}

export function defaultLanguage(): Language {
  return ENG
}
